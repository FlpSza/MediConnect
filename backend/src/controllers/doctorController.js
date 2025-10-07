const { Op } = require('sequelize');
const Doctor = require('../models/Doctor');
const logger = require('../utils/logger');

/**
 * Listar todos os médicos
 * GET /api/doctors
 */
const getAllDoctors = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      specialty,
      is_active 
    } = req.query;

    const offset = (page - 1) * limit;

    // Construir filtros
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { crm: { [Op.like]: `%${search}%` } },
        { cpf: { [Op.like]: `%${search}%` } }
      ];
    }

    if (specialty) {
      where.specialty = { [Op.like]: `%${specialty}%` };
    }

    if (is_active !== undefined) {
      where.is_active = is_active === 'true';
    }

    // Buscar médicos com paginação
    const { count, rows: doctors } = await Doctor.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: doctors,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Erro ao listar médicos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar médicos'
    });
  }
};

/**
 * Obter médico por ID
 * GET /api/doctors/:id
 */
const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findByPk(id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Médico não encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    logger.error('Erro ao buscar médico:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar médico'
    });
  }
};

/**
 * Criar novo médico
 * POST /api/doctors
 */
const createDoctor = async (req, res) => {
  try {
    const doctorData = req.body;

    // Verificar se CRM já existe
    const existingCRM = await Doctor.findOne({ 
      where: { 
        crm: doctorData.crm,
        crm_state: doctorData.crm_state
      } 
    });

    if (existingCRM) {
      return res.status(409).json({
        success: false,
        message: 'CRM já cadastrado'
      });
    }

    // Verificar se CPF já existe
    const existingCPF = await Doctor.findOne({ 
      where: { cpf: doctorData.cpf } 
    });

    if (existingCPF) {
      return res.status(409).json({
        success: false,
        message: 'CPF já cadastrado'
      });
    }

    // Criar médico
    const doctor = await Doctor.create(doctorData);

    logger.info(`Médico ${doctor.name} criado com sucesso por ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Médico criado com sucesso',
      data: doctor
    });
  } catch (error) {
    logger.error('Erro ao criar médico:', error);
    
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
      message: 'Erro ao criar médico'
    });
  }
};

/**
 * Atualizar médico
 * PUT /api/doctors/:id
 */
const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const doctor = await Doctor.findByPk(id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Médico não encontrado'
      });
    }

    // Verificar duplicidade de CRM se estiver sendo atualizado
    if ((updateData.crm || updateData.crm_state) && 
        (updateData.crm !== doctor.crm || updateData.crm_state !== doctor.crm_state)) {
      const existingCRM = await Doctor.findOne({ 
        where: { 
          crm: updateData.crm || doctor.crm,
          crm_state: updateData.crm_state || doctor.crm_state,
          id: { [Op.ne]: id }
        } 
      });

      if (existingCRM) {
        return res.status(409).json({
          success: false,
          message: 'CRM já cadastrado para outro médico'
        });
      }
    }

    // Verificar duplicidade de CPF se estiver sendo atualizado
    if (updateData.cpf && updateData.cpf !== doctor.cpf) {
      const existingCPF = await Doctor.findOne({ 
        where: { 
          cpf: updateData.cpf,
          id: { [Op.ne]: id }
        } 
      });

      if (existingCPF) {
        return res.status(409).json({
          success: false,
          message: 'CPF já cadastrado para outro médico'
        });
      }
    }

    // Atualizar médico
    await doctor.update(updateData);

    logger.info(`Médico ${doctor.name} atualizado por ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Médico atualizado com sucesso',
      data: doctor
    });
  } catch (error) {
    logger.error('Erro ao atualizar médico:', error);
    
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
      message: 'Erro ao atualizar médico'
    });
  }
};

/**
 * Deletar médico (soft delete)
 * DELETE /api/doctors/:id
 */
const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findByPk(id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Médico não encontrado'
      });
    }

    // Soft delete - apenas desativa
    await doctor.update({ is_active: false });

    logger.info(`Médico ${doctor.name} desativado por ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Médico desativado com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao deletar médico:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar médico'
    });
  }
};

/**
 * Obter especialidades únicas
 * GET /api/doctors/specialties
 */
const getSpecialties = async (req, res) => {
  try {
    const specialties = await Doctor.findAll({
      attributes: [[require('sequelize').fn('DISTINCT', require('sequelize').col('specialty')), 'specialty']],
      where: { is_active: true },
      order: [['specialty', 'ASC']],
      raw: true
    });

    res.status(200).json({
      success: true,
      data: specialties.map(s => s.specialty)
    });
  } catch (error) {
    logger.error('Erro ao listar especialidades:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar especialidades'
    });
  }
};

/**
 * Atualizar horários de atendimento
 * PUT /api/doctors/:id/working-hours
 */
const updateWorkingHours = async (req, res) => {
  try {
    const { id } = req.params;
    const { working_hours } = req.body;

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
    logger.error('Erro ao atualizar horários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar horários'
    });
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getSpecialties,
  updateWorkingHours
};