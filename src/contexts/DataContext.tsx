
/**
 * Contexto de Datos
 * 
 * Este contexto proporciona datos globales y funciones auxiliares para la aplicación:
 * - Información de usuarios
 * - Categorías de trabajos
 * - Lista de habilidades
 * - Otros datos globales
 */

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { getCategories, getSkills } from '@/lib/api';

export type UserType = {
  id: string;
  name: string;
  email: string;
  role: 'freelancer' | 'client';
  photoURL?: string;
  bio?: string;
  location?: string;
  skills?: string[];
  joinDate?: number;
};

interface DataContextType {
  jobCategories: string[];
  skillsList: string[];
  users: UserType[];
  loadingData: boolean;
  getUserById: (userId: string) => UserType | undefined;
  getAllUsers: () => UserType[];
  fetchCategories: () => Promise<void>;
  fetchSkills: () => Promise<void>;
}

// Algunos usuarios para pruebas (en producción vendrían de la API)
const testUsers: UserType[] = [
  {
    id: 'user1',
    name: 'Juan Pérez',
    email: 'juan@example.com',
    role: 'freelancer',
    photoURL: 'https://i.pravatar.cc/150?img=1',
    bio: 'Desarrollador web con 5 años de experiencia en React y Node.js',
    location: 'Madrid, España',
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
    joinDate: Date.now() - 90 * 24 * 60 * 60 * 1000 // 90 días atrás
  },
  {
    id: 'user2',
    name: 'María Gómez',
    email: 'maria@example.com',
    role: 'freelancer',
    photoURL: 'https://i.pravatar.cc/150?img=5',
    bio: 'Diseñadora UX/UI con pasión por crear experiencias de usuario increíbles',
    location: 'Barcelona, España',
    skills: ['UI Design', 'UX Research', 'Figma', 'Adobe XD'],
    joinDate: Date.now() - 120 * 24 * 60 * 60 * 1000 // 120 días atrás
  },
  {
    id: 'user3',
    name: 'Empresa ABC',
    email: 'info@empresaabc.com',
    role: 'client',
    photoURL: 'https://logo.clearbit.com/acme.com',
    bio: 'Empresa dedicada al desarrollo de software y soluciones tecnológicas',
    location: 'Valencia, España',
    joinDate: Date.now() - 180 * 24 * 60 * 60 * 1000 // 180 días atrás
  }
];

const DataContext = createContext<DataContextType | null>(null);

/**
 * Hook personalizado para acceder al contexto de datos
 */
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData debe usarse dentro de un DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

/**
 * Proveedor del contexto de datos
 * Proporciona datos globales y funcionalidad relacionada
 */
export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  // Estado para categorías de trabajos
  const [jobCategories, setJobCategories] = useState<string[]>([]);
  
  // Estado para lista de habilidades
  const [skillsList, setSkillsList] = useState<string[]>([]);
  
  // Estado de carga de datos
  const [loadingData, setLoadingData] = useState<boolean>(true);
  
  // Estado para usuarios (en producción vendrían de una API)
  const [users] = useState<UserType[]>(testUsers);
  
  /**
   * Obtener categorías de trabajos desde la API
   */
  const fetchCategories = async () => {
    try {
      const categories = await getCategories();
      if (Array.isArray(categories) && categories.length > 0) {
        setJobCategories(categories);
      } else {
        console.warn("No se pudieron cargar las categorías desde la API, usando datos de respaldo");
      }
    } catch (error) {
      console.error("Error al obtener categorías:", error);
    }
  };
  
  /**
   * Obtener lista de habilidades desde la API
   */
  const fetchSkills = async () => {
    try {
      const skills = await getSkills();
      if (Array.isArray(skills) && skills.length > 0) {
        setSkillsList(skills);
      } else {
        console.warn("No se pudieron cargar las habilidades desde la API, usando datos de respaldo");
      }
    } catch (error) {
      console.error("Error al obtener habilidades:", error);
    }
  };
  
  // Cargar datos al iniciar
  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      await Promise.all([
        fetchCategories(),
        fetchSkills()
      ]);
      setLoadingData(false);
    };
    
    loadData();
  }, []);
  
  /**
   * Obtener un usuario por su ID
   */
  const getUserById = (userId: string) => {
    return users.find(user => user.id === userId);
  };
  
  /**
   * Obtener todos los usuarios
   */
  const getAllUsers = () => {
    return users;
  };
  
  return (
    <DataContext.Provider
      value={{
        jobCategories,
        skillsList,
        users,
        loadingData,
        getUserById,
        getAllUsers,
        fetchCategories,
        fetchSkills
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
