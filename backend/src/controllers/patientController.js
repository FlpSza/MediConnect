const { Op } = require('sequelize');
const Patient = require('../models/Patient');
const { Appointment } = require('../models');
const logger = require('../utils/logger');

/**
 * Listar todos os pacientes com filtros
 * GET /api/patients
 * @access Private
 */
const getAllPatients = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      is_active,
      health_insurance,
      gender,
      sort_by = 'name',
      sort_order = 'ASC'
    } = req.query;

    const offset = (page - 1) * limit;

    // Construir filtros
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { cpf: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    if (is_active !== undefined) {
      where.is_active = is_active === 'true';
    }

    if (health_insurance) {
      where.health_insurance = { [Op.like]: `%${health_insurance}%` };
    }

    if (gender) {
      where.gender = gender;
    }

    // Buscar pacientes com paginação
    const { count, rows: patients } = await Patient.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sort_by, sort_order.toUpperCase()]]
    });

    res.status(200).json({
      success: true,
      data: patients,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Erro ao listar pacientes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar pacientes'
    });
  }
};

/**
 * Obter paciente por ID
 * GET /api/patients/:id
 * @access Private
 */
const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByPk(id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente não encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    logger.error('Erro ao buscar paciente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar paciente'
    });
  }
};

/**
 * Buscar paciente por CPF
 * GET /api/patients/cpf/:cpf
 * @access Private
 */
const getPatientByCPF = async (req, res) => {
  try {
    const { cpf } = req.params;

    const patient = await Patient.findOne({ where: { cpf } });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente não encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    logger.error('Erro ao buscar paciente por CPF:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar paciente'
    });
  }
};

/**
 * Criar novo paciente
 * POST /api/patients
 * @access Private (admin, receptionist)
 */
const createPatient = async (req, res) => {
  try {
    const patientData = req.body;

    // Verificar se CPF já existe
    const existingPatient = await Patient.findOne({ 
      where: { cpf: patientData.cpf } 
    });

    if (existingPatient) {
      return res.status(409).json({
        success: false,
        message: 'CPF já cadastrado'
      });
    }

    // Verificar se email já existe (se fornecido)
    if (patientData.email) {
      const existingEmail = await Patient.findOne({ 
        where: { email: patientData.email } 
      });

      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: 'Email já cadastrado'
        });
      }
    }

    // Criar paciente
    const patient = await Patient.create(patientData);

    logger.info(`Paciente ${patient.name} (CPF: ${patient.cpf}) criado com sucesso por ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Paciente criado com sucesso',
      data: patient
    });
  } catch (error) {
    logger.error('Erro ao criar paciente:', error);
    
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

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'CPF ou email já cadastrado'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro ao criar paciente'
    });
  }
};

/**
 * Atualizar paciente
 * PUT /api/patients/:id
 * @access Private (admin, receptionist)
 */
const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const patient = await Patient.findByPk(id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente não encontrado'
      });
    }

    // Se estiver atualizando CPF, verificar duplicidade
    if (updateData.cpf && updateData.cpf !== patient.cpf) {
      const existingPatient = await Patient.findOne({ 
        where: { 
          cpf: updateData.cpf,
          id: { [Op.ne]: id }
        } 
      });

      if (existingPatient) {
        return res.status(409).json({
          success: false,
          message: 'CPF já cadastrado para outro paciente'
        });
      }
    }

    // Se estiver atualizando email, verificar duplicidade
    if (updateData.email && updateData.email !== patient.email) {
      const existingEmail = await Patient.findOne({ 
        where: { 
          email: updateData.email,
          id: { [Op.ne]: id }
        } 
      });

      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: 'Email já cadastrado para outro paciente'
        });
      }
    }

    // Atualizar paciente
    await patient.update(updateData);

    logger.info(`Paciente ${patient.name} atualizado por ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Paciente atualizado com sucesso',
      data: patient
    });
  } catch (error) {
    logger.error('Erro ao atualizar paciente:', error);
    
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
      message: 'Erro ao atualizar paciente'
    });
  }
};

/**
 * Deletar paciente (soft delete)
 * DELETE /api/patients/:id
 * @access Private (admin)
 */
const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByPk(id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente não encontrado'
      });
    }

    // Verificar se paciente tem agendamentos futuros
    const futureAppointments = await Appointment.count({
      where: {
        patient_id: id,
        appointment_date: {
          [Op.gte]: new Date()
        },
        status: {
          [Op.notIn]: ['cancelled', 'completed', 'no_show']
        }
      }
    });

    if (futureAppointments > 0) {
      return res.status(400).json({
        success: false,
        message: `Paciente possui ${futureAppointments} agendamento(s) futuro(s). Cancele-os antes de desativar o paciente.`
      });
    }

    // Soft delete - apenas desativa
    await patient.update({ is_active: false });

    logger.info(`Paciente ${patient.name} desativado por ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Paciente desativado com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao deletar paciente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar paciente'
    });
  }
};

/**
 * Reativar paciente
 * PATCH /api/patients/:id/reactivate
 * @access Private (admin)
 */
const reactivatePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByPk(id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente não encontrado'
      });
    }

    if (patient.is_active) {
      return res.status(400).json({
        success: false,
        message: 'Paciente já está ativo'
      });
    }

    await patient.update({ is_active: true });

    logger.info(`Paciente ${patient.name} reativado por ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Paciente reativado com sucesso',
      data: patient
    });
  } catch (error) {
    logger.error('Erro ao reativar paciente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao reativar paciente'
    });
  }
};

/**
 * Obter histórico de consultas do paciente
 * GET /api/patients/:id/appointments
 * @access Private
 */
const getPatientAppointments = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, date_from, date_to, page = 1, limit = 20 } = req.query;

    const patient = await Patient.findByPk(id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente não encontrado'
      });
    }

    const where = { patient_id: id };
    
    if (status) {
      where.status = status;
    }

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

    const offset = (page - 1) * limit;

    const { count, rows: appointments } = await Appointment.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: require('../models/Doctor'),
          as: 'doctor',
          attributes: ['id', 'name', 'crm', 'specialty']
        }
      ],
      order: [['appointment_date', 'DESC'], ['appointment_time', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: {
        patient: {
          id: patient.id,
          name: patient.name,
          cpf: patient.cpf
        },
        appointments,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Erro ao buscar histórico de consultas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar histórico de consultas'
    });
  }
};

/**
 * Obter estatísticas do paciente
 * GET /api/patients/:id/stats
 * @access Private
 */
const getPatientStats = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByPk(id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Paciente não encontrado'
      });
    }

    // Total de consultas
    const totalAppointments = await Appointment.count({
      where: { patient_id: id }
    });

    // Consultas por status
    const appointmentsByStatus = await Appointment.findAll({
      where: { patient_id: id },
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', 'id'), 'count']
      ],
      group: ['status'],
      raw: true
    });

    // Última consulta
    const lastAppointment = await Appointment.findOne({
      where: { 
        patient_id: id,
        status: 'completed'
      },
      order: [['appointment_date', 'DESC'], ['appointment_time', 'DESC']],
      include: [
        {
          model: require('../models/Doctor'),
          as: 'doctor',
          attributes: ['id', 'name', 'specialty']
        }
      ]
    });

    // Próxima consulta
    const nextAppointment = await Appointment.findOne({
      where: { 
        patient_id: id,
        appointment_date: {
          [Op.gte]: new Date()
        },
        status: {
          [Op.in]: ['scheduled', 'confirmed']
        }
      },
      order: [['appointment_date', 'ASC'], ['appointment_time', 'ASC']],
      include: [
        {
          model: require('../models/Doctor'),
          as: 'doctor',
          attributes: ['id', 'name', 'specialty']
        }
      ]
    });

    // Total gasto
    const totalSpent = await Appointment.sum('price', {
      where: {
        patient_id: id,
        payment_status: 'paid'
      }
    });

    res.status(200).json({
      success: true,
      data: {
        patient: {
          id: patient.id,
          name: patient.name,
          cpf: patient.cpf,
          age: patient.getAge()
        },
        stats: {
          total_appointments: totalAppointments,
          by_status: appointmentsByStatus,
          last_appointment: lastAppointment,
          next_appointment: nextAppointment,
          total_spent: totalSpent || 0
        }
      }
    });
  } catch (error) {
    logger.error('Erro ao buscar estatísticas do paciente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas'
    });
  }
};

/**
 * Buscar pacientes por convênio
 * GET /api/patients/by-insurance/:insurance
 * @access Private
 */
const getPatientsByInsurance = async (req, res) => {
  try {
    const { insurance } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const { count, rows: patients } = await Patient.findAndCountAll({
      where: {
        health_insurance: { [Op.like]: `%${insurance}%` },
        is_active: true
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: patients,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Erro ao buscar pacientes por convênio:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar pacientes'
    });
  }
};

module.exports = {
  getAllPatients,
  getPatientById,
  getPatientByCPF,
  createPatient,
  updatePatient,
  deletePatient,
  reactivatePatient,
  getPatientAppointments,
  getPatientStats,
  getPatientsByInsurance
};