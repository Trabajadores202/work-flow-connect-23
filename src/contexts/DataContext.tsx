
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Definición de tipos
export interface UserType {
  id: string;
  name: string;
  email: string;
  role: 'freelancer' | 'client';
  bio?: string;
  skills?: string[];
  photoURL?: string;
  hourlyRate?: number;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface JobType {
  id: string;
  title: string;
  description: string;
  budget: number;
  category: string;
  skills: string[];
  status: 'open' | 'assigned' | 'completed' | 'cancelled';
  userId: string;
  createdAt: string;
  updatedAt: string;
  user?: UserType;
  likedBy?: UserType[];
  comments?: CommentType[];
}

export interface CommentType {
  id: string;
  content: string;
  userId: string;
  jobId: string;
  createdAt: string;
  updatedAt: string;
  user?: UserType;
  replies?: ReplyType[];
}

export interface ReplyType {
  id: string;
  content: string;
  userId: string;
  commentId: string;
  createdAt: string;
  updatedAt: string;
  user?: UserType;
}

export interface ChatType {
  id: string;
  name: string;
  isGroup: boolean;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  messages?: MessageType[];
  participants?: UserType[];
}

export interface MessageType {
  id: string;
  content: string;
  userId: string;
  chatId: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
  user?: UserType;
}

// Tipos para el contexto
interface DataContextType {
  users: UserType[];
  setUsers: React.Dispatch<React.SetStateAction<UserType[]>>;
  jobs: JobType[];
  setJobs: React.Dispatch<React.SetStateAction<JobType[]>>;
  comments: CommentType[];
  setComments: React.Dispatch<React.SetStateAction<CommentType[]>>;
  replies: ReplyType[];
  setReplies: React.Dispatch<React.SetStateAction<ReplyType[]>>;
  chats: ChatType[];
  setChats: React.Dispatch<React.SetStateAction<ChatType[]>>;
  messages: MessageType[];
  setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
  savedJobs: string[];
  setSavedJobs: React.Dispatch<React.SetStateAction<string[]>>;
  likedJobs: string[];
  setLikedJobs: React.Dispatch<React.SetStateAction<string[]>>;
  loading: boolean;
  error: string | null;
}

// Crear contexto
const DataContext = createContext<DataContextType | undefined>(undefined);

// Provider Component
export const DataProvider = ({ children }: { children: ReactNode }) => {
  // Estados para los datos
  const [users, setUsers] = useState<UserType[]>([]);
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [replies, setReplies] = useState<ReplyType[]>([]);
  const [chats, setChats] = useState<ChatType[]>([]);
  const [messages, setMessages] = useState<MessageType[]>([]);
  
  // Estados para las interacciones del usuario
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [likedJobs, setLikedJobs] = useState<string[]>([]);
  
  // Estados para la carga y errores
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos mock para desarrollo
  React.useEffect(() => {
    // Simular carga de datos
    setUsers([
      {
        id: '1',
        name: 'Juan Pérez',
        email: 'juan@example.com',
        role: 'freelancer',
        bio: 'Desarrollador web con 5 años de experiencia',
        skills: ['React', 'Node.js', 'TypeScript'],
        photoURL: '/placeholder.svg',
        hourlyRate: 25,
        isOnline: true,
        lastSeen: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Ana López',
        email: 'ana@example.com',
        role: 'client',
        photoURL: '/placeholder.svg',
        isOnline: false,
        lastSeen: new Date(Date.now() - 86400000).toISOString() // Hace 1 día
      },
      {
        id: '3',
        name: 'Empresa ABC',
        email: 'empresa@abc.com',
        role: 'client',
        bio: 'Empresa dedicada al desarrollo de software',
        photoURL: '/placeholder.svg',
        isOnline: true,
        lastSeen: new Date().toISOString()
      }
    ]);

    setJobs([
      {
        id: '1',
        title: 'Desarrollo de aplicación web',
        description: 'Necesitamos desarrollar una aplicación web completa usando React y Node.js.',
        budget: 5000,
        category: 'Desarrollo Web',
        skills: ['React', 'Node.js', 'MongoDB'],
        status: 'open',
        userId: '3', // Empresa ABC
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), // Hace 2 días
        updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        user: {
          id: '3',
          name: 'Empresa ABC',
          email: 'empresa@abc.com',
          role: 'client',
          photoURL: '/placeholder.svg'
        }
      },
      {
        id: '2',
        title: 'Diseño de logo y branding',
        description: 'Buscamos un diseñador gráfico para crear el logo y elementos de branding para nuestra startup.',
        budget: 1200,
        category: 'Diseño Gráfico',
        skills: ['Illustrator', 'Photoshop', 'Branding'],
        status: 'open',
        userId: '2', // Ana López
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(), // Hace 5 días
        updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        user: {
          id: '2',
          name: 'Ana López',
          email: 'ana@example.com',
          role: 'client',
          photoURL: '/placeholder.svg'
        }
      }
    ]);

    setComments([
      {
        id: '1',
        content: 'Me interesa este proyecto. Tengo experiencia en React y Node.js.',
        userId: '1', // Juan Pérez
        jobId: '1',
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(), // Hace 1 día
        updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        user: {
          id: '1',
          name: 'Juan Pérez',
          email: 'juan@example.com',
          role: 'freelancer',
          photoURL: '/placeholder.svg'
        }
      }
    ]);

    setReplies([
      {
        id: '1',
        content: 'Hola Juan, gracias por tu interés. ¿Podrías enviarnos tu portafolio?',
        userId: '3', // Empresa ABC
        commentId: '1',
        createdAt: new Date(Date.now() - 12 * 3600000).toISOString(), // Hace 12 horas
        updatedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
        user: {
          id: '3',
          name: 'Empresa ABC',
          email: 'empresa@abc.com',
          role: 'client',
          photoURL: '/placeholder.svg'
        }
      }
    ]);

    // Simular chats
    setChats([
      {
        id: '1',
        name: '',
        isGroup: false,
        lastMessageAt: new Date(Date.now() - 2 * 3600000).toISOString(), // Hace 2 horas
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), // Hace 3 días
        updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
        participants: [
          {
            id: '1',
            name: 'Juan Pérez',
            email: 'juan@example.com',
            role: 'freelancer',
            photoURL: '/placeholder.svg'
          },
          {
            id: '3',
            name: 'Empresa ABC',
            email: 'empresa@abc.com',
            role: 'client',
            photoURL: '/placeholder.svg'
          }
        ]
      }
    ]);

    // Simular mensajes
    setMessages([
      {
        id: '1',
        content: 'Hola, me gustaría discutir el proyecto con ustedes.',
        userId: '1', // Juan Pérez
        chatId: '1',
        read: true,
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), // Hace 3 días
        updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        user: {
          id: '1',
          name: 'Juan Pérez',
          email: 'juan@example.com',
          role: 'freelancer',
          photoURL: '/placeholder.svg'
        }
      },
      {
        id: '2',
        content: 'Claro, podemos agendar una videollamada para hablar de los detalles.',
        userId: '3', // Empresa ABC
        chatId: '1',
        read: true,
        createdAt: new Date(Date.now() - 2.5 * 86400000).toISOString(), // Hace 2.5 días
        updatedAt: new Date(Date.now() - 2.5 * 86400000).toISOString(),
        user: {
          id: '3',
          name: 'Empresa ABC',
          email: 'empresa@abc.com',
          role: 'client',
          photoURL: '/placeholder.svg'
        }
      },
      {
        id: '3',
        content: '¿Les parece bien mañana a las 10am?',
        userId: '1', // Juan Pérez
        chatId: '1',
        read: true,
        createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), // Hace 2 horas
        updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
        user: {
          id: '1',
          name: 'Juan Pérez',
          email: 'juan@example.com',
          role: 'freelancer',
          photoURL: '/placeholder.svg'
        }
      }
    ]);

    console.log('Datos mock cargados correctamente');
  }, []);

  return (
    <DataContext.Provider value={{
      users,
      setUsers,
      jobs,
      setJobs,
      comments,
      setComments,
      replies,
      setReplies,
      chats,
      setChats,
      messages,
      setMessages,
      savedJobs,
      setSavedJobs,
      likedJobs,
      setLikedJobs,
      loading,
      error
    }}>
      {children}
    </DataContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData debe usarse dentro de un DataProvider');
  }
  return context;
};
