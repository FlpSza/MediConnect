const { Op } = require('sequelize');
const { Appointment, Patient, Doctor, User } = require('../models');
const logger = require('../utils/logger');

/**
 * Listar todos os agendamentos com filtros avançados
 * GET /api/appointments
 * @access Private
 */
const getAllAppointments = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20,
      doctor_id,
      patient_id,
      status,
      date_from,
      date_to,
      date, // Data específica
      payment_status,
      sort_by = 'appointment_date',
      sort_order = 'ASC'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Aplicar filtros
    if (doctor_id) where.doctor_id = doctor_id;
    if (patient_id) where.patient_id = patient_id;
    if (status) where.status = status;
    if (payment_status) where.payment_status = payment_status;

    // Filtro por data específica
    if (date) {
      where.appointment_date = date;
    }

    // Filtro por intervalo de datas
    if (date_from && date_to) {
      where.appointment_date = {
        [Op.between]: [date_from, date_to]
      };
    } else if (date_from) {
      where.appointment_date = {
        [Op.gte]: date_from
      };
    } else if (date_to) {
      where.appointment_date = {
        [Op.lte]: date_to
      };
    }

    // Buscar agendamentos com paginação
    const { count, rows: appointments } = await Appointment.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['id', 'name', 'cpf', 'phone', 'email', 'health_insurance']
        },
        {
          model: Doctor,
          as: 'doctor',
          attributes: ['id', 'name', 'crm', 'crm_state', 'specialty', 'phone']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [
        [sort_by, sort_order.toUpperCase()],
        ['appointment_time', 'ASC']
      ]
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
    logger.error('Erro ao listar agendamentos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar agendamentos'
    });
  }
};

/**
 * Obter agendamento por ID
 * GET /api/appointments/:id
 * @access Private
 */
const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByPk(id, {
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
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'canceller',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Agendamento não encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    logger.error('Erro ao buscar agendamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar agendamento'
    });
  }
};

/**
 * Criar novo agendamento
 * POST /api/appointments
 * @access Private (admin, receptionist)
 */
const createAppointment = async (req, res) => {
  try {
    const { 
      patient_id, 
      doctor_id, 
      appointment_date, 
      appointment_time,
      duration,
      appointment_type,
      reason,
      notes,
      price,
      payment_method,
      health_insurance_authorization
    } = req.body;

    // Verificar se médico existe e está ativo
    const doctor = await Doctor.findByPk(doctor_id);
    if (!doctor || !doctor.is_active) {
      return res.status(404).json({
        success: false,
        message: 'Médico não encontrado ou inativo'
      });
    }

    // Verificar se paciente existe e está ativo
    const patient = await Patient.findByPk(patient_id);
    if (!patient || !patient.is_active) {
      return res.status(404).json({
        success: false,
        message: 'Paciente não encontrado ou inativo'
      });
    }

    // Verificar se já existe agendamento no mesmo horário para o médico
    const existingAppointment = await Appointment.findOne({
      where: {
        doctor_id,
        appointment_date,
        appointment_time,
        status: {
          [Op.notIn]: ['cancelled', 'no_show']
        }
      }
    });

    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        message: 'Já existe um agendamento para este médico neste horário'
      });
    }

    // Verificar se o dia da semana está nos horários de trabalho do médico
    const appointmentDay = new Date(appointment_date).getDay();
    const daysMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = daysMap[appointmentDay];

    if (doctor.working_hours && doctor.working_hours[dayName]) {
      if (!doctor.working_hours[dayName].active) {
        return res.status(400).json({
          success: false,
          message: `Médico não atende às ${dayName}s`
        });
      }
    }

    // Criar agendamento
    const appointment = await Appointment.create({
      patient_id,
      doctor_id,
      appointment_date,
      appointment_time,
      duration: duration || doctor.consultation_duration || 30,
      status: 'scheduled',
      appointment_type: appointment_type || 'first_visit',
      reason,
      notes,
      price: price || doctor.consultation_price,
      payment_status: 'pending',
      payment_method,
      health_insurance_authorization,
      created_by: req.user.id
    });

    // Buscar agendamento completo com relacionamentos
    const fullAppointment = await Appointment.findByPk(appointment.id, {
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['id', 'name', 'cpf', 'phone', 'health_insurance']
        },
        {
          model: Doctor,
          as: 'doctor',
          attributes: ['id', 'name', 'crm', 'specialty']
        }
      ]
    });

    logger.info(`Agendamento criado por ${req.user.email} - Paciente: ${patient.name}, Médico: ${doctor.name}, Data: ${appointment_date} ${appointment_time}`);

    res.status(201).json({
      success: true,
      message: 'Agendamento criado com sucesso',
      data: fullAppointment
    });
  } catch (error) {
    logger.error('Erro ao criar agendamento:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Erro de validação',
        errors: error.errors.map(e => ({
          field: e.path,
          message: e.message
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro ao criar agendamento'
    });
  }
};

/**
 * Atualizar agendamento
 * PUT /api/appointments/:id
 * @access Private (admin, receptionist)
 */
const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const appointment = await Appointment.findByPk(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Agendamento não encontrado'
      });
    }

    // Não permitir atualizar agendamentos completados ou cancelados
    if (['completed', 'cancelled'].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível atualizar agendamento completado ou cancelado'
      });
    }

    // Se mudou horário ou médico, verificar conflito
    if (updateData.appointment_date || updateData.appointment_time || updateData.doctor_id) {
      const checkDate = updateData.appointment_date || appointment.appointment_date;
      const checkTime = updateData.appointment_time || appointment.appointment_time;
      const checkDoctor = updateData.doctor_id || appointment.doctor_id;

      const conflict = await Appointment.findOne({
        where: {
          doctor_id: checkDoctor,
          appointment_date: checkDate,
          appointment_time: checkTime,
          id: { [Op.ne]: id },
          status: { [Op.notIn]: ['cancelled', 'no_show'] }
        }
      });

      if (conflict) {
        return res.status(409).json({
          success: false,
          message: 'Já existe um agendamento neste horário'
        });
      }
    }

    // Atualizar agendamento
    await appointment.update(updateData);

    // Buscar agendamento atualizado com relacionamentos
    const updated = await Appointment.findByPk(id, {
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['id', 'name', 'cpf', 'phone']
        },
        {
          model: Doctor,
          as: 'doctor',
          attributes: ['id', 'name', 'crm', 'specialty']
        }
      ]
    });

    logger.info(`Agendamento ${id} atualizado por ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Agendamento atualizado com sucesso',
      data: updated
    });
  } catch (error) {
    logger.error('Erro ao atualizar agendamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar agendamento'
    });
  }
};

/**
 * Cancelar agendamento
 * PATCH /api/appointments/:id/cancel
 * @access Private (admin, receptionist)
 */
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancellation_reason } = req.body;

    const appointment = await Appointment.findByPk(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Agendamento não encontrado'
      });
    }

    if (!appointment.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: 'Este agendamento não pode ser cancelado'
      });
    }

    await appointment.update({
      status: 'cancelled',
      cancellation_reason: cancellation_reason || 'Não informado',
      cancelled_at: new Date(),
      cancelled_by: req.user.id
    });

    logger.info(`Agendamento ${id} cancelado por ${req.user.email} - Motivo: ${cancellation_reason}`);

    res.status(200).json({
      success: true,
      message: 'Agendamento cancelado com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao cancelar agendamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao cancelar agendamento'
    });
  }
};

/**
 * Confirmar agendamento
 * PATCH /api/appointments/:id/confirm
 * @access Private
 */
const confirmAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByPk(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Agendamento não encontrado'
      });
    }

    if (appointment.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'Apenas agendamentos pendentes podem ser confirmados'
      });
    }

    await appointment.update({
      status: 'confirmed',
      confirmed_at: new Date()
    });

    logger.info(`Agendamento ${id} confirmado por ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Agendamento confirmado com sucesso',
      data: appointment
    });
  } catch (error) {
    logger.error('Erro ao confirmar agendamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao confirmar agendamento'
    });
  }
};

/**
 * Marcar como em andamento
 * PATCH /api/appointments/:id/start
 * @access Private (admin, doctor)
 */
const startAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByPk(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Agendamento não encontrado'
      });
    }

    if (!['scheduled', 'confirmed'].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: 'Este agendamento não pode ser iniciado'
      });
    }

    await appointment.update({
      status: 'in_progress'
    });

    logger.info(`Agendamento ${id} iniciado por ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Consulta iniciada com sucesso',
      data: appointment
    });
  } catch (error) {
    logger.error('Erro ao iniciar consulta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao iniciar consulta'
    });
  }
};

/**
 * Marcar agendamento como concluído
 * PATCH /api/appointments/:id/complete
 * @access Private (admin, doctor)
 */
const completeAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByPk(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Agendamento não encontrado'
      });
    }

    if (!['in_progress', 'confirmed', 'scheduled'].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: 'Este agendamento não pode ser concluído'
      });
    }

    await appointment.update({
      status: 'completed',
      completed_at: new Date()
    });

    logger.info(`Agendamento ${id} concluído por ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Consulta concluída com sucesso',
      data: appointment
    });
  } catch (error) {
    logger.error('Erro ao concluir consulta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao concluir consulta'
    });
  }
};

/**
 * Marcar como falta (no-show)
 * PATCH /api/appointments/:id/no-show
 * @access Private (admin, receptionist)
 */
const markAsNoShow = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByPk(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Agendamento não encontrado'
      });
    }

    if (!['scheduled', 'confirmed'].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: 'Apenas agendamentos agendados podem ser marcados como falta'
      });
    }

    await appointment.update({
      status: 'no_show'
    });

    logger.info(`Agendamento ${id} marcado como falta por ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Agendamento marcado como falta',
      data: appointment
    });
  } catch (error) {
    logger.error('Erro ao marcar falta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao marcar falta'
    });
  }
};

/**
 * Obter horários disponíveis de um médico em uma data
 * GET /api/appointments/doctor/:doctor_id/available-slots
 * @access Private
 */
const getAvailableSlots = async (req, res) => {
  try {
    const { doctor_id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Data é obrigatória'
      });
    }

    // Buscar médico
    const doctor = await Doctor.findByPk(doctor_id);
    if (!doctor || !doctor.is_active) {
      return res.status(404).json({
        success: false,
        message: 'Médico não encontrado ou inativo'
      });
    }

    // Verificar dia da semana
    const appointmentDay = new Date(date).getDay();
    const daysMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = daysMap[appointmentDay];

    // Verificar se médico atende neste dia
    if (!doctor.working_hours || !doctor.working_hours[dayName] || !doctor.working_hours[dayName].active) {
      return res.status(200).json({
        success: true,
        message: 'Médico não atende neste dia',
        data: {
          date,
          day: dayName,
          available_slots: [],
          working: false
        }
      });
    }

    // Buscar agendamentos do médico na data
    const appointments = await Appointment.findAll({
      where: {
        doctor_id,
        appointment_date: date,
        status: { [Op.notIn]: ['cancelled', 'no_show'] }
      },
      attributes: ['appointment_time', 'duration'],
      order: [['appointment_time', 'ASC']]
    });

    // Gerar horários ocupados
    const busySlots = appointments.map(apt => ({
      time: apt.appointment_time,
      duration: apt.duration
    }));

    res.status(200).json({
      success: true,
      data: {
        date,
        day: dayName,
        working_hours: doctor.working_hours[dayName],
        consultation_duration: doctor.consultation_duration,
        busy_slots: busySlots,
        working: true
      }
    });
  } catch (error) {
    logger.error('Erro ao buscar horários disponíveis:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar horários disponíveis'
    });
  }
};

/**
 * Obter estatísticas de agendamentos
 * GET /api/appointments/stats
 * @access Private (admin)
 */
const getAppointmentStats = async (req, res) => {
  try {
    const { date_from, date_to } = req.query;
    
    const where = {};
    if (date_from && date_to) {
      where.appointment_date = {
        [Op.between]: [date_from, date_to]
      };
    }

    // Total de agendamentos
    const total = await Appointment.count({ where });

    // Agendamentos por status
    const byStatus = await Appointment.findAll({
      where,
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', 'id'), 'count']
      ],
      group: ['status'],
      raw: true
    });

    // Agendamentos por tipo
    const byType = await Appointment.findAll({
      where,
      attributes: [
        'appointment_type',
        [require('sequelize').fn('COUNT', 'id'), 'count']
      ],
      group: ['appointment_type'],
      raw: true
    });

    // Total de receita (apenas pagos)
    const revenue = await Appointment.sum('price', {
      where: {
        ...where,
        payment_status: 'paid'
      }
    });

    res.status(200).json({
      success: true,
      data: {
        total,
        by_status: byStatus,
        by_type: byType,
        revenue: revenue || 0
      }
    });
  } catch (error) {
    logger.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas'
    });
  }
};

module.exports = {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  confirmAppointment,
  startAppointment,
  completeAppointment,
  markAsNoShow,
  getAvailableSlots,
  getAppointmentStats
};