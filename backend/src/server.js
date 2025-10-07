const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Importar configurações e middlewares
const { sequelize, testConnection, syncDatabase } = require('./config/database');
const logger = require('./utils/logger');
const { errorHandler, notFound, handleUncaughtException, handleUnhandledRejection } = require('./middlewares/errorHandler');

// Importar rotas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const medicalRecordRoutes = require('./routes/medicalRecordRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Importar serviços
const emailService = require('./services/emailService');
const backupService = require('./services/backupService');

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ==================== CONFIGURAÇÕES DE SEGURANÇA ====================

// Helmet para headers de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP por janela
  message: {
    error: 'Muitas tentativas. Tente novamente em 15 minutos.',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Rate limiting mais restritivo para autenticação
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas de login por IP
  message: {
    error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    retryAfter: 900
  },
  skipSuccessfulRequests: true,
});

app.use('/api/auth/login', authLimiter);

// ==================== MIDDLEWARES GERAIS ====================

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging de requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl} - ${req.ip}`);
  next();
});

// ==================== ROTAS DA API ====================

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);

// ==================== MIDDLEWARES DE ERRO ====================

// 404 - Rota não encontrada
app.use(notFound);

// Error handler global
app.use(errorHandler);

// ==================== INICIALIZAÇÃO DO SERVIDOR ====================

const startServer = async () => {
  try {
    // Testar conexão com banco
    logger.info('Testando conexão com banco de dados...');
    await testConnection();
    logger.info('✅ Conexão com banco estabelecida');

    // Sincronizar modelos (apenas em desenvolvimento)
    if (NODE_ENV === 'development') {
      logger.info('Sincronizando modelos do banco...');
      await syncDatabase({ force: false, alter: true });
      logger.info('✅ Modelos sincronizados');
    }

    // Inicializar serviços
    logger.info('Inicializando serviços...');
    await emailService.initialize();
    logger.info('✅ Serviço de email inicializado');

    // Configurar backup automático (apenas em produção)
    if (NODE_ENV === 'production') {
      backupService.scheduleAutoBackup('0 2 * * *'); // Todo dia às 2h
      logger.info('✅ Backup automático configurado');
    }

    // Iniciar servidor
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Servidor rodando na porta ${PORT}`);
      logger.info(`📱 Ambiente: ${NODE_ENV}`);
      logger.info(`🌐 URL: http://localhost:${PORT}`);
      logger.info(`📚 API: http://localhost:${PORT}/api`);
      logger.info(`❤️  Health: http://localhost:${PORT}/health`);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      logger.info(`Recebido sinal ${signal}. Encerrando servidor...`);
      
      server.close(async () => {
        logger.info('Servidor HTTP fechado');
        
        try {
          await sequelize.close();
          logger.info('Conexão com banco fechada');
          process.exit(0);
        } catch (error) {
          logger.error('Erro ao fechar conexão com banco:', error);
          process.exit(1);
        }
      });

      // Forçar encerramento após 10 segundos
      setTimeout(() => {
        logger.error('Forçando encerramento do servidor...');
        process.exit(1);
      }, 10000);
    };

    // Handlers para sinais do sistema
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// ==================== HANDLERS DE ERRO GLOBAL ====================

// Handlers para erros não capturados
handleUncaughtException();
handleUnhandledRejection();

// ==================== INICIAR APLICAÇÃO ====================

// Iniciar servidor apenas se não estiver em modo de teste
if (require.main === module) {
  startServer();
}

module.exports = app;
