
const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Middleware para verificar token JWT
 */
exports.verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Acceso denegado. Token no proporcionado.'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Buscar usuario en la base de datos
      const user = await User.findByPk(decoded.id);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      
      // Añadir usuario al objeto request
      req.user = user;
      next();
      
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }
    
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Middleware para verificar permisos de cliente
 */
exports.isClient = (req, res, next) => {
  if (req.user && req.user.role === 'client') {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    message: 'Acceso denegado. Se requiere rol de cliente.'
  });
};

/**
 * Middleware para verificar si es propietario del recurso (ej: job, comment)
 */
exports.isOwner = (model) => async (req, res, next) => {
  try {
    const resourceId = req.params.id;
    const userId = req.user.id;
    
    const resource = await model.findByPk(resourceId);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Recurso no encontrado'
      });
    }
    
    if (resource.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. No eres propietario de este recurso.'
      });
    }
    
    req.resource = resource;
    next();
    
  } catch (error) {
    console.error('Error en middleware isOwner:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
