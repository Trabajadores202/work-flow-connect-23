
/**
 * Contexto de Chat
 * 
 * Este archivo gestiona toda la funcionalidad de chat incluyendo:
 * - Sincronización en tiempo real de chats usando listeners de Firebase
 * - Envío y recepción de mensajes
 * - Creación de nuevos chats
 * - Gestión del estado del chat activo
 * 
 * La funcionalidad en tiempo real se implementa usando los listeners onSnapshot de Firebase
 * que actúan de manera similar a WebSockets al enviar actualizaciones a los clientes conectados.
 */

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { 
  getChats as getFirebaseChats,
  createChat as createFirebaseChat,
  sendMessage as sendFirebaseMessage,
  addParticipantToChat as addFirebaseParticipantToChat
} from '@/lib/firebaseUtils';
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  doc 
} from "firebase/firestore";
import { db } from '@/lib/firebase';
import { toast } from '@/components/ui/use-toast';

// Definición de tipos para mensajes y chats
export type MessageType = {
  id: string;           // ID único del mensaje
  senderId: string;     // ID del usuario que envió el mensaje
  content: string;      // Contenido del mensaje
  timestamp: number;    // Timestamp cuando se envió el mensaje
};

export type ChatType = {
  id: string;           // ID único del chat
  name: string;         // Nombre del chat (para chats grupales)
  participants: string[]; // Array de IDs de usuarios participantes
  messages: MessageType[]; // Array de mensajes en el chat
  isGroup: boolean;     // Indica si es un chat grupal o privado
  lastMessage?: MessageType; // Último mensaje enviado (para mostrar vistas previas)
};

// Interfaz del contexto de chat definiendo funciones y estado disponibles
interface ChatContextType {
  chats: ChatType[];    // Lista de todos los chats del usuario
  activeChat: ChatType | null; // Chat actualmente seleccionado
  setActiveChat: (chat: ChatType | null) => void; // Función para cambiar el chat activo
  sendMessage: (chatId: string, content: string) => void; // Enviar mensaje a un chat
  createChat: (participantIds: string[], name?: string) => void; // Crear un nuevo chat
  createPrivateChat: (participantId: string) => Promise<void>; // Crear un chat privado 1:1
  getChat: (chatId: string) => ChatType | undefined; // Obtener un chat por ID
  loadingChats: boolean; // Estado de carga de chats
  onlineUsers: string[]; // IDs de usuarios conectados
  loadChats: () => Promise<void>; // Cargar todos los chats
  addParticipantToChat: (chatId: string, participantId: string) => Promise<boolean>; // Añadir usuario a chat
  findExistingPrivateChat: (participantId: string) => ChatType | undefined; // Buscar chat privado existente
}

// Crear el contexto
const ChatContext = createContext<ChatContextType | null>(null);

// Hook personalizado para usar el contexto de chat
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat debe usarse dentro de un ChatProvider');
  }
  return context;
};

// Usuario en línea simulados - en una app real esto vendría de un sistema de presencia
const MOCK_ONLINE_USERS = ['1', '2', '3'];

// Props para el provider
interface ChatProviderProps {
  children: ReactNode;
}

// Componente proveedor del contexto de chat
export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  // Obtener usuario actual del contexto de autenticación
  const { currentUser } = useAuth();
  
  // Estados para gestionar los chats y su estado
  const [chats, setChats] = useState<ChatType[]>([]);
  const [activeChat, setActiveChat] = useState<ChatType | null>(null);
  const [loadingChats, setLoadingChats] = useState(true);
  const [onlineUsers] = useState<string[]>(MOCK_ONLINE_USERS);
  const [unsubscribers, setUnsubscribers] = useState<(() => void)[]>([]);

  /**
   * Función para buscar un chat privado existente con un usuario específico
   * Usada para prevenir la creación de chats duplicados
   */
  const findExistingPrivateChat = (participantId: string): ChatType | undefined => {
    if (!currentUser) return undefined;
    
    return chats.find(
      chat => !chat.isGroup && 
      chat.participants.length === 2 && 
      chat.participants.includes(currentUser.id) && 
      chat.participants.includes(participantId)
    );
  };

  /**
   * Función para cargar todos los chats y configurar los listeners en tiempo real
   * Esta es la función principal que inicializa la funcionalidad de chat en tiempo real
   */
  const loadChats = async () => {
    // Si no hay usuario autenticado, no se cargan chats
    if (!currentUser) {
      setChats([]);
      setLoadingChats(false);
      return;
    }
  
    setLoadingChats(true);
    try {
      console.log("Cargando chats para el usuario:", currentUser.id);
      // Obtener chats iniciales de Firebase
      const userChats = await getFirebaseChats(currentUser.id);
      setChats(userChats);
      console.log("Chats cargados:", userChats.length);
      
      // Configurar los listeners en tiempo real para cada chat
      setupChatListeners();
    } catch (error) {
      console.error("Error al cargar chats:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los chats. Por favor, inténtalo de nuevo."
      });
    } finally {
      setLoadingChats(false);
    }
  };

  /**
   * Función clave para actualizaciones en tiempo real
   * Configura los listeners onSnapshot de Firebase para reaccionar a cambios en documentos de chat
   * Esto reemplaza la necesidad de WebSockets/Socket.io tradicionales
   */
  const setupChatListeners = () => {
    if (!currentUser) return;
    
    // Limpiar listeners existentes para evitar duplicados
    unsubscribers.forEach(unsubscribe => unsubscribe());
    setUnsubscribers([]);
    
    // Crear una consulta para chats donde el usuario actual es participante
    const chatsQuery = query(
      collection(db, "chats"),
      where("participants", "array-contains", currentUser.id)
    );
    
    // Crear un listener en tiempo real con onSnapshot
    const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
      console.log("Actualización en tiempo real de chats recibida");
      
      // Procesar cambios en la colección de chats
      const updatedChats: ChatType[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Obtener el último mensaje si hay mensajes
        let lastMessage = null;
        if (data.messages && data.messages.length > 0) {
          lastMessage = data.messages[data.messages.length - 1];
        }
        
        updatedChats.push({
          id: doc.id,
          name: data.name || "",
          participants: data.participants || [],
          messages: data.messages || [],
          isGroup: data.isGroup || false,
          lastMessage
        });
      });
      
      console.log("Actualización en tiempo real:", updatedChats.length, "chats");
      setChats(updatedChats);
      
      // IMPORTANTE: Mejora clave - actualizar chat activo después de cada cambio para actualizaciones en tiempo real 
      // dentro de una conversación
      if (activeChat) {
        const updatedActiveChat = updatedChats.find(chat => chat.id === activeChat.id);
        if (updatedActiveChat) {
          console.log("Actualizando chat activo con nuevos mensajes en tiempo real");
          setActiveChat(updatedActiveChat);
        }
      }
    }, (error) => {
      console.error("Error en el listener de chats:", error);
      toast({
        variant: "destructive",
        title: "Error de conexión",
        description: "Ha ocurrido un problema con la conexión en tiempo real. Intenta recargar la página."
      });
    });
    
    setUnsubscribers([unsubscribe]);
    console.log("Listener en tiempo real configurado correctamente");
    return unsubscribe;
  };

  /**
   * Effect para monitorear cambios en activeChat y asegurar que se mantenga actualizado
   * Esto es crucial para mensajería en tiempo real dentro de un chat abierto
   */
  useEffect(() => {
    if (activeChat && chats.length > 0) {
      // Encontrar la versión más actualizada del chat activo en el array de chats
      const refreshedChat = chats.find(chat => chat.id === activeChat.id);
      if (refreshedChat && JSON.stringify(refreshedChat) !== JSON.stringify(activeChat)) {
        console.log("Actualizando chat activo con datos más recientes");
        setActiveChat(refreshedChat);
      }
    }
  }, [chats]);

  /**
   * Configurar y limpiar listeners cuando el usuario cambia
   */
  useEffect(() => {
    console.log("Usuario cambiado, configurando listeners...");
    loadChats();
    
    // Función de limpieza cuando el componente se desmonta
    return () => {
      console.log("Limpiando listeners de chat");
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [currentUser]);

  /**
   * Función auxiliar para obtener un chat específico por ID
   */
  const getChat = (chatId: string) => {
    return chats.find(chat => chat.id === chatId);
  };

  /**
   * Función para enviar mensajes con actualizaciones en tiempo real
   */
  const sendMessage = async (chatId: string, content: string) => {
    if (!currentUser || !content.trim()) return;
    
    try {
      console.log("Enviando mensaje:", { chatId, content });
      const newMessage = await sendFirebaseMessage(chatId, currentUser.id, content);
      console.log("Mensaje enviado correctamente:", newMessage);
      
      // El listener onSnapshot detectará el cambio y actualizará el estado
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar el mensaje. Por favor, inténtalo de nuevo."
      });
    }
  };

  /**
   * Función para crear un chat (puede ser grupal o 1:1)
   */
  const createChat = async (participantIds: string[], name = '') => {
    if (!currentUser) return;
    
    // Asegurar que el usuario actual esté incluido
    if (!participantIds.includes(currentUser.id)) {
      participantIds.push(currentUser.id);
    }
    
    try {
      const newChat = await createFirebaseChat(participantIds, name);
      console.log("Nuevo chat creado:", newChat);
      
      // El nuevo chat se añadirá a través del listener en tiempo real
      // Sin embargo, actualizar el chat activo inmediatamente
      setActiveChat(newChat);
    } catch (error) {
      console.error("Error al crear chat:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear el chat. Por favor, inténtalo de nuevo."
      });
    }
  };

  /**
   * Función mejorada para crear o navegar a un chat privado existente
   */
  const createPrivateChat = async (participantId: string) => {
    if (!currentUser || participantId === currentUser.id) return;
    
    try {
      // Verificar si ya existe un chat privado con este usuario
      const existingChat = findExistingPrivateChat(participantId);
      
      if (existingChat) {
        // Si el chat existe, establecerlo como activo
        console.log("Chat privado existente encontrado, navegando a él:", existingChat.id);
        setActiveChat(existingChat);
        return;
      }
      
      // Si no existe, crear un nuevo chat privado
      console.log("Creando nuevo chat privado con usuario:", participantId);
      const participants = [currentUser.id, participantId];
      const newChat = await createFirebaseChat(participants);
      console.log("Nuevo chat privado creado:", newChat);
      
      // El chat se añadirá a través del listener en tiempo real
      setActiveChat(newChat);
    } catch (error) {
      console.error("Error al crear chat privado:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear el chat privado. Por favor, inténtalo de nuevo."
      });
    }
  };

  /**
   * Función para añadir participantes a un chat existente
   */
  const addParticipantToChat = async (chatId: string, participantId: string) => {
    try {
      // Comprobar si el chat existe y es un chat grupal
      const chat = chats.find(c => c.id === chatId);
      if (!chat) return false;
      
      // Comprobar si el usuario ya está en el chat
      if (chat.participants.includes(participantId)) return false;
      
      // Añadir participante a Firebase
      await addFirebaseParticipantToChat(chatId, participantId);
      console.log(`Participante ${participantId} añadido al chat ${chatId}`);
      
      // El chat se actualizará a través del listener en tiempo real
      return true;
    } catch (error) {
      console.error("Error al añadir participante:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo añadir el participante. Por favor, inténtalo de nuevo."
      });
      return false;
    }
  };

  // Proporcionar el contexto a los componentes hijos
  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChat,
        setActiveChat,
        sendMessage,
        createChat,
        createPrivateChat,
        getChat,
        loadingChats,
        onlineUsers,
        loadChats,
        addParticipantToChat,
        findExistingPrivateChat
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
