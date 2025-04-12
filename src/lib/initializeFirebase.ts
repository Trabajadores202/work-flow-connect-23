
import { doc, getDoc, setDoc, collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

// Categorías de trabajo de ejemplo
const SAMPLE_JOB_CATEGORIES = [
  'Desarrollo Web',
  'Diseño UX/UI',
  'Desarrollo Móvil',
  'Marketing Digital',
  'Redacción y Traducción',
  'Consultoría',
  'Administración de Sistemas',
  'Análisis de Datos'
];

// Lista de habilidades de ejemplo
const SAMPLE_SKILLS = [
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

// Datos de usuarios de ejemplo
const SAMPLE_USERS = [
  {
    name: 'Carlos Rodriguez',
    email: 'carlos@example.com',
    bio: 'Desarrollador web con 5 años de experiencia en React y Node.js',
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
    role: 'freelancer',
    photoURL: 'https://randomuser.me/api/portraits/men/1.jpg'
  },
  {
    name: 'Ana Martinez',
    email: 'ana@example.com',
    bio: 'Diseñadora UX/UI especializada en experiencias móviles',
    skills: ['UI Design', 'UX Research', 'Figma', 'Adobe XD'],
    role: 'freelancer',
    photoURL: 'https://randomuser.me/api/portraits/women/1.jpg'
  },
  {
    name: 'Empresa ABC',
    email: 'contact@abc.com',
    bio: 'Empresa de desarrollo de software buscando talentos',
    role: 'client',
    photoURL: 'https://logo.clearbit.com/acme.com'
  }
];

// Trabajos de ejemplo
const SAMPLE_JOBS = [
  {
    title: 'Desarrollo de sitio web responsive',
    description: 'Necesitamos desarrollar un sitio web responsive para nuestra empresa. El sitio debe ser moderno, rápido y fácil de usar.',
    budget: 1500,
    category: 'Desarrollo Web',
    skills: ['JavaScript', 'React', 'HTML/CSS'],
    userId: '', // Se completará con el ID de usuario actual
    userName: 'Empresa ABC',
    userPhoto: 'https://logo.clearbit.com/acme.com',
    status: 'open'
  },
  {
    title: 'Diseño de interfaz para aplicación móvil',
    description: 'Buscamos un diseñador UX/UI para crear la interfaz de nuestra nueva aplicación móvil de fitness.',
    budget: 1200,
    category: 'Diseño UX/UI',
    skills: ['UI Design', 'UX Research', 'Figma'],
    userId: '', // Se completará con el ID de usuario actual
    userName: 'Empresa ABC',
    userPhoto: 'https://logo.clearbit.com/acme.com',
    status: 'open'
  }
];

// Función para crear una colección si no existe
const ensureCollectionExists = async (collectionName) => {
  const collectionRef = collection(db, collectionName);
  const snapshot = await getDocs(collectionRef);
  return snapshot.empty;
};

// Función para inicializar Firebase con datos de ejemplo
export const initializeFirebaseData = async () => {
  try {
    // Verificar si la colección de metadatos existe
    const metadataDoc = await getDoc(doc(db, "metadata", "initialized"));
    if (metadataDoc.exists()) {
      console.log("Firebase ya está inicializado con datos de ejemplo");
      return;
    }

    console.log("Inicializando Firebase con datos de ejemplo...");
    
    // Crear colecciones si no existen
    await Promise.all([
      ensureCollectionExists("users"),
      ensureCollectionExists("jobs"),
      ensureCollectionExists("chats"),
      ensureCollectionExists("metadata")
    ]);

    // Añadir categorías de trabajo
    await setDoc(doc(db, "metadata", "jobCategories"), {
      categories: SAMPLE_JOB_CATEGORIES
    });

    // Añadir lista de habilidades
    await setDoc(doc(db, "metadata", "skills"), {
      skills: SAMPLE_SKILLS
    });

    // Añadir usuarios de ejemplo
    const userPromises = SAMPLE_USERS.map(async (userData) => {
      const userDocRef = doc(collection(db, "users"));
      const userId = userDocRef.id;
      await setDoc(userDocRef, {
        id: userId,
        ...userData,
        joinedAt: serverTimestamp(),
        savedJobs: []
      });
      return { id: userId, ...userData };
    });
    
    const createdUsers = await Promise.all(userPromises);
    
    // Añadir trabajos de ejemplo vinculados a los usuarios creados
    const clientUser = createdUsers.find(user => user.role === 'client');
    if (clientUser) {
      const jobPromises = SAMPLE_JOBS.map(async (jobData) => {
        const timestamp = serverTimestamp();
        await addDoc(collection(db, "jobs"), {
          ...jobData,
          userId: clientUser.id,
          timestamp,
          comments: [],
          likes: []
        });
      });
      await Promise.all(jobPromises);
    }

    // Marcar como inicializado
    await setDoc(doc(db, "metadata", "initialized"), {
      timestamp: serverTimestamp(),
      initialized: true
    });

    console.log("Firebase inicializado con datos de ejemplo exitosamente!");
  } catch (error) {
    console.error("Error al inicializar los datos de Firebase:", error);
    throw error;
  }
};
