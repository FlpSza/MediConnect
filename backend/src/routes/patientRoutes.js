const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { validate, createPatientSchema, updatePatientSchema, uuidSchema } = require('../middlewares/validation');
const Joi = require('joi');

/**
 * Todas as rotas requerem autenticação
 */
router.use(authenticate);

/**
 * @route   GET /api/patients
 * @desc    Listar todos os pacientes com filtros
 * @access  Private (admin, doctor, receptionist)
 * @query   page, limit, search, is_active, health_insurance, gender, sort_by, sort_order
 */
router.get(
  '/',
  patientController.getAllPatients
);

/**
 * @route   GET /api/patients/statistics
 * @desc    Obter estatísticas gerais de pacientes
 * @access  Private (admin)
 */
router.get(
  '/statistics',
  authorize('admin'),
  async (req, res) => {
    try {
      const { Patient } = require('../models');
      const stats = await Patient.getStatistics();

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      const logger = require('../utils/logger');
      logger.error('Erro ao buscar estatísticas de pacientes:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar estatísticas'
      });
    }
  }
);

/**
 * @route   GET /api/patients/birthdays
 * @desc    Obter aniversariantes do mês
 * @access  Private (admin, receptionist)
 * @query   month (1-12)
 */
router.get(
  '/birthdays',
  authorize('admin', 'receptionist'),
  async (req, res) => {
    try {
      const { Patient } = require('../models');
      const { month = new Date().getMonth() + 1 } = req.query;
      const logger = require('../utils/logger');

      const birthdays = await Patient.findBirthdaysInMonth(parseInt(month));

      res.status(200).json({
        success: true,
        data: birthdays,
        month: parseInt(month)
      });
    } catch (error) {
      const logger = require('../utils/logger');
      logger.error('Erro ao buscar aniversariantes:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar aniversariantes'
      });
    }
  }
);

/**
 * @route   GET /api/patients/by-insurance/:insurance
 * @desc    Buscar pacientes por convênio
 * @access  Private (admin, receptionist)
 */
router.get(
  '/by-insurance/:insurance',
  authorize('admin', 'receptionist'),
  patientController.getPatientsByInsurance
);

/**
 * @route   GET /api/patients/cpf/:cpf
 * @desc    Buscar paciente por CPF
 * @access  Private
 */
router.get(
  '/cpf/:cpf',
  validate(
    Joi.object({
      cpf: Joi.string()
        .pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
        .required()
        .messages({
          'string.pattern.base': 'CPF deve estar no formato XXX.XXX.XXX-XX'
        })
    }),
    'params'
  ),
  patientController.getPatientByCPF
);

/**
 * @route   GET /api/patients/:id
 * @desc    Obter paciente por ID
 * @access  Private
 */
router.get(
  '/:id',
  validate(uuidSchema, 'params'),
  patientController.getPatientById
);

/**
 * @route   GET /api/patients/:id/appointments
 * @desc    Obter histórico de consultas do paciente
 * @access  Private
 * @query   status, date_from, date_to, page, limit
 */
router.get(
  '/:id/appointments',
  validate(uuidSchema, 'params'),
  patientController.getPatientAppointments
);

/**
 * @route   GET /api/patients/:id/stats
 * @desc    Obter estatísticas do paciente
 * @access  Private
 */
router.get(
  '/:id/stats',
  validate(uuidSchema, 'params'),
  patientController.getPatientStats
);

/**
 * @route   GET /api/patients/:id/medical-records
 * @desc    Obter prontuários médicos do paciente
 * @access  Private (admin, doctor)
 */
router.get(
  '/:id/medical-records',
  authorize('admin', 'doctor'),
  validate(uuidSchema, 'params'),
  async (req, res) => {
    try {
      const { MedicalRecord, Doctor } = require('../models');
      const { id } = req.params;
      const { page = 1, limit = 20, status } = req.query;
      const logger = require('../utils/logger');

      const offset = (page - 1) * limit;
      const where = { patient_id: id };

      // Médico só vê seus próprios prontuários
      if (req.user.role === 'doctor') {
        const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
        if (doctor) {
          where.doctor_id = doctor.id;
        }
      }

      if (status) where.record_status = status;

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
      const logger = require('../utils/logger');
      logger.error('Erro ao buscar prontuários do paciente:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar prontuários'
      });
    }
  }
);

/**
 * @route   GET /api/patients/:id/payments
 * @desc    Obter histórico de pagamentos do paciente
 * @access  Private (admin, receptionist)
 */
router.get(
  '/:id/payments',
  authorize('admin', 'receptionist'),
  validate(uuidSchema, 'params'),
  async (req, res) => {
    try {
      const { Payment, Appointment, Doctor } = require('../models');
      const { id } = req.params;
      const { page = 1, limit = 20, payment_status } = req.query;

      const offset = (page - 1) * limit;
      const where = { patient_id: id };

      if (payment_status) where.payment_status = payment_status;

      const { count, rows: payments } = await Payment.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [
          {
            model: Appointment,
            as: 'appointment',
            attributes: ['id', 'appointment_date', 'appointment_time'],
            include: [
              {
                model: Doctor,
                as: 'doctor',
                attributes: ['id', 'name', 'specialty']
              }
            ]
          }
        ],
        order: [['created_at', 'DESC']]
      });

      res.status(200).json({
        success: true,
        data: payments,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      const logger = require('../utils/logger');
      logger.error('Erro ao buscar pagamentos do paciente:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar pagamentos'
      });
    }
  }
);

/**
 * @route   POST /api/patients
 * @desc    Criar novo paciente
 * @access  Private (admin, receptionist)
 */
router.post(
  '/',
  authorize('admin', 'receptionist'),
  validate(createPatientSchema),
  patientController.createPatient
);

/**
 * @route   PUT /api/patients/:id
 * @desc    Atualizar paciente
 * @access  Private (admin, receptionist)
 */
router.put(
  '/:id',
  authorize('admin', 'receptionist'),
  validate(uuidSchema, 'params'),
  validate(updatePatientSchema),
  patientController.updatePatient
);

/**
 * @route   PATCH /api/patients/:id/toggle-status
 * @desc    Ativar/desativar paciente
 * @access  Private (admin)
 */
router.patch(
  '/:id/toggle-status',
  authorize('admin'),
  validate(uuidSchema, 'params'),
  async (req, res) => {
    try {
      const { Patient } = require('../models');
      const { id } = req.params;
      const logger = require('../utils/logger');

      const patient = await Patient.findByPk(id);

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Paciente não encontrado'
        });
      }

      const newStatus = !patient.is_active;
      await patient.update({ is_active: newStatus });

      logger.info(`Paciente ${patient.name} ${newStatus ? 'ativado' : 'desativado'} por ${req.user.email}`);

      res.status(200).json({
        success: true,
        message: `Paciente ${newStatus ? 'ativado' : 'desativado'} com sucesso`,
        data: patient
      });
    } catch (error) {
      const logger = require('../utils/logger');
      logger.error('Erro ao alterar status do paciente:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao alterar status'
      });
    }
  }
);

/**
 * @route   PATCH /api/patients/:id/reactivate
 * @desc    Reativar paciente inativo
 * @access  Private (admin)
 */
router.patch(
  '/:id/reactivate',
  authorize('admin'),
  validate(uuidSchema, 'params'),
  patientController.reactivatePatient
);

/**
 * @route   POST /api/patients/:id/documents
 * @desc    Adicionar documento ao paciente
 * @access  Private (admin, receptionist)
 */
router.post(
  '/:id/documents',
  authorize('admin', 'receptionist'),
  validate(uuidSchema, 'params'),
  validate(
    Joi.object({
      type: Joi.string().required().messages({
        'any.required': 'Tipo do documento é obrigatório'
      }),
      filename: Joi.string().required(),
      url: Joi.string().uri().required(),
      description: Joi.string().allow(null, '')
    })
  ),
  async (req, res) => {
    try {
      const { Patient } = require('../models');
      const { id } = req.params;
      const document = req.body;
      const logger = require('../utils/logger');

      const patient = await Patient.findByPk(id);

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Paciente não encontrado'
        });
      }

      await patient.addDocument(document);

      logger.info(`Documento adicionado ao paciente ${patient.name} por ${req.user.email}`);

      res.status(200).json({
        success: true,
        message: 'Documento adicionado com sucesso',
        data: patient
      });
    } catch (error) {
      const logger = require('../utils/logger');
      logger.error('Erro ao adicionar documento:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao adicionar documento'
      });
    }
  }
);

/**
 * @route   DELETE /api/patients/:id/documents/:filename
 * @desc    Remover documento do paciente
 * @access  Private (admin, receptionist)
 */
router.delete(
  '/:id/documents/:filename',
  authorize('admin', 'receptionist'),
  validate(uuidSchema, 'params'),
  async (req, res) => {
    try {
      const { Patient } = require('../models');
      const { id, filename } = req.params;
      const logger = require('../utils/logger');

      const patient = await Patient.findByPk(id);

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Paciente não encontrado'
        });
      }

      await patient.removeDocument(filename);

      logger.info(`Documento removido do paciente ${patient.name} por ${req.user.email}`);

      res.status(200).json({
        success: true,
        message: 'Documento removido com sucesso'
      });
    } catch (error) {
      const logger = require('../utils/logger');
      logger.error('Erro ao remover documento:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao remover documento'
      });
    }
  }
);

/**
 * @route   DELETE /api/patients/:id
 * @desc    Deletar paciente (soft delete)
 * @access  Private (admin)
 */
router.delete(
  '/:id',
  authorize('admin'),
  validate(uuidSchema, 'params'),
  patientController.deletePatient
);

module.exports = router;

/**
 * DOCUMENTAÇÃO DAS ROTAS:
 * 
 * GET    /api/patients                            - Lista pacientes com filtros
 * GET    /api/patients/statistics                 - Estatísticas gerais (admin)
 * GET    /api/patients/birthdays                  - Aniversariantes do mês
 * GET    /api/patients/by-insurance/:name         - Pacientes por convênio
 * GET    /api/patients/cpf/:cpf                   - Busca por CPF
 * GET    /api/patients/:id                        - Busca por ID
 * GET    /api/patients/:id/appointments           - Histórico de consultas
 * GET    /api/patients/:id/stats                  - Estatísticas do paciente
 * GET    /api/patients/:id/medical-records        - Prontuários médicos (admin, doctor)
 * GET    /api/patients/:id/payments               - Histórico de pagamentos (admin, receptionist)
 * POST   /api/patients                            - Criar (admin, receptionist)
 * PUT    /api/patients/:id                        - Atualizar (admin, receptionist)
 * PATCH  /api/patients/:id/toggle-status          - Ativar/desativar (admin)
 * PATCH  /api/patients/:id/reactivate             - Reativar (admin)
 * POST   /api/patients/:id/documents              - Adicionar documento
 * DELETE /api/patients/:id/documents/:filename    - Remover documento
 * DELETE /api/patients/:id                        - Soft delete (admin)
 * 
 * FILTROS DISPONÍVEIS NO GET:
 * - page: número da página
 * - limit: itens por página
 * - search: busca por nome, CPF, telefone, email
 * - is_active: true/false
 * - health_insurance: filtrar por convênio
 * - gender: male/female/other
 * - sort_by: campo para ordenação
 * - sort_order: ASC/DESC
 * 
 * ESTATÍSTICAS DO PACIENTE INCLUEM:
 * - Total de consultas
 * - Consultas por status
 * - Última consulta
 * - Próxima consulta
 * - Total gasto
 * 
 * EXEMPLO DE USO:
 * GET /api/patients?search=João&health_insurance=Unimed&is_active=true
 * GET /api/patients/birthdays?month=10
 * GET /api/patients/:id/appointments?status=completed&date_from=2025-01-01
 * GET /api/patients/:id/stats
 * POST /api/patients/:id/documents { type, filename, url }
 */