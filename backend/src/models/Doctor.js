const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Modelo de Médico
 * Gerencia informações cadastrais e profissionais dos médicos
 */
const Doctor = sequelize.define('doctors', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: 'ID único do médico'
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    comment: 'Referência ao usuário do sistema (se tiver acesso)'
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
    comment: 'Nome completo do médico'
  },
  crm: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'CRM não pode estar vazio'
      }
    },
    comment: 'Número do CRM'
  },
  crm_state: {
    type: DataTypes.STRING(2),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Estado do CRM não pode estar vazio'
      },
      len: {
        args: [2, 2],
        msg: 'Estado do CRM deve ter 2 caracteres'
      },
      isUppercase: {
        msg: 'Estado do CRM deve estar em maiúsculas'
      }
    },
    comment: 'Estado do CRM (UF)'
  },
  cpf: {
    type: DataTypes.STRING(14),
    allowNull: false,
    unique: {
      msg: 'CPF já cadastrado'
    },
    validate: {
      notEmpty: {
        msg: 'CPF não pode estar vazio'
      },
      is: {
        args: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
        msg: 'CPF deve estar no formato XXX.XXX.XXX-XX'
      }
    },
    comment: 'CPF do médico (formato: XXX.XXX.XXX-XX)'
  },
  specialty: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Especialidade não pode estar vazia'
      }
    },
    comment: 'Especialidade médica principal'
  },
  sub_specialties: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null,
    validate: {
      isValidArray(value) {
        if (value !== null && !Array.isArray(value)) {
          throw new Error('Sub-especialidades deve ser um array');
        }
      }
    },
    comment: 'Sub-especialidades (array JSON)'
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
    comment: 'Email profissional'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Telefone não pode estar vazio'
      }
    },
    comment: 'Telefone principal'
  },
  phone_secondary: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Telefone secundário'
  },
  birth_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isDate: {
        msg: 'Data de nascimento inválida'
      },
      isBefore: {
        args: new Date().toISOString().split('T')[0],
        msg: 'Data de nascimento não pode ser futura'
      }
    },
    comment: 'Data de nascimento'
  },
  // Informações profissionais
  consultation_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: {
        args: [0],
        msg: 'Preço da consulta não pode ser negativo'
      }
    },
    comment: 'Valor padrão da consulta particular'
  },
  consultation_duration: {
    type: DataTypes.INTEGER,
    defaultValue: 30,
    allowNull: false,
    validate: {
      min: {
        args: [5],
        msg: 'Duração mínima da consulta é 5 minutos'
      },
      max: {
        args: [480],
        msg: 'Duração máxima da consulta é 480 minutos (8 horas)'
      }
    },
    comment: 'Duração padrão da consulta em minutos'
  },
  accepts_health_insurance: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    comment: 'Aceita convênio médico'
  },
  health_insurances: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null,
    validate: {
      isValidArray(value) {
        if (value !== null && !Array.isArray(value)) {
          throw new Error('Convênios deve ser um array');
        }
      }
    },
    comment: 'Lista de convênios aceitos (array JSON)'
  },
  // Horários de atendimento (JSON)
  working_hours: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      monday: { start: '08:00', end: '18:00', active: true },
      tuesday: { start: '08:00', end: '18:00', active: true },
      wednesday: { start: '08:00', end: '18:00', active: true },
      thursday: { start: '08:00', end: '18:00', active: true },
      friday: { start: '08:00', end: '18:00', active: true },
      saturday: { start: '08:00', end: '12:00', active: false },
      sunday: { start: '08:00', end: '12:00', active: false }
    },
    validate: {
      isValidWorkingHours(value) {
        if (!value) return;
        
        const requiredDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const days = Object.keys(value);
        
        // Verifica se todos os dias estão presentes
        const missingDays = requiredDays.filter(day => !days.includes(day));
        if (missingDays.length > 0) {
          throw new Error(`Dias faltando no horário de trabalho: ${missingDays.join(', ')}`);
        }
        
        // Valida estrutura de cada dia
        for (const [day, hours] of Object.entries(value)) {
          if (!hours.start || !hours.end || typeof hours.active !== 'boolean') {
            throw new Error(`Estrutura inválida para ${day}. Deve conter: start, end, active`);
          }
          
          // Valida formato de hora (HH:mm)
          const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
          if (!timeRegex.test(hours.start) || !timeRegex.test(hours.end)) {
            throw new Error(`Formato de hora inválido para ${day}. Use HH:mm`);
          }
        }
      }
    },
    comment: 'Horários de atendimento por dia da semana'
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Biografia/apresentação do médico'
  },
  photo: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isUrl: {
        msg: 'URL da foto inválida'
      }
    },
    comment: 'URL da foto do médico'
  },
  signature: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isUrl: {
        msg: 'URL da assinatura inválida'
      }
    },
    comment: 'URL da assinatura digitalizada'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    comment: 'Status ativo/inativo'
  },
  // Informações adicionais
  formation: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Formação acadêmica'
  },
  additional_info: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Informações adicionais'
  },
  // Campos de auditoria
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
  tableName: 'doctors',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['crm', 'crm_state'],
      name: 'unique_crm_state'
    },
    {
      unique: true,
      fields: ['cpf']
    },
    {
      unique: true,
      fields: ['email']
    },
    {
      fields: ['specialty']
    },
    {
      fields: ['name']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['user_id']
    }
  ],
  hooks: {
    beforeValidate: (doctor) => {
      // Converter CRM state para maiúsculas
      if (doctor.crm_state) {
        doctor.crm_state = doctor.crm_state.toUpperCase();
      }
      
      // Trim em strings
      if (doctor.name) doctor.name = doctor.name.trim();
      if (doctor.email) doctor.email = doctor.email.trim().toLowerCase();
      if (doctor.specialty) doctor.specialty = doctor.specialty.trim();
    },
    
    beforeCreate: (doctor) => {
      // Garantir que working_hours tem valor padrão se null
      if (!doctor.working_hours) {
        doctor.working_hours = {
          monday: { start: '08:00', end: '18:00', active: true },
          tuesday: { start: '08:00', end: '18:00', active: true },
          wednesday: { start: '08:00', end: '18:00', active: true },
          thursday: { start: '08:00', end: '18:00', active: true },
          friday: { start: '08:00', end: '18:00', active: true },
          saturday: { start: '08:00', end: '12:00', active: false },
          sunday: { start: '08:00', end: '12:00', active: false }
        };
      }
    }
  }
});

/**
 * Métodos de instância
 */

/**
 * Verifica se o médico atende em um dia específico
 * @param {string} dayName - Nome do dia (monday, tuesday, etc)
 * @returns {boolean}
 */
Doctor.prototype.isAvailableOnDay = function(dayName) {
  if (!this.working_hours || !this.working_hours[dayName]) {
    return false;
  }
  return this.working_hours[dayName].active === true;
};

/**
 * Obtém horário de trabalho de um dia específico
 * @param {string} dayName - Nome do dia
 * @returns {object|null} - {start, end, active} ou null
 */
Doctor.prototype.getWorkingHoursForDay = function(dayName) {
  if (!this.working_hours || !this.working_hours[dayName]) {
    return null;
  }
  return this.working_hours[dayName];
};

/**
 * Calcula idade do médico
 * @returns {number|null}
 */
Doctor.prototype.getAge = function() {
  if (!this.birth_date) return null;
  
  const today = new Date();
  const birthDate = new Date(this.birth_date);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Verifica se aceita um convênio específico
 * @param {string} insuranceName - Nome do convênio
 * @returns {boolean}
 */
Doctor.prototype.acceptsInsurance = function(insuranceName) {
  if (!this.accepts_health_insurance || !this.health_insurances) {
    return false;
  }
  
  return this.health_insurances.some(
    insurance => insurance.toLowerCase() === insuranceName.toLowerCase()
  );
};

/**
 * Obtém lista de dias em que atende
 * @returns {array} - Array de dias ['monday', 'tuesday', ...]
 */
Doctor.prototype.getActiveDays = function() {
  if (!this.working_hours) return [];
  
  return Object.keys(this.working_hours).filter(
    day => this.working_hours[day].active === true
  );
};

/**
 * Retorna informações resumidas do médico
 * @returns {object}
 */
Doctor.prototype.getSummary = function() {
  return {
    id: this.id,
    name: this.name,
    crm: `${this.crm}/${this.crm_state}`,
    specialty: this.specialty,
    email: this.email,
    phone: this.phone,
    is_active: this.is_active,
    accepts_health_insurance: this.accepts_health_insurance
  };
};

/**
 * Valida se um horário está dentro do expediente
 * @param {string} dayName - Nome do dia
 * @param {string} time - Horário no formato HH:mm
 * @returns {boolean}
 */
Doctor.prototype.isTimeWithinWorkingHours = function(dayName, time) {
  const hours = this.getWorkingHoursForDay(dayName);
  
  if (!hours || !hours.active) {
    return false;
  }
  
  const [timeHour, timeMinute] = time.split(':').map(Number);
  const [startHour, startMinute] = hours.start.split(':').map(Number);
  const [endHour, endMinute] = hours.end.split(':').map(Number);
  
  const timeInMinutes = timeHour * 60 + timeMinute;
  const startInMinutes = startHour * 60 + startMinute;
  const endInMinutes = endHour * 60 + endMinute;
  
  return timeInMinutes >= startInMinutes && timeInMinutes < endInMinutes;
};

/**
 * Métodos estáticos
 */

/**
 * Busca médicos por especialidade
 * @param {string} specialty - Especialidade
 * @returns {Promise<Array>}
 */
Doctor.findBySpecialty = async function(specialty) {
  return await this.findAll({
    where: {
      specialty: {
        [require('sequelize').Op.like]: `%${specialty}%`
      },
      is_active: true
    },
    order: [['name', 'ASC']]
  });
};

/**
 * Busca médicos disponíveis em um dia específico
 * @param {string} dayName - Nome do dia
 * @returns {Promise<Array>}
 */
Doctor.findAvailableOnDay = async function(dayName) {
  const doctors = await this.findAll({
    where: { is_active: true }
  });
  
  return doctors.filter(doctor => doctor.isAvailableOnDay(dayName));
};

/**
 * Busca médico por CRM
 * @param {string} crm - Número do CRM
 * @param {string} state - Estado (UF)
 * @returns {Promise<Doctor|null>}
 */
Doctor.findByCRM = async function(crm, state) {
  return await this.findOne({
    where: {
      crm: crm,
      crm_state: state.toUpperCase()
    }
  });
};

/**
 * Customiza JSON de saída
 */
Doctor.prototype.toJSON = function() {
  const values = { ...this.get() };
  
  // Adiciona informações calculadas
  if (this.birth_date) {
    values.age = this.getAge();
  }
  
  // Adiciona CRM formatado
  values.crm_full = `${this.crm}/${this.crm_state}`;
  
  // Adiciona dias ativos
  values.active_days = this.getActiveDays();
  
  return values;
};

module.exports = Doctor;