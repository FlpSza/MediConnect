const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

/**
 * Configuração do Sequelize para conexão com MySQL
 * Suporta múltiplos ambientes (development, production, test)
 */

// Configurações específicas por ambiente
const config = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mediconnect',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: (msg) => logger.debug(msg),
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false, // Desabilita logs em produção
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Para servidores como AWS RDS
      }
    }
  },
  test: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME_TEST || 'mediconnect_test',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false
  }
};

// Seleciona configuração baseada no ambiente
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Criar instância do Sequelize
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool,
    dialectOptions: {
      ...dbConfig.dialectOptions,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      dateStrings: true,
      typeCast: true
    },
    define: {
      timestamps: true, // Adiciona createdAt e updatedAt
      underscored: true, // Usa snake_case (ex: created_at)
      freezeTableName: true, // Não pluraliza nomes de tabelas
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    },
    timezone: '-03:00', // Timezone do Brasil (ajuste conforme necessário)
    benchmark: env === 'development', // Mede tempo de queries em dev
    retry: {
      max: 3, // Tenta reconectar 3 vezes
      match: [
        /ETIMEDOUT/,
        /EHOSTUNREACH/,
        /ECONNRESET/,
        /ECONNREFUSED/,
        /ETIMEDOUT/,
        /ESOCKETTIMEDOUT/,
        /EHOSTDOWN/,
        /EPIPE/,
        /EAI_AGAIN/,
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/
      ]
    }
  }
);

/**
 * Testa a conexão com o banco de dados
 * @returns {Promise<boolean>}
 */
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info(`✓ Conexão com MySQL estabelecida com sucesso`);
    logger.info(`  Base de dados: ${dbConfig.database}`);
    logger.info(`  Host: ${dbConfig.host}:${dbConfig.port}`);
    logger.info(`  Ambiente: ${env}`);
    return true;
  } catch (error) {
    logger.error('✗ Erro ao conectar ao MySQL:', {
      message: error.message,
      host: dbConfig.host,
      database: dbConfig.database
    });
    return false;
  }
};

/**
 * Sincroniza os modelos com o banco de dados
 * CUIDADO: Em produção, use migrations ao invés de sync
 * @param {object} options - Opções de sincronização
 */
const syncDatabase = async (options = {}) => {
  try {
    const defaultOptions = {
      force: false, // Se true, DROP todas as tabelas antes de criar
      alter: false, // Se true, altera tabelas existentes
      ...options
    };

    if (env === 'production' && (defaultOptions.force || defaultOptions.alter)) {
      logger.warn('⚠️ AVISO: Não use sync em produção! Use migrations.');
      return false;
    }

    await sequelize.sync(defaultOptions);
    
    logger.info('✓ Modelos sincronizados com o banco de dados');
    
    if (defaultOptions.force) {
      logger.warn('⚠️ Todas as tabelas foram recriadas (force: true)');
    }
    
    if (defaultOptions.alter) {
      logger.info('✓ Tabelas alteradas para corresponder aos modelos (alter: true)');
    }
    
    return true;
  } catch (error) {
    logger.error('✗ Erro ao sincronizar banco de dados:', error);
    return false;
  }
};

/**
 * Fecha a conexão com o banco de dados
 */
const closeConnection = async () => {
  try {
    await sequelize.close();
    logger.info('✓ Conexão com banco de dados fechada');
  } catch (error) {
    logger.error('✗ Erro ao fechar conexão:', error);
  }
};

/**
 * Verifica o status da conexão
 * @returns {boolean}
 */
const isConnected = () => {
  try {
    return sequelize.connectionManager.pool !== null;
  } catch (error) {
    return false;
  }
};

/**
 * Obtém informações sobre o pool de conexões
 * @returns {object}
 */
const getPoolInfo = () => {
  try {
    const pool = sequelize.connectionManager.pool;
    return {
      size: pool.size,
      available: pool.available,
      using: pool.using,
      waiting: pool.waiting
    };
  } catch (error) {
    logger.error('Erro ao obter info do pool:', error);
    return null;
  }
};

// Nota: Event handlers são gerenciados internamente pelo Sequelize

// Exportações
module.exports = {
  sequelize,
  Sequelize,
  testConnection,
  syncDatabase,
  closeConnection,
  isConnected,
  getPoolInfo,
  config: dbConfig
};

/**
 * EXEMPLO DE USO:
 * 
 * const { sequelize, testConnection, syncDatabase } = require('./config/database');
 * 
 * // Testar conexão
 * await testConnection();
 * 
 * // Sincronizar modelos (apenas em desenvolvimento)
 * await syncDatabase({ alter: true });
 * 
 * // Executar query
 * const [results] = await sequelize.query('SELECT * FROM users');
 * 
 * // Fechar conexão (ao encerrar aplicação)
 * await closeConnection();
 */