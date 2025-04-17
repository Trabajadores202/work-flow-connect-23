
/**
 * Servicio de Chat
 * 
 * Este servicio proporciona funcionalidades temporales para la gestión de chats
 * mientras se implementa un backend personalizado.
 */

import { ChatType, MessageType } from "@/contexts/ChatContext";

// Estado local para los chats (simula una base de datos)
let CHATS: ChatType[] = [
  {
    id: "chat1",
    name: "",
    participants: ["user1", "user3"],
    messages: [
      {
        id: "msg1",
        senderId: "user3",
        content: "Hola, me interesa tu perfil para un proyecto",
        timestamp: Date.now() - 86400000 // 1 día atrás
      },
      {
        id: "msg2",
        senderId: "user1",
        content: "Hola, gracias por contactarme. Cuéntame más sobre el proyecto.",
        timestamp: Date.now() - 86400000 + 3600000 // 1 día atrás + 1 hora
      }
    ],
    isGroup: false,
    lastMessage: {
      id: "msg2",
      senderId: "user1",
      content: "Hola, gracias por contactarme. Cuéntame más sobre el proyecto.",
      timestamp: Date.now() - 86400000 + 3600000
    }
  },
  {
    id: "chat2",
    name: "Proyecto Web App",
    participants: ["user1", "user2", "user3"],
    messages: [
      {
        id: "msg3",
        senderId: "user3",
        content: "He creado este grupo para coordinar el nuevo proyecto",
        timestamp: Date.now() - 172800000 // 2 días atrás
      },
      {
        id: "msg4",
        senderId: "user2",
        content: "Perfecto, ¿cuándo comenzamos?",
        timestamp: Date.now() - 172800000 + 3600000 // 2 días atrás + 1 hora
      }
    ],
    isGroup: true,
    lastMessage: {
      id: "msg4",
      senderId: "user2",
      content: "Perfecto, ¿cuándo comenzamos?",
      timestamp: Date.now() - 172800000 + 3600000
    }
  }
];

// Mapa de callbacks para simular listeners en tiempo real
const listeners: ((chats: ChatType[]) => void)[] = [];

// Función para notificar a los listeners cuando hay cambios
const notifyListeners = () => {
  listeners.forEach(callback => callback([...CHATS]));
};

/**
 * Obtener todos los chats para un usuario
 */
export const getChats = async (userId: string): Promise<ChatType[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return CHATS.filter(chat => chat.participants.includes(userId)).map(chat => ({ ...chat }));
};

/**
 * Crear un nuevo chat
 */
export const createChat = async (participantIds: string[], name = ""): Promise<ChatType> => {
  await new Promise(resolve => setTimeout(resolve, 700));
  
  const isGroup = participantIds.length > 2 || !!name;
  
  const newChat: ChatType = {
    id: `chat${Date.now()}`,
    name,
    participants: participantIds,
    messages: [],
    isGroup
  };
  
  CHATS = [...CHATS, newChat];
  
  // Notificar a los listeners sobre el cambio
  notifyListeners();
  
  return { ...newChat };
};

/**
 * Enviar un mensaje a un chat
 */
export const sendMessage = async (chatId: string, senderId: string, content: string): Promise<MessageType> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const chatIndex = CHATS.findIndex(chat => chat.id === chatId);
  if (chatIndex === -1) {
    throw new Error('Chat no encontrado');
  }
  
  const newMessage: MessageType = {
    id: `msg_${Date.now()}`,
    senderId,
    content,
    timestamp: Date.now()
  };
  
  CHATS[chatIndex].messages.push(newMessage);
  CHATS[chatIndex].lastMessage = newMessage;
  
  // Notificar a los listeners sobre el cambio
  notifyListeners();
  
  return { ...newMessage };
};

/**
 * Añadir un participante a un chat existente
 */
export const addParticipantToChat = async (chatId: string, participantId: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const chatIndex = CHATS.findIndex(chat => chat.id === chatId);
  if (chatIndex === -1) {
    throw new Error('Chat no encontrado');
  }
  
  if (CHATS[chatIndex].participants.includes(participantId)) {
    return false;
  }
  
  CHATS[chatIndex].participants = [...CHATS[chatIndex].participants, participantId];
  
  // Añadir un mensaje del sistema
  const systemMessage: MessageType = {
    id: `msg_${Date.now()}`,
    senderId: "system",
    content: "Un nuevo participante se ha unido al chat",
    timestamp: Date.now()
  };
  
  CHATS[chatIndex].messages = [...CHATS[chatIndex].messages, systemMessage];
  CHATS[chatIndex].lastMessage = systemMessage;
  
  // Notificar a los listeners sobre el cambio
  notifyListeners();
  
  return true;
};

/**
 * Configurar un listener para cambios en los chats
 * Esta función simula la funcionalidad en tiempo real que antes proporcionaba Firebase
 */
export const setupChatListener = (callback: (chats: ChatType[]) => void) => {
  listeners.push(callback);
  
  // Llamar inmediatamente con los datos actuales
  callback([...CHATS]);
  
  // Devolver una función para eliminar el listener
  return () => {
    const index = listeners.indexOf(callback);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  };
};

/**
 * Obtener un chat por ID
 */
export const getChatById = async (chatId: string): Promise<ChatType | null> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const chat = CHATS.find(chat => chat.id === chatId);
  return chat ? { ...chat } : null;
};
