const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { validate, createUserSchema, updateUserSchema, uuidSchema } = require('../middlewares/validation');
const User = require('../models/User');
const logger = require('../utils/logger');

// Todas as rotas requerem autenticação e permissão de admin
router.use(authenticate);
router.use(authorize('admin'));

/**
 * @route   GET /api/users
 * @desc    Listar todos os usuários
 * @access  Private (admin)
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, role, is_active, search } = req.query;
    const offset = (page - 1) * limit;
    const { Op } = require('sequelize');

    const where = {};
    if (role) where.role = role;
    if (is_active !== undefined) where.is_active = is_active === 'true';
    
    // Busca por nome ou email
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Erro ao listar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar usuários'
    });
  }
});

/**
 * @route   GET /api/users/statistics
 * @desc    Estatísticas de usuários
 * @access  Private (admin)
 */
router.get('/statistics', async (req, res) => {
  try {
    const stats = await User.getStatistics();

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas'
    });
  }
});

/**
 * @route   GET /api/users/:id
 * @desc    Obter usuário por ID
 * @access  Private (admin)
 */
router.get('/:id', validate(uuidSchema, 'params'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar usuário'
    });
  }
});

/**
 * @route   POST /api/users
 * @desc    Criar novo usuário
 * @access  Private (admin)
 */
router.post('/', validate(createUserSchema), async (req, res) => {
  try {
    const { email } = req.body;

    // Verificar se email já existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email já cadastrado'
      });
    }

    const user = await User.create(req.body);

    logger.info(`Usuário ${user.email} criado por ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: user
    });
  } catch (error) {
    logger.error('Erro ao criar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar usuário'
    });
  }
});

/**
 * @route   PUT /api/users/:id
 * @desc    Atualizar usuário
 * @access  Private (admin)
 */
router.put('/:id', validate(uuidSchema, 'params'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Se estiver mudando email, verificar duplicidade
    if (req.body.email && req.body.email !== user.email) {
      const existingEmail = await User.findOne({ 
        where: { 
          email: req.body.email,
          id: { [require('sequelize').Op.ne]: req.params.id }
        } 
      });

      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: 'Email já cadastrado para outro usuário'
        });
      }
    }

    await user.update(req.body);

    logger.info(`Usuário ${user.email} atualizado por ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: user
    });
  } catch (error) {
    logger.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar usuário'
    });
  }
});

/**
 * @route   PATCH /api/users/:id/toggle-status
 * @desc    Ativar/desativar usuário
 * @access  Private (admin)
 */
router.patch('/:id/toggle-status', validate(uuidSchema, 'params'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Não permitir desativar próprio usuário
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Você não pode desativar sua própria conta'
      });
    }

    const newStatus = !user.is_active;
    await user.update({ is_active: newStatus });

    logger.info(`Usuário ${user.email} ${newStatus ? 'ativado' : 'desativado'} por ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: `Usuário ${newStatus ? 'ativado' : 'desativado'} com sucesso`,
      data: user
    });
  } catch (error) {
    logger.error('Erro ao alterar status do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao alterar status'
    });
  }
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Desativar usuário
 * @access  Private (admin)
 */
router.delete('/:id', validate(uuidSchema, 'params'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Não permitir desativar próprio usuário
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Você não pode desativar sua própria conta'
      });
    }

    await user.update({ is_active: false });

    logger.info(`Usuário ${user.email} desativado por ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Usuário desativado com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao desativar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao desativar usuário'
    });
  }
});

module.exports = router;