
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const { sequelize, testConnection } = require('./config/database');
const { Category, Skill } = require('./models'); // Importamos los modelos de categorías y habilidades
require('./models'); // Esto carga todos los modelos

// Cargar variables de entorno
dotenv.config();

// Crear la aplicación Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const jobRoutes = require('./routes/job.routes');
const chatRoutes = require('./routes/chat.routes');

// Definir rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/chats', chatRoutes);

// Ruta para obtener categorías
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Ruta para obtener habilidades
app.get('/api/skills', async (req, res) => {
  try {
    const skills = await Skill.findAll();
    res.json({ success: true, skills });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando correctamente' });
});

// Crear el servidor HTTP
const server = http.createServer(app);

// Configurar Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Importar controladores de Socket.IO
const { initSocket } = require('./controllers/socket.controller');
initSocket(io);

// Datos iniciales para categorías y habilidades
const initialCategories = [
  'Desarrollo Web', 'Diseño UX/UI', 'Marketing Digital', 'Redacción y Traducción',
  'Diseño Gráfico', 'Video y Animación', 'Audio y Música', 'Programación y Tecnología',
  'Análisis de Datos', 'Negocios', 'Legal', 'Ingeniería y Arquitectura', 'Administración'
];

const initialSkills = [
  'JavaScript', 'React', 'HTML/CSS', 'Node.js', 'Vue.js', 'Angular',
  'PHP', 'Laravel', 'Python', 'Django', 'Ruby on Rails', 'Java',
  'UI Design', 'UX Research', 'Figma', 'Adobe XD', 'Sketch', 'Photoshop',
  'Illustrator', 'SEO', 'SEM', 'Facebook Ads', 'Google Ads', 'Email Marketing',
  'Redacción de contenidos', 'Copywriting', 'Traducción', 'Social Media',
  'Edición de video', 'After Effects', 'Premiere Pro', 'WordPress',
  'SQL', 'MongoDB', 'TypeScript', 'Docker', 'AWS', 'Firebase', 
  'Machine Learning', 'Data Science', 'Excel', 'Power BI', 'Tableau'
];

// Inicialización de datos
const initializeData = async () => {
  try {
    // Insertar categorías iniciales si no existen
    for (const categoryName of initialCategories) {
      await Category.findOrCreate({
        where: { name: categoryName },
        defaults: { name: categoryName }
      });
    }
    console.log('Categorías inicializadas correctamente');

    // Insertar habilidades iniciales si no existen
    for (const skillName of initialSkills) {
      await Skill.findOrCreate({
        where: { name: skillName },
        defaults: { name: skillName }
      });
    }
    console.log('Habilidades inicializadas correctamente');
  } catch (error) {
    console.error('Error al inicializar datos:', error);
  }
};

// Iniciar servidor
const startServer = async () => {
  try {
    // Probar conexión a la base de datos
    const isConnected = await testConnection();
    
    if (isConnected) {
      // Sincronizar modelos con la base de datos
      await sequelize.sync({ force: false });
      console.log('Modelos sincronizados con la base de datos.');
      
      // Inicializar datos
      await initializeData();
      
      // Iniciar el servidor HTTP
      server.listen(PORT, () => {
        console.log(`Servidor iniciado en el puerto ${PORT}`);
      });
    } else {
      console.error('No se pudo iniciar el servidor debido a errores de conexión a la DB.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();
