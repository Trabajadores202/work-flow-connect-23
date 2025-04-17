
/**
 * Contexto de Autenticación
 * 
 * Este contexto proporciona funcionalidad de autenticación para la aplicación, incluyendo:
 * - Manejo de inicio de sesión y registro de usuarios
 * - Gestión del estado del usuario actual
 * - Actualización del perfil de usuario
 * - Cierre de sesión
 */

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { toast } from "@/components/ui/use-toast";
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  updateUserProfile as updateUserProfileService,
  uploadUserPhoto,
  onAuthStateChanged,
  loadSession
} from "@/lib/authService";

export type UserType = {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  bio?: string;
  skills?: string[];
  role: 'freelancer' | 'client';
  savedJobs?: string[];
  hourlyRate?: number;
  joinedAt?: number;
};

interface AuthContextType {
  currentUser: UserType | null; // Usuario actualmente autenticado
  loading: boolean; // Indica si está cargando el estado de autenticación
  login: (email: string, password: string) => Promise<void>; // Función para iniciar sesión
  register: (email: string, password: string, name: string) => Promise<void>; // Función para registrar un nuevo usuario
  logout: () => Promise<void>; // Función para cerrar sesión
  updateUserProfile: (data: Partial<UserType>) => Promise<void>; // Función para actualizar el perfil del usuario
  uploadProfilePhoto: (file: File) => Promise<string>; // Función para subir una foto de perfil
}

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Hook personalizado para acceder al contexto de autenticación
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Proveedor del contexto de autenticación
 * Maneja el estado de autenticación y proporciona funciones relacionadas
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserType | null>(loadSession());
  const [loading, setLoading] = useState(true);

  // Efecto para escuchar cambios en el estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  /**
   * Función para iniciar sesión con correo y contraseña
   */
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const user = await loginUser(email, password);
      setCurrentUser(user);
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido a WorkFlowConnect",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error de inicio de sesión",
        description: error instanceof Error ? error.message : "Error al iniciar sesión",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Función para registrar un nuevo usuario
   */
  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const user = await registerUser(email, password, name);
      setCurrentUser(user);
      toast({
        title: "Registro exitoso",
        description: "¡Bienvenido a WorkFlowConnect!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error de registro",
        description: error instanceof Error ? error.message : "Error al registrar",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Función para cerrar sesión
   */
  const logout = async () => {
    try {
      await logoutUser();
      setCurrentUser(null);
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al cerrar sesión"
      });
    }
  };

  /**
   * Función para actualizar el perfil del usuario
   */
  const updateUserProfile = async (data: Partial<UserType>) => {
    if (!currentUser) throw new Error('No hay usuario autenticado');
    
    try {
      await updateUserProfileService(currentUser.id, data);
      setCurrentUser(prev => prev ? { ...prev, ...data } : null);
      toast({
        title: "Perfil actualizado",
        description: "Tus cambios han sido guardados",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al actualizar el perfil"
      });
      throw error;
    }
  };

  /**
   * Función para subir una foto de perfil
   */
  const uploadProfilePhoto = async (file: File) => {
    if (!currentUser) throw new Error('No hay usuario autenticado');
    
    try {
      console.log("Iniciando proceso de subida de foto de perfil");
      const photoURL = await uploadUserPhoto(currentUser.id, file);
      
      setCurrentUser(prev => prev ? { ...prev, photoURL } : null);
      
      toast({
        title: "Foto actualizada",
        description: "Tu foto de perfil ha sido actualizada",
      });
      
      console.log("Foto de perfil actualizada correctamente:", photoURL);
      return photoURL;
    } catch (error) {
      console.error("Error en uploadProfilePhoto:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al subir la foto de perfil"
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        currentUser, 
        loading, 
        login, 
        register, 
        logout,
        updateUserProfile,
        uploadProfilePhoto
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
