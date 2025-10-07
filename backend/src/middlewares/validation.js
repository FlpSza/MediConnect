const Joi = require('joi');
const logger = require('../utils/logger');

/**
 * Middleware genérico para validação com Joi
 * @param {Joi.Schema} schema - Schema Joi para validação
 * @param {string} property - Propriedade do request a validar (body, query, params)
 * @returns {Function} Middleware function
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Retorna todos os erros, não apenas o primeiro
      stripUnknown: true, // Remove campos desconhecidos
      convert: true // Converte tipos automaticamente
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, ''),
        type: detail.type
      }));

      logger.warn('Erro de validação:', {
        property,
        errors,
        url: req.originalUrl
      });

      return res.status(400).json({
        success: false,
        message: 'Erro de validação',
        code: 'VALIDATION_ERROR',
        errors
      });
    }

    // Substitui o valor original pelo valor validado e sanitizado
    req[property] = value;
    next();
  };
};

/**
 * Validadores customizados
 */

// Validador de CPF brasileiro
const cpfValidator = (value, helpers) => {
  // Remove caracteres não numéricos
  const cpf = value.replace(/[^\d]/g, '');
  
  if (cpf.length !== 11) {
    return helpers.error('any.invalid');
  }

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cpf)) {
    return helpers.error('any.invalid');
  }

  // Validação dos dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cpf.charAt(9))) {
    return helpers.error('any.invalid');
  }

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cpf.charAt(10))) {
    return helpers.error('any.invalid');
  }

  return value;
};

// Validador de telefone brasileiro
const phoneValidator = (value, helpers) => {
  const phone = value.replace(/[^\d]/g, '');
  
  // Aceita 10 ou 11 dígitos (com ou sem 9 na frente)
  if (phone.length !== 10 && phone.length !== 11) {
    return helpers.error('any.invalid');
  }
  
  return value;
};

/**
 * Schemas de validação para autenticação
 */

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email inválido',
      'any.required': 'Email é obrigatório',
      'string.empty': 'Email não pode estar vazio'
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Senha deve ter no mínimo 6 caracteres',
      'any.required': 'Senha é obrigatória',
      'string.empty': 'Senha não pode estar vazia'
    })
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email inválido',
      'any.required': 'Email é obrigatório'
    })
});

const resetPasswordSchema = Joi.object({
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Senha deve ter no mínimo 6 caracteres',
      'any.required': 'Senha é obrigatória'
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'As senhas não coincidem',
      'any.required': 'Confirmação de senha é obrigatória'
    })
});

const changePasswordSchema = Joi.object({
  current_password: Joi.string()
    .required()
    .messages({
      'any.required': 'Senha atual é obrigatória'
    }),
  new_password: Joi.string()
    .min(6)
    .required()
    .invalid(Joi.ref('current_password'))
    .messages({
      'string.min': 'Nova senha deve ter no mínimo 6 caracteres',
      'any.required': 'Nova senha é obrigatória',
      'any.invalid': 'Nova senha deve ser diferente da senha atual'
    })
});

/**
 * Schemas de validação para usuários
 */

const createUserSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.min': 'Nome deve ter no mínimo 3 caracteres',
      'string.max': 'Nome deve ter no máximo 100 caracteres',
      'any.required': 'Nome é obrigatório'
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email inválido',
      'any.required': 'Email é obrigatório'
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Senha deve ter no mínimo 6 caracteres',
      'any.required': 'Senha é obrigatória'
    }),
  role: Joi.string()
    .valid('admin', 'doctor', 'receptionist')
    .default('receptionist')
    .messages({
      'any.only': 'Role deve ser admin, doctor ou receptionist'
    }),
  phone: Joi.string()
    .custom(phoneValidator)
    .allow(null, '')
    .messages({
      'any.invalid': 'Telefone inválido'
    })
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(3).max(100),
  email: Joi.string().email(),
  phone: Joi.string().custom(phoneValidator).allow(null, ''),
  role: Joi.string().valid('admin', 'doctor', 'receptionist'),
  is_active: Joi.boolean()
}).min(1);

/**
 * Schemas de validação para pacientes
 */

const createPatientSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.min': 'Nome deve ter no mínimo 3 caracteres',
      'any.required': 'Nome é obrigatório'
    }),
  cpf: Joi.string()
    .custom(cpfValidator)
    .required()
    .messages({
      'any.invalid': 'CPF inválido',
      'any.required': 'CPF é obrigatório'
    }),
  birth_date: Joi.date()
    .iso()
    .max('now')
    .required()
    .messages({
      'date.max': 'Data de nascimento não pode ser futura',
      'any.required': 'Data de nascimento é obrigatória'
    }),
  gender: Joi.string()
    .valid('male', 'female', 'other')
    .required()
    .messages({
      'any.only': 'Gênero deve ser male, female ou other',
      'any.required': 'Gênero é obrigatório'
    }),
  email: Joi.string()
    .email()
    .allow(null, '')
    .messages({
      'string.email': 'Email inválido'
    }),
  phone: Joi.string()
    .custom(phoneValidator)
    .required()
    .messages({
      'any.invalid': 'Telefone inválido',
      'any.required': 'Telefone é obrigatório'
    }),
  phone_secondary: Joi.string()
    .custom(phoneValidator)
    .allow(null, '')
    .messages({
      'any.invalid': 'Telefone secundário inválido'
    }),
  // Endereço
  address_street: Joi.string().max(200).allow(null, ''),
  address_number: Joi.string().max(10).allow(null, ''),
  address_complement: Joi.string().max(100).allow(null, ''),
  address_neighborhood: Joi.string().max(100).allow(null, ''),
  address_city: Joi.string().max(100).allow(null, ''),
  address_state: Joi.string().length(2).uppercase().allow(null, ''),
  address_zip: Joi.string()
    .pattern(/^\d{5}-?\d{3}$/)
    .allow(null, '')
    .messages({
      'string.pattern.base': 'CEP inválido. Use o formato 12345-678'
    }),
  // Informações médicas
  health_insurance: Joi.string().max(100).allow(null, ''),
  health_insurance_number: Joi.string().max(50).allow(null, ''),
  blood_type: Joi.string()
    .valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
    .allow(null, ''),
  allergies: Joi.string().allow(null, ''),
  chronic_diseases: Joi.string().allow(null, ''),
  medications: Joi.string().allow(null, ''),
  medical_notes: Joi.string().allow(null, ''),
  // Contato de emergência
  emergency_contact_name: Joi.string().max(100).allow(null, ''),
  emergency_contact_phone: Joi.string()
    .custom(phoneValidator)
    .allow(null, '')
    .messages({
      'any.invalid': 'Telefone de emergência inválido'
    }),
  emergency_contact_relationship: Joi.string().max(50).allow(null, '')
});

const updatePatientSchema = Joi.object({
  name: Joi.string().min(3).max(100),
  cpf: Joi.string().custom(cpfValidator),
  birth_date: Joi.date().iso().max('now'),
  gender: Joi.string().valid('male', 'female', 'other'),
  email: Joi.string().email().allow(null, ''),
  phone: Joi.string().custom(phoneValidator),
  phone_secondary: Joi.string().custom(phoneValidator).allow(null, ''),
  address_street: Joi.string().max(200).allow(null, ''),
  address_number: Joi.string().max(10).allow(null, ''),
  address_complement: Joi.string().max(100).allow(null, ''),
  address_neighborhood: Joi.string().max(100).allow(null, ''),
  address_city: Joi.string().max(100).allow(null, ''),
  address_state: Joi.string().length(2).uppercase().allow(null, ''),
  address_zip: Joi.string().pattern(/^\d{5}-?\d{3}$/).allow(null, ''),
  health_insurance: Joi.string().max(100).allow(null, ''),
  health_insurance_number: Joi.string().max(50).allow(null, ''),
  blood_type: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').allow(null, ''),
  allergies: Joi.string().allow(null, ''),
  chronic_diseases: Joi.string().allow(null, ''),
  medications: Joi.string().allow(null, ''),
  medical_notes: Joi.string().allow(null, ''),
  emergency_contact_name: Joi.string().max(100).allow(null, ''),
  emergency_contact_phone: Joi.string().custom(phoneValidator).allow(null, ''),
  emergency_contact_relationship: Joi.string().max(50).allow(null, ''),
  is_active: Joi.boolean()
}).min(1);

/**
 * Schemas de validação para médicos
 */

const createDoctorSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'any.required': 'Nome é obrigatório'
    }),
  crm: Joi.string()
    .required()
    .messages({
      'any.required': 'CRM é obrigatório'
    }),
  crm_state: Joi.string()
    .length(2)
    .uppercase()
    .required()
    .messages({
      'string.length': 'Estado do CRM deve ter 2 caracteres',
      'any.required': 'Estado do CRM é obrigatório'
    }),
  cpf: Joi.string()
    .custom(cpfValidator)
    .required()
    .messages({
      'any.invalid': 'CPF inválido',
      'any.required': 'CPF é obrigatório'
    }),
  specialty: Joi.string()
    .required()
    .messages({
      'any.required': 'Especialidade é obrigatória'
    }),
  sub_specialties: Joi.array().items(Joi.string()).allow(null),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email inválido',
      'any.required': 'Email é obrigatório'
    }),
  phone: Joi.string()
    .custom(phoneValidator)
    .required()
    .messages({
      'any.invalid': 'Telefone inválido',
      'any.required': 'Telefone é obrigatório'
    }),
  phone_secondary: Joi.string()
    .custom(phoneValidator)
    .allow(null, ''),
  birth_date: Joi.date().iso().max('now').allow(null),
  consultation_price: Joi.number().positive().allow(null),
  consultation_duration: Joi.number().integer().positive().default(30),
  accepts_health_insurance: Joi.boolean().default(true),
  health_insurances: Joi.array().items(Joi.string()).allow(null),
  working_hours: Joi.object().allow(null),
  bio: Joi.string().allow(null, ''),
  formation: Joi.string().allow(null, ''),
  additional_info: Joi.string().allow(null, ''),
  user_id: Joi.string().uuid().allow(null)
});

const updateDoctorSchema = Joi.object({
  name: Joi.string().min(3).max(100),
  crm: Joi.string(),
  crm_state: Joi.string().length(2).uppercase(),
  cpf: Joi.string().custom(cpfValidator),
  specialty: Joi.string(),
  sub_specialties: Joi.array().items(Joi.string()).allow(null),
  email: Joi.string().email(),
  phone: Joi.string().custom(phoneValidator),
  phone_secondary: Joi.string().custom(phoneValidator).allow(null, ''),
  birth_date: Joi.date().iso().max('now').allow(null),
  consultation_price: Joi.number().positive().allow(null),
  consultation_duration: Joi.number().integer().positive(),
  accepts_health_insurance: Joi.boolean(),
  health_insurances: Joi.array().items(Joi.string()).allow(null),
  working_hours: Joi.object().allow(null),
  bio: Joi.string().allow(null, ''),
  formation: Joi.string().allow(null, ''),
  additional_info: Joi.string().allow(null, ''),
  is_active: Joi.boolean()
}).min(1);

/**
 * Schemas de validação para agendamentos
 */

const createAppointmentSchema = Joi.object({
  patient_id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'ID do paciente inválido',
      'any.required': 'ID do paciente é obrigatório'
    }),
  doctor_id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'ID do médico inválido',
      'any.required': 'ID do médico é obrigatório'
    }),
  appointment_date: Joi.date()
    .iso()
    .min('now')
    .required()
    .messages({
      'date.min': 'Data da consulta não pode ser no passado',
      'any.required': 'Data da consulta é obrigatória'
    }),
  appointment_time: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .required()
    .messages({
      'string.pattern.base': 'Horário inválido. Use o formato HH:mm',
      'any.required': 'Horário da consulta é obrigatório'
    }),
  duration: Joi.number()
    .integer()
    .positive()
    .default(30)
    .messages({
      'number.positive': 'Duração deve ser maior que zero'
    }),
  appointment_type: Joi.string()
    .valid('first_visit', 'return', 'follow_up', 'emergency')
    .default('first_visit'),
  reason: Joi.string().allow(null, ''),
  notes: Joi.string().allow(null, ''),
  price: Joi.number().positive().allow(null),
  payment_method: Joi.string()
    .valid('cash', 'credit_card', 'debit_card', 'pix', 'health_insurance')
    .allow(null),
  health_insurance_authorization: Joi.string().allow(null, '')
});

const updateAppointmentSchema = Joi.object({
  appointment_date: Joi.date().iso().min('now'),
  appointment_time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
  duration: Joi.number().integer().positive(),
  status: Joi.string().valid('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'),
  appointment_type: Joi.string().valid('first_visit', 'return', 'follow_up', 'emergency'),
  reason: Joi.string().allow(null, ''),
  notes: Joi.string().allow(null, ''),
  price: Joi.number().positive().allow(null),
  payment_status: Joi.string().valid('pending', 'paid', 'partially_paid', 'refunded'),
  payment_method: Joi.string().valid('cash', 'credit_card', 'debit_card', 'pix', 'health_insurance').allow(null),
  health_insurance_authorization: Joi.string().allow(null, '')
}).min(1);

const cancelAppointmentSchema = Joi.object({
  cancellation_reason: Joi.string()
    .required()
    .messages({
      'any.required': 'Motivo do cancelamento é obrigatório'
    })
});

/**
 * Schemas de validação para parâmetros UUID
 */

const uuidSchema = Joi.object({
  id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'ID inválido',
      'any.required': 'ID é obrigatório'
    })
});

const uuidParamSchema = Joi.object({
  id: Joi.string().uuid().required()
});

/**
 * Schemas de validação para query parameters
 */

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort_by: Joi.string().default('created_at'),
  sort_order: Joi.string().valid('ASC', 'DESC', 'asc', 'desc').default('DESC')
});

const dateRangeSchema = Joi.object({
  date_from: Joi.date().iso(),
  date_to: Joi.date().iso().min(Joi.ref('date_from'))
}).and('date_from', 'date_to');

/**
 * Middleware para validar múltiplas propriedades
 */
const validateMultiple = (schemas) => {
  return (req, res, next) => {
    const errors = [];

    for (const [property, schema] of Object.entries(schemas)) {
      const { error, value } = schema.validate(req[property], {
        abortEarly: false,
        stripUnknown: true,
        convert: true
      });

      if (error) {
        error.details.forEach(detail => {
          errors.push({
            property,
            field: detail.path.join('.'),
            message: detail.message.replace(/"/g, ''),
            type: detail.type
          });
        });
      } else {
        req[property] = value;
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Erro de validação',
        code: 'VALIDATION_ERROR',
        errors
      });
    }

    next();
  };
};

/**
 * Sanitização de dados
 */
const sanitize = {
  // Remove tags HTML
  stripHtml: (value) => {
    if (typeof value !== 'string') return value;
    return value.replace(/<[^>]*>/g, '');
  },

  // Remove espaços extras
  trimSpaces: (value) => {
    if (typeof value !== 'string') return value;
    return value.trim().replace(/\s+/g, ' ');
  },

  // Remove caracteres especiais (exceto letras, números e espaços)
  removeSpecialChars: (value) => {
    if (typeof value !== 'string') return value;
    return value.replace(/[^a-zA-Z0-9\s]/g, '');
  },

  // Formata CPF
  formatCPF: (value) => {
    if (typeof value !== 'string') return value;
    const cpf = value.replace(/\D/g, '');
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  },

  // Formata telefone
  formatPhone: (value) => {
    if (typeof value !== 'string') return value;
    const phone = value.replace(/\D/g, '');
    if (phone.length === 11) {
      return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    if (phone.length === 10) {
      return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return value;
  }
};

module.exports = {
  validate,
  validateMultiple,
  sanitize,
  // Auth schemas
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  // User schemas
  createUserSchema,
  updateUserSchema,
  // Patient schemas
  createPatientSchema,
  updatePatientSchema,
  // Doctor schemas
  createDoctorSchema,
  updateDoctorSchema,
  // Appointment schemas
  createAppointmentSchema,
  updateAppointmentSchema,
  cancelAppointmentSchema,
  // Common schemas
  uuidSchema,
  uuidParamSchema,
  paginationSchema,
  dateRangeSchema
};