const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Modelo de Agendamento
 * Gerencia consultas agendadas
 */
const Appointment = sequelize.define('appointments', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: 'ID único do agendamento'
  },
  patient_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'patients',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'ID do paciente'
  },
  doctor_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'doctors',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'ID do médico'
  },
  appointment_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Data da consulta'
  },
  appointment_time: {
    type: DataTypes.TIME,
    allowNull: false,
    comment: 'Horário da consulta'
  },
  duration: {
    type: DataTypes.INTEGER,
    defaultValue: 30,
    comment: 'Duração em minutos'
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'),
    defaultValue: 'scheduled',
    comment: 'Status do agendamento'
  },
  appointment_type: {
    type: DataTypes.ENUM('first_visit', 'return', 'follow_up', 'emergency'),
    defaultValue: 'first_visit',
    comment: 'Tipo de consulta'
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Motivo da consulta'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Observações adicionais'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Valor da consulta'
  },
  payment_status: {
    type: DataTypes.ENUM('pending', 'paid', 'partially_paid', 'refunded'),
    defaultValue: 'pending',
    comment: 'Status do pagamento'
  },
  payment_method: {
    type: DataTypes.ENUM('cash', 'credit_card', 'debit_card', 'pix', 'health_insurance'),
    allowNull: true,
    comment: 'Método de pagamento'
  },
  health_insurance_authorization: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Número de autorização do convênio'
  },
  cancellation_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Motivo do cancelamento'
  },
  cancelled_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data/hora do cancelamento'
  },
  cancelled_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuário que cancelou'
  },
  confirmed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data/hora da confirmação'
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data/hora da conclusão'
  },
  reminder_sent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Lembrete enviado'
  },
  reminder_sent_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data/hora do envio do lembrete'
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuário que criou o agendamento'
  }
}, {
  tableName: 'appointments',
  timestamps: true,
  indexes: [
    {
      fields: ['patient_id']
    },
    {
      fields: ['doctor_id']
    },
    {
      fields: ['appointment_date', 'appointment_time']
    },
    {
      fields: ['status']
    },
    {
      unique: true,
      fields: ['doctor_id', 'appointment_date', 'appointment_time'],
      name: 'unique_doctor_datetime'
    }
  ]
});

/**
 * Método para verificar se o agendamento pode ser cancelado
 */
Appointment.prototype.canBeCancelled = function() {
  const cancellableStatuses = ['scheduled', 'confirmed'];
  return cancellableStatuses.includes(this.status);
};

/**
 * Método para verificar se o agendamento está no passado
 */
Appointment.prototype.isPast = function() {
  const appointmentDateTime = new Date(`${this.appointment_date}T${this.appointment_time}`);
  return appointmentDateTime < new Date();
};

/**
 * Método para obter data/hora completa
 */
Appointment.prototype.getFullDateTime = function() {
  return new Date(`${this.appointment_date}T${this.appointment_time}`);
};

module.exports = Appointment;