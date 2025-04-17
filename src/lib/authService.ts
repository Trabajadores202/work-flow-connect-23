
/**
 * Servicio de Autenticación
 * 
 * Este servicio proporciona funcionalidades temporales de autenticación
 * mientras se implementa un backend personalizado.
 */

import { UserType } from "@/contexts/DataContext";

// Usuarios mock para autenticación
const MOCK_USERS = [
  {
    id: "user1",
    name: "Carlos Rodriguez",
    email: "carlos@example.com",
    password: "password123", // En un sistema real, esto estaría hasheado
    role: "freelancer",
    skills: ["JavaScript", "React", "Node.js", "MongoDB"],
    bio: "Desarrollador web con 5 años de experiencia en React y Node.js",
    photoURL: "https://randomuser.me/api/portraits/men/1.jpg",
    hourlyRate: 25,
    joinedAt: Date.now() - 86400000 * 30
  },
  {
    id: "user2",
    name: "Ana Martinez",
    email: "ana@example.com",
    password: "password123",
    role: "freelancer",
    skills: ["UI Design", "UX Research", "Figma", "Adobe XD"],
    bio: "Diseñadora UX/UI especializada en experiencias móviles",
    photoURL: "https://randomuser.me/api/portraits/women/1.jpg",
    hourlyRate: 30,
    joinedAt: Date.now() - 86400000 * 60
  },
  {
    id: "user3",
    name: "Empresa ABC",
    email: "contact@abc.com",
    password: "password123",
    role: "client",
    bio: "Empresa de desarrollo de software buscando talentos",
    photoURL: "https://logo.clearbit.com/acme.com",
    joinedAt: Date.now() - 86400000 * 45
  }
];

// Almacenamiento local para el usuario actual
let currentUser: UserType | null = null;
const SESSION_STORAGE_KEY = 'workflowconnect_user';

// Guardar sesión de usuario actual
const saveSession = (user: UserType | null) => {
  if (user) {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }
  currentUser = user;
};

// Cargar sesión guardada
export const loadSession = (): UserType | null => {
  const savedUser = localStorage.getItem(SESSION_STORAGE_KEY);
  if (savedUser) {
    try {
      const parsedUser = JSON.parse(savedUser);
      currentUser = parsedUser;
      return parsedUser;
    } catch (error) {
      console.error('Error al cargar la sesión:', error);
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }
  return null;
};

/**
 * Iniciar sesión con email y contraseña
 */
export const loginUser = async (email: string, password: string): Promise<UserType> => {
  // Simulamos un retraso para imitar una petición a un servidor
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const user = MOCK_USERS.find(user => user.email === email);
  
  if (!user || user.password !== password) {
    throw new Error('Credenciales incorrectas');
  }
  
  // Omitimos el campo password antes de devolverlo
  const { password: _, ...safeUser } = user;
  saveSession(safeUser as UserType);
  
  return safeUser as UserType;
};

/**
 * Registro de nuevo usuario
 */
export const registerUser = async (email: string, password: string, name: string): Promise<UserType> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Verificar si el email ya está registrado
  if (MOCK_USERS.some(user => user.email === email)) {
    throw new Error('El correo electrónico ya está registrado');
  }
  
  // Crear nuevo usuario
  const newUser = {
    id: `user${Date.now()}`,
    name,
    email,
    role: "freelancer" as const,
    bio: "",
    skills: [],
    joinedAt: Date.now()
  };
  
  // En un sistema real, aquí guardaríamos el usuario en la base de datos
  saveSession(newUser);
  
  return newUser;
};

/**
 * Cerrar sesión del usuario actual
 */
export const logoutUser = async (): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  saveSession(null);
};

/**
 * Actualizar perfil de usuario
 */
export const updateUserProfile = async (userId: string, data: Partial<UserType>): Promise<Partial<UserType>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (currentUser && currentUser.id === userId) {
    const updatedUser = { ...currentUser, ...data };
    saveSession(updatedUser);
    return data;
  }
  
  throw new Error('No autorizado para actualizar este perfil');
};

/**
 * Simular subida de foto de perfil
 */
export const uploadUserPhoto = async (userId: string, file: File): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simular tiempo de carga
  
  // En un sistema real, aquí subiríamos la foto y obtendríamos una URL
  // Por ahora, devolvemos una URL de imagen aleatoria
  const photoURL = `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 100)}.jpg`;
  
  if (currentUser && currentUser.id === userId) {
    const updatedUser = { ...currentUser, photoURL };
    saveSession(updatedUser);
  }
  
  return photoURL;
};

// Función para establecer un manejador de cambio de autenticación
export const onAuthStateChanged = (callback: (user: UserType | null) => void) => {
  // Ejecutar de inmediato con el usuario actual
  callback(loadSession());
  
  // En un sistema real, aquí estableceríamos un listener
  // Por ahora, simplemente devolvemos una función vacía para simular la limpieza
  return () => {};
};
