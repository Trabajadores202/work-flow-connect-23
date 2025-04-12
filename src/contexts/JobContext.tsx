
/**
 * Contexto de Trabajos
 * 
 * Este contexto proporciona funcionalidades relacionadas con la gestión de trabajos:
 * - Listar, crear, actualizar y eliminar trabajos
 * - Gestionar comentarios y respuestas en trabajos
 * - Manejar likes y guardados de trabajos
 * - Proporcionar acceso a los datos de trabajos en toda la aplicación
 */

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { UserType } from './AuthContext';
import { 
  getAllJobs, 
  getJobById, 
  createJob as createFirebaseJob,
  updateJob as updateFirebaseJob,
  deleteJob as deleteFirebaseJob,
  addCommentToJob, 
  addReplyToComment as addFirebaseReplyToComment,
  toggleJobLike as toggleFirebaseJobLike,
  toggleSavedJob as toggleFirebaseSavedJob,
  getSavedJobs as getFirebaseSavedJobs
} from '@/lib/firebaseUtils';

export type ReplyType = {
  id: string;           // ID único de la respuesta
  commentId: string;    // ID del comentario al que responde
  userId: string;       // ID del usuario que creó la respuesta
  userName: string;     // Nombre del usuario que creó la respuesta
  userPhoto?: string;   // Foto de perfil del usuario (opcional)
  content: string;      // Contenido de la respuesta
  timestamp: number;    // Marca de tiempo cuando se creó la respuesta
};

export type CommentType = {
  id: string;           // ID único del comentario
  jobId: string;        // ID del trabajo al que pertenece el comentario
  userId: string;       // ID del usuario que creó el comentario
  userName: string;     // Nombre del usuario que creó el comentario
  userPhoto?: string;   // Foto de perfil del usuario (opcional)
  content: string;      // Contenido del comentario
  timestamp: number;    // Marca de tiempo cuando se creó el comentario
  replies: ReplyType[]; // Lista de respuestas al comentario
};

export type JobType = {
  id: string;           // ID único del trabajo
  title: string;        // Título del trabajo
  description: string;  // Descripción detallada del trabajo
  budget: number;       // Presupuesto asignado al trabajo
  category: string;     // Categoría a la que pertenece el trabajo
  skills: string[];     // Habilidades requeridas para el trabajo
  userId: string;       // ID del usuario que creó el trabajo
  userName: string;     // Nombre del usuario que creó el trabajo
  userPhoto?: string;   // Foto de perfil del usuario (opcional)
  timestamp: number;    // Marca de tiempo cuando se creó el trabajo
  status: 'open' | 'in-progress' | 'completed'; // Estado actual del trabajo
  comments: CommentType[]; // Comentarios en el trabajo
  likes: string[];      // Array de IDs de usuarios que dieron like
};

type JobContextType = {
  jobs: JobType[];      // Lista de todos los trabajos disponibles
  loading: boolean;     // Indica si los datos están cargando
  createJob: (jobData: Omit<JobType, 'id' | 'timestamp' | 'comments' | 'likes'>) => Promise<JobType>; // Crear nuevo trabajo
  updateJob: (jobId: string, jobData: Partial<JobType>) => Promise<JobType>; // Actualizar trabajo existente
  deleteJob: (jobId: string) => Promise<boolean>; // Eliminar trabajo
  addComment: (jobId: string, content: string, user: UserType) => Promise<void>; // Añadir comentario a un trabajo
  addReplyToComment: (jobId: string, commentId: string, content: string, user: UserType) => Promise<void>; // Añadir respuesta a comentario
  getJob: (jobId: string) => JobType | undefined; // Obtener un trabajo por su ID
  toggleSavedJob: (jobId: string, userId: string) => void; // Guardar/eliminar un trabajo de favoritos
  getSavedJobs: (userId: string) => Promise<JobType[]>; // Obtener trabajos guardados por un usuario
  toggleLike: (jobId: string, userId: string) => void; // Dar/quitar like a un trabajo
  savedJobs: string[]; // Array de IDs de trabajos guardados por el usuario actual
  loadJobs: () => Promise<void>; // Método para recargar trabajos
};

const JobContext = createContext<JobContextType | null>(null);

/**
 * Hook personalizado para acceder al contexto de trabajos
 */
export const useJobs = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobs debe usarse dentro de un JobProvider');
  }
  return context;
};

interface JobProviderProps {
  children: ReactNode;
}

/**
 * Proveedor del contexto de trabajos
 * Proporciona funcionalidad y estado relacionados con los trabajos
 */
export const JobProvider: React.FC<JobProviderProps> = ({ children }) => {
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);

  /**
   * Función para cargar todos los trabajos desde Firebase
   */
  const loadJobs = async () => {
    setLoading(true);
    try {
      const jobsData = await getAllJobs();
      setJobs(jobsData);
    } catch (error) {
      console.error("Error al cargar trabajos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar trabajos iniciales al montar el componente
  useEffect(() => {
    loadJobs();
  }, []);

  /**
   * Función para crear un nuevo trabajo
   */
  const createJob = async (jobData: Omit<JobType, 'id' | 'timestamp' | 'comments' | 'likes'>) => {
    try {
      const newJob = await createFirebaseJob(jobData);
      const typedNewJob = newJob as JobType;
      setJobs(prevJobs => [...prevJobs, typedNewJob]);
      return typedNewJob;
    } catch (error) {
      console.error("Error al crear trabajo:", error);
      throw error;
    }
  };

  /**
   * Función para actualizar un trabajo existente
   */
  const updateJob = async (jobId: string, jobData: Partial<JobType>) => {
    try {
      const updatedJob = await updateFirebaseJob(jobId, jobData);
      
      setJobs(prevJobs => prevJobs.map(job => 
        job.id === jobId ? updatedJob : job
      ));
      
      return updatedJob;
    } catch (error) {
      console.error("Error al actualizar trabajo:", error);
      throw error;
    }
  };

  /**
   * Función para eliminar un trabajo
   */
  const deleteJob = async (jobId: string) => {
    try {
      const success = await deleteFirebaseJob(jobId);
      
      if (success) {
        setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
      }
      
      return success;
    } catch (error) {
      console.error("Error al eliminar trabajo:", error);
      throw error;
    }
  };

  /**
   * Función para añadir un comentario a un trabajo
   */
  const addComment = async (jobId: string, content: string, user: UserType) => {
    try {
      const newComment = await addCommentToJob(jobId, content, user);
      
      setJobs(prevJobs => prevJobs.map(job => 
        job.id === jobId 
          ? { ...job, comments: [...job.comments, newComment] }
          : job
      ));
    } catch (error) {
      console.error("Error al añadir comentario:", error);
      throw error;
    }
  };

  /**
   * Función para añadir una respuesta a un comentario
   */
  const addReplyToComment = async (jobId: string, commentId: string, content: string, user: UserType) => {
    try {
      const newReply = await addFirebaseReplyToComment(jobId, commentId, content, user);
      
      if (!newReply) return;
      
      setJobs(prevJobs => prevJobs.map(job => {
        if (job.id !== jobId) return job;
        
        return {
          ...job,
          comments: job.comments.map(comment => 
            comment.id === commentId
              ? { ...comment, replies: [...comment.replies, newReply] }
              : comment
          )
        };
      }));
    } catch (error) {
      console.error("Error al añadir respuesta:", error);
      throw error;
    }
  };

  /**
   * Función para obtener un trabajo por su ID
   */
  const getJob = (jobId: string) => {
    return jobs.find(job => job.id === jobId);
  };

  /**
   * Función para guardar/eliminar un trabajo de favoritos
   */
  const toggleSavedJob = async (jobId: string, userId: string) => {
    try {
      const isNowSaved = await toggleFirebaseSavedJob(userId, jobId);
      
      setSavedJobs(prev => {
        if (isNowSaved) {
          return [...prev, jobId];
        } else {
          return prev.filter(id => id !== jobId);
        }
      });
    } catch (error) {
      console.error("Error al marcar/desmarcar trabajo guardado:", error);
    }
  };

  /**
   * Función para obtener trabajos guardados por un usuario
   */
  const getSavedJobs = async (userId: string) => {
    try {
      const savedJobsData = await getFirebaseSavedJobs(userId);
      const savedJobIds = savedJobsData.map(job => job.id);
      setSavedJobs(savedJobIds);
      return savedJobsData;
    } catch (error) {
      console.error("Error al obtener trabajos guardados:", error);
      return [];
    }
  };

  /**
   * Función para dar/quitar like a un trabajo
   */
  const toggleLike = async (jobId: string, userId: string) => {
    try {
      await toggleFirebaseJobLike(jobId, userId);
      
      setJobs(prevJobs => prevJobs.map(job => {
        if (job.id !== jobId) return job;
        
        const userLiked = job.likes.includes(userId);
        
        return {
          ...job,
          likes: userLiked
            ? job.likes.filter(id => id !== userId)
            : [...job.likes, userId]
        };
      }));
    } catch (error) {
      console.error("Error al marcar/desmarcar me gusta:", error);
    }
  };

  return (
    <JobContext.Provider
      value={{
        jobs,
        loading,
        createJob,
        updateJob,
        deleteJob,
        addComment,
        addReplyToComment,
        getJob,
        toggleSavedJob,
        getSavedJobs,
        toggleLike,
        savedJobs,
        loadJobs
      }}
    >
      {children}
    </JobContext.Provider>
  );
};
