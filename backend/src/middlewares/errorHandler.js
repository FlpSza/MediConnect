const logger = require('../utils/logger');

/**
 * Classe customizada para erros da aplicação
 */
class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Middleware de tratamento de erros 404 (rota não encontrada)
 * Deve ser adicionado APÓS todas as rotas
 */
const notFound = (req, res, next) => {
  const error = new AppError(
    `Rota não encontrada: ${req.method} ${req.originalUrl}`,
    404,
    'ROUTE_NOT_FOUND'
  );
  
  logger.warn(`404 - Rota não encontrada: ${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  
  next(error);
};

/**
 * Middleware principal de tratamento de erros
 * Deve ser o ÚLTIMO middleware adicionado
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // Log do erro
  logger.error('Erro capturado:', {
    message: err.message,
    statusCode: err.statusCode,
    code: err.code,errorHan,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    user: req.user ? req.user.email : 'Não autenticado'
  });

  // Erro de validação do Sequelize
  if (err.name === 'SequelizeValidationError') {
    const message = 'Erro de validação';
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message,
      value: e.value
    }));
    
    return res.status(400).json({
      success: false,
      message,
      code: 'VALIDATION_ERROR',
      errors
    });
  }

  // Erro de constraint única do Sequelize
  if (err.name === 'SequelizeUniqueConstraintError') {
    const message = 'Registro duplicado';
    const fields = err.errors.map(e => e.path);
    
    return res.status(409).json({
      success: false,
      message: `${message}: ${fields.join(', ')} já existe(m)`,
      code: 'DUPLICATE_ENTRY',
      fields
    });
  }

  // Erro de foreign key do Sequelize
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    const message = 'Violação de integridade referencial';
    
    return res.status(400).json({
      success: false,
      message: 'Não é possível excluir este registro pois está relacionado a outros dados',
      code: 'FOREIGN_KEY_VIOLATION'
    });
  }

  // Erro de conexão com banco de dados
  if (err.name === 'SequelizeConnectionError' || 
      err.name === 'SequelizeConnectionRefusedError') {
    return res.status(503).json({
      success: false,
      message: 'Erro de conexão com o banco de dados. Tente novamente.',
      code: 'DATABASE_CONNECTION_ERROR'
    });
  }

  // Erro de timeout do Sequelize
  if (err.name === 'SequelizeTimeoutError') {
    return res.status(504).json({
      success: false,
      message: 'Tempo de consulta excedido. Tente novamente.',
      code: 'DATABASE_TIMEOUT'
    });
  }

  // Erro de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido',
      code: 'INVALID_TOKEN'
    });
  }

  // Erro de JWT expirado
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado. Faça login novamente.',
      code: 'TOKEN_EXPIRED'
    });
  }

  // Erro de sintaxe JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'JSON inválido no corpo da requisição',
      code: 'INVALID_JSON'
    });
  }

  // Erro de Multer (upload de arquivos)
  if (err.name === 'MulterError') {
    let message = 'Erro no upload do arquivo';
    let statusCode = 400;

    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'Arquivo muito grande';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'Muitos arquivos enviados';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Campo de arquivo inesperado';
    }

    return res.status(statusCode).json({
      success: false,
      message,
      code: err.code
    });
  }

  // Erro de cast (ID inválido)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID inválido',
      code: 'INVALID_ID'
    });
  }

  // Erro customizado da aplicação
  if (err.isOperational) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
      code: err.code || 'OPERATIONAL_ERROR',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }errorHan

  // Erro genérico/inesperado
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor';

  return res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Erro interno do servidor' : message,
    code: err.code || 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { 
      originalMessage: err.message,
      stack: err.stack 
    })
  });
};

/**
 * Middleware para tratar erros assíncronos
 * Envolve funções async/await para capturar erros
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Middleware para validar Content-Type
 */
const validateContentType = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.get('Content-Type');
    
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(415).json({
        success: false,
        message: 'Content-Type deve ser application/json',
        code: 'INVALID_CONTENT_TYPE'
      });
    }
  }
  next();
};

/**
 * Middleware para limpar dados sensíveis dos logs de erro
 */
const sanitizeError = (err) => {
  const sensitiveFields = ['password', 'token', 'secret', 'authorization'];
  
  if (err.config && err.config.headers) {
    sensitiveFields.forEach(field => {
      if (err.config.headers[field]) {
        err.config.headers[field] = '***REDACTED***';
      }
    });
  }
  
  return err;
};

/**
 * Tratamento de erros não capturados
 */
const handleUncaughtException = () => {
  process.on('uncaughtException', (err) => {
    logger.error('UNCAUGHT EXCEPTION! 💥 Encerrando aplicação...', {
      error: err.message,
      stack: err.stack
    });
    
    // Dar tempo para o log ser escrito antes de encerrar
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });
};

/**
 * Tratamento de promises rejeitadas não capturadas
 */
const handleUnhandledRejection = () => {
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('UNHANDLED REJECTION! 💥', {
      reason,
      promise
    });
    
    // Em produção, pode-se optar por não encerrar o processo
    if (process.env.NODE_ENV === 'production') {
      logger.error('Servidor continuará rodando...');
    }
  });
};

/**
 * Tratamento gracioso de SIGTERM
 */
const handleSIGTERM = (server) => {
  process.on('SIGTERM', () => {
    logger.info('👋 SIGTERM recebido. Encerrando graciosamente...');
    
    server.close(() => {
      logger.info('💥 Processo encerrado!');
      process.exit(0);
    });
  });
};

/**
 * Middleware para capturar erros de rota duplicada
 */
const duplicateRouteHandler = () => {
  const routes = new Set();
  
  return (req, res, next) => {
    const route = `${req.method}:${req.path}`;
    
    if (routes.has(route)) {
      logger.warn(`Rota duplicada detectada: ${route}`);
    } else {
      routes.add(route);
    }
    
    next();
  };
};

module.exports = {
  AppError,
  notFound,
  errorHandler,
  asyncHandler,
  validateContentType,
  sanitizeError,
  handleUncaughtException,
  handleUnhandledRejection,
  handleSIGTERM,
  duplicateRouteHandler
};