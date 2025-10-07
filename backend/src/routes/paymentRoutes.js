const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { validate, uuidSchema } = require('../middlewares/validation');
const Joi = require('joi');
const { Payment, Patient, Appointment, Doctor, HealthInsurance } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * Todas as rotas requerem autenticação
 * Pagamentos são restritos a admin e receptionist
 */
router.use(authenticate);

/**
 * Schema de validação para criar pagamento
 */
const createPaymentSchema = Joi.object({
  appointment_id: Joi.string().uuid().required(),
  patient_id: Joi.string().uuid().required(),
  amount: Joi.number().positive().required(),
  discount: Joi.number().min(0).default(0),
  discount_percentage: Joi.number().min(0).max(100).allow(null),
  payment_method: Joi.string()
    .valid('cash', 'credit_card', 'debit_card', 'pix', 'bank_transfer', 'health_insurance', 'check', 'other')
    .required(),
  installments: Joi.number().integer().min(1).default(1),
  due_date: Joi.date().iso().allow(null),
  card_last_digits: Joi.string().length(4).allow(null, ''),
  card_brand: Joi.string().allow(null, ''),
  health_insurance_id: Joi.string().uuid().allow(null),
  health_insurance_authorization: Joi.string().allow(null, ''),
  insurance_coverage_amount: Joi.number().min(0).allow(null),
  patient_copayment: Joi.number().min(0).allow(null),
  notes: Joi.string().allow(null, '')
});

/**
 * Schema para processar pagamento
 */
const processPaymentSchema = Joi.object({
  amount: Joi.number().positive().required()
});

/**
 * Schema para reembolso
 */
const refundPaymentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  reason: Joi.string().required()
});

/**
 * @route   GET /api/payments
 * @desc    Listar todos os pagamentos com filtros
 * @access  Private (admin, receptionist)
 */
router.get(
  '/',
  authorize('admin', 'receptionist'),
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        payment_status,
        payment_method,
        patient_id,
        date_from,
        date_to,
        overdue_only = false
      } = req.query;

      const offset = (page - 1) * limit;
      const where = {};

      if (payment_status) where.payment_status = payment_status;
      if (payment_method) where.payment_method = payment_method;
      if (patient_id) where.patient_id = patient_id;

      if (date_from && date_to) {
        where.payment_date = {
          [Op.between]: [date_from, date_to]
        };
      }

      // Filtrar apenas vencidos
      if (overdue_only === 'true') {
        where.due_date = {
          [Op.lt]: new Date()
        };
        where.payment_status = {
          [Op.notIn]: ['paid', 'cancelled', 'refunded']
        };
      }

      const { count, rows: payments } = await Payment.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [
          {
            model: Patient,
            as: 'patient',
            attributes: ['id', 'name', 'cpf', 'phone']
          },
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
          },
          {
            model: HealthInsurance,
            as: 'healthInsurance',
            attributes: ['id', 'name', 'code']
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
      logger.error('Erro ao listar pagamentos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao listar pagamentos'
      });
    }
  }
);

/**
 * @route   GET /api/payments/overdue
 * @desc    Listar pagamentos vencidos
 * @access  Private (admin, receptionist)
 */
router.get(
  '/overdue',
  authorize('admin', 'receptionist'),
  async (req, res) => {
    try {
      const payments = await Payment.findOverdue();

      res.status(200).json({
        success: true,
        data: payments
      });
    } catch (error) {
      logger.error('Erro ao listar pagamentos vencidos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao listar pagamentos vencidos'
      });
    }
  }
);

/**
 * @route   GET /api/payments/statistics
 * @desc    Obter estatísticas de pagamentos
 * @access  Private (admin)
 */
router.get(
  '/statistics',
  authorize('admin'),
  async (req, res) => {
    try {
      const { date_from, date_to } = req.query;

      const stats = await Payment.getStatistics({ date_from, date_to });

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Erro ao buscar estatísticas de pagamentos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar estatísticas'
      });
    }
  }
);

/**
 * @route   GET /api/payments/revenue
 * @desc    Obter receita total por período
 * @access  Private (admin)
 */
router.get(
  '/revenue',
  authorize('admin'),
  async (req, res) => {
    try {
      const { date_from, date_to } = req.query;

      if (!date_from || !date_to) {
        return res.status(400).json({
          success: false,
          message: 'date_from e date_to são obrigatórios'
        });
      }

      const revenue = await Payment.getTotalRevenue(date_from, date_to);

      res.status(200).json({
        success: true,
        data: {
          date_from,
          date_to,
          total_revenue: revenue
        }
      });
    } catch (error) {
      logger.error('Erro ao calcular receita:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao calcular receita'
      });
    }
  }
);

/**
 * @route   GET /api/payments/:id
 * @desc    Obter pagamento por ID
 * @access  Private (admin, receptionist)
 */
router.get(
  '/:id',
  authorize('admin', 'receptionist'),
  validate(uuidSchema, 'params'),
  async (req, res) => {
    try {
      const { id } = req.params;

      const payment = await Payment.findByPk(id, {
        include: [
          {
            model: Patient,
            as: 'patient'
          },
          {
            model: Appointment,
            as: 'appointment',
            include: [
              {
                model: Doctor,
                as: 'doctor'
              }
            ]
          },
          {
            model: HealthInsurance,
            as: 'healthInsurance'
          }
        ]
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Pagamento não encontrado'
        });
      }

      res.status(200).json({
        success: true,
        data: payment
      });
    } catch (error) {
      logger.error('Erro ao buscar pagamento:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar pagamento'
      });
    }
  }
);

/**
 * @route   POST /api/payments
 * @desc    Criar novo pagamento
 * @access  Private (admin, receptionist)
 */
router.post(
  '/',
  authorize('admin', 'receptionist'),
  validate(createPaymentSchema),
  async (req, res) => {
    try {
      const paymentData = req.body;

      // Verificar se agendamento existe
      const appointment = await Appointment.findByPk(paymentData.appointment_id);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Agendamento não encontrado'
        });
      }

      // Verificar se paciente existe
      const patient = await Patient.findByPk(paymentData.patient_id);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Paciente não encontrado'
        });
      }

      // Criar pagamento
      const payment = await Payment.create(paymentData);

      // Buscar com relacionamentos
      const fullPayment = await Payment.findByPk(payment.id, {
        include: [
          { model: Patient, as: 'patient' },
          { model: Appointment, as: 'appointment' }
        ]
      });

      // Gerar número do recibo se não tiver
      if (!payment.receipt_number) {
        payment.receipt_number = payment.generateReceiptNumber();
        await payment.save();
      }

      logger.info(`Pagamento criado por ${req.user.email} - Paciente: ${patient.name}, Valor: R$ ${payment.amount}`);

      res.status(201).json({
        success: true,
        message: 'Pagamento criado com sucesso',
        data: fullPayment
      });
    } catch (error) {
      logger.error('Erro ao criar pagamento:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao criar pagamento'
      });
    }
  }
);

/**
 * @route   PUT /api/payments/:id
 * @desc    Atualizar pagamento
 * @access  Private (admin, receptionist)
 */
router.put(
  '/:id',
  authorize('admin', 'receptionist'),
  validate(uuidSchema, 'params'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const payment = await Payment.findByPk(id);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Pagamento não encontrado'
        });
      }

      // Não permitir atualizar pagamentos já pagos ou reembolsados
      if (['paid', 'refunded'].includes(payment.payment_status)) {
        return res.status(400).json({
          success: false,
          message: 'Não é possível atualizar pagamento pago ou reembolsado'
        });
      }

      await payment.update(updateData);

      logger.info(`Pagamento ${id} atualizado por ${req.user.email}`);

      res.status(200).json({
        success: true,
        message: 'Pagamento atualizado com sucesso',
        data: payment
      });
    } catch (error) {
      logger.error('Erro ao atualizar pagamento:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar pagamento'
      });
    }
  }
);

/**
 * @route   PATCH /api/payments/:id/process
 * @desc    Processar pagamento (registrar valor pago)
 * @access  Private (admin, receptionist)
 */
router.patch(
  '/:id/process',
  authorize('admin', 'receptionist'),
  validate(uuidSchema, 'params'),
  validate(processPaymentSchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { amount } = req.body;

      const payment = await Payment.findByPk(id);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Pagamento não encontrado'
        });
      }

      if (payment.payment_status === 'cancelled') {
        return res.status(400).json({
          success: false,
          message: 'Não é possível processar pagamento cancelado'
        });
      }

      // Verificar se o valor não ultrapassa o saldo devedor
      const remaining = payment.getRemainingBalance();
      if (amount > remaining) {
        return res.status(400).json({
          success: false,
          message: `Valor informado (R$ ${amount}) é maior que o saldo devedor (R$ ${remaining})`
        });
      }

      await payment.processPayment(amount, req.user.id);

      logger.info(`Pagamento ${id} processado por ${req.user.email} - Valor: R$ ${amount}`);

      res.status(200).json({
        success: true,
        message: 'Pagamento processado com sucesso',
        data: payment
      });
    } catch (error) {
      logger.error('Erro ao processar pagamento:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao processar pagamento'
      });
    }
  }
);

/**
 * @route   PATCH /api/payments/:id/cancel
 * @desc    Cancelar pagamento
 * @access  Private (admin)
 */
router.patch(
  '/:id/cancel',
  authorize('admin'),
  validate(uuidSchema, 'params'),
  validate(Joi.object({
    reason: Joi.string().required()
  })),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const payment = await Payment.findByPk(id);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Pagamento não encontrado'
        });
      }

      if (payment.payment_status === 'paid') {
        return res.status(400).json({
          success: false,
          message: 'Pagamento já foi pago. Use reembolso ao invés de cancelamento.'
        });
      }

      await payment.cancel(reason, req.user.id);

      logger.info(`Pagamento ${id} cancelado por ${req.user.email}`);

      res.status(200).json({
        success: true,
        message: 'Pagamento cancelado com sucesso',
        data: payment
      });
    } catch (error) {
      logger.error('Erro ao cancelar pagamento:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao cancelar pagamento'
      });
    }
  }
);

/**
 * @route   PATCH /api/payments/:id/refund
 * @desc    Processar reembolso
 * @access  Private (admin)
 */
router.patch(
  '/:id/refund',
  authorize('admin'),
  validate(uuidSchema, 'params'),
  validate(refundPaymentSchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { amount, reason } = req.body;

      const payment = await Payment.findByPk(id);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Pagamento não encontrado'
        });
      }

      if (payment.payment_status !== 'paid') {
        return res.status(400).json({
          success: false,
          message: 'Apenas pagamentos concluídos podem ser reembolsados'
        });
      }

      if (amount > parseFloat(payment.amount_paid)) {
        return res.status(400).json({
          success: false,
          message: 'Valor de reembolso não pode ser maior que o valor pago'
        });
      }

      await payment.refund(amount, reason);

      logger.info(`Reembolso processado no pagamento ${id} por ${req.user.email} - Valor: R$ ${amount}`);

      res.status(200).json({
        success: true,
        message: 'Reembolso processado com sucesso',
        data: payment
      });
    } catch (error) {
      logger.error('Erro ao processar reembolso:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao processar reembolso'
      });
    }
  }
);

/**
 * @route   GET /api/payments/:id/receipt
 * @desc    Gerar/obter recibo de pagamento
 * @access  Private (admin, receptionist)
 */
router.get(
  '/:id/receipt',
  authorize('admin', 'receptionist'),
  validate(uuidSchema, 'params'),
  async (req, res) => {
    try {
      const { id } = req.params;

      const payment = await Payment.findByPk(id, {
        include: [
          {
            model: Patient,
            as: 'patient'
          },
          {
            model: Appointment,
            as: 'appointment',
            include: [
              {
                model: Doctor,
                as: 'doctor'
              }
            ]
          }
        ]
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Pagamento não encontrado'
        });
      }

      // Gerar número do recibo se não existir
      if (!payment.receipt_number) {
        payment.receipt_number = payment.generateReceiptNumber();
        await payment.save();
      }

      // Aqui você pode gerar um PDF do recibo
      // Por enquanto, retornamos os dados do recibo

      const receiptData = {
        receipt_number: payment.receipt_number,
        date: payment.payment_date || new Date(),
        patient: {
          name: payment.patient.name,
          cpf: payment.patient.cpf
        },
        doctor: payment.appointment.doctor ? {
          name: payment.appointment.doctor.name,
          crm: payment.appointment.doctor.crm
        } : null,
        appointment_date: payment.appointment.appointment_date,
        amount: payment.amount,
        amount_paid: payment.amount_paid,
        discount: payment.discount,
        payment_method: payment.payment_method
      };

      res.status(200).json({
        success: true,
        data: receiptData
      });
    } catch (error) {
      logger.error('Erro ao gerar recibo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao gerar recibo'
      });
    }
  }
);

module.exports = router;

/**
 * DOCUMENTAÇÃO DAS ROTAS:
 * 
 * GET    /api/payments                     - Lista pagamentos com filtros
 * GET    /api/payments/overdue             - Lista pagamentos vencidos
 * GET    /api/payments/statistics          - Estatísticas (admin)
 * GET    /api/payments/revenue             - Receita por período (admin)
 * GET    /api/payments/:id                 - Busca por ID
 * GET    /api/payments/:id/receipt         - Gerar/obter recibo
 * POST   /api/payments                     - Criar pagamento
 * PUT    /api/payments/:id                 - Atualizar
 * PATCH  /api/payments/:id/process         - Processar pagamento
 * PATCH  /api/payments/:id/cancel          - Cancelar (admin)
 * PATCH  /api/payments/:id/refund          - Reembolsar (admin)
 * 
 * MÉTODOS DE PAGAMENTO:
 * - cash: Dinheiro
 * - credit_card: Cartão de crédito
 * - debit_card: Cartão de débito
 * - pix: PIX
 * - bank_transfer: Transferência bancária
 * - health_insurance: Convênio
 * - check: Cheque
 * - other: Outros
 * 
 * STATUS DE PAGAMENTO:
 * - pending: Pendente
 * - paid: Pago
 * - partially_paid: Parcialmente pago
 * - overdue: Vencido
 * - refunded: Reembolsado
 * - cancelled: Cancelado
 * 
 * FILTROS DISPONÍVEIS:
 * - payment_status: filtrar por status
 * - payment_method: filtrar por método
 * - patient_id: filtrar por paciente
 * - date_from/date_to: intervalo de datas
 * - overdue_only: apenas vencidos
 * 
 * EXEMPLO DE USO:
 * GET /api/payments?payment_status=pending&overdue_only=true
 * GET /api/payments/revenue?date_from=2025-01-01&date_to=2025-12-31
 * PATCH /api/payments/:id/process { amount: 150.00 }
 * PATCH /api/payments/:id/refund { amount: 100.00, reason: "..." }
 */