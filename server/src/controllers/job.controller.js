
const { Job, User, Comment, Reply, Category, Skill } = require('../models');
const { Op } = require('sequelize');

// Obtener categorías
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['name', 'ASC']]
    });
    
    return res.status(200).json({
      success: true,
      categories: categories.map(category => category.name)
    });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener categorías',
      error: error.message
    });
  }
};

// Obtener habilidades
exports.getSkills = async (req, res) => {
  try {
    const skills = await Skill.findAll({
      order: [['name', 'ASC']]
    });
    
    return res.status(200).json({
      success: true,
      skills: skills.map(skill => skill.name)
    });
  } catch (error) {
    console.error('Error al obtener habilidades:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener habilidades',
      error: error.message
    });
  }
};

/**
 * Crear un nuevo trabajo
 */
exports.createJob = async (req, res) => {
  try {
    const { title, description, budget, category, skills } = req.body;
    const userId = req.user.id;
    
    console.log('Creating job with data:', { title, description, budget, category, skills, userId });
    
    // Verificar que el usuario es un cliente
    if (req.user.role !== 'client') {
      return res.status(403).json({
        success: false,
        message: 'Solo los clientes pueden publicar trabajos'
      });
    }
    
    // Validar datos requeridos
    if (!title || !description || !budget || !category) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos (título, descripción, presupuesto, categoría)'
      });
    }
    
    // Verificar que la categoría existe
    const categoryExists = await Category.findOne({
      where: { name: category }
    });
    
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'La categoría seleccionada no existe'
      });
    }
    
    // Crear el trabajo
    const job = await Job.create({
      title,
      description,
      budget: parseFloat(budget),
      category,
      skills: Array.isArray(skills) ? skills : [],
      userId
    });
    
    console.log('Job created successfully:', job.id);
    
    // Cargar el trabajo con información del usuario
    const jobWithUser = await Job.findByPk(job.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'photoURL']
        }
      ]
    });
    
    return res.status(201).json({
      success: true,
      message: 'Trabajo creado correctamente',
      job: jobWithUser
    });
    
  } catch (error) {
    console.error('Error al crear trabajo:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al crear trabajo',
      error: error.message
    });
  }
};

/**
 * Obtener todos los trabajos con filtros
 */
exports.getAllJobs = async (req, res) => {
  try {
    const { category, search, status } = req.query;
    const query = {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'photoURL']
        },
        {
          model: User,
          as: 'likedBy',
          attributes: ['id'],
          through: { attributes: [] }
        }
      ],
      order: [['createdAt', 'DESC']],
      where: {}
    };
    
    // Filtrar por categoría
    if (category) {
      query.where.category = category;
    }
    
    // Filtrar por estado
    if (status) {
      query.where.status = status;
    }
    
    // Buscar por título o descripción
    if (search) {
      query.where = {
        ...query.where,
        [Op.or]: [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ]
      };
    }
    
    const jobs = await Job.findAll(query);
    
    return res.status(200).json({
      success: true,
      jobs
    });
    
  } catch (error) {
    console.error('Error al obtener trabajos:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener trabajos',
      error: error.message
    });
  }
};

/**
 * Obtener un trabajo por ID
 */
exports.getJobById = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const job = await Job.findByPk(jobId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'photoURL']
        },
        {
          model: User,
          as: 'likedBy',
          attributes: ['id'],
          through: { attributes: [] }
        },
        {
          model: Comment,
          as: 'comments',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'photoURL']
            },
            {
              model: Reply,
              as: 'replies',
              include: [
                {
                  model: User,
                  as: 'user',
                  attributes: ['id', 'name', 'photoURL']
                }
              ]
            }
          ]
        }
      ]
    });
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Trabajo no encontrado'
      });
    }
    
    return res.status(200).json({
      success: true,
      job
    });
    
  } catch (error) {
    console.error('Error al obtener trabajo por ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener trabajo',
      error: error.message
    });
  }
};

/**
 * Actualizar un trabajo
 */
exports.updateJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { title, description, budget, category, skills, status } = req.body;
    const userId = req.user.id;
    
    const job = await Job.findByPk(jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Trabajo no encontrado'
      });
    }
    
    // Verificar que el usuario es el propietario
    if (job.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para editar este trabajo'
      });
    }
    
    // Actualizar campos
    if (title) job.title = title;
    if (description) job.description = description;
    if (budget) job.budget = budget;
    if (category) job.category = category;
    if (skills) job.skills = skills;
    if (status) job.status = status;
    
    await job.save();
    
    // Cargar el trabajo actualizado con información del usuario
    const updatedJob = await Job.findByPk(jobId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'photoURL']
        }
      ]
    });
    
    return res.status(200).json({
      success: true,
      message: 'Trabajo actualizado correctamente',
      job: updatedJob
    });
    
  } catch (error) {
    console.error('Error al actualizar trabajo:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar trabajo',
      error: error.message
    });
  }
};

/**
 * Eliminar un trabajo
 */
exports.deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;
    
    const job = await Job.findByPk(jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Trabajo no encontrado'
      });
    }
    
    // Verificar que el usuario es el propietario
    if (job.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar este trabajo'
      });
    }
    
    await job.destroy();
    
    return res.status(200).json({
      success: true,
      message: 'Trabajo eliminado correctamente'
    });
    
  } catch (error) {
    console.error('Error al eliminar trabajo:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar trabajo',
      error: error.message
    });
  }
};

/**
 * Añadir un comentario a un trabajo
 */
exports.addComment = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    
    // Verificar que el trabajo existe
    const job = await Job.findByPk(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Trabajo no encontrado'
      });
    }
    
    // Crear comentario
    const comment = await Comment.create({
      content,
      jobId,
      userId
    });
    
    // Cargar comentario con información del usuario
    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'photoURL']
        }
      ]
    });
    
    return res.status(201).json({
      success: true,
      message: 'Comentario añadido correctamente',
      comment: commentWithUser
    });
    
  } catch (error) {
    console.error('Error al añadir comentario:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al añadir comentario',
      error: error.message
    });
  }
};

/**
 * Añadir una respuesta a un comentario
 */
exports.addReply = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    
    // Verificar que el comentario existe
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado'
      });
    }
    
    // Crear respuesta
    const reply = await Reply.create({
      content,
      commentId,
      userId
    });
    
    // Cargar respuesta con información del usuario
    const replyWithUser = await Reply.findByPk(reply.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'photoURL']
        }
      ]
    });
    
    return res.status(201).json({
      success: true,
      message: 'Respuesta añadida correctamente',
      reply: replyWithUser
    });
    
  } catch (error) {
    console.error('Error al añadir respuesta:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al añadir respuesta',
      error: error.message
    });
  }
};

/**
 * Toggle like para un trabajo
 */
exports.toggleJobLike = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;
    
    const job = await Job.findByPk(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Trabajo no encontrado'
      });
    }
    
    // Verificar si el usuario ya ha dado like
    const likedBy = await job.getLikedBy({ where: { id: userId } });
    const hasLiked = likedBy.length > 0;
    
    if (hasLiked) {
      // Quitar like
      await job.removeLikedBy(userId);
    } else {
      // Añadir like
      await job.addLikedBy(userId);
    }
    
    return res.status(200).json({
      success: true,
      liked: !hasLiked
    });
    
  } catch (error) {
    console.error('Error al gestionar like:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al gestionar like',
      error: error.message
    });
  }
};

/**
 * Toggle guardar trabajo
 */
exports.toggleSavedJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;
    
    const job = await Job.findByPk(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Trabajo no encontrado'
      });
    }
    
    // Verificar si el usuario ya ha guardado el trabajo
    const savedBy = await job.getSavedBy({ where: { id: userId } });
    const hasSaved = savedBy.length > 0;
    
    if (hasSaved) {
      // Quitar de guardados
      await job.removeSavedBy(userId);
    } else {
      // Añadir a guardados
      await job.addSavedBy(userId);
    }
    
    return res.status(200).json({
      success: true,
      saved: !hasSaved
    });
    
  } catch (error) {
    console.error('Error al gestionar trabajo guardado:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al gestionar trabajo guardado',
      error: error.message
    });
  }
};

/**
 * Obtener trabajos guardados por el usuario
 */
exports.getSavedJobs = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findByPk(userId);
    const savedJobs = await user.getSavedJobs({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'photoURL']
        }
      ]
    });
    
    return res.status(200).json({
      success: true,
      jobs: savedJobs
    });
    
  } catch (error) {
    console.error('Error al obtener trabajos guardados:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener trabajos guardados',
      error: error.message
    });
  }
};
