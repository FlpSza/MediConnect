const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Middleware para verificar token JWT
 * Protege rotas que requerem autenticação
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
const authenticate = async (req, res, next) => {
  try {
    // Obter token do header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido. Acesso negado.',
        code: 'TOKEN_NOT_PROVIDED'
      });
    }

    // Extrair token (remove 'Bearer ')
    const token = authHeader.substring(7);

    // Verificar e decodificar token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expirado. Faça login novamente.',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Token inválido.',
          code: 'TOKEN_INVALID'
        });
      }

      throw err;
    }

    // Buscar usuário no banco
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado. Token inválido.',
        code: 'USER_NOT_FOUND'
      });
    }

    // Verificar se usuário está ativo
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Usuário inativo. Acesso negado.',
        code: 'USER_INACTIVE'
      });
    }

    // Adicionar usuário ao objeto request
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    logger.error('Erro na autenticação:', {
      error: error.message,
      stack: error.stack
    });

    return res.status(500).json({
      success: false,
      message: 'Erro ao verificar autenticação.',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Middleware para autorizar apenas roles específicas
 * Deve ser usado APÓS o middleware authenticate
 * @param {...string} allowedRoles - Roles permitidas (admin, doctor, receptionist)
 * @returns {Function} Middleware function
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Verificar se usuário está autenticado
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado.',
        code: 'NOT_AUTHENTICATED'
      });
    }

    // Verificar se role do usuário está na lista de permitidos
    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(`Tentativa de acesso não autorizado: ${req.user.email} (${req.user.role}) tentou acessar recurso restrito a [${allowedRoles.join(', ')}]`);
      
      return res.status(403).json({
        success: false,
        message: `Acesso negado. Esta ação requer permissão de: ${allowedRoles.join(' ou ')}.`,
        code: 'FORBIDDEN',
        required_roles: allowedRoles,
        user_role: req.user.role
      });
    }

    next();
  };
};

/**
 * Middleware opcional de autenticação
 * Adiciona usuário ao request se token válido, mas não bloqueia se inválido
 * Útil para rotas públicas que podem ter comportamento diferente para usuários autenticados
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id, {
          attributes: { exclude: ['password'] }
        });
        
        if (user && user.is_active) {
          req.user = user;
          req.token = token;
        }
      } catch (err) {
        // Ignora erros de token em auth opcional
        logger.debug('Auth opcional falhou:', err.message);
      }
    }
  } catch (error) {
    logger.error('Erro no auth opcional:', error);
  }
  
  next();
};

/**
 * Middleware para verificar se o usuário pode acessar recurso próprio
 * Permite que o usuário acesse apenas seus próprios dados (ou admin pode acessar tudo)
 * @param {string} paramName - Nome do parâmetro que contém o ID do recurso
 * @param {string} userIdField - Campo no banco que referencia o user_id (padrão: 'user_id')
 */
const canAccessOwnResource = (paramName = 'id', userIdField = 'user_id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[paramName];
      const userId = req.user.id;
      const userRole = req.user.role;

      // Admin pode acessar tudo
      if (userRole === 'admin') {
        return next();
      }

      // Se o ID do recurso é o mesmo ID do usuário
      if (resourceId === userId) {
        return next();
      }

      // Se precisa verificar no banco (ex: médico acessando seus agendamentos)
      // Implementar lógica adicional aqui se necessário

      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para acessar este recurso.',
        code: 'FORBIDDEN_RESOURCE'
      });
    } catch (error) {
      logger.error('Erro ao verificar acesso ao recurso:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao verificar permissões.'
      });
    }
  };
};

/**
 * Middleware para verificar se médico está acessando apenas seus próprios dados
 * @param {string} doctorIdParam - Nome do parâmetro que contém o doctor_id
 */
const isDoctorOwnData = (doctorIdParam = 'doctor_id') => {
  return async (req, res, next) => {
    try {
      const userRole = req.user.role;

      // Admin pode acessar tudo
      if (userRole === 'admin') {
        return next();
      }

      // Se não é médico, negar acesso
      if (userRole !== 'doctor') {
        return res.status(403).json({
          success: false,
          message: 'Acesso restrito a médicos.',
          code: 'NOT_DOCTOR'
        });
      }

      // Buscar o doctor_id do usuário logado
      const Doctor = require('../models/Doctor');
      const doctor = await Doctor.findOne({
        where: { user_id: req.user.id }
      });

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Perfil de médico não encontrado para este usuário.',
          code: 'DOCTOR_PROFILE_NOT_FOUND'
        });
      }

      // Verificar se está acessando seus próprios dados
      const requestedDoctorId = req.params[doctorIdParam] || req.body[doctorIdParam] || req.query[doctorIdParam];
      
      if (requestedDoctorId && requestedDoctorId !== doctor.id) {
        return res.status(403).json({
          success: false,
          message: 'Você só pode acessar seus próprios dados.',
          code: 'FORBIDDEN_DOCTOR_DATA'
        });
      }

      // Adicionar doctor_id ao request para uso posterior
      req.doctorId = doctor.id;
      
      next();
    } catch (error) {
      logger.error('Erro ao verificar dados do médico:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao verificar permissões.'
      });
    }
  };
};

/**
 * Middleware para rate limiting por usuário
 * Previne abuso de API por usuários específicos
 */
const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    if (!req.user) {
      return next();
    }

    const userId = req.user.id;
    const now = Date.now();
    
    if (!requests.has(userId)) {
      requests.set(userId, []);
    }

    const userRequests = requests.get(userId);
    
    // Remover requisições antigas
    const recentRequests = userRequests.filter(time => now - time < windowMs);
    
    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Muitas requisições. Tente novamente mais tarde.',
        code: 'RATE_LIMIT_EXCEEDED',
        retry_after: Math.ceil(windowMs / 1000)
      });
    }

    recentRequests.push(now);
    requests.set(userId, recentRequests);
    
    next();
  };
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
  canAccessOwnResource,
  isDoctorOwnData,
  userRateLimit
};