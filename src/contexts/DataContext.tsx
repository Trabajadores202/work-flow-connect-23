
import React, { createContext, useContext, useState, useEffect } from 'react';
import { JobType } from './JobContext';
import {
  getAllUsers as getFirebaseUsers,
  getUserById as getFirebaseUserById,
  getJobCategories as getFirebaseJobCategories,
  getSkillsList as getFirebaseSkillsList,
  getAllJobs as getFirebaseJobs
} from '@/lib/firebaseUtils';

// Asegúrate de que el UserType en DataContext coincida o extienda el UserType de AuthContext
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
  users: UserType[];
  getUserById: (userId: string) => UserType | undefined;
  getAllUsers: () => UserType[];
  loading: boolean;
  jobs: JobType[];
  jobCategories: string[];
  skillsList: string[];
  loadData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData debe ser usado dentro de un DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobCategories, setJobCategories] = useState<string[]>([]);
  const [skillsList, setSkillsList] = useState<string[]>([]);

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

  useEffect(() => {
    loadData();
  }, []);

  const getUserById = (userId: string) => {
    return users.find(user => user.id === userId);
  };
  
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
