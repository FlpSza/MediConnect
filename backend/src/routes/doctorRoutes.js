const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { authenticate, authorize, isDoctorOwnData } = require('../middlewares/authMiddleware');
const { validate, createDoctorSchema, updateDoctorSchema, uuidSchema } = require('../middlewares/validation');
const Joi = require('joi');

/**
 * Todas as rotas requerem autenticação
 */
router.use(authenticate);

/**
 * @route   GET /api/doctors
 * @desc    Listar todos os médicos com filtros
 * @access  Private (admin, doctor, receptionist)
 * @query   page, limit, search, specialty, is_active, sort_by, sort_order
 */
router.get(
  '/',
  doctorController.getAllDoctors);

/**
 * @route   GET /api/doctors/specialties
 * @desc    Obter lista de todas as especialidades cadastradas
 * @access  Private
 */
router.get(
  '/specialties',
  doctorController.getSpecialties
);

/**
 * @route   GET /api/doctors/statistics
 * @desc    Obter estatísticas dos médicos
 * @access  Private (admin)
 */
router.get(
  '/statistics',
  authorize('admin'),
  async (req, res) => {
    try {
      const { Doctor } = require('../models');
      const { Op } = require('sequelize');

      const total = await Doctor.count();
      const active = await Doctor.count({ where: { is_active: true } });

      const bySpecialty = await Doctor.findAll({
        where: { is_active: true },
        attributes: [
          'specialty',
          [require('sequelize').fn('COUNT', 'id'), 'count']
        ],
        group: ['specialty'],
        order: [[require('sequelize').fn('COUNT', 'id'), 'DESC']],
        raw: true
      });

      const withUser = await Doctor.count({
        where: {
          user_id: { [Op.ne]: null },
          is_active: true
        }
      });

      res.status(200).json({
        success: true,
        data: {
          total,
          active,
          inactive: total - active,
          by_specialty: bySpecialty,
          with_system_access: withUser,
          without_system_access: active - withUser
        }
      });
    } catch (error) {
      const logger = require('../utils/logger');
      logger.error('Erro ao buscar estatísticas de médicos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar estatísticas'
      });
    }
  }
);

/**
 * @route   GET /api/doctors/:id
 * @desc    Obter médico por ID
 * @access  Private
 */
router.get(
  '/:id',
  validate(uuidSchema, 'params'),
  doctorController.getDoctorById
);

/**
 * @route   GET /api/doctors/:id/appointments
 * @desc    Obter agendamentos de um médico
 * @access  Private (admin, próprio médico)
 */
router.get(
  '/:id/appointments',
  validate(uuidSchema, 'params'),
  async (req, res) => {
    try {
      const { Appointment, Patient } = require('../models');
      const { id } = req.params;
      const { page = 1, limit = 20, status, date_from, date_to } = req.query;
      const logger = require('../utils/logger');

      // Verificar permissão: admin ou próprio médico
      if (req.user.role !== 'admin') {
        const { Doctor } = require('../models');
        const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
        
        if (!doctor || doctor.id !== id) {
          return res.status(403).json({
            success: false,
            message: 'Você só pode acessar seus próprios agendamentos'
          });
        }
      }

      const offset = (page - 1) * limit;
      const where = { doctor_id: id };

      if (status) where.status = status;
      if (date_from && date_to) {
        where.appointment_date = {
          [require('sequelize').Op.between]: [date_from, date_to]
        };
      }

      const { count, rows: appointments } = await Appointment.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [
          {
            model: Patient,
            as: 'patient',
            attributes: ['id', 'name', 'cpf', 'phone']
          }
        ],
        order: [['appointment_date', 'DESC'], ['appointment_time', 'DESC']]
      });

      res.status(200).json({
        success: true,
        data: appointments,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      const logger = require('../utils/logger');
      logger.error('Erro ao buscar agendamentos do médico:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar agendamentos'
      });
    }
  }
);

/**
 * @route   GET /api/doctors/:id/schedule
 * @desc    Obter agenda do médico (próximos agendamentos)
 * @access  Private (admin, próprio médico)
 */
router.get(
  '/:id/schedule',
  validate(uuidSchema, 'params'),
  async (req, res) => {
    try {
      const { Appointment, Patient } = require('../models');
      const { id } = req.params;
      const { days = 7 } = req.query;
      const { Op } = require('sequelize');

      // Verificar permissão
      if (req.user.role !== 'admin') {
        const { Doctor } = require('../models');
        const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
        
        if (!doctor || doctor.id !== id) {
          return res.status(403).json({
            success: false,
            message: 'Acesso negado'
          });
        }
      }

      const today = new Date().toISOString().split('T')[0];
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + parseInt(days));

      const appointments = await Appointment.findAll({
        where: {
          doctor_id: id,
          appointment_date: {
            [Op.between]: [today, futureDate.toISOString().split('T')[0]]
          },
          status: {
            [Op.notIn]: ['cancelled', 'no_show']
          }
        },
        include: [
          {
            model: Patient,
            as: 'patient',
            attributes: ['id', 'name', 'phone']
          }
        ],
        order: [['appointment_date', 'ASC'], ['appointment_time', 'ASC']]
      });

      res.status(200).json({
        success: true,
        data: appointments
      });
    } catch (error) {
      const logger = require('../utils/logger');
      logger.error('Erro ao buscar agenda do médico:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar agenda'
      });
    }
  }
);

/**
 * @route   POST /api/doctors
 * @desc    Criar novo médico
 * @access  Private (admin)
 */
router.post(
  '/',
  authorize('admin'),
  validate(createDoctorSchema),
  doctorController.createDoctor
);

/**
 * @route   PUT /api/doctors/:id
 * @desc    Atualizar médico
 * @access  Private (admin)
 */
router.put(
  '/:id',
  authorize('admin'),
  validate(uuidSchema, 'params'),
  validate(updateDoctorSchema),
  doctorController.updateDoctor
);

/**
 * @route   PUT /api/doctors/:id/working-hours
 * @desc    Atualizar horários de atendimento
 * @access  Private (admin, próprio médico)
 */
router.put(
  '/:id/working-hours',
  validate(uuidSchema, 'params'),
  validate(
    Joi.object({
      working_hours: Joi.object({
        monday: Joi.object({
          start: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
          end: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
          active: Joi.boolean().required()
        }),
        tuesday: Joi.object({
          start: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
          end: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
          active: Joi.boolean().required()
        }),
        wednesday: Joi.object({
          start: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
          end: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
          active: Joi.boolean().required()
        }),
        thursday: Joi.object({
          start: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
          end: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
          active: Joi.boolean().required()
        }),
        friday: Joi.object({
          start: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
          end: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
          active: Joi.boolean().required()
        }),
        saturday: Joi.object({
          start: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
          end: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
          active: Joi.boolean().required()
        }),
        sunday: Joi.object({
          start: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
          end: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
          active: Joi.boolean().required()
        })
      }).required()
    })
  ),
  async (req, res) => {
    try {
      const { Doctor } = require('../models');
      const { id } = req.params;
      const { working_hours } = req.body;
      const logger = require('../utils/logger');

      // Verificar permissão: admin ou próprio médico
      if (req.user.role !== 'admin') {
        const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
        
        if (!doctor || doctor.id !== id) {
          return res.status(403).json({
            success: false,
            message: 'Você só pode atualizar seus próprios horários'
          });
        }
      }

      const doctor = await Doctor.findByPk(id);

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Médico não encontrado'
        });
      }

      await doctor.update({ working_hours });

      logger.info(`Horários de ${doctor.name} atualizados por ${req.user.email}`);

      res.status(200).json({
        success: true,
        message: 'Horários atualizados com sucesso',
        data: doctor
      });
    } catch (error) {
      const logger = require('../utils/logger');
      logger.error('Erro ao atualizar horários:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar horários'
      });
    }
  }
);

/**
 * @route   PATCH /api/doctors/:id/toggle-status
 * @desc    Ativar/desativar médico
 * @access  Private (admin)
 */
router.patch(
  '/:id/toggle-status',
  authorize('admin'),
  validate(uuidSchema, 'params'),
  async (req, res) => {
    try {
      const { Doctor } = require('../models');
      const { id } = req.params;
      const logger = require('../utils/logger');

      const doctor = await Doctor.findByPk(id);

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Médico não encontrado'
        });
      }

      const newStatus = !doctor.is_active;
      await doctor.update({ is_active: newStatus });

      logger.info(`Médico ${doctor.name} ${newStatus ? 'ativado' : 'desativado'} por ${req.user.email}`);

      res.status(200).json({
        success: true,
        message: `Médico ${newStatus ? 'ativado' : 'desativado'} com sucesso`,
        data: doctor
      });
    } catch (error) {
      const logger = require('../utils/logger');
      logger.error('Erro ao alterar status do médico:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao alterar status'
      });
    }
  }
);

/**
 * @route   DELETE /api/doctors/:id
 * @desc    Deletar médico (soft delete)
 * @access  Private (admin)
 */
router.delete(
  '/:id',
  authorize('admin'),
  validate(uuidSchema, 'params'),
  doctorController.deleteDoctor
);

module.exports = router;

/**
 * DOCUMENTAÇÃO DAS ROTAS:
 * 
 * GET    /api/doctors                           - Lista médicos com filtros
 * GET    /api/doctors/specialties               - Lista especialidades
 * GET    /api/doctors/statistics                - Estatísticas (admin)
 * GET    /api/doctors/:id                       - Busca por ID
 * GET    /api/doctors/:id/appointments          - Agendamentos do médico
 * GET    /api/doctors/:id/schedule              - Agenda próximos dias
 * POST   /api/doctors                           - Criar (admin)
 * PUT    /api/doctors/:id                       - Atualizar (admin)
 * PUT    /api/doctors/:id/working-hours         - Atualizar horários (admin, próprio)
 * PATCH  /api/doctors/:id/toggle-status         - Ativar/desativar (admin)
 * DELETE /api/doctors/:id                       - Soft delete (admin)
 * 
 * FILTROS DISPONÍVEIS NO GET:
 * - page: número da página
 * - limit: itens por página
 * - search: busca por nome, CRM, CPF
 * - specialty: filtrar por especialidade
 * - is_active: true/false
 * - sort_by: campo para ordenação
 * - sort_order: ASC/DESC
 * 
 * EXEMPLO DE USO:
 * GET /api/doctors?specialty=Cardiologia&is_active=true
 * GET /api/doctors/:id/appointments?status=scheduled&date_from=2025-10-01
 * GET /api/doctors/:id/schedule?days=7
 * PUT /api/doctors/:id/working-hours { working_hours: {...} }
 */