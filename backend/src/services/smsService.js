const logger = require('../utils/logger');

/**
 * Serviço de SMS para o sistema MediConnect
 * 
 * Este serviço fornece uma interface unificada para envio de SMS,
 * suportando múltiplos provedores (Twilio, AWS SNS, etc.)
 */

class SMSService {
  constructor() {
    this.provider = process.env.SMS_PROVIDER || 'twilio';
    this.isInitialized = false;
    this.client = null;
    
    // Configurações por provedor
    this.config = {
      twilio: {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        fromNumber: process.env.TWILIO_FROM_NUMBER
      },
      aws: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'us-east-1'
      },
      mock: {
        // Para desenvolvimento/testes
        enabled: process.env.NODE_ENV === 'development'
      }
    };
  }

  // ==================== INICIALIZAÇÃO ====================

  /**
   * Inicializa o serviço de SMS
   */
  async initialize() {
    try {
      logger.info(`Inicializando serviço de SMS com provedor: ${this.provider}`);
      
      switch (this.provider) {
        case 'twilio':
          await this.initializeTwilio();
          break;
        case 'aws':
          await this.initializeAWS();
          break;
        case 'mock':
          await this.initializeMock();
          break;
        default:
          throw new Error(`Provedor de SMS não suportado: ${this.provider}`);
      }
      
      this.isInitialized = true;
      logger.info('✅ Serviço de SMS inicializado com sucesso');
    } catch (error) {
      logger.error('❌ Erro ao inicializar serviço de SMS:', error);
      throw error;
    }
  }

  /**
   * Inicializa Twilio
   */
  async initializeTwilio() {
    try {
      const twilio = require('twilio');
      
      if (!this.config.twilio.accountSid || !this.config.twilio.authToken) {
        throw new Error('Configurações do Twilio não encontradas');
      }
      
      this.client = twilio(this.config.twilio.accountSid, this.config.twilio.authToken);
      
      // Testar conexão
      const account = await this.client.api.accounts(this.config.twilio.accountSid).fetch();
      logger.info(`Twilio conectado - Conta: ${account.friendlyName}`);
    } catch (error) {
      logger.error('Erro ao inicializar Twilio:', error);
      throw error;
    }
  }

  /**
   * Inicializa AWS SNS
   */
  async initializeAWS() {
    try {
      const AWS = require('aws-sdk');
      
      if (!this.config.aws.accessKeyId || !this.config.aws.secretAccessKey) {
        throw new Error('Configurações da AWS não encontradas');
      }
      
      AWS.config.update({
        accessKeyId: this.config.aws.accessKeyId,
        secretAccessKey: this.config.aws.secretAccessKey,
        region: this.config.aws.region
      });
      
      this.client = new AWS.SNS();
      
      // Testar conexão
      const result = await this.client.listTopics().promise();
      logger.info(`AWS SNS conectado - Região: ${this.config.aws.region}`);
    } catch (error) {
      logger.error('Erro ao inicializar AWS SNS:', error);
      throw error;
    }
  }

  /**
   * Inicializa mock para desenvolvimento
   */
  async initializeMock() {
    logger.info('Serviço de SMS em modo mock (desenvolvimento)');
    this.client = {
      send: (message) => {
        logger.info(`[MOCK SMS] ${message.to}: ${message.body}`);
        return Promise.resolve({ sid: 'mock_sid_' + Date.now() });
      }
    };
  }

  // ==================== ENVIO DE SMS ====================

  /**
   * Envia SMS
   * @param {string} to - Número de destino
   * @param {string} message - Mensagem a ser enviada
   * @param {Object} options - Opções adicionais
   * @returns {Object} Resultado do envio
   */
  async sendSMS(to, message, options = {}) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      // Validar número
      const formattedNumber = this.formatPhoneNumber(to);
      if (!formattedNumber) {
        throw new Error('Número de telefone inválido');
      }
      
      // Validar mensagem
      if (!message || message.trim().length === 0) {
        throw new Error('Mensagem não pode estar vazia');
      }
      
      if (message.length > 1600) {
        throw new Error('Mensagem muito longa (máximo 1600 caracteres)');
      }
      
      logger.info(`Enviando SMS para ${formattedNumber}`);
      
      let result;
      switch (this.provider) {
        case 'twilio':
          result = await this.sendTwilioSMS(formattedNumber, message, options);
          break;
        case 'aws':
          result = await this.sendAWSSMS(formattedNumber, message, options);
          break;
        case 'mock':
          result = await this.sendMockSMS(formattedNumber, message, options);
          break;
        default:
          throw new Error(`Provedor não suportado: ${this.provider}`);
      }
      
      logger.info(`✅ SMS enviado com sucesso - ID: ${result.id || result.sid}`);
      
      return {
        success: true,
        id: result.id || result.sid,
        to: formattedNumber,
        message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
        provider: this.provider,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('❌ Erro ao enviar SMS:', error);
      
      return {
        success: false,
        error: error.message,
        to,
        provider: this.provider,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Envia SMS via Twilio
   */
  async sendTwilioSMS(to, message, options) {
    const result = await this.client.messages.create({
      body: message,
      from: this.config.twilio.fromNumber,
      to: to,
      ...options
    });
    
    return result;
  }

  /**
   * Envia SMS via AWS SNS
   */
  async sendAWSSMS(to, message, options) {
    const params = {
      Message: message,
      PhoneNumber: to,
      MessageAttributes: {
        'AWS.SNS.SMS.SenderID': {
          DataType: 'String',
          StringValue: 'MediConnect'
        },
        'AWS.SNS.SMS.SMSType': {
          DataType: 'String',
          StringValue: 'Transactional'
        }
      }
    };
    
    const result = await this.client.publish(params).promise();
    return result;
  }

  /**
   * Envia SMS mock
   */
  async sendMockSMS(to, message, options) {
    logger.info(`[MOCK SMS] Para: ${to}`);
    logger.info(`[MOCK SMS] Mensagem: ${message}`);
    
    return {
      sid: 'mock_sid_' + Date.now(),
      status: 'sent'
    };
  }

  // ==================== TEMPLATES DE SMS ====================

  /**
   * Envia SMS de boas-vindas
   * @param {Object} user - Dados do usuário
   * @returns {Object} Resultado do envio
   */
  async sendWelcomeSMS(user) {
    const message = `Olá ${user.name}! Bem-vindo(a) ao MediConnect. Sua conta foi criada com sucesso. Acesse nosso sistema para agendar consultas.`;
    
    return await this.sendSMS(user.phone, message);
  }

  /**
   * Envia SMS de lembrete de consulta
   * @param {Object} appointment - Dados da consulta
   * @returns {Object} Resultado do envio
   */
  async sendAppointmentReminderSMS(appointment) {
    const date = new Date(appointment.appointment_date).toLocaleDateString('pt-BR');
    const time = appointment.appointment_time;
    
    const message = `Lembrete: Você tem uma consulta com ${appointment.doctor.name} no dia ${date} às ${time}. Chegue 15 minutos antes.`;
    
    return await this.sendSMS(appointment.patient.phone, message);
  }

  /**
   * Envia SMS de confirmação de consulta
   * @param {Object} appointment - Dados da consulta
   * @returns {Object} Resultado do envio
   */
  async sendAppointmentConfirmationSMS(appointment) {
    const date = new Date(appointment.appointment_date).toLocaleDateString('pt-BR');
    const time = appointment.appointment_time;
    
    const message = `Sua consulta com ${appointment.doctor.name} foi confirmada para ${date} às ${time}. Em caso de cancelamento, entre em contato conosco.`;
    
    return await this.sendSMS(appointment.patient.phone, message);
  }

  /**
   * Envia SMS de cancelamento de consulta
   * @param {Object} appointment - Dados da consulta
   * @param {string} reason - Motivo do cancelamento
   * @returns {Object} Resultado do envio
   */
  async sendAppointmentCancellationSMS(appointment, reason) {
    const date = new Date(appointment.appointment_date).toLocaleDateString('pt-BR');
    const time = appointment.appointment_time;
    
    const message = `Sua consulta com ${appointment.doctor.name} no dia ${date} às ${time} foi cancelada. Motivo: ${reason}. Entre em contato para reagendar.`;
    
    return await this.sendSMS(appointment.patient.phone, message);
  }

  /**
   * Envia SMS de confirmação de pagamento
   * @param {Object} payment - Dados do pagamento
   * @returns {Object} Resultado do envio
   */
  async sendPaymentConfirmationSMS(payment) {
    const amount = payment.amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
    
    const message = `Pagamento confirmado! Valor: ${amount}. Recebido: ${payment.payment_method}. Obrigado por escolher o MediConnect!`;
    
    return await this.sendSMS(payment.patient.phone, message);
  }

  /**
   * Envia SMS de lembrete de pagamento
   * @param {Object} payment - Dados do pagamento
   * @returns {Object} Resultado do envio
   */
  async sendPaymentReminderSMS(payment) {
    const amount = payment.amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
    
    const message = `Lembrete: Você tem um pagamento pendente de ${amount} referente à consulta. Entre em contato para regularizar.`;
    
    return await this.sendSMS(payment.patient.phone, message);
  }

  /**
   * Envia SMS de reset de senha
   * @param {Object} user - Dados do usuário
   * @param {string} resetToken - Token de reset
   * @returns {Object} Resultado do envio
   */
  async sendPasswordResetSMS(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const message = `Olá ${user.name}! Você solicitou reset de senha. Use este link: ${resetUrl} (válido por 1 hora).`;
    
    return await this.sendSMS(user.phone, message);
  }

  // ==================== UTILITÁRIOS ====================

  /**
   * Formata número de telefone para envio
   * @param {string} phone - Número de telefone
   * @returns {string} Número formatado
   */
  formatPhoneNumber(phone) {
    if (!phone) return null;
    
    // Remove caracteres não numéricos
    const numbers = phone.replace(/\D/g, '');
    
    // Se não começar com código do país, adiciona +55 (Brasil)
    if (numbers.length === 11 && numbers.startsWith('11')) {
      return `+55${numbers}`;
    } else if (numbers.length === 10) {
      return `+5511${numbers}`; // Assumindo São Paulo como padrão
    } else if (numbers.length === 13 && numbers.startsWith('55')) {
      return `+${numbers}`;
    }
    
    return numbers.length >= 10 ? `+${numbers}` : null;
  }

  /**
   * Valida número de telefone
   * @param {string} phone - Número de telefone
   * @returns {boolean} True se válido
   */
  isValidPhoneNumber(phone) {
    const formatted = this.formatPhoneNumber(phone);
    return formatted !== null && formatted.length >= 12;
  }

  /**
   * Obtém status de entrega do SMS
   * @param {string} messageId - ID da mensagem
   * @returns {Object} Status da mensagem
   */
  async getMessageStatus(messageId) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      switch (this.provider) {
        case 'twilio':
          const message = await this.client.messages(messageId).fetch();
          return {
            id: message.sid,
            status: message.status,
            to: message.to,
            from: message.from,
            body: message.body,
            dateCreated: message.dateCreated,
            dateSent: message.dateSent,
            errorCode: message.errorCode,
            errorMessage: message.errorMessage
          };
        case 'aws':
          // AWS SNS não fornece status detalhado por mensagem
          return {
            id: messageId,
            status: 'sent',
            provider: 'aws'
          };
        case 'mock':
          return {
            id: messageId,
            status: 'sent',
            provider: 'mock'
          };
        default:
          throw new Error(`Provedor não suportado: ${this.provider}`);
      }
    } catch (error) {
      logger.error('Erro ao obter status da mensagem:', error);
      throw error;
    }
  }

  /**
   * Obtém estatísticas do serviço
   * @returns {Object} Estatísticas
   */
  getStats() {
    return {
      provider: this.provider,
      isInitialized: this.isInitialized,
      config: {
        hasTwilioConfig: !!(this.config.twilio.accountSid && this.config.twilio.authToken),
        hasAWSConfig: !!(this.config.aws.accessKeyId && this.config.aws.secretAccessKey),
        isMockMode: this.provider === 'mock'
      }
    };
  }
}

// ==================== EXPORT ====================

const smsService = new SMSService();

module.exports = smsService;
