const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Modelo de Pagamento
 * Gerencia pagamentos de consultas e procedimentos
 */
const Payment = sequelize.define('payments', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: 'ID único do pagamento'
  },
  appointment_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'appointments',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    comment: 'Referência ao agendamento'
  },
  patient_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'patients',
      key: 'id'
    },
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    comment: 'Referência ao paciente'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: 'Valor não pode ser negativo'
      }
    },
    comment: 'Valor total a pagar'
  },
  amount_paid: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: 'Valor pago não pode ser negativo'
      }
    },
    comment: 'Valor já pago'
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: 'Desconto não pode ser negativo'
      }
    },
    comment: 'Valor de desconto aplicado'
  },
  discount_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: {
        args: [0],
        msg: 'Percentual de desconto não pode ser negativo'
      },
      max: {
        args: [100],
        msg: 'Percentual de desconto não pode ser maior que 100'
      }
    },
    comment: 'Percentual de desconto'
  },
  payment_method: {
    type: DataTypes.ENUM('cash', 'credit_card', 'debit_card', 'pix', 'bank_transfer', 'health_insurance', 'check', 'other'),
    allowNull: false,
    comment: 'Método de pagamento'
  },
  payment_status: {
    type: DataTypes.ENUM('pending', 'paid', 'partially_paid', 'overdue', 'refunded', 'cancelled'),
    defaultValue: 'pending',
    allowNull: false,
    comment: 'Status do pagamento'
  },
  installments: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: 'Número de parcelas deve ser no mínimo 1'
      }
    },
    comment: 'Número de parcelas'
  },
  installment_value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Valor de cada parcela'
  },
  due_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Data de vencimento'
  },
  payment_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data/hora do pagamento'
  },
  // Informações de cartão (se aplicável)
  card_last_digits: {
    type: DataTypes.STRING(4),
    allowNull: true,
    comment: 'Últimos 4 dígitos do cartão'
  },
  card_brand: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Bandeira do cartão (Visa, Master, etc)'
  },
  authorization_code: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Código de autorização da transação'
  },
  transaction_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
    comment: 'ID da transação (gateway de pagamento)'
  },
  // Informações de convênio
  health_insurance_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'health_insurances',
      key: 'id'
    },
    onDelete: 'SET NULL',
    comment: 'Referência ao convênio'
  },
  health_insurance_authorization: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Número de autorização do convênio'
  },
  insurance_coverage_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Valor coberto pelo convênio'
  },
  patient_copayment: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Valor de coparticipação do paciente'
  },
  // Reembolso
  refund_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: {
        args: [0],
        msg: 'Valor de reembolso não pode ser negativo'
      }
    },
    comment: 'Valor reembolsado'
  },
  refund_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data do reembolso'
  },
  refund_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Motivo do reembolso'
  },
  // Recibo e nota fiscal
  receipt_number: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true,
    comment: 'Número do recibo'
  },
  receipt_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'URL do recibo PDF'
  },
  invoice_number: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Número da nota fiscal'
  },
  invoice_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'URL da nota fiscal'
  },
  // Observações
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Observações sobre o pagamento'
  },
  // Controle e auditoria
  processed_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuário que processou o pagamento'
  },
  cancelled_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuário que cancelou o pagamento'
  },
  cancelled_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data/hora do cancelamento'
  },
  cancellation_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Motivo do cancelamento'
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
  tableName: 'payments',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['appointment_id']
    },
    {
      fields: ['patient_id']
    },
    {
      fields: ['payment_status']
    },
    {
      fields: ['payment_method']
    },
    {
      fields: ['due_date']
    },
    {
      fields: ['payment_date']
    },
    {
      unique: true,
      fields: ['receipt_number'],
      where: {
        receipt_number: { [require('sequelize').Op.ne]: null }
      }
    },
    {
      unique: true,
      fields: ['transaction_id'],
      where: {
        transaction_id: { [require('sequelize').Op.ne]: null }
      }
    }
  ],
  hooks: {
    beforeCreate: (payment) => {
      // Calcular valor da parcela
      if (payment.installments > 1 && !payment.installment_value) {
        const totalAfterDiscount = parseFloat(payment.amount) - parseFloat(payment.discount);
        payment.installment_value = (totalAfterDiscount / payment.installments).toFixed(2);
      }
    }
  }
});

/**
 * Métodos de instância
 */

/**
 * Calcula saldo devedor
 * @returns {number}
 */
Payment.prototype.getRemainingBalance = function() {
  const total = parseFloat(this.amount) - parseFloat(this.discount);
  const paid = parseFloat(this.amount_paid);
  return Math.max(0, total - paid);
};

/**
 * Verifica se está pago
 * @returns {boolean}
 */
Payment.prototype.isPaid = function() {
  return this.payment_status === 'paid' || this.getRemainingBalance() === 0;
};

/**
 * Verifica se está vencido
 * @returns {boolean}
 */
Payment.prototype.isOverdue = function() {
  if (!this.due_date || this.isPaid()) return false;
  
  const today = new Date();
  const dueDate = new Date(this.due_date);
  return dueDate < today;
};

/**
 * Calcula dias até vencimento
 * @returns {number}
 */
Payment.prototype.daysUntilDue = function() {
  if (!this.due_date) return null;
  
  const today = new Date();
  const dueDate = new Date(this.due_date);
  const diffTime = dueDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Processa pagamento
 * @param {number} amount - Valor a pagar
 * @param {string} userId - ID do usuário processando
 * @returns {Promise<void>}
 */
Payment.prototype.processPayment = async function(amount, userId) {
  const amountFloat = parseFloat(amount);
  this.amount_paid = parseFloat(this.amount_paid) + amountFloat;
  
  const remaining = this.getRemainingBalance();
  
  if (remaining === 0) {
    this.payment_status = 'paid';
    this.payment_date = new Date();
  } else if (this.amount_paid > 0) {
    this.payment_status = 'partially_paid';
  }
  
  this.processed_by = userId;
  await this.save();
};

/**
 * Cancela pagamento
 * @param {string} reason - Motivo do cancelamento
 * @param {string} userId - ID do usuário
 * @returns {Promise<void>}
 */
Payment.prototype.cancel = async function(reason, userId) {
  this.payment_status = 'cancelled';
  this.cancellation_reason = reason;
  this.cancelled_by = userId;
  this.cancelled_at = new Date();
  await this.save();
};

/**
 * Processa reembolso
 * @param {number} amount - Valor a reembolsar
 * @param {string} reason - Motivo do reembolso
 * @returns {Promise<void>}
 */
Payment.prototype.refund = async function(amount, reason) {
  this.refund_amount = amount;
  this.refund_date = new Date();
  this.refund_reason = reason;
  this.payment_status = 'refunded';
  await this.save();
};

/**
 * Gera número de recibo
 * @returns {string}
 */
Payment.prototype.generateReceiptNumber = function() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `REC-${year}${month}-${random}`;
};

/**
 * Retorna resumo do pagamento
 * @returns {object}
 */
Payment.prototype.getSummary = function() {
  return {
    id: this.id,
    amount: this.amount,
    amount_paid: this.amount_paid,
    remaining_balance: this.getRemainingBalance(),
    payment_method: this.payment_method,
    payment_status: this.payment_status,
    due_date: this.due_date,
    is_paid: this.isPaid(),
    is_overdue: this.isOverdue()
  };
};

/**
 * Métodos estáticos
 */

/**
 * Busca pagamentos por status
 * @param {string} status - Status do pagamento
 * @returns {Promise<Array>}
 */
Payment.findByStatus = async function(status) {
  return await this.findAll({
    where: { payment_status: status },
    order: [['due_date', 'ASC']],
    include: [
      {
        model: require('./Patient'),
        as: 'patient',
        attributes: ['id', 'name', 'cpf']
      }
    ]
  });
};

/**
 * Busca pagamentos vencidos
 * @returns {Promise<Array>}
 */
Payment.findOverdue = async function() {
  const today = new Date().toISOString().split('T')[0];
  
  return await this.findAll({
    where: {
      due_date: {
        [require('sequelize').Op.lt]: today
      },
      payment_status: {
        [require('sequelize').Op.notIn]: ['paid', 'cancelled', 'refunded']
      }
    },
    order: [['due_date', 'ASC']]
  });
};

/**
 * Calcula receita total por período
 * @param {Date} dateFrom - Data inicial
 * @param {Date} dateTo - Data final
 * @returns {Promise<number>}
 */
Payment.getTotalRevenue = async function(dateFrom, dateTo) {
  const result = await this.sum('amount_paid', {
    where: {
      payment_date: {
        [require('sequelize').Op.between]: [dateFrom, dateTo]
      },
      payment_status: {
        [require('sequelize').Op.in]: ['paid', 'partially_paid']
      }
    }
  });
  
  return result || 0;
};

/**
 * Estatísticas de pagamentos
 * @param {object} filters - Filtros opcionais
 * @returns {Promise<object>}
 */
Payment.getStatistics = async function(filters = {}) {
  const where = {};
  
  if (filters.date_from && filters.date_to) {
    where.payment_date = {
      [require('sequelize').Op.between]: [filters.date_from, filters.date_to]
    };
  }
  
  const total = await this.sum('amount_paid', { where });
  
  const byMethod = await this.findAll({
    where,
    attributes: [
      'payment_method',
      [require('sequelize').fn('COUNT', 'id'), 'count'],
      [require('sequelize').fn('SUM', require('sequelize').col('amount_paid')), 'total']
    ],
    group: ['payment_method'],
    raw: true
  });
  
  const byStatus = await this.findAll({
    attributes: [
      'payment_status',
      [require('sequelize').fn('COUNT', 'id'), 'count']
    ],
    group: ['payment_status'],
    raw: true
  });
  
  return {
    total_revenue: total || 0,
    by_method: byMethod,
    by_status: byStatus
  };
};

/**
 * Customiza JSON de saída
 */
Payment.prototype.toJSON = function() {
  const values = { ...this.get() };
  
  // Adiciona informações calculadas
  values.remaining_balance = this.getRemainingBalance();
  values.is_paid = this.isPaid();
  values.is_overdue = this.isOverdue();
  values.days_until_due = this.daysUntilDue();
  
  // Formata valores monetários
  values.amount_formatted = `R$ ${parseFloat(this.amount).toFixed(2)}`;
  values.amount_paid_formatted = `R$ ${parseFloat(this.amount_paid).toFixed(2)}`;
  
  return values;
};

module.exports = Payment;