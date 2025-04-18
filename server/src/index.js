
require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { createClient } = require('redis');
const { createAdapter } = require('@socket.io/redis-adapter');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');

// Importar configuración de la base de datos
const db = require('./config/database');

// Importar modelos para asegurar que se registren
const models = require('./models');

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const jobRoutes = require('./routes/job.routes');
const chatRoutes = require('./routes/chat.routes');

// Importar middleware
const { verifyToken } = require('./middleware/auth');

// Inicializar Express
const app = express();
const server = http.createServer(app);

// Configurar Socket.io con Redis
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Configurar Redis para Socket.io (con manejo de errores)
let pubClient;
let subClient;

async function setupRedis() {
  try {
    pubClient = createClient({ url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}` });
    subClient = pubClient.duplicate();
    
    // Manejar errores de Redis
    pubClient.on('error', (err) => {
      console.error('Error de Redis:', err);
    });
    
    await pubClient.connect();
    await subClient.connect();
    console.log('Conectado a Redis correctamente');
    
    // Configurar adapter de Redis para Socket.io
    io.adapter(createAdapter(pubClient, subClient));
    return true;
  } catch (error) {
    console.error('No se pudo conectar a Redis:', error);
    console.log('Continuando sin Redis (funcionalidad de chat limitada)');
    return false;
  }
}

async function startServer() {
  try {
    // Middleware
    app.use(cors());
    app.use(helmet());
    app.use(morgan('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    
    // Configurar rutas estáticas
    app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
    
    // Conectar a la base de datos y sincronizar modelos
    await db.authenticate();
    console.log('Conexión a PostgreSQL establecida');
    
    // Sincronizar modelos con la base de datos (force:true en desarrollo solo)
    // En producción deberías usar { alter: true } o { force: false }
    await db.sync({ force: process.env.NODE_ENV === 'development' });
    console.log('Modelos sincronizados con la base de datos');
    
    // Intentar conectar Redis (no crítico para la aplicación)
    await setupRedis();
    
    // Rutas API
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes); // Algunas rutas requieren autenticación
    app.use('/api/jobs', jobRoutes);   // Algunas rutas públicas, otras protegidas
    app.use('/api/chats', verifyToken, chatRoutes);
    
    // Importar controlador de socket
    const socketController = require('./controllers/socket.controller');
    socketController(io);
    
    // Ruta de verificación de estado
    app.get('/api/health', (req, res) => {
      res.status(200).json({
        status: 'success',
        message: 'Servidor funcionando correctamente',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
      });
    });
    
    // Capturar todas las peticiones no manejadas
    app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
      });
    });
    
    // Manejador global de errores
    app.use((err, req, res, next) => {
      console.error('Error global:', err);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    });
    
    // Iniciar el servidor
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
      console.log(`Modo: ${process.env.NODE_ENV}`);
    });
    
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();
