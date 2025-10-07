const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Modelo de Convênio Médico / Plano de Saúde
 * Gerencia informações sobre convênios e planos aceitos pela clínica
 */
const HealthInsurance = sequelize.define('health_insurances', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: 'ID único do convênio'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: {
      msg: 'Convênio com este nome já cadastrado'
    },
    validate: {
      notEmpty: {
        msg: 'Nome do convênio não pode estar vazio'
      },
      len: {
        args: [2, 100],
        msg: 'Nome deve ter entre 2 e 100 caracteres'
      }
    },
    comment: 'Nome do convênio/plano de saúde'
  },
  code: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: {
      msg: 'Código já cadastrado'
    },
    comment: 'Código identificador do convênio (ANS, CNPJ, etc)'
  },
  type: {
    type: DataTypes.ENUM('private', 'public', 'cooperative', 'self_management'),
    defaultValue: 'private',
    allowNull: false,
    comment: 'Tipo de convênio: privado, público, cooperativa, autogestão'
  },
  category: {
    type: DataTypes.ENUM('individual', 'company', 'collective', 'family'),
    allowNull: true,
    comment: 'Categoria do plano'
  },
  // Informações de contato
  contact_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Nome do contato no convênio'
  },
  contact_phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Telefone de contato'
  },
  contact_email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: {
        msg: 'Email de contato inválido'
      }
    },
    comment: 'Email de contato'
  },
  website: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isUrl: {
        msg: 'URL do website inválida'
      }
    },
    comment: 'Website do convênio'
  },
  // Informações financeiras
  reimbursement_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 100.00,
    validate: {
      min: {
        args: [0],
        msg: 'Percentual de reembolso não pode ser negativo'
      },
      max: {
        args: [100],
        msg: 'Percentual de reembolso não pode ser maior que 100'
      }
    },
    comment: 'Percentual de reembolso do convênio (%)'
  },
  copayment_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00,
    validate: {
      min: {
        args: [0],
        msg: 'Valor de coparticipação não pode ser negativo'
      }
    },
    comment: 'Valor fixo de coparticipação'
  },
  copayment_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 0.00,
    validate: {
      min: {
        args: [0],
        msg: 'Percentual de coparticipação não pode ser negativo'
      },
      max: {
        args: [100],
        msg: 'Percentual de coparticipação não pode ser maior que 100'
      }
    },
    comment: 'Percentual de coparticipação (%)'
  },
  minimum_consultation_value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: {
        args: [0],
        msg: 'Valor mínimo não pode ser negativo'
      }
    },
    comment: 'Valor mínimo da consulta para este convênio'
  },
  // Informações administrativas
  requires_authorization: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'Requer autorização prévia para consultas'
  },
  authorization_deadline_days: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: {
        args: [1],
        msg: 'Prazo de autorização deve ser no mínimo 1 dia'
      }
    },
    comment: 'Prazo em dias para obter autorização'
  },
  billing_deadline_days: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 30,
    validate: {
      min: {
        args: [1],
        msg: 'Prazo de faturamento deve ser no mínimo 1 dia'
      }
    },
    comment: 'Prazo em dias para envio do faturamento'
  },
  payment_deadline_days: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 30,
    validate: {
      min: {
        args: [1],
        msg: 'Prazo de pagamento deve ser no mínimo 1 dia'
      }
    },
    comment: 'Prazo em dias para recebimento do pagamento'
  },
  // Tabelas e procedimentos
  procedure_table: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Tabela de procedimentos utilizada (TUSS, AMB, CBHPM, etc)'
  },
  coverage_info: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Informações sobre cobertura e procedimentos aceitos'
  },
  exclusions: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Exclusões e limitações do convênio'
  },
  // Configurações
  accepts_emergency: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    comment: 'Aceita atendimentos de emergência'
  },
  accepts_telemedicine: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'Aceita telemedicina'
  },
  carencia_days: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'Carência não pode ser negativa'
      }
    },
    comment: 'Período de carência em dias'
  },
  // Observações
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Observações gerais sobre o convênio'
  },
  contract_number: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Número do contrato com o convênio'
  },
  contract_start_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Data de início do contrato'
  },
  contract_end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isAfterStartDate(value) {
        if (value && this.contract_start_date && value < this.contract_start_date) {
          throw new Error('Data de término deve ser posterior à data de início');
        }
      }
    },
    comment: 'Data de término do contrato'
  },
  // Status
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    comment: 'Status ativo/inativo'
  },
  logo: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isUrl: {
        msg: 'URL do logo inválida'
      }
    },
    comment: 'URL do logo do convênio'
  },
  // Estatísticas (calculadas)
  total_patients: {
    type: DataTypes.VIRTUAL,
    get() {
      // Será calculado via query quando necessário
      return this.getDataValue('total_patients') || 0;
    }
  },
  total_appointments: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.getDataValue('total_appointments') || 0;
    }
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
  tableName: 'health_insurances',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['name']
    },
    {
      unique: true,
      fields: ['code'],
      where: {
        code: { [require('sequelize').Op.ne]: null }
      }
    },
    {
      fields: ['type']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['requires_authorization']
    }
  ],
  hooks: {
    beforeValidate: (insurance) => {
      // Trim em strings
      if (insurance.name) insurance.name = insurance.name.trim();
      if (insurance.code) insurance.code = insurance.code.trim().toUpperCase();
      if (insurance.contact_email) insurance.contact_email = insurance.contact_email.trim().toLowerCase();
    }
  }
});

/**
 * Métodos de instância
 */

/**
 * Verifica se o convênio está válido/ativo
 * @returns {boolean}
 */
HealthInsurance.prototype.isValid = function() {
  if (!this.is_active) return false;
  
  if (this.contract_end_date) {
    const today = new Date();
    const endDate = new Date(this.contract_end_date);
    if (endDate < today) return false;
  }
  
  return true;
};

/**
 * Calcula o valor da consulta com coparticipação
 * @param {number} baseValue - Valor base da consulta
 * @returns {object} - {patientPays, insurancePays, total}
 */
HealthInsurance.prototype.calculateConsultationValue = function(baseValue) {
  let patientPays = 0;
  let insurancePays = 0;
  
  // Aplica percentual de reembolso
  if (this.reimbursement_percentage) {
    insurancePays = baseValue * (this.reimbursement_percentage / 100);
    patientPays = baseValue - insurancePays;
  } else {
    insurancePays = baseValue;
  }
  
  // Adiciona coparticipação fixa
  if (this.copayment_amount) {
    patientPays += parseFloat(this.copayment_amount);
    insurancePays -= parseFloat(this.copayment_amount);
  }
  
  // Adiciona coparticipação percentual
  if (this.copayment_percentage) {
    const copayValue = baseValue * (this.copayment_percentage / 100);
    patientPays += copayValue;
    insurancePays -= copayValue;
  }
  
  return {
    total: baseValue,
    patientPays: Math.max(0, patientPays),
    insurancePays: Math.max(0, insurancePays)
  };
};

/**
 * Verifica se o convênio aceita um tipo de atendimento
 * @param {string} type - 'emergency' ou 'telemedicine'
 * @returns {boolean}
 */
HealthInsurance.prototype.acceptsServiceType = function(type) {
  if (type === 'emergency') return this.accepts_emergency;
  if (type === 'telemedicine') return this.accepts_telemedicine;
  return true;
};

/**
 * Retorna informações resumidas do convênio
 * @returns {object}
 */
HealthInsurance.prototype.getSummary = function() {
  return {
    id: this.id,
    name: this.name,
    code: this.code,
    type: this.type,
    is_active: this.is_active,
    requires_authorization: this.requires_authorization,
    reimbursement_percentage: this.reimbursement_percentage
  };
};

/**
 * Verifica se está no período de carência
 * @param {Date} patientStartDate - Data de início do plano do paciente
 * @returns {boolean}
 */
HealthInsurance.prototype.isInCarenciaPeriod = function(patientStartDate) {
  if (!this.carencia_days || this.carencia_days === 0) return false;
  
  const today = new Date();
  const startDate = new Date(patientStartDate);
  const diffTime = Math.abs(today - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays < this.carencia_days;
};

/**
 * Calcula dias restantes até pagamento
 * @param {Date} billingDate - Data do faturamento
 * @returns {number}
 */
HealthInsurance.prototype.daysUntilPayment = function(billingDate) {
  if (!this.payment_deadline_days) return 0;
  
  const paymentDate = new Date(billingDate);
  paymentDate.setDate(paymentDate.getDate() + this.payment_deadline_days);
  
  const today = new Date();
  const diffTime = paymentDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Métodos estáticos
 */

/**
 * Busca convênios ativos
 * @returns {Promise<Array>}
 */
HealthInsurance.findActive = async function() {
  return await this.findAll({
    where: { is_active: true },
    order: [['name', 'ASC']]
  });
};

/**
 * Busca convênios por tipo
 * @param {string} type - Tipo do convênio
 * @returns {Promise<Array>}
 */
HealthInsurance.findByType = async function(type) {
  return await this.findAll({
    where: {
      type: type,
      is_active: true
    },
    order: [['name', 'ASC']]
  });
};

/**
 * Busca convênio por código
 * @param {string} code - Código do convênio
 * @returns {Promise<HealthInsurance|null>}
 */
HealthInsurance.findByCode = async function(code) {
  return await this.findOne({
    where: {
      code: code.toUpperCase()
    }
  });
};

/**
 * Busca convênios que requerem autorização
 * @returns {Promise<Array>}
 */
HealthInsurance.findRequiringAuthorization = async function() {
  return await this.findAll({
    where: {
      requires_authorization: true,
      is_active: true
    },
    order: [['name', 'ASC']]
  });
};

/**
 * Customiza JSON de saída
 */
HealthInsurance.prototype.toJSON = function() {
  const values = { ...this.get() };
  
  // Adiciona informação de validade
  values.is_valid = this.isValid();
  
  // Formata valores monetários
  if (this.copayment_amount) {
    values.copayment_amount_formatted = `R$ ${parseFloat(this.copayment_amount).toFixed(2)}`;
  }
  
  if (this.minimum_consultation_value) {
    values.minimum_consultation_value_formatted = `R$ ${parseFloat(this.minimum_consultation_value).toFixed(2)}`;
  }
  
  return values;
};

module.exports = HealthInsurance;