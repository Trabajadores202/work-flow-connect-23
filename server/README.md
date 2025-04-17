
# WorkFlow Connect - Backend

Este es el backend para la aplicación WorkFlow Connect, una plataforma que conecta freelancers con clientes.

## Requisitos

- Node.js v14 o superior
- PostgreSQL v12 o superior
- Redis v6 o superior

## Instalación

1. Clonar el repositorio
2. Instalar dependencias: `npm install`
3. Configurar variables de entorno (ver `.env.example`)
4. Iniciar el servidor: `npm run dev`

## Características principales

- API RESTful con Express
- Comunicación en tiempo real con Socket.io
- Autenticación basada en JWT
- Base de datos PostgreSQL con Sequelize
- Escalabilidad de chats con Redis
- Subida de archivos
- Sistema completo de gestión de usuarios, trabajos y mensajes

## Estructura del proyecto

- `/src`: Código fuente
  - `/config`: Configuraciones (base de datos, etc.)
  - `/controllers`: Controladores de la API
  - `/middleware`: Middleware personalizado
  - `/models`: Modelos de datos
  - `/routes`: Rutas de la API
  - `index.js`: Punto de entrada

## API Endpoints

### Autenticación

- `POST /api/auth/register`: Registrar un nuevo usuario
- `POST /api/auth/login`: Iniciar sesión
- `POST /api/auth/logout`: Cerrar sesión
- `GET /api/auth/verify`: Verificar token JWT

### Usuarios

- `GET /api/users/me`: Obtener información del usuario actual
- `GET /api/users/search`: Buscar usuarios
- `GET /api/users/:userId`: Obtener perfil de usuario por ID
- `PUT /api/users/profile`: Actualizar perfil de usuario
- `POST /api/users/profile/photo`: Subir foto de perfil

### Trabajos

- `GET /api/jobs`: Listar todos los trabajos
- `GET /api/jobs/:jobId`: Obtener detalle de un trabajo
- `POST /api/jobs`: Crear un nuevo trabajo
- `PUT /api/jobs/:jobId`: Actualizar un trabajo
- `DELETE /api/jobs/:jobId`: Eliminar un trabajo
- `POST /api/jobs/:jobId/comments`: Añadir un comentario
- `POST /api/jobs/comments/:commentId/replies`: Responder a un comentario
- `POST /api/jobs/:jobId/like`: Dar/quitar like a un trabajo
- `POST /api/jobs/:jobId/save`: Guardar/desmarcar un trabajo
- `GET /api/jobs/saved/me`: Obtener trabajos guardados

### Chats

- `GET /api/chats`: Obtener chats del usuario
- `GET /api/chats/:chatId`: Obtener un chat con mensajes
- `POST /api/chats`: Crear un nuevo chat
- `POST /api/chats/:chatId/messages`: Enviar un mensaje
- `POST /api/chats/:chatId/participants`: Añadir participante a un chat grupal
- `DELETE /api/chats/:chatId/leave`: Abandonar un chat

## Eventos de Socket.io

### Cliente a Servidor

- `send_message`: Enviar un mensaje
- `typing`: Notificar que el usuario está escribiendo
- `mark_read`: Marcar mensajes como leídos
- `join_chat`: Unirse a una sala de chat

### Servidor a Cliente

- `new_message`: Nuevo mensaje recibido
- `user_typing`: Usuario está escribiendo
- `messages_read`: Mensajes leídos por un usuario
- `user_status_change`: Cambio de estado de un usuario (online/offline)
- `error`: Error en alguna operación

## Licencia

MIT
