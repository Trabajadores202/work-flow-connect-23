
/**
 * Punto de entrada de la aplicación
 * 
 * Este es el punto de entrada principal para la aplicación React que:
 * - Inicializa los datos de Firebase
 * - Configura los proveedores globales
 * - Renderiza el componente principal App en el DOM
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './contexts/ThemeContext.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { DataProvider } from './contexts/DataContext.tsx'
import { JobProvider } from './contexts/JobContext.tsx'
import { ChatProvider } from './contexts/ChatContext.tsx'
import { Toaster } from './components/ui/toaster.tsx'
import { initializeFirebaseData } from './lib/firebaseUtils'

// Inicializar los datos de Firebase antes de renderizar la aplicación
initializeFirebaseData().then(() => {
  console.log("La inicialización de Firebase está completa o ya fue inicializada");
}).catch(error => {
  console.error("La inicialización de Firebase falló:", error);
});

// Renderizar la aplicación en el DOM
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <JobProvider>
            <ChatProvider>
              <App />
              <Toaster />
            </ChatProvider>
          </JobProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
