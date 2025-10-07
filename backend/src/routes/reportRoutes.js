const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validation');
const Joi = require('joi');
const { 
  Patient, 
  Doctor, 
  Appointment, 
  Payment, 
  MedicalRecord, 
  User,
  HealthInsurance 
} = require('../models');
const logger = require('../utils/logger');
const { Op, fn, col } = require('sequelize');

/**
 * Todas as rotas requerem autenticação
 * Relatórios são restritos a admin
 */
router.use(authenticate);
router.use(authorize('admin'));

/**
 * Schema de validação para filtros de data
 */
const dateRangeSchema = Joi.object({
  date_from: Joi.date().iso().required(),
  date_to: Joi.date().iso().min(Joi.ref('date_from')).required()
});

/**
 * @route   GET /api/reports/dashboard
 * @desc    Obter dados gerais para dashboard
 * @access  Private (admin)
 */
router.get('/dashboard', async (req, res) => {
  try {
    const today = new Date();
    const firstDayMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Totais gerais
    const totalPatients = await Patient.count({ where: { is_active: true } });
    const totalDoctors = await Doctor.count({ where: { is_active: true } });
    const totalUsers = await User.count({ where: { is_active: true } });

    // Agendamentos do dia
    const todayAppointments = await Appointment.count({
      where: {
        appointment_date: today.toISOString().split('T')[0],
        status: { [Op.notIn]: ['cancelled', 'no_show'] }
      }
    });

    // Agendamentos do mês
    const monthAppointments = await Appointment.count({
      where: {
        appointment_date: {
          [Op.between]: [
            firstDayMonth.toISOString().split('T')[0],
            lastDayMonth.toISOString().split('T')[0]
          ]
        }
      }
    });

    // Consultas concluídas no mês
    const completedAppointments = await Appointment.count({
      where: {
        appointment_date: {
          [Op.between]: [
            firstDayMonth.toISOString().split('T')[0],
            lastDayMonth.toISOString().split('T')[0]
          ]
        },
        status: 'completed'
      }
    });

    // Receita do mês
    const monthRevenue = await Payment.sum('amount_paid', {
      where: {
        payment_date: {
          [Op.between]: [firstDayMonth, lastDayMonth]
        },
        payment_status: { [Op.in]: ['paid', 'partially_paid'] }
      }
    }) || 0;

    // Pagamentos pendentes
    const pendingPayments = await Payment.count({
      where: {
        payment_status: 'pending'
      }
    });

    // Pagamentos vencidos
    const overduePayments = await Payment.count({
      where: {
        due_date: { [Op.lt]: today },
        payment_status: { [Op.notIn]: ['paid', 'cancelled', 'refunded'] }
      }
    });

    // Próximos agendamentos (próximos 7 dias)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcomingAppointments = await Appointment.findAll({
      where: {
        appointment_date: {
          [Op.between]: [
            today.toISOString().split('T')[0],
            nextWeek.toISOString().split('T')[0]
          ]
        },
        status: { [Op.in]: ['scheduled', 'confirmed'] }
      },
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['id', 'name', 'phone']
        },
        {
          model: Doctor,
          as: 'doctor',
          attributes: ['id', 'name']
        }
      ],
      order: [['appointment_date', 'ASC'], ['appointment_time', 'ASC']],
      limit: 10
    });

    // Novos pacientes no mês
    const newPatients = await Patient.count({
      where: {
        registration_date: {
          [Op.between]: [firstDayMonth, lastDayMonth]
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          total_patients: totalPatients,
          total_doctors: totalDoctors,
          total_users: totalUsers,
          today_appointments: todayAppointments,
          month_appointments: monthAppointments,
          completed_appointments: completedAppointments,
          month_revenue: parseFloat(monthRevenue).toFixed(2),
          pending_payments: pendingPayments,
          overdue_payments: overduePayments,
          new_patients_month: newPatients
        },
        upcoming_appointments: upcomingAppointments
      }
    });
  } catch (error) {
    logger.error('Erro ao buscar dados do dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar dados do dashboard'
    });
  }
});

/**
 * @route   GET /api/reports/appointments
 * @desc    Relatório de agendamentos por período
 * @access  Private (admin)
 */
router.get(
  '/appointments',
  validate(dateRangeSchema, 'query'),
  async (req, res) => {
    try {
      const { date_from, date_to } = req.query;

      // Total de agendamentos
      const total = await Appointment.count({
        where: {
          appointment_date: {
            [Op.between]: [date_from, date_to]
          }
        }
      });

      // Por status
      const byStatus = await Appointment.findAll({
        where: {
          appointment_date: {
            [Op.between]: [date_from, date_to]
          }
        },
        attributes: [
          'status',
          [fn('COUNT', col('id')), 'count']
        ],
        group: ['status'],
        raw: true
      });

      // Por médico
      const byDoctor = await Appointment.findAll({
        where: {
          appointment_date: {
            [Op.between]: [date_from, date_to]
          }
        },
        attributes: [
          'doctor_id',
          [fn('COUNT', col('id')), 'count']
        ],
        include: [
          {
            model: Doctor,
            as: 'doctor',
            attributes: ['name', 'specialty']
          }
        ],
        group: ['doctor_id', 'doctor.id'],
        order: [[fn('COUNT', col('id')), 'DESC']],
        limit: 10
      });

      // Por especialidade
      const bySpecialty = await Appointment.findAll({
        where: {
          appointment_date: {
            [Op.between]: [date_from, date_to]
          }
        },
        include: [
          {
            model: Doctor,
            as: 'doctor',
            attributes: ['specialty']
          }
        ],
        attributes: [
          [fn('COUNT', col('appointments.id')), 'count']
        ],
        group: ['doctor.specialty'],
        order: [[fn('COUNT', col('appointments.id')), 'DESC']],
        raw: true
      });

      // Por tipo de consulta
      const byType = await Appointment.findAll({
        where: {
          appointment_date: {
            [Op.between]: [date_from, date_to]
          }
        },
        attributes: [
          'appointment_type',
          [fn('COUNT', col('id')), 'count']
        ],
        group: ['appointment_type'],
        raw: true
      });

      // Taxa de no-show
      const noShowCount = await Appointment.count({
        where: {
          appointment_date: {
            [Op.between]: [date_from, date_to]
          },
          status: 'no_show'
        }
      });

      const noShowRate = total > 0 ? ((noShowCount / total) * 100).toFixed(2) : 0;

      res.status(200).json({
        success: true,
        data: {
          period: { date_from, date_to },
          total,
          by_status: byStatus,
          by_doctor: byDoctor,
          by_specialty: bySpecialty,
          by_type: byType,
          no_show_rate: `${noShowRate}%`,
          no_show_count: noShowCount
        }
      });
    } catch (error) {
      logger.error('Erro ao gerar relatório de agendamentos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao gerar relatório'
      });
    }
  }
);

/**
 * @route   GET /api/reports/financial
 * @desc    Relatório financeiro por período
 * @access  Private (admin)
 */
router.get(
  '/financial',
  validate(dateRangeSchema, 'query'),
  async (req, res) => {
    try {
      const { date_from, date_to } = req.query;

      // Receita total
      const totalRevenue = await Payment.sum('amount_paid', {
        where: {
          payment_date: {
            [Op.between]: [date_from, date_to]
          },
          payment_status: { [Op.in]: ['paid', 'partially_paid'] }
        }
      }) || 0;

      // Receita por método de pagamento
      const byPaymentMethod = await Payment.findAll({
        where: {
          payment_date: {
            [Op.between]: [date_from, date_to]
          },
          payment_status: { [Op.in]: ['paid', 'partially_paid'] }
        },
        attributes: [
          'payment_method',
          [fn('COUNT', col('id')), 'count'],
          [fn('SUM', col('amount_paid')), 'total']
        ],
        group: ['payment_method'],
        raw: true
      });

      // Receita por médico
      const byDoctor = await Payment.findAll({
        where: {
          payment_date: {
            [Op.between]: [date_from, date_to]
          },
          payment_status: { [Op.in]: ['paid', 'partially_paid'] }
        },
        include: [
          {
            model: Appointment,
            as: 'appointment',
            attributes: [],
            include: [
              {
                model: Doctor,
                as: 'doctor',
                attributes: ['name', 'specialty']
              }
            ]
          }
        ],
        attributes: [
          [fn('SUM', col('amount_paid')), 'total'],
          [fn('COUNT', col('payments.id')), 'count']
        ],
        group: ['appointment.doctor.id'],
        order: [[fn('SUM', col('amount_paid')), 'DESC']],
        limit: 10
      });

      // Pagamentos pendentes
      const pending = await Payment.sum('amount', {
        where: {
          payment_status: 'pending'
        }
      }) || 0;

      // Pagamentos vencidos
      const overdue = await Payment.sum('amount', {
        where: {
          due_date: { [Op.lt]: new Date() },
          payment_status: { [Op.notIn]: ['paid', 'cancelled', 'refunded'] }
        }
      }) || 0;

      // Total de descontos
      const totalDiscounts = await Payment.sum('discount', {
        where: {
          payment_date: {
            [Op.between]: [date_from, date_to]
          }
        }
      }) || 0;

      // Reembolsos
      const totalRefunds = await Payment.sum('refund_amount', {
        where: {
          refund_date: {
            [Op.between]: [date_from, date_to]
          },
          payment_status: 'refunded'
        }
      }) || 0;

      // Receita por convênio
      const byInsurance = await Payment.findAll({
        where: {
          payment_date: {
            [Op.between]: [date_from, date_to]
          },
          payment_method: 'health_insurance',
          payment_status: { [Op.in]: ['paid', 'partially_paid'] }
        },
        include: [
          {
            model: HealthInsurance,
            as: 'healthInsurance',
            attributes: ['name']
          }
        ],
        attributes: [
          [fn('SUM', col('amount_paid')), 'total'],
          [fn('COUNT', col('payments.id')), 'count']
        ],
        group: ['health_insurance_id'],
        order: [[fn('SUM', col('amount_paid')), 'DESC']]
      });

      res.status(200).json({
        success: true,
        data: {
          period: { date_from, date_to },
          summary: {
            total_revenue: parseFloat(totalRevenue).toFixed(2),
            pending_payments: parseFloat(pending).toFixed(2),
            overdue_payments: parseFloat(overdue).toFixed(2),
            total_discounts: parseFloat(totalDiscounts).toFixed(2),
            total_refunds: parseFloat(totalRefunds).toFixed(2),
            net_revenue: parseFloat(totalRevenue - totalRefunds).toFixed(2)
          },
          by_payment_method: byPaymentMethod,
          by_doctor: byDoctor,
          by_insurance: byInsurance
        }
      });
    } catch (error) {
      logger.error('Erro ao gerar relatório financeiro:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao gerar relatório financeiro'
      });
    }
  }
);

/**
 * @route   GET /api/reports/patients
 * @desc    Relatório de pacientes
 * @access  Private (admin)
 */
router.get('/patients', async (req, res) => {
  try {
    // Total de pacientes
    const total = await Patient.count();
    const active = await Patient.count({ where: { is_active: true } });

    // Por gênero
    const byGender = await Patient.findAll({
      where: { is_active: true },
      attributes: [
        'gender',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['gender'],
      raw: true
    });

    // Por faixa etária
    const today = new Date();
    const ageRanges = [
      { label: '0-17', min: 0, max: 17 },
      { label: '18-30', min: 18, max: 30 },
      { label: '31-45', min: 31, max: 45 },
      { label: '46-60', min: 46, max: 60 },
      { label: '60+', min: 61, max: 150 }
    ];

    const byAge = await Promise.all(
      ageRanges.map(async (range) => {
        const maxDate = new Date(today.getFullYear() - range.min, today.getMonth(), today.getDate());
        const minDate = new Date(today.getFullYear() - range.max - 1, today.getMonth(), today.getDate());

        const count = await Patient.count({
          where: {
            birth_date: {
              [Op.between]: [minDate, maxDate]
            },
            is_active: true
          }
        });

        return { age_range: range.label, count };
      })
    );

    // Por convênio
    const byInsurance = await Patient.findAll({
      where: {
        is_active: true,
        health_insurance: { [Op.ne]: null }
      },
      attributes: [
        'health_insurance',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['health_insurance'],
      order: [[fn('COUNT', col('id')), 'DESC']],
      limit: 10,
      raw: true
    });

    const withInsurance = await Patient.count({
      where: {
        is_active: true,
        health_insurance: { [Op.ne]: null }
      }
    });

    // Novos pacientes por mês (últimos 6 meses)
    const newPatientsByMonth = await Promise.all(
      Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        return Patient.count({
          where: {
            registration_date: {
              [Op.between]: [firstDay, lastDay]
            }
          }
        }).then(count => ({
          month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
          count
        }));
      })
    );

    res.status(200).json({
      success: true,
      data: {
        summary: {
          total,
          active,
          inactive: total - active,
          with_insurance: withInsurance,
          without_insurance: active - withInsurance
        },
        by_gender: byGender,
        by_age: byAge,
        by_insurance: byInsurance,
        new_patients_by_month: newPatientsByMonth.reverse()
      }
    });
  } catch (error) {
    logger.error('Erro ao gerar relatório de pacientes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar relatório de pacientes'
    });
  }
});

/**
 * @route   GET /api/reports/doctors
 * @desc    Relatório de médicos e performance
 * @access  Private (admin)
 */
router.get('/doctors', async (req, res) => {
  try {
    const { date_from, date_to } = req.query;

    // Total de médicos
    const totalDoctors = await Doctor.count({ where: { is_active: true } });

    // Por especialidade
    const bySpecialty = await Doctor.findAll({
      where: { is_active: true },
      attributes: [
        'specialty',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['specialty'],
      order: [[fn('COUNT', col('id')), 'DESC']],
      raw: true
    });

    // Performance dos médicos (se houver filtro de data)
    let doctorPerformance = null;
    if (date_from && date_to) {
      doctorPerformance = await Appointment.findAll({
        where: {
          appointment_date: {
            [Op.between]: [date_from, date_to]
          },
          status: 'completed'
        },
        include: [
          {
            model: Doctor,
            as: 'doctor',
            attributes: ['name', 'specialty']
          }
        ],
        attributes: [
          'doctor_id',
          [fn('COUNT', col('appointments.id')), 'total_appointments'],
          [fn('AVG', col('duration')), 'avg_duration']
        ],
        group: ['doctor_id', 'doctor.id'],
        order: [[fn('COUNT', col('appointments.id')), 'DESC']]
      });
    }

    // Médicos com mais consultas marcadas
    const mostActive = await Appointment.findAll({
      where: date_from && date_to ? {
        appointment_date: {
          [Op.between]: [date_from, date_to]
        }
      } : {},
      include: [
        {
          model: Doctor,
          as: 'doctor',
          attributes: ['name', 'specialty'],
          where: { is_active: true }
        }
      ],
      attributes: [
        'doctor_id',
        [fn('COUNT', col('appointments.id')), 'count']
      ],
      group: ['doctor_id', 'doctor.id'],
      order: [[fn('COUNT', col('appointments.id')), 'DESC']],
      limit: 10
    });

    res.status(200).json({
      success: true,
      data: {
        total_doctors: totalDoctors,
        by_specialty: bySpecialty,
        most_active: mostActive,
        ...(doctorPerformance && {
          performance: {
            period: { date_from, date_to },
            data: doctorPerformance
          }
        })
      }
    });
  } catch (error) {
    logger.error('Erro ao gerar relatório de médicos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar relatório de médicos'
    });
  }
});

/**
 * @route   GET /api/reports/medical-records
 * @desc    Relatório de prontuários
 * @access  Private (admin)
 */
router.get(
  '/medical-records',
  validate(dateRangeSchema, 'query'),
  async (req, res) => {
    try {
      const { date_from, date_to } = req.query;

      // Total de prontuários
      const total = await MedicalRecord.count({
        where: {
          consultation_date: {
            [Op.between]: [date_from, date_to]
          }
        }
      });

      // Por status
      const byStatus = await MedicalRecord.findAll({
        where: {
          consultation_date: {
            [Op.between]: [date_from, date_to]
          }
        },
        attributes: [
          'record_status',
          [fn('COUNT', col('id')), 'count']
        ],
        group: ['record_status'],
        raw: true
      });

      // Diagnósticos mais comuns
      const commonDiagnoses = await MedicalRecord.findAll({
        where: {
          consultation_date: {
            [Op.between]: [date_from, date_to]
          },
          diagnosis_primary: { [Op.ne]: null }
        },
        attributes: [
          'diagnosis_primary',
          [fn('COUNT', col('id')), 'count']
        ],
        group: ['diagnosis_primary'],
        order: [[fn('COUNT', col('id')), 'DESC']],
        limit: 10,
        raw: true
      });

      res.status(200).json({
        success: true,
        data: {
          period: { date_from, date_to },
          total,
          by_status: byStatus,
          common_diagnoses: commonDiagnoses
        }
      });
    } catch (error) {
      logger.error('Erro ao gerar relatório de prontuários:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao gerar relatório'
      });
    }
  }
);

/**
 * @route   GET /api/reports/export
 * @desc    Exportar relatório em formato CSV/JSON
 * @access  Private (admin)
 */
router.get('/export', async (req, res) => {
  try {
    const { type, format = 'json' } = req.query;

    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de relatório é obrigatório'
      });
    }

    // Aqui você pode implementar a lógica de exportação
    // Por enquanto, retornamos uma mensagem

    res.status(200).json({
      success: true,
      message: `Exportação de ${type} em formato ${format} será implementada`,
      data: {
        type,
        format,
        note: 'Funcionalidade em desenvolvimento'
      }
    });
  } catch (error) {
    logger.error('Erro ao exportar relatório:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao exportar relatório'
    });
  }
});

module.exports = router;

/**
 * DOCUMENTAÇÃO DAS ROTAS:
 * 
 * GET /api/reports/dashboard           - Dashboard geral com KPIs
 * GET /api/reports/appointments        - Relatório de agendamentos
 * GET /api/reports/financial           - Relatório financeiro
 * GET /api/reports/patients            - Relatório de pacientes
 * GET /api/reports/doctors             - Relatório de médicos
 * GET /api/reports/medical-records     - Relatório de prontuários
 * GET /api/reports/export              - Exportar relatórios
 * 
 * ACESSO:
 * - Todas as rotas requerem role 'admin'
 * 
 * DASHBOARD INCLUI:
 * - Totais gerais (pacientes, médicos, usuários)
 * - Agendamentos do dia e do mês
 * - Receita do mês
 * - Pagamentos pendentes e vencidos
 * - Próximos agendamentos (7 dias)
 * - Novos pacientes do mês
 * 
 * RELATÓRIOS POR PERÍODO:
 * - Agendamentos: por status, médico, especialidade, tipo
 * - Financeiro: receita, métodos de pagamento, por médico
 * - Prontuários: por status, diagnósticos mais comuns
 * 
 * EXEMPLO DE USO:
 * GET /api/reports/dashboard
 * GET /api/reports/appointments?date_from=2025-01-01&date_to=2025-12-31
 * GET /api/reports/financial?date_from=2025-10-01&date_to=2025-10-31
 */