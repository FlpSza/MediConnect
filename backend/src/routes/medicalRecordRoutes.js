const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { validate, uuidSchema } = require('../middlewares/validation');
const Joi = require('joi');
const { MedicalRecord, Patient, Doctor, Appointment, User } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * Todas as rotas requerem autenticação
 * Prontuários são restritos a médicos e admin
 */
router.use(authenticate);

/**
 * Schema de validação para criar prontuário
 */
const createMedicalRecordSchema = Joi.object({
  appointment_id: Joi.string().uuid().required(),
  patient_id: Joi.string().uuid().required(),
  doctor_id: Joi.string().uuid().required(),
  consultation_date: Joi.date().iso().max('now').required(),
  consultation_time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).allow(null, ''),
  chief_complaint: Joi.string().allow(null, ''),
  history_present_illness: Joi.string().allow(null, ''),
  past_medical_history: Joi.string().allow(null, ''),
  family_history: Joi.string().allow(null, ''),
  social_history: Joi.string().allow(null, ''),
  allergies: Joi.string().allow(null, ''),
  current_medications: Joi.string().allow(null, ''),
  vital_signs: Joi.object().allow(null),
  physical_examination: Joi.string().allow(null, ''),
  clinical_assessment: Joi.string().allow(null, ''),
  diagnosis_primary: Joi.string().allow(null, ''),
  diagnosis_secondary: Joi.string().allow(null, ''),
  icd10_codes: Joi.array().items(Joi.string()).allow(null),
  treatment_plan: Joi.string().allow(null, ''),
  prescription: Joi.string().allow(null, ''),
  medications_prescribed: Joi.array().allow(null),
  lab_tests_requested: Joi.string().allow(null, ''),
  imaging_requested: Joi.string().allow(null, ''),
  referrals: Joi.string().allow(null, ''),
  patient_instructions: Joi.string().allow(null, ''),
  follow_up: Joi.string().allow(null, ''),
  follow_up_date: Joi.date().iso().min('now').allow(null),
  procedures_performed: Joi.string().allow(null, ''),
  procedure_codes: Joi.array().allow(null),
  clinical_notes: Joi.string().allow(null, ''),
  private_notes: Joi.string().allow(null, ''),
  is_confidential: Joi.boolean().default(false)
});

/**
 * Schema para atualizar prontuário
 */
const updateMedicalRecordSchema = createMedicalRecordSchema.fork(
  ['appointment_id', 'patient_id', 'doctor_id', 'consultation_date'],
  (schema) => schema.optional()
);

/**
 * Middleware para verificar se usuário pode acessar prontuário
 */
const canAccessMedicalRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Admin pode acessar tudo
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Médico só pode acessar prontuários que ele criou
    if (req.user.role === 'doctor') {
      const record = await MedicalRecord.findByPk(id);
      
      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Prontuário não encontrado'
        });
      }
      
      const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
      
      if (!doctor || record.doctor_id !== doctor.id) {
        return res.status(403).json({
          success: false,
          message: 'Você só pode acessar prontuários criados por você'
        });
      }
      
      return next();
    }
    
    // Outros roles não têm acesso
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas médicos e administradores podem acessar prontuários.'
    });
  } catch (error) {
    logger.error('Erro ao verificar acesso ao prontuário:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao verificar permissões'
    });
  }
};

/**
 * @route   GET /api/medical-records
 * @desc    Listar prontuários com filtros
 * @access  Private (admin, doctor)
 */
router.get(
  '/',
  authorize('admin', 'doctor'),
  async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 20,
        patient_id,
        doctor_id,
        status,
        date_from,
        date_to,
        diagnosis
      } = req.query;

      const offset = (page - 1) * limit;
      const where = {};

      // Filtros
      if (patient_id) where.patient_id = patient_id;
      
      // Médico só vê seus próprios prontuários
      if (req.user.role === 'doctor') {
        const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
        if (doctor) {
          where.doctor_id = doctor.id;
        }
      } else if (doctor_id) {
        where.doctor_id = doctor_id;
      }
      
      if (status) where.record_status = status;
      if (diagnosis) {
        where.diagnosis_primary = { [Op.like]: `%${diagnosis}%` };
      }
      if (date_from && date_to) {
        where.consultation_date = { [Op.between]: [date_from, date_to] };
      }

      const { count, rows: records } = await MedicalRecord.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [
          {
            model: Patient,
            as: 'patient',
            attributes: ['id', 'name', 'cpf', 'birth_date']
          },
          {
            model: Doctor,
            as: 'doctor',
            attributes: ['id', 'name', 'crm', 'specialty']
          }
        ],
        order: [['consultation_date', 'DESC']]
      });

      res.status(200).json({
        success: true,
        data: records,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      logger.error('Erro ao listar prontuários:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao listar prontuários'
      });
    }
  }
);

/**
 * @route   GET /api/medical-records/patient/:patient_id
 * @desc    Listar prontuários de um paciente específico
 * @access  Private (admin, doctor)
 */
router.get(
  '/patient/:patient_id',
  authorize('admin', 'doctor'),
  validate(Joi.object({ patient_id: Joi.string().uuid().required() }), 'params'),
  async (req, res) => {
    try {
      const { patient_id } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const where = { patient_id };
      
      // Médico só vê seus próprios prontuários
      if (req.user.role === 'doctor') {
        const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
        if (doctor) {
          where.doctor_id = doctor.id;
        }
      }

      const { count, rows: records } = await MedicalRecord.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [
          {
            model: Doctor,
            as: 'doctor',
            attributes: ['id', 'name', 'crm', 'specialty']
          }
        ],
        order: [['consultation_date', 'DESC']]
      });

      res.status(200).json({
        success: true,
        data: records,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      logger.error('Erro ao buscar prontuários do paciente:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar prontuários'
      });
    }
  }
);

/**
 * @route   GET /api/medical-records/appointment/:appointment_id
 * @desc    Obter prontuário de um agendamento específico
 * @access  Private (admin, doctor)
 */
router.get(
  '/appointment/:appointment_id',
  authorize('admin', 'doctor'),
  validate(Joi.object({ appointment_id: Joi.string().uuid().required() }), 'params'),
  async (req, res) => {
    try {
      const { appointment_id } = req.params;

      const record = await MedicalRecord.findOne({
        where: { appointment_id },
        include: [
          {
            model: Patient,
            as: 'patient'
          },
          {
            model: Doctor,
            as: 'doctor'
          },
          {
            model: Appointment,
            as: 'appointment'
          }
        ]
      });

      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Prontuário não encontrado para este agendamento'
        });
      }

      // Verificar permissão para médico
      if (req.user.role === 'doctor') {
        const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
        if (!doctor || record.doctor_id !== doctor.id) {
          return res.status(403).json({
            success: false,
            message: 'Acesso negado'
          });
        }
      }

      res.status(200).json({
        success: true,
        data: record
      });
    } catch (error) {
      logger.error('Erro ao buscar prontuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar prontuário'
      });
    }
  }
);

/**
 * @route   GET /api/medical-records/:id
 * @desc    Obter prontuário por ID
 * @access  Private (admin, doctor - próprio)
 */
router.get(
  '/:id',
  authorize('admin', 'doctor'),
  validate(uuidSchema, 'params'),
  canAccessMedicalRecord,
  async (req, res) => {
    try {
      const { id } = req.params;

      const record = await MedicalRecord.findByPk(id, {
        include: [
          {
            model: Patient,
            as: 'patient'
          },
          {
            model: Doctor,
            as: 'doctor'
          },
          {
            model: Appointment,
            as: 'appointment'
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name', 'email']
          },
          {
            model: User,
            as: 'reviewer',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Prontuário não encontrado'
        });
      }

      res.status(200).json({
        success: true,
        data: record
      });
    } catch (error) {
      logger.error('Erro ao buscar prontuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar prontuário'
      });
    }
  }
);

/**
 * @route   POST /api/medical-records
 * @desc    Criar novo prontuário
 * @access  Private (admin, doctor)
 */
router.post(
  '/',
  authorize('admin', 'doctor'),
  validate(createMedicalRecordSchema),
  async (req, res) => {
    try {
      const recordData = req.body;

      // Verificar se já existe prontuário para este agendamento
      const existing = await MedicalRecord.findOne({
        where: { appointment_id: recordData.appointment_id }
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Já existe um prontuário para este agendamento'
        });
      }

      // Verificar se médico está criando seu próprio prontuário
      if (req.user.role === 'doctor') {
        const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
        if (!doctor || recordData.doctor_id !== doctor.id) {
          return res.status(403).json({
            success: false,
            message: 'Você só pode criar prontuários para suas próprias consultas'
          });
        }
      }

      // Criar prontuário
      const record = await MedicalRecord.create({
        ...recordData,
        created_by: req.user.id,
        record_status: 'draft'
      });

      // Buscar com relacionamentos
      const fullRecord = await MedicalRecord.findByPk(record.id, {
        include: [
          { model: Patient, as: 'patient' },
          { model: Doctor, as: 'doctor' }
        ]
      });

      logger.info(`Prontuário criado por ${req.user.email} - Paciente: ${fullRecord.patient.name}`);

      res.status(201).json({
        success: true,
        message: 'Prontuário criado com sucesso',
        data: fullRecord
      });
    } catch (error) {
      logger.error('Erro ao criar prontuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao criar prontuário'
      });
    }
  }
);

/**
 * @route   PUT /api/medical-records/:id
 * @desc    Atualizar prontuário
 * @access  Private (admin, doctor - próprio)
 */
router.put(
  '/:id',
  authorize('admin', 'doctor'),
  validate(uuidSchema, 'params'),
  validate(updateMedicalRecordSchema),
  canAccessMedicalRecord,
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const record = await MedicalRecord.findByPk(id);

      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Prontuário não encontrado'
        });
      }

      // Verificar se pode ser editado
      if (!record.canBeEdited()) {
        return res.status(400).json({
          success: false,
          message: 'Prontuário não pode ser editado neste status'
        });
      }

      await record.update({
        ...updateData,
        updated_by: req.user.id
      });

      logger.info(`Prontuário ${id} atualizado por ${req.user.email}`);

      res.status(200).json({
        success: true,
        message: 'Prontuário atualizado com sucesso',
        data: record
      });
    } catch (error) {
      logger.error('Erro ao atualizar prontuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar prontuário'
      });
    }
  }
);

/**
 * @route   PATCH /api/medical-records/:id/complete
 * @desc    Marcar prontuário como concluído
 * @access  Private (admin, doctor - próprio)
 */
router.patch(
  '/:id/complete',
  authorize('admin', 'doctor'),
  validate(uuidSchema, 'params'),
  canAccessMedicalRecord,
  async (req, res) => {
    try {
      const { id } = req.params;

      const record = await MedicalRecord.findByPk(id);

      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Prontuário não encontrado'
        });
      }

      await record.complete();

      logger.info(`Prontuário ${id} concluído por ${req.user.email}`);

      res.status(200).json({
        success: true,
        message: 'Prontuário concluído com sucesso',
        data: record
      });
    } catch (error) {
      logger.error('Erro ao concluir prontuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao concluir prontuário'
      });
    }
  }
);

/**
 * @route   PATCH /api/medical-records/:id/sign
 * @desc    Assinar prontuário digitalmente
 * @access  Private (doctor - próprio)
 */
router.patch(
  '/:id/sign',
  authorize('doctor'),
  validate(uuidSchema, 'params'),
  validate(Joi.object({
    signature: Joi.string().required()
  })),
  canAccessMedicalRecord,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { signature } = req.body;

      const record = await MedicalRecord.findByPk(id);

      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Prontuário não encontrado'
        });
      }

      if (!record.isComplete()) {
        return res.status(400).json({
          success: false,
          message: 'Prontuário deve estar concluído antes de assinar'
        });
      }

      await record.sign(signature);

      logger.info(`Prontuário ${id} assinado por ${req.user.email}`);

      res.status(200).json({
        success: true,
        message: 'Prontuário assinado com sucesso',
        data: record
      });
    } catch (error) {
      logger.error('Erro ao assinar prontuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao assinar prontuário'
      });
    }
  }
);

/**
 * @route   POST /api/medical-records/:id/attachments
 * @desc    Adicionar anexo ao prontuário
 * @access  Private (admin, doctor - próprio)
 */
router.post(
  '/:id/attachments',
  authorize('admin', 'doctor'),
  validate(uuidSchema, 'params'),
  validate(Joi.object({
    filename: Joi.string().required(),
    url: Joi.string().uri().required(),
    type: Joi.string().required(),
    size: Joi.number().required()
  })),
  canAccessMedicalRecord,
  async (req, res) => {
    try {
      const { id } = req.params;
      const attachment = req.body;

      const record = await MedicalRecord.findByPk(id);

      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Prontuário não encontrado'
        });
      }

      await record.addAttachment(attachment);

      logger.info(`Anexo adicionado ao prontuário ${id} por ${req.user.email}`);

      res.status(200).json({
        success: true,
        message: 'Anexo adicionado com sucesso',
        data: record
      });
    } catch (error) {
      logger.error('Erro ao adicionar anexo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao adicionar anexo'
      });
    }
  }
);

/**
 * @route   GET /api/medical-records/statistics
 * @desc    Obter estatísticas de prontuários
 * @access  Private (admin)
 */
router.get(
  '/stats/overview',
  authorize('admin'),
  async (req, res) => {
    try {
      const { date_from, date_to } = req.query;

      const stats = await MedicalRecord.getStatistics({ date_from, date_to });

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar estatísticas'
      });
    }
  }
);

module.exports = router;

/**
 * DOCUMENTAÇÃO DAS ROTAS:
 * 
 * GET    /api/medical-records                          - Lista prontuários
 * GET    /api/medical-records/patient/:id              - Prontuários do paciente
 * GET    /api/medical-records/appointment/:id          - Prontuário do agendamento
 * GET    /api/medical-records/stats/overview           - Estatísticas (admin)
 * GET    /api/medical-records/:id                      - Busca por ID
 * POST   /api/medical-records                          - Criar prontuário
 * PUT    /api/medical-records/:id                      - Atualizar
 * PATCH  /api/medical-records/:id/complete             - Marcar como concluído
 * PATCH  /api/medical-records/:id/sign                 - Assinar digitalmente
 * POST   /api/medical-records/:id/attachments          - Adicionar anexo
 * 
 * ACESSO:
 * - Admin: acesso total
 * - Doctor: apenas prontuários que criou
 * - Outros: sem acesso
 * 
 * STATUS DO PRONTUÁRIO:
 * - draft: rascunho (pode editar)
 * - completed: concluído
 * - reviewed: revisado
 * - amended: emendado
 * - cancelled: cancelado
 */