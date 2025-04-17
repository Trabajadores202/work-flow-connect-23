
/**
 * Contexto de Datos
 * 
 * Proporciona acceso centralizado a datos compartidos en la aplicación:
 * - Lista de usuarios
 * - Categorías de trabajos
 * - Lista de habilidades disponibles
 * - Datos de trabajos
 * 
 * Estos datos ahora se cargan desde datos mock locales mientras 
 * se planifica la migración a un backend personalizado.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { JobType } from './JobContext';

// Tipo de usuario para el DataContext
export type UserType = {
  id: string;
  name: string;
  email: string;
  role: "freelancer" | "client";
  skills?: string[];
  bio?: string;
  photoURL?: string;
  hourlyRate?: number;
  joinedAt?: number;
};

export type CommentType = {
  id: string;
  userId: string;
  text: string;
  timestamp: number;
};

export interface DataContextType {
  users: UserType[];                                     // Lista de todos los usuarios
  getUserById: (userId: string) => UserType | undefined; // Obtener usuario por ID
  getAllUsers: () => UserType[];                         // Obtener todos los usuarios
  loading: boolean;                                      // Estado de carga
  jobs: JobType[];                                       // Lista de trabajos
  jobCategories: string[];                               // Categorías de trabajos disponibles
  skillsList: string[];                                  // Lista de habilidades disponibles
  loadData: () => Promise<void>;                         // Función para recargar datos
}

const DataContext = createContext<DataContextType | null>(null);

// Datos mock para reemplazar los datos de Firebase
const MOCK_USERS: UserType[] = [
  {
    id: "user1",
    name: "Carlos Rodriguez",
    email: "carlos@example.com",
    role: "freelancer",
    skills: ["JavaScript", "React", "Node.js", "MongoDB"],
    bio: "Desarrollador web con 5 años de experiencia en React y Node.js",
    photoURL: "https://randomuser.me/api/portraits/men/1.jpg",
    hourlyRate: 25,
    joinedAt: Date.now() - 86400000 * 30 // 30 días atrás
  },
  {
    id: "user2",
    name: "Ana Martinez",
    email: "ana@example.com",
    role: "freelancer",
    skills: ["UI Design", "UX Research", "Figma", "Adobe XD"],
    bio: "Diseñadora UX/UI especializada en experiencias móviles",
    photoURL: "https://randomuser.me/api/portraits/women/1.jpg",
    hourlyRate: 30,
    joinedAt: Date.now() - 86400000 * 60 // 60 días atrás
  },
  {
    id: "user3",
    name: "Empresa ABC",
    email: "contact@abc.com",
    role: "client",
    bio: "Empresa de desarrollo de software buscando talentos",
    photoURL: "https://logo.clearbit.com/acme.com",
    joinedAt: Date.now() - 86400000 * 45 // 45 días atrás
  }
];

const MOCK_JOB_CATEGORIES = [
  'Desarrollo Web',
  'Diseño UX/UI',
  'Desarrollo Móvil',
  'Marketing Digital',
  'Redacción y Traducción',
  'Consultoría',
  'Administración de Sistemas',
  'Análisis de Datos'
];

const MOCK_SKILLS = [
  'JavaScript',
  'React',
  'Node.js',
  'HTML/CSS',
  'Python',
  'UI Design',
  'UX Research',
  'Figma',
  'Adobe XD',
  'Photoshop',
  'React Native',
  'Flutter',
  'Swift',
  'Kotlin',
  'SEO',
  'SEM',
  'Social Media',
  'Content Writing',
  'Translation',
  'WordPress',
  'PHP',
  'MongoDB',
  'PostgreSQL',
  'AWS',
  'DevOps',
  'Docker',
  'Machine Learning'
];

const MOCK_JOBS: JobType[] = [
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

/**
 * Hook personalizado para acceder al contexto de datos
 */
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData debe ser usado dentro de un DataProvider');
  }
  return context;
};

/**
 * Proveedor del contexto de datos
 * Carga y proporciona acceso a datos mockeados de la aplicación
 */
export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobCategories, setJobCategories] = useState<string[]>([]);
  const [skillsList, setSkillsList] = useState<string[]>([]);

  /**
   * Función para cargar todos los datos mock
   */
  const loadData = async () => {
    setLoading(true);
    try {
      // Simulamos un retraso para imitar la carga desde un servidor
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Cargar usuarios mock
      setUsers(MOCK_USERS);
      
      // Cargar trabajos mock
      setJobs(MOCK_JOBS);
      
      // Cargar categorías y habilidades mock
      setJobCategories(MOCK_JOB_CATEGORIES);
      setSkillsList(MOCK_SKILLS);
      
      console.log("Datos mock cargados correctamente");
    } catch (error) {
      console.error("Error al cargar datos mock:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos iniciales al montar el componente
  useEffect(() => {
    loadData();
  }, []);

  /**
   * Función para obtener un usuario por su ID
   */
  const getUserById = (userId: string) => {
    return users.find(user => user.id === userId);
  };
  
  /**
   * Función para obtener todos los usuarios
   */
  const getAllUsers = () => {
    return users;
  };

  return (
    <DataContext.Provider
      value={{
        users,
        getUserById,
        getAllUsers,
        loading,
        jobCategories,
        skillsList,
        jobs,
        loadData
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
