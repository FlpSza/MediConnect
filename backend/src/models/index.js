const User = require('./User');
const Patient = require('./Patient');
const Doctor = require('./Doctor');
const Appointment = require('./Appointment');
const MedicalRecord = require('./MedicalRecord');
const HealthInsurance = require('./HealthInsurance');
const Payment = require('./Payment');

/**
 * Definir todas as associações entre modelos
 * Executado uma única vez quando o módulo é carregado
 */

// ========================================
// USER ASSOCIATIONS
// ========================================

// User -> Doctor (um usuário pode ter um perfil de médico)
User.hasOne(Doctor, {
  foreignKey: 'user_id',
  as: 'doctorProfile',
  onDelete: 'SET NULL'
});

Doctor.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// User -> Appointments (criado por)
User.hasMany(Appointment, {
  foreignKey: 'created_by',
  as: 'createdAppointments'
});

Appointment.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator'
});

// User -> Appointments (cancelado por)
User.hasMany(Appointment, {
  foreignKey: 'cancelled_by',
  as: 'cancelledAppointments'
});

Appointment.belongsTo(User, {
  foreignKey: 'cancelled_by',
  as: 'canceller'
});

// User -> MedicalRecords (criado por)
User.hasMany(MedicalRecord, {
  foreignKey: 'created_by',
  as: 'createdMedicalRecords'
});

MedicalRecord.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator'
});

// User -> MedicalRecords (revisado por)
User.hasMany(MedicalRecord, {
  foreignKey: 'reviewed_by',
  as: 'reviewedMedicalRecords'
});

MedicalRecord.belongsTo(User, {
  foreignKey: 'reviewed_by',
  as: 'reviewer'
});

// User -> Payments (processado por)
User.hasMany(Payment, {
  foreignKey: 'processed_by',
  as: 'processedPayments'
});

Payment.belongsTo(User, {
  foreignKey: 'processed_by',
  as: 'processor'
});

// User -> Payments (cancelado por)
User.hasMany(Payment, {
  foreignKey: 'cancelled_by',
  as: 'cancelledPayments'
});

Payment.belongsTo(User, {
  foreignKey: 'cancelled_by',
  as: 'canceller'
});

// ========================================
// PATIENT ASSOCIATIONS
// ========================================

// Patient -> Appointments
Patient.hasMany(Appointment, {
  foreignKey: 'patient_id',
  as: 'appointments',
  onDelete: 'CASCADE'
});

Appointment.belongsTo(Patient, {
  foreignKey: 'patient_id',
  as: 'patient'
});

// Patient -> MedicalRecords
Patient.hasMany(MedicalRecord, {
  foreignKey: 'patient_id',
  as: 'medicalRecords',
  onDelete: 'CASCADE'
});

MedicalRecord.belongsTo(Patient, {
  foreignKey: 'patient_id',
  as: 'patient'
});

// Patient -> Payments
Patient.hasMany(Payment, {
  foreignKey: 'patient_id',
  as: 'payments',
  onDelete: 'RESTRICT'
});

Payment.belongsTo(Patient, {
  foreignKey: 'patient_id',
  as: 'patient'
});

// ========================================
// DOCTOR ASSOCIATIONS
// ========================================

// Doctor -> Appointments
Doctor.hasMany(Appointment, {
  foreignKey: 'doctor_id',
  as: 'appointments',
  onDelete: 'CASCADE'
});

Appointment.belongsTo(Doctor, {
  foreignKey: 'doctor_id',
  as: 'doctor'
});

// Doctor -> MedicalRecords
Doctor.hasMany(MedicalRecord, {
  foreignKey: 'doctor_id',
  as: 'medicalRecords',
  onDelete: 'RESTRICT'
});

MedicalRecord.belongsTo(Doctor, {
  foreignKey: 'doctor_id',
  as: 'doctor'
});

// ========================================
// APPOINTMENT ASSOCIATIONS
// ========================================

// Appointment -> MedicalRecord (1:1)
Appointment.hasOne(MedicalRecord, {
  foreignKey: 'appointment_id',
  as: 'medicalRecord',
  onDelete: 'CASCADE'
});

MedicalRecord.belongsTo(Appointment, {
  foreignKey: 'appointment_id',
  as: 'appointment'
});

// Appointment -> Payment (1:1 ou 1:N se permitir múltiplos pagamentos)
Appointment.hasMany(Payment, {
  foreignKey: 'appointment_id',
  as: 'payments',
  onDelete: 'CASCADE'
});

Payment.belongsTo(Appointment, {
  foreignKey: 'appointment_id',
  as: 'appointment'
});

// ========================================
// HEALTH INSURANCE ASSOCIATIONS
// ========================================

// HealthInsurance -> Payments
HealthInsurance.hasMany(Payment, {
  foreignKey: 'health_insurance_id',
  as: 'payments',
  onDelete: 'SET NULL'
});

Payment.belongsTo(HealthInsurance, {
  foreignKey: 'health_insurance_id',
  as: 'healthInsurance'
});

/**
 * Função para sincronizar todos os modelos com o banco
 * @param {object} options - Opções de sincronização
 * @returns {Promise<void>}
 */
const syncModels = async (options = {}) => {
  const { sequelize } = require('../config/database');
  
  try {
    await sequelize.sync(options);
    console.log('✓ Todos os modelos foram sincronizados com sucesso');
  } catch (error) {
    console.error('✗ Erro ao sincronizar modelos:', error);
    throw error;
  }
};

/**
 * Função para verificar associações
 * @returns {object} Informações sobre as associações
 */
const getAssociations = () => {
  return {
    User: Object.keys(User.associations),
    Patient: Object.keys(Patient.associations),
    Doctor: Object.keys(Doctor.associations),
    Appointment: Object.keys(Appointment.associations),
    MedicalRecord: Object.keys(MedicalRecord.associations),
    HealthInsurance: Object.keys(HealthInsurance.associations),
    Payment: Object.keys(Payment.associations)
  };
};

/**
 * Exportar todos os modelos e funções utilitárias
 */
module.exports = {
  // Modelos
  User,
  Patient,
  Doctor,
  Appointment,
  MedicalRecord,
  HealthInsurance,
  Payment,
  
  // Funções utilitárias
  syncModels,
  getAssociations
};

/**
 * RESUMO DAS ASSOCIAÇÕES:
 * 
 * User (1) ---< Doctor (N) - hasOne/belongsTo
 * User (1) ---< Appointment (N) - created_by
 * User (1) ---< Appointment (N) - cancelled_by
 * User (1) ---< MedicalRecord (N) - created_by, reviewed_by
 * User (1) ---< Payment (N) - processed_by, cancelled_by
 * 
 * Patient (1) ---< Appointment (N)
 * Patient (1) ---< MedicalRecord (N)
 * Patient (1) ---< Payment (N)
 * 
 * Doctor (1) ---< Appointment (N)
 * Doctor (1) ---< MedicalRecord (N)
 * 
 * Appointment (1) --- MedicalRecord (1) - One to One
 * Appointment (1) ---< Payment (N)
 * 
 * HealthInsurance (1) ---< Payment (N)
 */