
/**
 * Servicio de Gestión de Trabajos
 * 
 * Este servicio proporciona funcionalidades temporales para gestionar trabajos
 * mientras se implementa un backend personalizado.
 */

import { JobType, CommentType, ReplyType } from "@/contexts/JobContext";
import { UserType } from "@/contexts/AuthContext";

// Estado local para almacenar trabajos (simulando una base de datos)
let JOBS: JobType[] = [
  {
    id: "job1",
    title: "Desarrollo de sitio web responsive",
    description: "Necesitamos desarrollar un sitio web responsive para nuestra empresa. El sitio debe ser moderno, rápido y fácil de usar.",
    budget: 1500,
    category: "Desarrollo Web",
    skills: ["JavaScript", "React", "HTML/CSS"],
    userId: "user3",
    userName: "Empresa ABC",
    userPhoto: "https://logo.clearbit.com/acme.com",
    status: "open",
    timestamp: Date.now() - 86400000 * 5, // 5 días atrás
    comments: [],
    likes: []
  },
  {
    id: "job2",
    title: "Diseño de interfaz para aplicación móvil",
    description: "Buscamos un diseñador UX/UI para crear la interfaz de nuestra nueva aplicación móvil de fitness.",
    budget: 1200,
    category: "Diseño UX/UI",
    skills: ["UI Design", "UX Research", "Figma"],
    userId: "user3",
    userName: "Empresa ABC",
    userPhoto: "https://logo.clearbit.com/acme.com",
    status: "open",
    timestamp: Date.now() - 86400000 * 3, // 3 días atrás
    comments: [],
    likes: []
  }
];

// Mapa para almacenar trabajos guardados por usuario
const SAVED_JOBS: Record<string, string[]> = {
  "user1": ["job2"],
  "user2": ["job1"]
};

/**
 * Obtener todos los trabajos
 */
export const getAllJobs = async (): Promise<JobType[]> => {
  // Simular latencia de red
  await new Promise(resolve => setTimeout(resolve, 500));
  return [...JOBS];
};

/**
 * Obtener un trabajo por su ID
 */
export const getJobById = async (jobId: string): Promise<JobType | null> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const job = JOBS.find(job => job.id === jobId);
  return job ? { ...job } : null;
};

/**
 * Crear un nuevo trabajo
 */
export const createJob = async (jobData: Omit<JobType, "id" | "timestamp" | "comments" | "likes">): Promise<JobType> => {
  await new Promise(resolve => setTimeout(resolve, 700));
  
  const newJob: JobType = {
    ...jobData,
    id: `job${Date.now()}`,
    timestamp: Date.now(),
    comments: [],
    likes: []
  };
  
  JOBS = [...JOBS, newJob];
  return { ...newJob };
};

/**
 * Actualizar un trabajo existente
 */
export const updateJob = async (jobId: string, jobData: Partial<JobType>): Promise<JobType> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = JOBS.findIndex(job => job.id === jobId);
  if (index === -1) {
    throw new Error('Trabajo no encontrado');
  }
  
  JOBS[index] = { ...JOBS[index], ...jobData };
  return { ...JOBS[index] };
};

/**
 * Eliminar un trabajo
 */
export const deleteJob = async (jobId: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const initialLength = JOBS.length;
  JOBS = JOBS.filter(job => job.id !== jobId);
  
  return JOBS.length < initialLength;
};

/**
 * Añadir un comentario a un trabajo
 */
export const addCommentToJob = async (jobId: string, content: string, user: UserType): Promise<CommentType> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const jobIndex = JOBS.findIndex(job => job.id === jobId);
  if (jobIndex === -1) {
    throw new Error('Trabajo no encontrado');
  }
  
  const commentId = `comment_${Date.now()}`;
  const newComment: CommentType = {
    id: commentId,
    jobId,
    userId: user.id,
    userName: user.name,
    userPhoto: user.photoURL,
    content,
    timestamp: Date.now(),
    replies: []
  };
  
  JOBS[jobIndex].comments.push(newComment);
  return { ...newComment };
};

/**
 * Añadir una respuesta a un comentario
 */
export const addReplyToComment = async (
  jobId: string, 
  commentId: string, 
  content: string, 
  user: UserType
): Promise<ReplyType | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const jobIndex = JOBS.findIndex(job => job.id === jobId);
  if (jobIndex === -1) {
    throw new Error('Trabajo no encontrado');
  }
  
  const commentIndex = JOBS[jobIndex].comments.findIndex(comment => comment.id === commentId);
  if (commentIndex === -1) {
    throw new Error('Comentario no encontrado');
  }
  
  const newReply: ReplyType = {
    id: `reply_${Date.now()}`,
    commentId,
    userId: user.id,
    userName: user.name,
    userPhoto: user.photoURL,
    content,
    timestamp: Date.now()
  };
  
  JOBS[jobIndex].comments[commentIndex].replies.push(newReply);
  return { ...newReply };
};

/**
 * Toggle like para un trabajo
 */
export const toggleJobLike = async (jobId: string, userId: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const jobIndex = JOBS.findIndex(job => job.id === jobId);
  if (jobIndex === -1) {
    throw new Error('Trabajo no encontrado');
  }
  
  const userLiked = JOBS[jobIndex].likes.includes(userId);
  
  if (userLiked) {
    JOBS[jobIndex].likes = JOBS[jobIndex].likes.filter(id => id !== userId);
  } else {
    JOBS[jobIndex].likes = [...JOBS[jobIndex].likes, userId];
  }
  
  return !userLiked;
};

/**
 * Toggle guardar un trabajo para un usuario
 */
export const toggleSavedJob = async (userId: string, jobId: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  if (!SAVED_JOBS[userId]) {
    SAVED_JOBS[userId] = [];
  }
  
  const isJobSaved = SAVED_JOBS[userId].includes(jobId);
  
  if (isJobSaved) {
    SAVED_JOBS[userId] = SAVED_JOBS[userId].filter(id => id !== jobId);
  } else {
    SAVED_JOBS[userId] = [...SAVED_JOBS[userId], jobId];
  }
  
  return !isJobSaved;
};

/**
 * Obtener trabajos guardados por un usuario
 */
export const getSavedJobs = async (userId: string): Promise<JobType[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const savedJobIds = SAVED_JOBS[userId] || [];
  const jobs = JOBS.filter(job => savedJobIds.includes(job.id));
  
  return jobs.map(job => ({ ...job }));
};
