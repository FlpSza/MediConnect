const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { validate, createAppointmentSchema, updateAppointmentSchema, cancelAppointmentSchema, uuidSchema } = require('../middlewares/validation');
const Joi = require('joi');

/**
 * Todas as rotas requerem autenticação
 */
router.use(authenticate);

/**
 * @route   GET /api/appointments
 * @desc    Listar todos os agendamentos com filtros
 * @access  Private (admin, doctor, receptionist)
 * @query   page, limit, doctor_id, patient_id, status, date_from, date_to, date
 */
router.get(
  '/',
  appointmentController.getAllAppointments
);

/**
 * @route   GET /api/appointments/stats
 * @desc    Obter estatísticas de agendamentos
 * @access  Private (admin)
 */
router.get(
  '/stats',
  authorize('admin'),
  appointmentController.getAppointmentStats
);

/**
 * @route   GET /api/appointments/doctor/:doctor_id/available-slots
 * @desc    Obter horários disponíveis de um médico em uma data específica
 * @access  Private
 * @query   date (required)
 */
router.get(
  '/doctor/:doctor_id/available-slots',
  validate(uuidSchema, 'params'),
  validate(
    Joi.object({
      date: Joi.date().iso().required().messages({
        'any.required': 'Data é obrigatória',
        'date.format': 'Data deve estar no formato ISO (YYYY-MM-DD)'
      })
    }),
    'query'
  ),
  appointmentController.getAvailableSlots
);

/**
 * @route   GET /api/appointments/:id
 * @desc    Obter agendamento por ID
 * @access  Private
 */
router.get(
  '/:id',
  validate(uuidSchema, 'params'),
  appointmentController.getAppointmentById
);

/**
 * @route   POST /api/appointments
 * @desc    Criar novo agendamento
 * @access  Private (admin, receptionist)
 */
router.post(
  '/',
  authorize('admin', 'receptionist'),
  validate(createAppointmentSchema),
  appointmentController.createAppointment
);

/**
 * @route   PUT /api/appointments/:id
 * @desc    Atualizar agendamento
 * @access  Private (admin, receptionist)
 */
router.put(
  '/:id',
  authorize('admin', 'receptionist'),
  validate(uuidSchema, 'params'),
  validate(updateAppointmentSchema),
  appointmentController.updateAppointment
);

/**
 * @route   PATCH /api/appointments/:id/confirm
 * @desc    Confirmar agendamento
 * @access  Private (admin, receptionist, doctor)
 */
router.patch(
  '/:id/confirm',
  authorize('admin', 'receptionist', 'doctor'),
  validate(uuidSchema, 'params'),
  appointmentController.confirmAppointment
);

/**
 * @route   PATCH /api/appointments/:id/start
 * @desc    Iniciar consulta (marcar como em andamento)
 * @access  Private (admin, doctor)
 */
router.patch(
  '/:id/start',
  authorize('admin', 'doctor'),
  validate(uuidSchema, 'params'),
  appointmentController.startAppointment
);

/**
 * @route   PATCH /api/appointments/:id/complete
 * @desc    Marcar consulta como concluída
 * @access  Private (admin, doctor)
 */
router.patch(
  '/:id/complete',
  authorize('admin', 'doctor'),
  validate(uuidSchema, 'params'),
  appointmentController.completeAppointment
);

/**
 * @route   PATCH /api/appointments/:id/cancel
 * @desc    Cancelar agendamento
 * @access  Private (admin, receptionist)
 */
router.patch(
  '/:id/cancel',
  authorize('admin', 'receptionist'),
  validate(uuidSchema, 'params'),
  validate(cancelAppointmentSchema),
  appointmentController.cancelAppointment
);

/**
 * @route   PATCH /api/appointments/:id/no-show
 * @desc    Marcar como falta (paciente não compareceu)
 * @access  Private (admin, receptionist)
 */
router.patch(
  '/:id/no-show',
  authorize('admin', 'receptionist'),
  validate(uuidSchema, 'params'),
  appointmentController.markAsNoShow
);

/**
 * @route   DELETE /api/appointments/:id
 * @desc    Deletar agendamento permanentemente
 * @access  Private (admin only)
 * @note    Use cancelamento ao invés de deleção quando possível
 */
router.delete(
  '/:id',
  authorize('admin'),
  validate(uuidSchema, 'params'),
  async (req, res) => {
    try {
      const { Appointment } = require('../models');
      const logger = require('../utils/logger');
      const { id } = req.params;

      const appointment = await Appointment.findByPk(id);

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Agendamento não encontrado'
        });
      }

      // Apenas permite deletar agendamentos cancelados
      if (appointment.status !== 'cancelled') {
        return res.status(400).json({
          success: false,
          message: 'Apenas agendamentos cancelados podem ser deletados. Cancele primeiro.'
        });
      }

      await appointment.destroy();

      logger.warn(`Agendamento ${id} deletado permanentemente por ${req.user.email}`);

      res.status(200).json({
        success: true,
        message: 'Agendamento deletado permanentemente'
      });
    } catch (error) {
      const logger = require('../utils/logger');
      logger.error('Erro ao deletar agendamento:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao deletar agendamento'
      });
    }
  }
);

module.exports = router;

/**
 * DOCUMENTAÇÃO DAS ROTAS:
 * 
 * GET    /api/appointments                              - Lista agendamentos com filtros
 * GET    /api/appointments/stats                        - Estatísticas (admin)
 * GET    /api/appointments/doctor/:id/available-slots   - Horários disponíveis
 * GET    /api/appointments/:id                          - Busca por ID
 * POST   /api/appointments                              - Criar (admin, receptionist)
 * PUT    /api/appointments/:id                          - Atualizar (admin, receptionist)
 * PATCH  /api/appointments/:id/confirm                  - Confirmar
 * PATCH  /api/appointments/:id/start                    - Iniciar consulta (doctor)
 * PATCH  /api/appointments/:id/complete                 - Concluir (doctor)
 * PATCH  /api/appointments/:id/cancel                   - Cancelar (admin, receptionist)
 * PATCH  /api/appointments/:id/no-show                  - Marcar falta (admin, receptionist)
 * DELETE /api/appointments/:id                          - Deletar permanente (admin, apenas cancelados)
 * 
 * FILTROS DISPONÍVEIS NO GET:
 * - page: número da página (default: 1)
 * - limit: itens por página (default: 20)
 * - doctor_id: filtrar por médico
 * - patient_id: filtrar por paciente
 * - status: scheduled, confirmed, in_progress, completed, cancelled, no_show
 * - date: data específica (YYYY-MM-DD)
 * - date_from: data inicial do intervalo
 * - date_to: data final do intervalo
 * - payment_status: pending, paid, partially_paid, refunded
 * - sort_by: campo para ordenação (default: appointment_date)
 * - sort_order: ASC ou DESC (default: ASC)
 * 
 * EXEMPLO DE USO:
 * GET /api/appointments?doctor_id=uuid&date=2025-10-10&status=scheduled
 * GET /api/appointments?date_from=2025-10-01&date_to=2025-10-31
 * GET /api/appointments/doctor/uuid/available-slots?date=2025-10-15
 * 
 * FLUXO DE STATUS:
 * scheduled -> confirmed -> in_progress -> completed
 *           -> cancelled
 *           -> no_show
 */