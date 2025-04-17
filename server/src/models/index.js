
const User = require('./user.model');
const Job = require('./job.model');
const Comment = require('./comment.model');
const Reply = require('./reply.model');
const Chat = require('./chat.model');
const Message = require('./message.model');

// Relaciones entre modelos
// Usuario - Trabajo
User.hasMany(Job, { foreignKey: 'userId', as: 'jobs' });
Job.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Usuario - Likes de trabajo
Job.belongsToMany(User, { through: 'JobLikes', as: 'likedBy' });
User.belongsToMany(Job, { through: 'JobLikes', as: 'likedJobs' });

// Usuario - Trabajos guardados
Job.belongsToMany(User, { through: 'SavedJobs', as: 'savedBy' });
User.belongsToMany(Job, { through: 'SavedJobs', as: 'savedJobs' });

// Trabajo - Comentarios
Job.hasMany(Comment, { foreignKey: 'jobId', as: 'comments' });
Comment.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

// Usuario - Comentarios
User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Comentario - Respuestas
Comment.hasMany(Reply, { foreignKey: 'commentId', as: 'replies' });
Reply.belongsTo(Comment, { foreignKey: 'commentId', as: 'comment' });

// Usuario - Respuestas
User.hasMany(Reply, { foreignKey: 'userId', as: 'replies' });
Reply.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Usuario - Chats (para chats en grupo)
User.belongsToMany(Chat, { through: 'UserChats', as: 'chats' });
Chat.belongsToMany(User, { through: 'UserChats', as: 'participants' });

// Chat - Mensajes
Chat.hasMany(Message, { foreignKey: 'chatId', as: 'messages' });
Message.belongsTo(Chat, { foreignKey: 'chatId', as: 'chat' });

// Usuario - Mensajes
User.hasMany(Message, { foreignKey: 'userId', as: 'messages' });
Message.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  User,
  Job,
  Comment,
  Reply,
  Chat,
  Message
};
