
/**
 * Contexto de Datos
 * 
 * Proporciona acceso centralizado a datos compartidos en la aplicación:
 * - Lista de usuarios
 * - Categorías de trabajos
 * - Lista de habilidades disponibles
 * - Datos de trabajos
 * 
 * Estos datos se cargan desde Firebase y se mantienen disponibles para
 * todos los componentes que los necesiten.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { JobType } from './JobContext';
import {
  getAllUsers as getFirebaseUsers,
  getUserById as getFirebaseUserById,
  getJobCategories as getFirebaseJobCategories,
  getSkillsList as getFirebaseSkillsList,
  getAllJobs as getFirebaseJobs
} from '@/lib/firebaseUtils';

// Tipo de usuario para el DataContext (asegurándose que sea compatible con AuthContext)
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
 * Carga y proporciona acceso a datos compartidos de la aplicación
 */
export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobCategories, setJobCategories] = useState<string[]>([]);
  const [skillsList, setSkillsList] = useState<string[]>([]);

  /**
   * Función para cargar todos los datos desde Firebase
   */
  const loadData = async () => {
    setLoading(true);
    try {
      // Cargar usuarios
      const usersData = await getFirebaseUsers();
      // Convertir usuarios de Firebase al tipo UserType de DataContext
      const convertedUsers = usersData.map(user => ({
        id: user.id,
        name: user.name || "",
        email: user.email || "",
        role: user.role as "freelancer" | "client" || "freelancer",
        bio: user.bio,
        photoURL: user.photoURL,
        skills: user.skills,
        hourlyRate: user.hourlyRate,
        joinedAt: user.joinedAt
      }));
      setUsers(convertedUsers);
      
      // Cargar trabajos
      const jobsData = await getFirebaseJobs();
      setJobs(jobsData);
      
      // Cargar categorías y habilidades
      const categories = await getFirebaseJobCategories();
      setJobCategories(categories);
      
      const skills = await getFirebaseSkillsList();
      setSkillsList(skills);
    } catch (error) {
      console.error("Error al cargar datos:", error);
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
