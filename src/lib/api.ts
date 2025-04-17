
/**
 * Cliente API para comunicación con el servidor backend
 * 
 * Este módulo proporciona funciones para interactuar con la API REST del servidor,
 * incluyendo autenticación, gestión de trabajos, chat y usuarios.
 */

import { UserType } from '@/contexts/DataContext';
import { JobType, CommentType, ReplyType } from '@/contexts/JobContext';
import { ChatType, MessageType } from '@/contexts/ChatContext';
import { toast } from '@/components/ui/use-toast';

// URL base de la API
const API_URL = 'http://localhost:5000/api';

// Obtener token JWT del almacenamiento local
const getToken = () => localStorage.getItem('wfc_token');

// Opciones por defecto para fetch con autenticación
const authFetchOptions = (options = {}) => ({
  ...options,
  headers: {
    ...options.headers,
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  }
});

// Gestionar errores de la API
const handleApiError = (error) => {
  console.error('Error de API:', error);
  const message = error.message || 'Ocurrió un error al conectar con el servidor';
  toast({
    title: 'Error',
    description: message,
    variant: 'destructive'
  });
  throw error;
};

// Verificar respuesta de la API
const checkResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    const error = new Error(data.message || 'Error en la solicitud');
    error.status = response.status;
    error.data = data;
    throw error;
  }
  
  return data;
};

// API de autenticación
export const authApi = {
  // Iniciar sesión con email y contraseña
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await checkResponse(response);
      localStorage.setItem('wfc_token', data.token);
      
      return data.user;
    } catch (error) {
      handleApiError(error);
    }
  },
  
  // Registrar un nuevo usuario
  register: async (name, email, password, role = 'freelancer') => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      
      const data = await checkResponse(response);
      localStorage.setItem('wfc_token', data.token);
      
      return data.user;
    } catch (error) {
      handleApiError(error);
    }
  },
  
  // Cerrar sesión
  logout: async () => {
    try {
      if (getToken()) {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          ...authFetchOptions()
        });
      }
      
      localStorage.removeItem('wfc_token');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      localStorage.removeItem('wfc_token');
    }
  },
  
  // Verificar token y obtener usuario actual
  verifySession: async () => {
    try {
      const token = getToken();
      if (!token) return null;
      
      const response = await fetch(`${API_URL}/auth/verify`, authFetchOptions());
      const data = await checkResponse(response);
      
      return data.user;
    } catch (error) {
      console.error('Error al verificar sesión:', error);
      localStorage.removeItem('wfc_token');
      return null;
    }
  }
};

// API de usuarios
export const userApi = {
  // Obtener perfil del usuario actual
  getCurrentUser: async () => {
    try {
      const response = await fetch(`${API_URL}/users/me`, authFetchOptions());
      const data = await checkResponse(response);
      
      return data.user;
    } catch (error) {
      handleApiError(error);
    }
  },
  
  // Obtener perfil de un usuario por ID
  getUserById: async (userId) => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}`, authFetchOptions());
      const data = await checkResponse(response);
      
      return data.user;
    } catch (error) {
      handleApiError(error);
    }
  },
  
  // Actualizar perfil de usuario
  updateProfile: async (userData) => {
    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        body: JSON.stringify(userData),
        ...authFetchOptions()
      });
      
      const data = await checkResponse(response);
      return data.user;
    } catch (error) {
      handleApiError(error);
    }
  },
  
  // Subir foto de perfil
  uploadProfilePhoto: async (file) => {
    try {
      const formData = new FormData();
      formData.append('photo', file);
      
      const response = await fetch(`${API_URL}/users/profile/photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        },
        body: formData
      });
      
      const data = await checkResponse(response);
      return data.photoURL;
    } catch (error) {
      handleApiError(error);
    }
  },
  
  // Buscar usuarios
  searchUsers: async (query = '', role = '') => {
    try {
      const queryParams = new URLSearchParams();
      if (query) queryParams.append('query', query);
      if (role) queryParams.append('role', role);
      
      const response = await fetch(
        `${API_URL}/users/search?${queryParams.toString()}`, 
        authFetchOptions()
      );
      
      const data = await checkResponse(response);
      return data.users;
    } catch (error) {
      handleApiError(error);
    }
  }
};

// API de trabajos
export const jobApi = {
  // Obtener todos los trabajos
  getAllJobs: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value as string);
      });
      
      const response = await fetch(`${API_URL}/jobs?${queryParams.toString()}`);
      const data = await checkResponse(response);
      
      return data.jobs;
    } catch (error) {
      handleApiError(error);
    }
  },
  
  // Obtener un trabajo por ID
  getJobById: async (jobId) => {
    try {
      const response = await fetch(`${API_URL}/jobs/${jobId}`);
      const data = await checkResponse(response);
      
      return data.job;
    } catch (error) {
      handleApiError(error);
    }
  },
  
  // Crear un nuevo trabajo
  createJob: async (jobData) => {
    try {
      const response = await fetch(`${API_URL}/jobs`, {
        method: 'POST',
        body: JSON.stringify(jobData),
        ...authFetchOptions()
      });
      
      const data = await checkResponse(response);
      return data.job;
    } catch (error) {
      handleApiError(error);
    }
  },
  
  // Actualizar un trabajo
  updateJob: async (jobId, jobData) => {
    try {
      const response = await fetch(`${API_URL}/jobs/${jobId}`, {
        method: 'PUT',
        body: JSON.stringify(jobData),
        ...authFetchOptions()
      });
      
      const data = await checkResponse(response);
      return data.job;
    } catch (error) {
      handleApiError(error);
    }
  },
  
  // Eliminar un trabajo
  deleteJob: async (jobId) => {
    try {
      const response = await fetch(`${API_URL}/jobs/${jobId}`, {
        method: 'DELETE',
        ...authFetchOptions()
      });
      
      const data = await checkResponse(response);
      return data.success;
    } catch (error) {
      handleApiError(error);
    }
  },
  
  // Añadir un comentario a un trabajo
  addComment: async (jobId, content) => {
    try {
      const response = await fetch(`${API_URL}/jobs/${jobId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content }),
        ...authFetchOptions()
      });
      
      const data = await checkResponse(response);
      return data.comment;
    } catch (error) {
      handleApiError(error);
    }
  },
  
  // Añadir una respuesta a un comentario
  addReply: async (commentId, content) => {
    try {
      const response = await fetch(`${API_URL}/jobs/comments/${commentId}/replies`, {
        method: 'POST',
        body: JSON.stringify({ content }),
        ...authFetchOptions()
      });
      
      const data = await checkResponse(response);
      return data.reply;
    } catch (error) {
      handleApiError(error);
    }
  },
  
  // Toggle like para un trabajo
  toggleJobLike: async (jobId) => {
    try {
      const response = await fetch(`${API_URL}/jobs/${jobId}/like`, {
        method: 'POST',
        ...authFetchOptions()
      });
      
      const data = await checkResponse(response);
      return data.liked;
    } catch (error) {
      handleApiError(error);
    }
  },
  
  // Toggle guardar un trabajo
  toggleSavedJob: async (jobId) => {
    try {
      const response = await fetch(`${API_URL}/jobs/${jobId}/save`, {
        method: 'POST',
        ...authFetchOptions()
      });
      
      const data = await checkResponse(response);
      return data.saved;
    } catch (error) {
      handleApiError(error);
    }
  },
  
  // Obtener trabajos guardados por el usuario
  getSavedJobs: async () => {
    try {
      const response = await fetch(`${API_URL}/jobs/saved/me`, authFetchOptions());
      const data = await checkResponse(response);
      
      return data.jobs;
    } catch (error) {
      handleApiError(error);
    }
  }
};

// API de chat
export const chatApi = {
  // Obtener todos los chats del usuario
  getChats: async () => {
    try {
      const response = await fetch(`${API_URL}/chats`, authFetchOptions());
      const data = await checkResponse(response);
      
      return data.chats;
    } catch (error) {
      handleApiError(error);
    }
  },
  
  // Obtener un chat por ID
  getChatById: async (chatId) => {
    try {
      const response = await fetch(`${API_URL}/chats/${chatId}`, authFetchOptions());
      const data = await checkResponse(response);
      
      return data.chat;
    } catch (error) {
      handleApiError(error);
    }
  },
  
  // Crear un nuevo chat
  createChat: async (participantIds, name = '', isGroup = false) => {
    try {
      const response = await fetch(`${API_URL}/chats`, {
        method: 'POST',
        body: JSON.stringify({ participantIds, name, isGroup }),
        ...authFetchOptions()
      });
      
      const data = await checkResponse(response);
      return data.chat;
    } catch (error) {
      handleApiError(error);
    }
  },
  
  // Enviar un mensaje a un chat
  sendMessage: async (chatId, content) => {
    try {
      const response = await fetch(`${API_URL}/chats/${chatId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content }),
        ...authFetchOptions()
      });
      
      const data = await checkResponse(response);
      return data.chatMessage;
    } catch (error) {
      handleApiError(error);
    }
  },
  
  // Añadir un participante a un chat grupal
  addParticipantToChat: async (chatId, userId) => {
    try {
      const response = await fetch(`${API_URL}/chats/${chatId}/participants`, {
        method: 'POST',
        body: JSON.stringify({ userId }),
        ...authFetchOptions()
      });
      
      const data = await checkResponse(response);
      return data.chat;
    } catch (error) {
      handleApiError(error);
    }
  },
  
  // Abandonar un chat
  leaveChat: async (chatId) => {
    try {
      const response = await fetch(`${API_URL}/chats/${chatId}/leave`, {
        method: 'DELETE',
        ...authFetchOptions()
      });
      
      const data = await checkResponse(response);
      return data.success;
    } catch (error) {
      handleApiError(error);
    }
  }
};

// Funciones de utilidad para la aplicación
export const loadCategories = async () => {
  return [
    'Desarrollo Web',
    'Diseño UX/UI',
    'Desarrollo Móvil',
    'Marketing Digital',
    'Redacción y Traducción',
    'Video y Animación',
    'Servicios de Voz',
    'Música y Audio',
    'Análisis de Datos',
    'Otros'
  ];
};

export const loadSkills = async () => {
  return [
    'JavaScript', 'React', 'Node.js', 'Angular', 'Vue.js',
    'HTML/CSS', 'TypeScript', 'PHP', 'Python', 'Java',
    'Ruby', 'UI Design', 'UX Research', 'Figma', 'Adobe XD',
    'Photoshop', 'Illustrator', 'SEO', 'Content Marketing',
    'Social Media', 'React Native', 'Flutter', 'iOS', 'Android',
    'SQL', 'MongoDB', 'Firebase', 'AWS', 'Docker', 'DevOps'
  ];
};
