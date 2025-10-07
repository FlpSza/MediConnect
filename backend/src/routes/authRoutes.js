const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');
const { validate, loginSchema } = require('../middlewares/validation');

/**
 * @route   POST /api/auth/login
 * @desc    Login de usuário
 * @access  Public
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * @route   GET /api/auth/me
 * @desc    Obter perfil do usuário autenticado
 * @access  Private
 */
router.get('/me', authenticate, authController.getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Atualizar perfil do usuário autenticado
 * @access  Private
 */
router.put('/profile', authenticate, authController.updateProfile);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Alterar senha do usuário autenticado
 * @access  Private
 */
router.put('/change-password', authenticate, authController.changePassword);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Solicitar redefinição de senha
 * @access  Public
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @route   POST /api/auth/reset-password/:token
 * @desc    Redefinir senha com token
 * @access  Public
 */
router.post('/reset-password/:token', authController.resetPassword);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout do usuário
 * @access  Private
 */
router.post('/logout', authenticate, authController.logout);

module.exports = router;