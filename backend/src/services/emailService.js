const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

/**
 * Serviço de Envio de Emails
 * Suporta múltiplos providers (Gmail, SMTP, etc)
 * Inclui templates para diferentes tipos de email
 */

class EmailService {
  constructor() {
    this.transporter = null;
    this.from = process.env.SMTP_FROM || process.env.SMTP_USER;
    this.appName = process.env.APP_NAME || 'MediConnect';
    this.appUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    this.initialized = false;
  }

  /**
   * Inicializa o transporter de email
   */
  async initialize() {
    try {
      // Configuração do transporter
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true', // true para 465, false para outras portas
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        tls: {
          rejectUnauthorized: false // Para servidores com certificados auto-assinados
        }
      });

      // Verificar conexão
      await this.transporter.verify();
      logger.info('✓ Serviço de email inicializado com sucesso');
      this.initialized = true;
      
      return true;
    } catch (error) {
      logger.error('✗ Erro ao inicializar serviço de email:', error);
      this.initialized = false;
      return false;
    }
  }

  /**
   * Verifica se o serviço está inicializado
   */
  checkInitialization() {
    if (!this.initialized) {
      throw new Error('Serviço de email não inicializado. Configure as variáveis SMTP no .env');
    }
  }

  /**
   * Envia email genérico
   * @param {object} options - Opções do email
   */
  async sendEmail({ to, subject, html, text, attachments = [] }) {
    try {
      this.checkInitialization();

      const mailOptions = {
        from: `${this.appName} <${this.from}>`,
        to,
        subject,
        html,
        text,
        attachments
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      logger.info(`Email enviado para ${to}: ${subject}`, {
        messageId: info.messageId
      });

      return {
        success: true,
        messageId: info.messageId,
        to,
        subject
      };
    } catch (error) {
      logger.error('Erro ao enviar email:', error);
      throw error;
    }
  }

  /**
   * Template base HTML
   */
  getBaseTemplate(content, title = '') {
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .content {
            padding: 30px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          .highlight {
            background-color: #fff3cd;
            padding: 15px;
            border-left: 4px solid #ffc107;
            margin: 15px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${this.appName}</h1>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <p>Este é um email automático, por favor não responda.</p>
            <p>&copy; ${new Date().getFullYear()} ${this.appName}. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Envia email de boas-vindas
   */
  async sendWelcomeEmail(user) {
    const content = `
      <h2>Bem-vindo(a), ${user.name}!</h2>
      <p>Sua conta foi criada com sucesso no ${this.appName}.</p>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Perfil:</strong> ${this.getRoleLabel(user.role)}</p>
      <p>Acesse o sistema através do link abaixo:</p>
      <a href="${this.appUrl}/login" class="button">Acessar Sistema</a>
      <p>Se você não solicitou esta conta, por favor ignore este email.</p>
    `;

    return await this.sendEmail({
      to: user.email,
      subject: `Bem-vindo ao ${this.appName}!`,
      html: this.getBaseTemplate(content, 'Bem-vindo'),
      text: `Bem-vindo, ${user.name}! Sua conta foi criada com sucesso.`
    });
  }

  /**
   * Envia email de redefinição de senha
   */
  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${this.appUrl}/reset-password/${resetToken}`;

    const content = `
      <h2>Redefinição de Senha</h2>
      <p>Olá, ${user.name}!</p>
      <p>Você solicitou a redefinição de senha da sua conta.</p>
      <p>Clique no botão abaixo para redefinir sua senha:</p>
      <a href="${resetUrl}" class="button">Redefinir Senha</a>
      <div class="highlight">
        <strong>⚠️ Importante:</strong>
        <ul>
          <li>Este link expira em 1 hora</li>
          <li>Se você não solicitou esta redefinição, ignore este email</li>
          <li>Sua senha atual permanecerá inalterada até que você crie uma nova</li>
        </ul>
      </div>
      <p>Ou copie e cole este link no seu navegador:</p>
      <p style="word-break: break-all; color: #666;">${resetUrl}</p>
    `;

    return await this.sendEmail({
      to: user.email,
      subject: 'Redefinição de Senha',
      html: this.getBaseTemplate(content, 'Redefinição de Senha'),
      text: `Redefinição de senha. Link: ${resetUrl}`
    });
  }

  /**
   * Envia lembrete de consulta
   */
  async sendAppointmentReminder(appointment, patient, doctor) {
    const appointmentDate = new Date(appointment.appointment_date).toLocaleDateString('pt-BR');
    const appointmentTime = appointment.appointment_time;

    const content = `
      <h2>Lembrete de Consulta</h2>
      <p>Olá, ${patient.name}!</p>
      <p>Este é um lembrete da sua consulta agendada:</p>
      <div class="highlight">
        <p><strong>📅 Data:</strong> ${appointmentDate}</p>
        <p><strong>🕐 Horário:</strong> ${appointmentTime}</p>
        <p><strong>👨‍⚕️ Médico(a):</strong> Dr(a). ${doctor.name}</p>
        <p><strong>🏥 Especialidade:</strong> ${doctor.specialty}</p>
        ${appointment.reason ? `<p><strong>Motivo:</strong> ${appointment.reason}</p>` : ''}
      </div>
      <p><strong>Importante:</strong></p>
      <ul>
        <li>Chegue com 15 minutos de antecedência</li>
        <li>Traga seus documentos e carteirinha do convênio</li>
        <li>Em caso de imprevistos, entre em contato para reagendar</li>
      </ul>
      <a href="${this.appUrl}/appointments/${appointment.id}" class="button">Ver Detalhes</a>
    `;

    return await this.sendEmail({
      to: patient.email,
      subject: `Lembrete: Consulta em ${appointmentDate}`,
      html: this.getBaseTemplate(content, 'Lembrete de Consulta'),
      text: `Lembrete: Consulta marcada para ${appointmentDate} às ${appointmentTime} com Dr(a). ${doctor.name}`
    });
  }

  /**
   * Envia confirmação de agendamento
   */
  async sendAppointmentConfirmation(appointment, patient, doctor) {
    const appointmentDate = new Date(appointment.appointment_date).toLocaleDateString('pt-BR');
    const appointmentTime = appointment.appointment_time;

    const content = `
      <h2>Consulta Agendada com Sucesso!</h2>
      <p>Olá, ${patient.name}!</p>
      <p>Sua consulta foi agendada com sucesso. Confira os detalhes:</p>
      <div class="highlight">
        <p><strong>📅 Data:</strong> ${appointmentDate}</p>
        <p><strong>🕐 Horário:</strong> ${appointmentTime}</p>
        <p><strong>👨‍⚕️ Médico(a):</strong> Dr(a). ${doctor.name}</p>
        <p><strong>🏥 Especialidade:</strong> ${doctor.specialty}</p>
        <p><strong>📍 Tipo:</strong> ${this.getAppointmentTypeLabel(appointment.appointment_type)}</p>
      </div>
      <p>Você receberá um lembrete próximo à data da consulta.</p>
      <a href="${this.appUrl}/appointments/${appointment.id}" class="button">Ver Detalhes</a>
    `;

    return await this.sendEmail({
      to: patient.email,
      subject: `Consulta Agendada - ${appointmentDate}`,
      html: this.getBaseTemplate(content, 'Consulta Agendada'),
      text: `Consulta agendada para ${appointmentDate} às ${appointmentTime} com Dr(a). ${doctor.name}`
    });
  }

  /**
   * Envia notificação de cancelamento
   */
  async sendAppointmentCancellation(appointment, patient, doctor, reason) {
    const appointmentDate = new Date(appointment.appointment_date).toLocaleDateString('pt-BR');
    const appointmentTime = appointment.appointment_time;

    const content = `
      <h2>Consulta Cancelada</h2>
      <p>Olá, ${patient.name}!</p>
      <p>Informamos que sua consulta foi cancelada:</p>
      <div class="highlight">
        <p><strong>📅 Data:</strong> ${appointmentDate}</p>
        <p><strong>🕐 Horário:</strong> ${appointmentTime}</p>
        <p><strong>👨‍⚕️ Médico(a):</strong> Dr(a). ${doctor.name}</p>
        ${reason ? `<p><strong>Motivo:</strong> ${reason}</p>` : ''}
      </div>
      <p>Para reagendar, entre em contato conosco.</p>
      <a href="${this.appUrl}/appointments/new" class="button">Agendar Nova Consulta</a>
    `;

    return await this.sendEmail({
      to: patient.email,
      subject: `Consulta Cancelada - ${appointmentDate}`,
      html: this.getBaseTemplate(content, 'Consulta Cancelada'),
      text: `Sua consulta de ${appointmentDate} às ${appointmentTime} foi cancelada.`
    });
  }

  /**
   * Envia notificação de pagamento recebido
   */
  async sendPaymentConfirmation(payment, patient, appointment) {
    const appointmentDate = new Date(appointment.appointment_date).toLocaleDateString('pt-BR');

    const content = `
      <h2>Pagamento Recebido</h2>
      <p>Olá, ${patient.name}!</p>
      <p>Confirmamos o recebimento do seu pagamento:</p>
      <div class="highlight">
        <p><strong>💰 Valor:</strong> R$ ${parseFloat(payment.amount_paid).toFixed(2)}</p>
        <p><strong>💳 Método:</strong> ${this.getPaymentMethodLabel(payment.payment_method)}</p>
        <p><strong>📅 Referente à consulta:</strong> ${appointmentDate}</p>
        <p><strong>🧾 Recibo:</strong> ${payment.receipt_number || 'Será gerado em breve'}</p>
      </div>
      <p>Obrigado por sua preferência!</p>
      ${payment.receipt_url ? `<a href="${payment.receipt_url}" class="button">Baixar Recibo</a>` : ''}
    `;

    return await this.sendEmail({
      to: patient.email,
      subject: 'Pagamento Confirmado',
      html: this.getBaseTemplate(content, 'Pagamento Confirmado'),
      text: `Pagamento de R$ ${payment.amount_paid} recebido com sucesso.`
    });
  }

  /**
   * Envia notificação de aniversário
   */
  async sendBirthdayEmail(patient) {
    const content = `
      <h2>🎉 Feliz Aniversário, ${patient.name}! 🎂</h2>
      <p>A equipe ${this.appName} deseja um feliz aniversário!</p>
      <p>Que este novo ano de vida seja repleto de saúde, alegria e realizações.</p>
      <p>Estamos sempre aqui para cuidar da sua saúde! 💙</p>
      <p style="text-align: center; font-size: 48px; margin: 30px 0;">🎈🎁🎊</p>
    `;

    return await this.sendEmail({
      to: patient.email,
      subject: `Feliz Aniversário, ${patient.name}! 🎉`,
      html: this.getBaseTemplate(content, 'Feliz Aniversário'),
      text: `Feliz Aniversário, ${patient.name}! A equipe ${this.appName} deseja um ótimo dia!`
    });
  }

  /**
   * Métodos auxiliares para labels
   */
  getRoleLabel(role) {
    const roles = {
      admin: 'Administrador',
      doctor: 'Médico',
      receptionist: 'Recepcionista'
    };
    return roles[role] || role;
  }

  getAppointmentTypeLabel(type) {
    const types = {
      first_visit: 'Primeira Consulta',
      return: 'Retorno',
      follow_up: 'Acompanhamento',
      emergency: 'Emergência'
    };
    return types[type] || type;
  }

  getPaymentMethodLabel(method) {
    const methods = {
      cash: 'Dinheiro',
      credit_card: 'Cartão de Crédito',
      debit_card: 'Cartão de Débito',
      pix: 'PIX',
      bank_transfer: 'Transferência Bancária',
      health_insurance: 'Convênio',
      check: 'Cheque',
      other: 'Outro'
    };
    return methods[method] || method;
  }

  /**
   * Envia email de teste
   */
  async sendTestEmail(to) {
    const content = `
      <h2>Email de Teste</h2>
      <p>Este é um email de teste do ${this.appName}.</p>
      <p>Se você recebeu este email, significa que o serviço de email está funcionando corretamente! ✅</p>
      <p><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
    `;

    return await this.sendEmail({
      to,
      subject: `Teste de Email - ${this.appName}`,
      html: this.getBaseTemplate(content, 'Email de Teste'),
      text: 'Email de teste do MediConnect'
    });
  }
}

// Exportar instância única (Singleton)
const emailService = new EmailService();

module.exports = emailService;

/**
 * EXEMPLO DE USO:
 * 
 * const emailService = require('./services/emailService');
 * 
 * // Inicializar (fazer no server.js)
 * await emailService.initialize();
 * 
 * // Enviar email de boas-vindas
 * await emailService.sendWelcomeEmail(user);
 * 
 * // Enviar redefinição de senha
 * await emailService.sendPasswordResetEmail(user, resetToken);
 * 
 * // Enviar lembrete de consulta
 * await emailService.sendAppointmentReminder(appointment, patient, doctor);
 * 
 * // Enviar confirmação de agendamento
 * await emailService.sendAppointmentConfirmation(appointment, patient, doctor);
 * 
 * // Enviar notificação de cancelamento
 * await emailService.sendAppointmentCancellation(appointment, patient, doctor, reason);
 * 
 * // Enviar confirmação de pagamento
 * await emailService.sendPaymentConfirmation(payment, patient, appointment);
 * 
 * // Enviar aniversário
 * await emailService.sendBirthdayEmail(patient);
 * 
 * // Email de teste
 * await emailService.sendTestEmail('teste@email.com');
 * 
 * DEPENDÊNCIAS NECESSÁRIAS:
 * npm install nodemailer
 * 
 * VARIÁVEIS DE AMBIENTE (.env):
 * SMTP_HOST=smtp.gmail.com
 * SMTP_PORT=587
 * SMTP_SECURE=false
 * SMTP_USER=seu_email@gmail.com
 * SMTP_PASS=sua_senha_app
 * SMTP_FROM=noreply@mediconnect.com
 * APP_NAME=MediConnect
 * FRONTEND_URL=http://localhost:3000
 * 
 * PARA GMAIL:
 * 1. Ativar verificação em 2 etapas
 * 2. Gerar senha de app em: https://myaccount.google.com/apppasswords
 * 3. Usar a senha de app no SMTP_PASS
 */