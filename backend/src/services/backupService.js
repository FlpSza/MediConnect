const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

/**
 * Serviço de Backup do Banco de Dados
 * Suporta backup manual e automático (agendado)
 */

class BackupService {
  constructor() {
    this.backupDir = path.join(__dirname, '../../backups');
    this.maxBackups = parseInt(process.env.MAX_BACKUPS) || 10;
    this.dbHost = process.env.DB_HOST || 'localhost';
    this.dbPort = process.env.DB_PORT || 3306;
    this.dbName = process.env.DB_NAME;
    this.dbUser = process.env.DB_USER;
    this.dbPassword = process.env.DB_PASSWORD;
  }

  /**
   * Garante que o diretório de backup existe
   */
  async ensureBackupDir() {
    try {
      await fs.access(this.backupDir);
    } catch (error) {
      await fs.mkdir(this.backupDir, { recursive: true });
      logger.info('Diretório de backup criado');
    }
  }

  /**
   * Gera nome do arquivo de backup
   * @returns {string}
   */
  generateBackupFilename() {
    const timestamp = new Date().toISOString()
      .replace(/:/g, '-')
      .replace(/\..+/, '');
    return `backup_${this.dbName}_${timestamp}.sql`;
  }

  /**
   * Executa backup do banco MySQL
   * @returns {Promise<object>}
   */
  async createBackup() {
    try {
      await this.ensureBackupDir();

      const filename = this.generateBackupFilename();
      const filepath = path.join(this.backupDir, filename);

      // Comando mysqldump
      const command = `mysqldump -h ${this.dbHost} -P ${this.dbPort} -u ${this.dbUser} -p${this.dbPassword} ${this.dbName} > "${filepath}"`;

      return new Promise((resolve, reject) => {
        exec(command, async (error, stdout, stderr) => {
          if (error) {
            logger.error('Erro ao criar backup:', error);
            return reject({
              success: false,
              message: 'Erro ao criar backup',
              error: error.message
            });
          }

          // Verificar se arquivo foi criado
          try {
            const stats = await fs.stat(filepath);
            const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

            logger.info(`Backup criado com sucesso: ${filename} (${sizeInMB} MB)`);

            // Limpar backups antigos
            await this.cleanOldBackups();

            resolve({
              success: true,
              message: 'Backup criado com sucesso',
              filename,
              filepath,
              size: `${sizeInMB} MB`,
              timestamp: new Date()
            });
          } catch (statError) {
            reject({
              success: false,
              message: 'Backup criado mas não foi possível verificar arquivo',
              error: statError.message
            });
          }
        });
      });
    } catch (error) {
      logger.error('Erro no processo de backup:', error);
      throw error;
    }
  }

  /**
   * Lista todos os backups disponíveis
   * @returns {Promise<Array>}
   */
  async listBackups() {
    try {
      await this.ensureBackupDir();

      const files = await fs.readdir(this.backupDir);
      const backups = [];

      for (const file of files) {
        if (file.endsWith('.sql')) {
          const filepath = path.join(this.backupDir, file);
          const stats = await fs.stat(filepath);

          backups.push({
            filename: file,
            filepath,
            size: `${(stats.size / (1024 * 1024)).toFixed(2)} MB`,
            created: stats.birthtime,
            modified: stats.mtime
          });
        }
      }

      // Ordenar por data de criação (mais recente primeiro)
      backups.sort((a, b) => b.created - a.created);

      return backups;
    } catch (error) {
      logger.error('Erro ao listar backups:', error);
      throw error;
    }
  }

  /**
   * Remove backups antigos mantendo apenas os N mais recentes
   * @returns {Promise<void>}
   */
  async cleanOldBackups() {
    try {
      const backups = await this.listBackups();

      if (backups.length > this.maxBackups) {
        const toDelete = backups.slice(this.maxBackups);

        for (const backup of toDelete) {
          await fs.unlink(backup.filepath);
          logger.info(`Backup antigo removido: ${backup.filename}`);
        }

        logger.info(`${toDelete.length} backup(s) antigo(s) removido(s)`);
      }
    } catch (error) {
      logger.error('Erro ao limpar backups antigos:', error);
    }
  }

  /**
   * Restaura um backup específico
   * @param {string} filename - Nome do arquivo de backup
   * @returns {Promise<object>}
   */
  async restoreBackup(filename) {
    try {
      const filepath = path.join(this.backupDir, filename);

      // Verificar se arquivo existe
      try {
        await fs.access(filepath);
      } catch (error) {
        throw new Error('Arquivo de backup não encontrado');
      }

      // Comando mysql para restaurar
      const command = `mysql -h ${this.dbHost} -P ${this.dbPort} -u ${this.dbUser} -p${this.dbPassword} ${this.dbName} < "${filepath}"`;

      return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
          if (error) {
            logger.error('Erro ao restaurar backup:', error);
            return reject({
              success: false,
              message: 'Erro ao restaurar backup',
              error: error.message
            });
          }

          logger.info(`Backup restaurado com sucesso: ${filename}`);

          resolve({
            success: true,
            message: 'Backup restaurado com sucesso',
            filename,
            timestamp: new Date()
          });
        });
      });
    } catch (error) {
      logger.error('Erro no processo de restauração:', error);
      throw error;
    }
  }

  /**
   * Deleta um backup específico
   * @param {string} filename - Nome do arquivo de backup
   * @returns {Promise<object>}
   */
  async deleteBackup(filename) {
    try {
      const filepath = path.join(this.backupDir, filename);

      // Verificar se arquivo existe
      try {
        await fs.access(filepath);
      } catch (error) {
        throw new Error('Arquivo de backup não encontrado');
      }

      await fs.unlink(filepath);

      logger.info(`Backup deletado: ${filename}`);

      return {
        success: true,
        message: 'Backup deletado com sucesso',
        filename
      };
    } catch (error) {
      logger.error('Erro ao deletar backup:', error);
      throw error;
    }
  }

  /**
   * Obtém informações sobre o espaço em disco usado pelos backups
   * @returns {Promise<object>}
   */
  async getStorageInfo() {
    try {
      const backups = await this.listBackups();
      
      let totalSize = 0;
      for (const backup of backups) {
        const stats = await fs.stat(backup.filepath);
        totalSize += stats.size;
      }

      return {
        total_backups: backups.length,
        total_size: `${(totalSize / (1024 * 1024)).toFixed(2)} MB`,
        max_backups: this.maxBackups,
        backup_directory: this.backupDir
      };
    } catch (error) {
      logger.error('Erro ao obter informações de armazenamento:', error);
      throw error;
    }
  }

  /**
   * Agenda backups automáticos
   * @param {string} cronExpression - Expressão cron (ex: '0 2 * * *' para 2h da manhã todos os dias)
   */
  scheduleAutoBackup(cronExpression = '0 2 * * *') {
    try {
      const cron = require('node-cron');

      // Validar expressão cron
      if (!cron.validate(cronExpression)) {
        throw new Error('Expressão cron inválida');
      }

      cron.schedule(cronExpression, async () => {
        logger.info('Iniciando backup automático agendado...');
        
        try {
          const result = await this.createBackup();
          logger.info('Backup automático concluído:', result);
        } catch (error) {
          logger.error('Erro no backup automático:', error);
        }
      });

      logger.info(`Backup automático agendado: ${cronExpression}`);
      
      return {
        success: true,
        message: 'Backup automático agendado',
        schedule: cronExpression
      };
    } catch (error) {
      logger.error('Erro ao agendar backup automático:', error);
      throw error;
    }
  }

  /**
   * Download de backup (retorna stream)
   * @param {string} filename - Nome do arquivo
   * @returns {Promise<ReadStream>}
   */
  async downloadBackup(filename) {
    try {
      const filepath = path.join(this.backupDir, filename);

      // Verificar se arquivo existe
      try {
        await fs.access(filepath);
      } catch (error) {
        throw new Error('Arquivo de backup não encontrado');
      }

      const fsSync = require('fs');
      return fsSync.createReadStream(filepath);
    } catch (error) {
      logger.error('Erro ao preparar download do backup:', error);
      throw error;
    }
  }
}

// Exportar instância única (Singleton)
const backupService = new BackupService();

module.exports = backupService;

/**
 * EXEMPLO DE USO:
 * 
 * const backupService = require('./services/backupService');
 * 
 * // Criar backup manualmente
 * const result = await backupService.createBackup();
 * 
 * // Listar backups
 * const backups = await backupService.listBackups();
 * 
 * // Restaurar backup
 * await backupService.restoreBackup('backup_mediconnect_2025-10-06.sql');
 * 
 * // Agendar backup automático (todo dia às 2h da manhã)
 * backupService.scheduleAutoBackup('0 2 * * *');
 * 
 * // Obter informações de armazenamento
 * const info = await backupService.getStorageInfo();
 * 
 * // Deletar backup
 * await backupService.deleteBackup('backup_mediconnect_2025-10-05.sql');
 * 
 * DEPENDÊNCIAS NECESSÁRIAS:
 * npm install node-cron
 * 
 * REQUISITOS:
 * - mysqldump instalado no sistema
 * - mysql instalado no sistema (para restore)
 * - Permissões de escrita na pasta backups/
 */