
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

// Configurar Redis para Socket.io
const pubClient = createClient({ url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}` });
const subClient = pubClient.duplicate();

// Manejar errores de Redis
pubClient.on('error', (err) => {
  console.error('Error de Redis:', err);
});

async function startServer() {
  try {
    // Conectar Redis
    await pubClient.connect();
    await subClient.connect();
    console.log('Conectado a Redis');
    
    // Configurar adapter de Redis para Socket.io
    io.adapter(createAdapter(pubClient, subClient));
    
    // Conectar a la base de datos y sincronizar modelos
    await db.authenticate();
    console.log('Conexión a PostgreSQL establecida');
    await db.sync({ alter: true });
    console.log('Modelos sincronizados con la base de datos');
    
    // Middleware
    app.use(cors());
    app.use(helmet());
    app.use(morgan('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    
    // Configurar rutas estáticas
    app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
    
    // Rutas API
    app.use('/api/auth', authRoutes);
    app.use('/api/users', verifyToken, userRoutes);
    app.use('/api/jobs', jobRoutes); // Algunas rutas públicas, otras protegidas
    app.use('/api/chats', verifyToken, chatRoutes);
    
    // Importar controlador de socket
    const socketController = require('./controllers/socket.controller');
    socketController(io);
    
    // Ruta de verificación de estado
    app.get('/api/health', (req, res) => {
      res.status(200).json({
        status: 'success',
        message: 'Servidor funcionando correctamente',
        timestamp: new Date().toISOString()
      });
    });
    
    // Iniciar el servidor
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
    
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();
