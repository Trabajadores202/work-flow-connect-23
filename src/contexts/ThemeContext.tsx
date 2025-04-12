
/**
 * Contexto del Tema
 * 
 * Gestiona el tema de la aplicación (claro/oscuro) y permite a los usuarios
 * cambiar entre temas. Persiste la preferencia del usuario en localStorage.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

type ThemeContextType = {
  theme: Theme;          // Tema actual ('light' o 'dark')
  toggleTheme: () => void; // Función para alternar entre temas
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Hook personalizado para acceder al contexto del tema
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme debe usarse dentro de un ThemeProvider');
  }
  return context;
};

/**
 * Proveedor del contexto del tema
 * Maneja la lógica para cambiar entre temas claro y oscuro
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');

  // Al iniciar, verificar si hay una preferencia de tema en localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    
    // Si hay una preferencia guardada, usarla
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } 
    // Si no hay preferencia, usar la preferencia del sistema
    else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  }, []);

  /**
   * Función para alternar entre temas claro y oscuro
   * Actualiza el estado, las clases CSS y guarda la preferencia en localStorage
   */
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
