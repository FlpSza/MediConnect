const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Gera token JWT para o usuário
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Login de usuário
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuário por email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos'
      });
    }

    // Verificar se usuário está ativo
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Usuário inativo. Entre em contato com o administrador.'
      });
    }

    // Verificar senha
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos'
      });
    }

    // Atualizar último login
    user.last_login = new Date();
    await user.save();

    // Gerar token
    const token = generateToken(user.id);

    logger.info(`Usuário ${user.email} fez login com sucesso`);

    res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        token,
        user: user.toJSON()
      }
    });
  } catch (error) {
    logger.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao realizar login'
    });
  }
};

/**
 * Obter perfil do usuário autenticado
 * GET /api/auth/me
 */
const getProfile = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: req.user.toJSON()
    });
  } catch (error) {
    logger.error('Erro ao obter perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter perfil'
    });
  }
};

/**
 * Atualizar perfil do usuário autenticado
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = req.user;

    // Atualizar apenas campos permitidos
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;

    await user.save();

    logger.info(`Usuário ${user.email} atualizou o perfil`);

    res.status(200).json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: user.toJSON()
    });
  } catch (error) {
    logger.error('Erro ao atualizar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar perfil'
    });
  }
};

/**
 * Alterar senha do usuário autenticado
 * PUT /api/auth/change-password
 */
const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const user = req.user;

    // Verificar senha atual
    const isPasswordValid = await user.comparePassword(current_password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Senha atual incorreta'
      });
    }

    // Validar nova senha
    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Nova senha deve ter no mínimo 6 caracteres'
      });
    }

    // Atualizar senha
    user.password = new_password;
    await user.save();

    logger.info(`Usuário ${user.email} alterou a senha`);

    res.status(200).json({
      success: true,
      message: 'Senha alterada com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao alterar senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao alterar senha'
    });
  }
};

/**
 * Solicitar redefinição de senha
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      // Por segurança, retorna sucesso mesmo se usuário não existir
      return res.status(200).json({
        success: true,
        message: 'Se o email existir, um link de redefinição será enviado'
      });
    }

    // Gerar token de redefinição
    const resetToken = user.createPasswordResetToken();
    await user.save();

    // TODO: Implementar envio de email
    // await sendPasswordResetEmail(user.email, resetToken);

    logger.info(`Token de redefinição de senha gerado para ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Link de redefinição enviado para o email',
      // Em desenvolvimento, retornar o token (REMOVER EM PRODUÇÃO)
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    });
  } catch (error) {
    logger.error('Erro ao solicitar redefinição de senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar solicitação'
    });
  }
};

/**
 * Redefinir senha com token
 * POST /api/auth/reset-password/:token
 */
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Hash do token recebido
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Buscar usuário com token válido e não expirado
    const user = await User.findOne({
      where: {
        password_reset_token: hashedToken,
        password_reset_expires: {
          [require('sequelize').Op.gt]: Date.now()
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido ou expirado'
      });
    }

    // Validar nova senha
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Senha deve ter no mínimo 6 caracteres'
      });
    }

    // Atualizar senha e limpar token
    user.password = password;
    user.password_reset_token = null;
    user.password_reset_expires = null;
    await user.save();

    logger.info(`Senha redefinida com sucesso para ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Senha redefinida com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao redefinir senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao redefinir senha'
    });
  }
};

/**
 * Logout (invalidação de token no frontend)
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  try {
    // Em um sistema com lista negra de tokens, adicionaríamos o token aqui
    // Por enquanto, apenas registra o logout
    logger.info(`Usuário ${req.user.email} fez logout`);

    res.status(200).json({
      success: true,
      message: 'Logout realizado com sucesso'
    });
  } catch (error) {
    logger.error('Erro no logout:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao realizar logout'
    });
  }
};

module.exports = {
  login,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  logout
};