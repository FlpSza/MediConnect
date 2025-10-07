const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Modelo de Paciente
 * Gerencia informações cadastrais e médicas dos pacientes
 */
const Patient = sequelize.define('patients', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: 'ID único do paciente'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Nome não pode estar vazio'
      },
      len: {
        args: [3, 100],
        msg: 'Nome deve ter entre 3 e 100 caracteres'
      }
    },
    comment: 'Nome completo do paciente'
  },
  cpf: {
    type: DataTypes.STRING(14),
    allowNull: false,
    unique: {
      msg: 'CPF já cadastrado'
    },
    validate: {
      notEmpty: {
        msg: 'CPF não pode estar vazio'
      },
      is: {
        args: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
        msg: 'CPF deve estar no formato XXX.XXX.XXX-XX'
      }
    },
    comment: 'CPF do paciente (formato: XXX.XXX.XXX-XX)'
  },
  rg: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'RG do paciente'
  },
  birth_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: {
        msg: 'Data de nascimento inválida'
      },
      isBefore: {
        args: new Date().toISOString().split('T')[0],
        msg: 'Data de nascimento não pode ser futura'
      }
    },
    comment: 'Data de nascimento'
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['male', 'female', 'other']],
        msg: 'Gênero deve ser male, female ou other'
      }
    },
    comment: 'Gênero do paciente'
  },
  marital_status: {
    type: DataTypes.ENUM('single', 'married', 'divorced', 'widowed', 'other'),
    allowNull: true,
    comment: 'Estado civil'
  },
  nationality: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'Brasileira',
    comment: 'Nacionalidade'
  },
  // Contatos
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: {
        msg: 'Email inválido'
      }
    },
    comment: 'Email de contato'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Telefone não pode estar vazio'
      }
    },
    comment: 'Telefone principal'
  },
  phone_secondary: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Telefone secundário'
  },
  // Endereço
  address_street: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Logradouro'
  },
  address_number: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: 'Número'
  },
  address_complement: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Complemento'
  },
  address_neighborhood: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Bairro'
  },
  address_city: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Cidade'
  },
  address_state: {
    type: DataTypes.STRING(2),
    allowNull: true,
    validate: {
      len: {
        args: [2, 2],
        msg: 'Estado deve ter 2 caracteres'
      },
      isUppercase: {
        msg: 'Estado deve estar em maiúsculas'
      }
    },
    comment: 'Estado (UF)'
  },
  address_zip: {
    type: DataTypes.STRING(10),
    allowNull: true,
    validate: {
      is: {
        args: /^\d{5}-?\d{3}$/,
        msg: 'CEP inválido. Use o formato 12345-678'
      }
    },
    comment: 'CEP'
  },
  // Informações de convênio
  health_insurance: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Nome do convênio médico'
  },
  health_insurance_number: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Número da carteirinha do convênio'
  },
  health_insurance_validity: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Validade da carteirinha'
  },
  health_insurance_type: {
    type: DataTypes.ENUM('titular', 'dependente'),
    allowNull: true,
    comment: 'Tipo: titular ou dependente'
  },
  // Informações médicas
  blood_type: {
    type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    allowNull: true,
    comment: 'Tipo sanguíneo'
  },
  weight: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: {
        args: [0],
        msg: 'Peso não pode ser negativo'
      },
      max: {
        args: [500],
        msg: 'Peso não pode ser maior que 500kg'
      }
    },
    comment: 'Peso em kg'
  },
  height: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: {
        args: [0],
        msg: 'Altura não pode ser negativa'
      },
      max: {
        args: [300],
        msg: 'Altura não pode ser maior que 300cm'
      }
    },
    comment: 'Altura em cm'
  },
  allergies: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Alergias conhecidas (medicamentos, alimentos, etc)'
  },
  chronic_diseases: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Doenças crônicas (diabetes, hipertensão, etc)'
  },
  medications: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Medicamentos em uso contínuo'
  },
  previous_surgeries: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Cirurgias anteriores'
  },
  family_history: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Histórico familiar de doenças'
  },
  lifestyle: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null,
    comment: 'Estilo de vida: tabagismo, etilismo, atividade física'
  },
  medical_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Observações médicas gerais'
  },
  risk_classification: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    allowNull: true,
    comment: 'Classificação de risco'
  },
  // Contato de emergência
  emergency_contact_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Nome do contato de emergência'
  },
  emergency_contact_phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Telefone do contato de emergência'
  },
  emergency_contact_relationship: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Parentesco do contato de emergência'
  },
  // Responsável (para menores de idade)
  guardian_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Nome do responsável legal'
  },
  guardian_cpf: {
    type: DataTypes.STRING(14),
    allowNull: true,
    validate: {
      is: {
        args: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
        msg: 'CPF do responsável inválido'
      }
    },
    comment: 'CPF do responsável'
  },
  guardian_phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Telefone do responsável'
  },
  // Arquivos e mídia
  photo: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isUrl: {
        msg: 'URL da foto inválida'
      }
    },
    comment: 'URL da foto do paciente'
  },
  documents: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null,
    comment: 'Documentos anexados (JSON array)'
  },
  // Status e controle
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    comment: 'Status ativo/inativo'
  },
  registration_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Data de cadastro no sistema'
  },
  last_appointment_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Data da última consulta'
  },
  total_appointments: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    comment: 'Total de consultas realizadas'
  },
  // Observações administrativas
  administrative_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Observações administrativas (privadas)'
  },
  special_needs: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Necessidades especiais (acessibilidade, etc)'
  },
  preferred_contact_method: {
    type: DataTypes.ENUM('phone', 'email', 'sms', 'whatsapp'),
    allowNull: true,
    defaultValue: 'phone',
    comment: 'Método preferido de contato'
  },
  // Campos de auditoria
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  }
}, {
  tableName: 'patients',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['cpf']
    },
    {
      unique: true,
      fields: ['email'],
      where: {
        email: { [require('sequelize').Op.ne]: null }
      }
    },
    {
      fields: ['name']
    },
    {
      fields: ['phone']
    },
    {
      fields: ['health_insurance']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['birth_date']
    },
    {
      fields: ['registration_date']
    },
    {
      fields: ['risk_classification']
    }
  ],
  hooks: {
    beforeValidate: (patient) => {
      // Normalizar dados
      if (patient.name) patient.name = patient.name.trim();
      if (patient.email) patient.email = patient.email.trim().toLowerCase();
      if (patient.address_state) patient.address_state = patient.address_state.toUpperCase();
      
      // Definir data de registro se não fornecida
      if (!patient.registration_date) {
        patient.registration_date = new Date();
      }
    },
    
    beforeCreate: (patient) => {
      // Inicializar contadores
      if (!patient.total_appointments) {
        patient.total_appointments = 0;
      }
    }
  }
});

/**
 * Métodos de instância
 */

/**
 * Calcula a idade do paciente
 * @returns {number}
 */
Patient.prototype.getAge = function() {
  const today = new Date();
  const birthDate = new Date(this.birth_date);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Verifica se é menor de idade
 * @returns {boolean}
 */
Patient.prototype.isMinor = function() {
  return this.getAge() < 18;
};

/**
 * Calcula IMC (Índice de Massa Corporal)
 * @returns {number|null}
 */
Patient.prototype.calculateBMI = function() {
  if (!this.weight || !this.height) return null;
  
  const weight = parseFloat(this.weight);
  const height = parseFloat(this.height) / 100; // converter cm para m
  
  if (height === 0) return null;
  
  const bmi = weight / (height * height);
  return Math.round(bmi * 10) / 10;
};

/**
 * Classifica IMC
 * @returns {string|null}
 */
Patient.prototype.getBMIClassification = function() {
  const bmi = this.calculateBMI();
  if (!bmi) return null;
  
  if (bmi < 18.5) return 'Abaixo do peso';
  if (bmi < 25) return 'Peso normal';
  if (bmi < 30) return 'Sobrepeso';
  if (bmi < 35) return 'Obesidade grau I';
  if (bmi < 40) return 'Obesidade grau II';
  return 'Obesidade grau III';
};

/**
 * Verifica se tem convênio ativo
 * @returns {boolean}
 */
Patient.prototype.hasActiveInsurance = function() {
  if (!this.health_insurance) return false;
  
  if (this.health_insurance_validity) {
    const today = new Date();
    const validity = new Date(this.health_insurance_validity);
    return validity >= today;
  }
  
  return true; // Se não tem validade definida, considera ativo
};

/**
 * Retorna endereço formatado
 * @returns {string}
 */
Patient.prototype.getFormattedAddress = function() {
  const parts = [];
  
  if (this.address_street) parts.push(this.address_street);
  if (this.address_number) parts.push(this.address_number);
  if (this.address_complement) parts.push(this.address_complement);
  if (this.address_neighborhood) parts.push(this.address_neighborhood);
  if (this.address_city && this.address_state) {
    parts.push(`${this.address_city}/${this.address_state}`);
  }
  if (this.address_zip) parts.push(`CEP: ${this.address_zip}`);
  
  return parts.join(', ');
};

/**
 * Retorna resumo do paciente
 * @returns {object}
 */
Patient.prototype.getSummary = function() {
  return {
    id: this.id,
    name: this.name,
    cpf: this.cpf,
    age: this.getAge(),
    gender: this.gender,
    phone: this.phone,
    email: this.email,
    health_insurance: this.health_insurance,
    is_active: this.is_active
  };
};

/**
 * Verifica se paciente tem alergias
 * @returns {boolean}
 */
Patient.prototype.hasAllergies = function() {
  return !!(this.allergies && this.allergies.trim().length > 0);
};

/**
 * Verifica se paciente tem doenças crônicas
 * @returns {boolean}
 */
Patient.prototype.hasChronicDiseases = function() {
  return !!(this.chronic_diseases && this.chronic_diseases.trim().length > 0);
};

/**
 * Adiciona documento
 * @param {object} document - {type, filename, url, uploaded_at}
 * @returns {Promise<void>}
 */
Patient.prototype.addDocument = async function(document) {
  if (!this.documents) {
    this.documents = [];
  }
  
  this.documents.push({
    ...document,
    uploaded_at: new Date()
  });
  
  await this.save();
};

/**
 * Remove documento
 * @param {string} filename - Nome do arquivo
 * @returns {Promise<void>}
 */
Patient.prototype.removeDocument = async function(filename) {
  if (!this.documents) return;
  
  this.documents = this.documents.filter(doc => doc.filename !== filename);
  await this.save();
};

/**
 * Incrementa contador de consultas
 * @returns {Promise<void>}
 */
Patient.prototype.incrementAppointments = async function() {
  this.total_appointments += 1;
  this.last_appointment_date = new Date();
  await this.save();
};

/**
 * Verifica se precisa de responsável legal
 * @returns {boolean}
 */
Patient.prototype.requiresGuardian = function() {
  return this.isMinor();
};

/**
 * Métodos estáticos
 */

/**
 * Busca pacientes por convênio
 * @param {string} insurance - Nome do convênio
 * @returns {Promise<Array>}
 */
Patient.findByInsurance = async function(insurance) {
  return await this.findAll({
    where: {
      health_insurance: {
        [require('sequelize').Op.like]: `%${insurance}%`
      },
      is_active: true
    },
    order: [['name', 'ASC']]
  });
};

/**
 * Busca pacientes por CPF
 * @param {string} cpf - CPF do paciente
 * @returns {Promise<Patient|null>}
 */
Patient.findByCPF = async function(cpf) {
  return await this.findOne({
    where: { cpf }
  });
};

/**
 * Busca pacientes por faixa etária
 * @param {number} minAge - Idade mínima
 * @param {number} maxAge - Idade máxima
 * @returns {Promise<Array>}
 */
Patient.findByAgeRange = async function(minAge, maxAge) {
  const today = new Date();
  const maxBirthDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
  const minBirthDate = new Date(today.getFullYear() - maxAge - 1, today.getMonth(), today.getDate());
  
  return await this.findAll({
    where: {
      birth_date: {
        [require('sequelize').Op.between]: [minBirthDate, maxBirthDate]
      },
      is_active: true
    },
    order: [['name', 'ASC']]
  });
};

/**
 * Busca aniversariantes do mês
 * @param {number} month - Mês (1-12)
 * @returns {Promise<Array>}
 */
Patient.findBirthdaysInMonth = async function(month) {
  const { Op, fn, col } = require('sequelize');
  
  return await this.findAll({
    where: {
      [Op.and]: [
        sequelize.where(fn('MONTH', col('birth_date')), month),
        { is_active: true }
      ]
    },
    order: [[fn('DAY', col('birth_date')), 'ASC']]
  });
};

/**
 * Estatísticas de pacientes
 * @returns {Promise<object>}
 */
Patient.getStatistics = async function() {
  const total = await this.count({ where: { is_active: true } });
  
  const byGender = await this.findAll({
    where: { is_active: true },
    attributes: [
      'gender',
      [require('sequelize').fn('COUNT', 'id'), 'count']
    ],
    group: ['gender'],
    raw: true
  });
  
  const withInsurance = await this.count({
    where: {
      is_active: true,
      health_insurance: {
        [require('sequelize').Op.ne]: null
      }
    }
  });
  
  return {
    total,
    by_gender: byGender,
    with_insurance: withInsurance,
    without_insurance: total - withInsurance
  };
};

/**
 * Customiza JSON de saída
 */
Patient.prototype.toJSON = function() {
  const values = { ...this.get() };
  
  // Adiciona informações calculadas
  values.age = this.getAge();
  values.is_minor = this.isMinor();
  values.has_active_insurance = this.hasActiveInsurance();
  values.requires_guardian = this.requiresGuardian();
  
  // Adiciona IMC se possível
  const bmi = this.calculateBMI();
  if (bmi) {
    values.bmi = bmi;
    values.bmi_classification = this.getBMIClassification();
  }
  
  // Adiciona endereço formatado
  values.formatted_address = this.getFormattedAddress();
  
  // Remove campos sensíveis se necessário
  // delete values.administrative_notes;
  
  return values;
};

module.exports = Patient;