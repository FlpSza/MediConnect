const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Criar diretório de logs se não existir
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Configuração de formatos
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    // Adicionar stack trace se existir
    if (stack) {
      log += `\n${stack}`;
    }
    
    // Adicionar metadados se existirem
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// Configuração de cores para console
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    let log = `${timestamp} ${level}: ${message}`;
    if (stack) {
      log += `\n${stack}`;
    }
    return log;
  })
);

// Configuração dos transports
const transports = [
  // Console (apenas em desenvolvimento)
  ...(process.env.NODE_ENV !== 'production' ? [
    new winston.transports.Console({
      level: 'debug',
      format: consoleFormat,
      handleExceptions: true,
      handleRejections: true
    })
  ] : []),

  // Arquivo de erros
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    format: logFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    tailable: true,
    handleExceptions: true,
    handleRejections: true
  }),

  // Arquivo de logs combinados
  new winston.transports.File({
    filename: path.join(logsDir, 'combined.log'),
    level: 'info',
    format: logFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    tailable: true
  }),

  // Arquivo de exceções não capturadas
  new winston.transports.File({
    filename: path.join(logsDir, 'exceptions.log'),
    level: 'error',
    format: logFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 3,
    tailable: true,
    handleExceptions: true
  }),

  // Arquivo de promises rejeitadas
  new winston.transports.File({
    filename: path.join(logsDir, 'rejections.log'),
    level: 'error',
    format: logFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 3,
    tailable: true,
    handleRejections: true
  })
];

// Criar logger principal
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: logFormat,
  transports,
  exitOnError: false
});

// Função para sanitizar dados sensíveis nos logs
const sanitizeData = (data) => {
  if (!data || typeof data !== 'object') return data;
  
  const sensitiveFields = [
    'password', 'password_hash', 'password_reset_token',
    'token', 'access_token', 'refresh_token',
    'cpf', 'crm', 'credit_card', 'card_number',
    'cvv', 'security_code', 'ssn'
  ];
  
  const sanitized = { ...data };
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }
  
  return sanitized;
};

// Métodos customizados para logging
logger.logRequest = (req, res, responseTime) => {
  const logData = {
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
    userRole: req.user?.role
  };
  
  if (res.statusCode >= 400) {
    logger.warn('HTTP Request', sanitizeData(logData));
  } else {
    logger.info('HTTP Request', sanitizeData(logData));
  }
};

logger.logError = (error, context = {}) => {
  const errorData = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    code: error.code,
    ...sanitizeData(context)
  };
  
  logger.error('Application Error', errorData);
};

logger.logAuth = (action, userId, details = {}) => {
  logger.info('Authentication', {
    action,
    userId,
    ...sanitizeData(details)
  });
};

logger.logDatabase = (operation, table, details = {}) => {
  logger.debug('Database Operation', {
    operation,
    table,
    ...sanitizeData(details)
  });
};

logger.logSecurity = (event, details = {}) => {
  logger.warn('Security Event', {
    event,
    timestamp: new Date().toISOString(),
    ...sanitizeData(details)
  });
};

// Middleware para logging de requests
logger.requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const responseTime = Date.now() - start;
    logger.logRequest(req, res, responseTime);
  });
  
  next();
};

// Função para limpar logs antigos
logger.cleanOldLogs = async (daysToKeep = 30) => {
  try {
    const files = fs.readdirSync(logsDir);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    for (const file of files) {
      const filePath = path.join(logsDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtime < cutoffDate) {
        fs.unlinkSync(filePath);
        logger.info(`Log antigo removido: ${file}`);
      }
    }
  } catch (error) {
    logger.error('Erro ao limpar logs antigos:', error);
  }
};

// Função para obter estatísticas dos logs
logger.getLogStats = () => {
  try {
    const files = fs.readdirSync(logsDir);
    const stats = {
      totalFiles: files.length,
      totalSize: 0,
      files: []
    };
    
    for (const file of files) {
      const filePath = path.join(logsDir, file);
      const fileStats = fs.statSync(filePath);
      const sizeInMB = (fileStats.size / 1024 / 1024).toFixed(2);
      
      stats.totalSize += fileStats.size;
      stats.files.push({
        name: file,
        size: `${sizeInMB} MB`,
        lastModified: fileStats.mtime
      });
    }
    
    stats.totalSize = `${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`;
    return stats;
  } catch (error) {
    logger.error('Erro ao obter estatísticas dos logs:', error);
    return null;
  }
};

// Stream para Morgan (se necessário)
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

module.exports = logger;
