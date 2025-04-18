
/**
 * Servicio de Autenticación
 * 
 * Este servicio proporciona funcionalidades de autenticación 
 * conectándose con el backend.
 */

import { UserType } from "@/contexts/DataContext";

const SESSION_STORAGE_KEY = 'workflowconnect_token';
const USER_STORAGE_KEY = 'workflowconnect_user';

/**
 * Obtiene el token JWT almacenado
 */
export const getToken = (): string | null => {
  return localStorage.getItem(SESSION_STORAGE_KEY);
};

/**
 * Guarda el token JWT
 */
export const saveToken = (token: string): void => {
  localStorage.setItem(SESSION_STORAGE_KEY, token);
};

/**
 * Elimina el token JWT
 */
export const removeToken = (): void => {
  localStorage.removeItem(SESSION_STORAGE_KEY);
};

/**
 * Guarda la información del usuario en localStorage
 */
export const saveUserData = (user: UserType): void => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

/**
 * Obtiene la información del usuario desde localStorage
 */
export const getUserData = (): UserType | null => {
  const userData = localStorage.getItem(USER_STORAGE_KEY);
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error al parsear datos de usuario:', error);
    }
  }
  return null;
};

/**
 * Elimina la información del usuario de localStorage
 */
export const removeUserData = (): void => {
  localStorage.removeItem(USER_STORAGE_KEY);
};

/**
 * Carga la sesión del usuario desde localStorage
 */
export const loadSession = (): UserType | null => {
  return getUserData();
};

/**
 * Cierra la sesión del usuario eliminando datos y token
 */
export const clearSession = (): void => {
  removeToken();
  removeUserData();
};
