
/**
 * Archivo de Configuración de Firebase
 * 
 * Este archivo inicializa los servicios de Firebase utilizados en toda la aplicación.
 * Exporta las instancias inicializadas de Firebase para autenticación, base de datos Firestore
 * y almacenamiento que otras partes de la aplicación pueden importar y utilizar.
 */

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Configuración de Firebase con las claves API
const firebaseConfig = {
  apiKey: "AIzaSyBMIiGervn7yGFctTZaO1Xjhrtw7_MX6_g",
  authDomain: "workflow-connect-cefbd.firebaseapp.com",
  projectId: "workflow-connect-cefbd",
  storageBucket: "workflow-connect-cefbd.firebasestorage.app",
  messagingSenderId: "796741870082",
  appId: "1:796741870082:web:1c02dead4f29df44fa3d1b"
};

// Inicializar los servicios de Firebase
const app = initializeApp(firebaseConfig); // Aplicación Firebase principal
const auth = getAuth(app);    // Servicio de autenticación
const db = getFirestore(app); // Servicio de base de datos Firestore
const storage = getStorage(app); // Servicio de almacenamiento para archivos/imágenes

export { auth, db, storage };
