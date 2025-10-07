const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Modelo de Prontuário Médico Eletrônico
 * Gerencia registros de consultas, diagnósticos e prescrições
 */
const MedicalRecord = sequelize.define('medical_records', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: 'ID único do prontuário'
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
    unique: {
      msg: 'Já existe um prontuário para este agendamento'
    },
    comment: 'Referência ao agendamento'
  },
  patient_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'patients',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    comment: 'Referência ao paciente'
  },
  doctor_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'doctors',
      key: 'id'
    },
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    comment: 'Referência ao médico responsável'
  },
  consultation_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Data da consulta'
  },
  consultation_time: {
    type: DataTypes.TIME,
    allowNull: true,
    comment: 'Horário da consulta'
  },
  // Anamnese (História do paciente)
  chief_complaint: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Queixa principal (motivo da consulta)'
  },
  history_present_illness: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'História da doença atual (HDA)'
  },
  past_medical_history: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Histórico médico pregresso'
  },
  family_history: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Histórico familiar'
  },
  social_history: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'História social (hábitos, ocupação, etc)'
  },
  allergies: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Alergias conhecidas'
  },
  current_medications: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Medicações em uso'
  },
  // Exame Físico
  vital_signs: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null,
    validate: {
      isValidVitalSigns(value) {
        if (value && typeof value !== 'object') {
          throw new Error('Sinais vitais devem ser um objeto JSON');
        }
      }
    },
    comment: 'Sinais vitais: PA, FC, FR, Temp, SpO2, Peso, Altura, IMC'
  },
  physical_examination: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Exame físico detalhado'
  },
  // Avaliação e Conduta
  clinical_assessment: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Avaliação clínica e impressão diagnóstica'
  },
  diagnosis_primary: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Diagnóstico principal'
  },
  diagnosis_secondary: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Diagnósticos secundários (lista)'
  },
  icd10_codes: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null,
    comment: 'Códigos CID-10 (array)'
  },
  // Plano terapêutico
  treatment_plan: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Plano de tratamento'
  },
  prescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Prescrição médica'
  },
  medications_prescribed: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null,
    comment: 'Lista de medicamentos prescritos (estruturado)'
  },
  // Solicitações
  lab_tests_requested: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Exames laboratoriais solicitados'
  },
  imaging_requested: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Exames de imagem solicitados'
  },
  referrals: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Encaminhamentos para outros especialistas'
  },
  // Orientações e seguimento
  patient_instructions: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Orientações ao paciente'
  },
  follow_up: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Recomendação de retorno (ex: "Retornar em 30 dias")'
  },
  follow_up_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isAfterToday(value) {
        if (value && new Date(value) < new Date()) {
          throw new Error('Data de retorno não pode ser no passado');
        }
      }
    },
    comment: 'Data sugerida para retorno'
  },
  // Procedimentos realizados
  procedures_performed: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Procedimentos realizados durante a consulta'
  },
  procedure_codes: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null,
    comment: 'Códigos de procedimentos (TUSS, CBHPM, etc)'
  },
  // Informações complementares
  clinical_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas clínicas adicionais'
  },
  private_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas privadas do médico (não visíveis ao paciente)'
  },
  // Anexos e documentos
  attachments: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null,
    comment: 'Lista de arquivos anexados (exames, laudos, etc)'
  },
  // Status e controle
  record_status: {
    type: DataTypes.ENUM('draft', 'completed', 'reviewed', 'amended', 'cancelled'),
    defaultValue: 'draft',
    allowNull: false,
    comment: 'Status do prontuário'
  },
  is_confidential: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'Prontuário confidencial (acesso restrito)'
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data/hora de conclusão do prontuário'
  },
  reviewed_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuário que revisou o prontuário'
  },
  reviewed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data/hora da revisão'
  },
  // Assinatura digital
  digital_signature: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Assinatura digital do médico'
  },
  signature_timestamp: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Timestamp da assinatura'
  },
  // Campos de auditoria
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Usuário que criou o prontuário'
  },
  updated_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Último usuário que atualizou'
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
  tableName: 'medical_records',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['appointment_id']
    },
    {
      fields: ['patient_id']
    },
    {
      fields: ['doctor_id']
    },
    {
      fields: ['consultation_date']
    },
    {
      fields: ['record_status']
    },
    {
      fields: ['diagnosis_primary']
    },
    {
      fields: ['is_confidential']
    },
    {
      fields: ['created_at']
    }
  ],
  hooks: {
    beforeValidate: (record) => {
      // Definir data da consulta se não fornecida
      if (!record.consultation_date) {
        record.consultation_date = new Date();
      }
    },
    
    beforeUpdate: (record) => {
      // Atualizar timestamp de conclusão quando status mudar para completed
      if (record.changed('record_status') && record.record_status === 'completed' && !record.completed_at) {
        record.completed_at = new Date();
      }
    }
  }
});

/**
 * Métodos de instância
 */

/**
 * Marca o prontuário como concluído
 * @returns {Promise<void>}
 */
MedicalRecord.prototype.complete = async function() {
  this.record_status = 'completed';
  this.completed_at = new Date();
  await this.save();
};

/**
 * Adiciona assinatura digital
 * @param {string} signature - Assinatura digital
 * @returns {Promise<void>}
 */
MedicalRecord.prototype.sign = async function(signature) {
  this.digital_signature = signature;
  this.signature_timestamp = new Date();
  await this.save();
};

/**
 * Verifica se o prontuário está completo
 * @returns {boolean}
 */
MedicalRecord.prototype.isComplete = function() {
  return this.record_status === 'completed' || this.record_status === 'reviewed';
};

/**
 * Verifica se pode ser editado
 * @returns {boolean}
 */
MedicalRecord.prototype.canBeEdited = function() {
  return ['draft', 'amended'].includes(this.record_status);
};

/**
 * Calcula IMC se tiver peso e altura
 * @returns {number|null}
 */
MedicalRecord.prototype.calculateBMI = function() {
  if (!this.vital_signs || !this.vital_signs.weight || !this.vital_signs.height) {
    return null;
  }
  
  const weight = parseFloat(this.vital_signs.weight);
  const height = parseFloat(this.vital_signs.height) / 100; // converter cm para m
  
  if (height === 0) return null;
  
  const bmi = weight / (height * height);
  return Math.round(bmi * 10) / 10;
};

/**
 * Adiciona anexo ao prontuário
 * @param {object} attachment - {filename, url, type, size}
 * @returns {Promise<void>}
 */
MedicalRecord.prototype.addAttachment = async function(attachment) {
  if (!this.attachments) {
    this.attachments = [];
  }
  
  this.attachments.push({
    ...attachment,
    uploaded_at: new Date()
  });
  
  await this.save();
};

/**
 * Remove anexo do prontuário
 * @param {string} filename - Nome do arquivo
 * @returns {Promise<void>}
 */
MedicalRecord.prototype.removeAttachment = async function(filename) {
  if (!this.attachments) return;
  
  this.attachments = this.attachments.filter(att => att.filename !== filename);
  await this.save();
};

/**
 * Retorna resumo do prontuário
 * @returns {object}
 */
MedicalRecord.prototype.getSummary = function() {
  return {
    id: this.id,
    consultation_date: this.consultation_date,
    chief_complaint: this.chief_complaint,
    diagnosis_primary: this.diagnosis_primary,
    record_status: this.record_status,
    is_complete: this.isComplete()
  };
};

/**
 * Verifica se tem prescrição
 * @returns {boolean}
 */
MedicalRecord.prototype.hasPrescription = function() {
  return !!(this.prescription || (this.medications_prescribed && this.medications_prescribed.length > 0));
};

/**
 * Verifica se tem exames solicitados
 * @returns {boolean}
 */
MedicalRecord.prototype.hasTestsRequested = function() {
  return !!(this.lab_tests_requested || this.imaging_requested);
};

/**
 * Obtém tempo decorrido desde a consulta
 * @returns {number} - Dias desde a consulta
 */
MedicalRecord.prototype.daysSinceConsultation = function() {
  const today = new Date();
  const consultDate = new Date(this.consultation_date);
  const diffTime = Math.abs(today - consultDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Métodos estáticos
 */

/**
 * Busca prontuários de um paciente
 * @param {string} patientId - ID do paciente
 * @param {object} options - Opções de busca
 * @returns {Promise<Array>}
 */
MedicalRecord.findByPatient = async function(patientId, options = {}) {
  const { limit = 20, offset = 0, status } = options;
  
  const where = { patient_id: patientId };
  if (status) where.record_status = status;
  
  return await this.findAll({
    where,
    limit,
    offset,
    order: [['consultation_date', 'DESC']],
    include: [
      {
        model: require('./Doctor'),
        as: 'doctor',
        attributes: ['id', 'name', 'crm', 'specialty']
      }
    ]
  });
};

/**
 * Busca prontuários de um médico
 * @param {string} doctorId - ID do médico
 * @param {object} options - Opções de busca
 * @returns {Promise<Array>}
 */
MedicalRecord.findByDoctor = async function(doctorId, options = {}) {
  const { limit = 20, offset = 0, status } = options;
  
  const where = { doctor_id: doctorId };
  if (status) where.record_status = status;
  
  return await this.findAll({
    where,
    limit,
    offset,
    order: [['consultation_date', 'DESC']],
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
 * Busca prontuário por agendamento
 * @param {string} appointmentId - ID do agendamento
 * @returns {Promise<MedicalRecord|null>}
 */
MedicalRecord.findByAppointment = async function(appointmentId) {
  return await this.findOne({
    where: { appointment_id: appointmentId }
  });
};

/**
 * Busca prontuários por diagnóstico
 * @param {string} diagnosis - Termo de busca no diagnóstico
 * @returns {Promise<Array>}
 */
MedicalRecord.findByDiagnosis = async function(diagnosis) {
  return await this.findAll({
    where: {
      diagnosis_primary: {
        [require('sequelize').Op.like]: `%${diagnosis}%`
      }
    },
    order: [['consultation_date', 'DESC']]
  });
};

/**
 * Estatísticas de prontuários
 * @param {object} filters - Filtros (doctor_id, date_from, date_to)
 * @returns {Promise<object>}
 */
MedicalRecord.getStatistics = async function(filters = {}) {
  const where = {};
  
  if (filters.doctor_id) where.doctor_id = filters.doctor_id;
  if (filters.date_from && filters.date_to) {
    where.consultation_date = {
      [require('sequelize').Op.between]: [filters.date_from, filters.date_to]
    };
  }
  
  const total = await this.count({ where });
  
  const byStatus = await this.findAll({
    where,
    attributes: [
      'record_status',
      [require('sequelize').fn('COUNT', 'id'), 'count']
    ],
    group: ['record_status'],
    raw: true
  });
  
  return { total, by_status: byStatus };
};

/**
 * Customiza JSON de saída
 */
MedicalRecord.prototype.toJSON = function() {
  const values = { ...this.get() };
  
  // Adiciona informações calculadas
  values.is_complete = this.isComplete();
  values.can_be_edited = this.canBeEdited();
  values.has_prescription = this.hasPrescription();
  values.has_tests_requested = this.hasTestsRequested();
  values.days_since_consultation = this.daysSinceConsultation();
  
  // Calcula IMC se possível
  const bmi = this.calculateBMI();
  if (bmi) {
    values.bmi = bmi;
  }
  
  // Remove notas privadas se não for médico (implementar lógica de contexto)
  // values.private_notes = undefined;
  
  return values;
};

module.exports = MedicalRecord;