const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

/**
 * Modelo de Usuário do Sistema
 * Gerencia autenticação e controle de acesso
 */
const User = sequelize.define('users', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: 'ID único do usuário'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Nome não pode estar vazio'
      },
      len: {
        args: [3, 100],
        msg: 'Nome deve ter entre 3 e 100 caracteres'
      }
    },
    comment: 'Nome completo do usuário'
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: {
      msg: 'Email já cadastrado'
    },
    validate: {
      notEmpty: {
        msg: 'Email não pode estar vazio'
      },
      isEmail: {
        msg: 'Email inválido'
      }
    },
    comment: 'Email único para login'
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Senha não pode estar vazia'
      },
      len: {
        args: [6, 255],
        msg: 'Senha deve ter no mínimo 6 caracteres'
      }
    },
    comment: 'Senha criptografada'
  },
  role: {
    type: DataTypes.ENUM('admin', 'doctor', 'receptionist'),
    defaultValue: 'receptionist',
    allowNull: false,
    validate: {
      isIn: {
        args: [['admin', 'doctor', 'receptionist']],
        msg: 'Role deve ser admin, doctor ou receptionist'
      }
    },
    comment: 'Nível de permissão do usuário'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Telefone de contato'
  },
  avatar: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isUrl: {
        msg: 'URL do avatar inválida'
      }
    },
    comment: 'URL da foto de perfil'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    comment: 'Status ativo/inativo do usuário'
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data/hora do último login'
  },
  last_login_ip: {
    type: DataTypes.STRING(45),
    allowNull: true,
    comment: 'IP do último login'
  },
  login_attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    comment: 'Tentativas de login falhadas'
  },
  locked_until: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data até quando a conta está bloqueada'
  },
  password_reset_token: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Token para redefinição de senha'
  },
  password_reset_expires: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data de expiração do token'
  },
  password_changed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data da última alteração de senha'
  },
  email_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'Email verificado'
  },
  email_verification_token: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Token para verificação de email'
  },
  two_factor_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'Autenticação de dois fatores habilitada'
  },
  two_factor_secret: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Secret para autenticação de dois fatores'
  },
  preferences: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null,
    comment: 'Preferências do usuário (tema, notificações, etc)'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      fields: ['role']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['last_login']
    }
  ],
  hooks: {
    beforeValidate: (user) => {
      // Normalizar email
      if (user.email) {
        user.email = user.email.trim().toLowerCase();
      }
      
      // Trim no nome
      if (user.name) {
        user.name = user.name.trim();
      }
    },
    
    beforeCreate: async (user) => {
      // Criptografar senha antes de criar
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
      
      // Inicializar preferências padrão
      if (!user.preferences) {
        user.preferences = {
          theme: 'light',
          notifications: true,
          language: 'pt-BR'
        };
      }
    },
    
    beforeUpdate: async (user) => {
      // Criptografar senha se foi alterada
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        user.password_changed_at = new Date();
      }
    }
  }
});

/**
 * Métodos de instância
 */

/**
 * Compara senha fornecida com a senha criptografada
 * @param {string} candidatePassword - Senha a comparar
 * @returns {Promise<boolean>}
 */
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Cria token de redefinição de senha
 * @returns {string} Token não criptografado
 */
User.prototype.createPasswordResetToken = function() {
  const resetToken = require('crypto').randomBytes(32).toString('hex');
  
  // Criptografa e salva o token
  this.password_reset_token = require('crypto')
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  // Token expira em 1 hora
  this.password_reset_expires = new Date(Date.now() + 3600000);
  
  return resetToken; // Retorna token não criptografado para enviar por email
};

/**
 * Verifica se o token de redefinição é válido
 * @param {string} token - Token a verificar
 * @returns {boolean}
 */
User.prototype.isPasswordResetTokenValid = function(token) {
  if (!this.password_reset_token || !this.password_reset_expires) {
    return false;
  }
  
  // Criptografa o token recebido
  const hashedToken = require('crypto')
    .createHash('sha256')
    .update(token)
    .digest('hex');
  
  // Verifica se corresponde e se não expirou
  return (
    hashedToken === this.password_reset_token &&
    new Date() < this.password_reset_expires
  );
};

/**
 * Limpa token de redefinição de senha
 */
User.prototype.clearPasswordResetToken = function() {
  this.password_reset_token = null;
  this.password_reset_expires = null;
};

/**
 * Registra tentativa de login falhada
 * @returns {Promise<void>}
 */
User.prototype.registerFailedLogin = async function() {
  this.login_attempts += 1;
  
  // Bloqueia conta após 5 tentativas
  if (this.login_attempts >= 5) {
    this.locked_until = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
  }
  
  await this.save();
};

/**
 * Reseta contador de tentativas de login
 * @returns {Promise<void>}
 */
User.prototype.resetLoginAttempts = async function() {
  this.login_attempts = 0;
  this.locked_until = null;
  await this.save();
};

/**
 * Verifica se a conta está bloqueada
 * @returns {boolean}
 */
User.prototype.isLocked = function() {
  if (!this.locked_until) return false;
  
  const now = new Date();
  if (now < this.locked_until) {
    return true;
  }
  
  // Se o tempo de bloqueio passou, desbloqueia
  this.locked_until = null;
  this.login_attempts = 0;
  return false;
};

/**
 * Atualiza informações de último login
 * @param {string} ip - IP do login
 * @returns {Promise<void>}
 */
User.prototype.updateLastLogin = async function(ip = null) {
  this.last_login = new Date();
  if (ip) {
    this.last_login_ip = ip;
  }
  await this.resetLoginAttempts();
};

/**
 * Verifica se o usuário tem permissão específica
 * @param {string} requiredRole - Role requerida
 * @returns {boolean}
 */
User.prototype.hasRole = function(requiredRole) {
  const roleHierarchy = {
    admin: 3,
    doctor: 2,
    receptionist: 1
  };
  
  return roleHierarchy[this.role] >= roleHierarchy[requiredRole];
};

/**
 * Verifica se é admin
 * @returns {boolean}
 */
User.prototype.isAdmin = function() {
  return this.role === 'admin';
};

/**
 * Verifica se é médico
 * @returns {boolean}
 */
User.prototype.isDoctor = function() {
  return this.role === 'doctor';
};

/**
 * Retorna dados públicos do usuário (sem informações sensíveis)
 * @returns {object}
 */
User.prototype.getPublicProfile = function() {
  return {
    id: this.id,
    name: this.name,
    email: this.email,
    role: this.role,
    avatar: this.avatar,
    is_active: this.is_active
  };
};

/**
 * Métodos estáticos
 */

/**
 * Busca usuário por email
 * @param {string} email - Email do usuário
 * @returns {Promise<User|null>}
 */
User.findByEmail = async function(email) {
  return await this.findOne({
    where: {
      email: email.toLowerCase().trim()
    }
  });
};

/**
 * Busca usuários por role
 * @param {string} role - Role a buscar
 * @returns {Promise<Array>}
 */
User.findByRole = async function(role) {
  return await this.findAll({
    where: {
      role,
      is_active: true
    },
    order: [['name', 'ASC']]
  });
};

/**
 * Busca usuários ativos
 * @returns {Promise<Array>}
 */
User.findActive = async function() {
  return await this.findAll({
    where: { is_active: true },
    order: [['name', 'ASC']]
  });
};

/**
 * Estatísticas de usuários
 * @returns {Promise<object>}
 */
User.getStatistics = async function() {
  const total = await this.count();
  const active = await this.count({ where: { is_active: true } });
  
  const byRole = await this.findAll({
    attributes: [
      'role',
      [require('sequelize').fn('COUNT', 'id'), 'count']
    ],
    group: ['role'],
    raw: true
  });
  
  return {
    total,
    active,
    inactive: total - active,
    by_role: byRole
  };
};

/**
 * Customiza saída JSON (remove informações sensíveis)
 */
User.prototype.toJSON = function() {
  const values = { ...this.get() };
  
  // Remove campos sensíveis
  delete values.password;
  delete values.password_reset_token;
  delete values.password_reset_expires;
  delete values.email_verification_token;
  delete values.two_factor_secret;
  
  // Adiciona informações calculadas
  values.is_locked = this.isLocked();
  values.is_admin = this.isAdmin();
  values.is_doctor = this.isDoctor();
  
  return values;
};

module.exports = User;