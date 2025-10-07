// ==================== VALIDADORES DE CPF ====================

/**
 * Valida CPF brasileiro
 * @param {string} cpf - CPF a ser validado
 * @returns {boolean} True se válido
 */
export const isValidCPF = (cpf) => {
  if (!cpf) return false;
  
  // Remove caracteres não numéricos
  const numbers = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (numbers.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(numbers)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers.charAt(9))) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers.charAt(10))) return false;
  
  return true;
};

// ==================== VALIDADORES DE TELEFONE ====================

/**
 * Valida telefone brasileiro
 * @param {string} phone - Telefone a ser validado
 * @returns {boolean} True se válido
 */
export const isValidPhone = (phone) => {
  if (!phone) return false;
  
  // Remove caracteres não numéricos
  const numbers = phone.replace(/\D/g, '');
  
  // Verifica se tem 10 ou 11 dígitos
  if (numbers.length !== 10 && numbers.length !== 11) return false;
  
  // Verifica se começa com código de área válido (11-99)
  const areaCode = parseInt(numbers.substring(0, 2));
  if (areaCode < 11 || areaCode > 99) return false;
  
  // Verifica se o número não começa com 0 ou 1
  const firstDigit = parseInt(numbers.charAt(2));
  if (firstDigit < 2) return false;
  
  return true;
};

/**
 * Valida celular brasileiro
 * @param {string} phone - Celular a ser validado
 * @returns {boolean} True se válido
 */
export const isValidCellPhone = (phone) => {
  if (!phone) return false;
  
  const numbers = phone.replace(/\D/g, '');
  
  // Celular deve ter 11 dígitos
  if (numbers.length !== 11) return false;
  
  // Verifica código de área
  const areaCode = parseInt(numbers.substring(0, 2));
  if (areaCode < 11 || areaCode > 99) return false;
  
  // Verifica se é celular (terceiro dígito deve ser 9)
  const thirdDigit = parseInt(numbers.charAt(2));
  if (thirdDigit !== 9) return false;
  
  return true;
};

// ==================== VALIDADORES DE CEP ====================

/**
 * Valida CEP brasileiro
 * @param {string} cep - CEP a ser validado
 * @returns {boolean} True se válido
 */
export const isValidCEP = (cep) => {
  if (!cep) return false;
  
  const numbers = cep.replace(/\D/g, '');
  
  // CEP deve ter 8 dígitos
  if (numbers.length !== 8) return false;
  
  // Verifica se não é um CEP inválido conhecido
  const invalidCEPs = ['00000000', '11111111', '22222222', '33333333', '44444444', '55555555', '66666666', '77777777', '88888888', '99999999'];
  if (invalidCEPs.includes(numbers)) return false;
  
  return true;
};

// ==================== VALIDADORES DE EMAIL ====================

/**
 * Valida email
 * @param {string} email - Email a ser validado
 * @returns {boolean} True se válido
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ==================== VALIDADORES DE SENHA ====================

/**
 * Valida força da senha
 * @param {string} password - Senha a ser validada
 * @returns {Object} Resultado da validação
 */
export const validatePasswordStrength = (password) => {
  if (!password) {
    return {
      isValid: false,
      score: 0,
      feedback: 'Senha é obrigatória'
    };
  }
  
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
  
  const score = Object.values(checks).filter(Boolean).length;
  
  let feedback = '';
  if (!checks.length) feedback += 'Pelo menos 8 caracteres. ';
  if (!checks.lowercase) feedback += 'Pelo menos uma letra minúscula. ';
  if (!checks.uppercase) feedback += 'Pelo menos uma letra maiúscula. ';
  if (!checks.numbers) feedback += 'Pelo menos um número. ';
  if (!checks.special) feedback += 'Pelo menos um caractere especial. ';
  
  return {
    isValid: score >= 4,
    score,
    feedback: feedback.trim(),
    checks
  };
};

// ==================== VALIDADORES DE DATAS ====================

/**
 * Valida se data é válida
 * @param {Date|string} date - Data a ser validada
 * @returns {boolean} True se válida
 */
export const isValidDate = (date) => {
  if (!date) return false;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return !isNaN(dateObj.getTime());
};

/**
 * Valida se data é futura
 * @param {Date|string} date - Data a ser validada
 * @returns {boolean} True se futura
 */
export const isFutureDate = (date) => {
  if (!isValidDate(date)) return false;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj > new Date();
};

/**
 * Valida se data é passada
 * @param {Date|string} date - Data a ser validada
 * @returns {boolean} True se passada
 */
export const isPastDate = (date) => {
  if (!isValidDate(date)) return false;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj < new Date();
};

/**
 * Valida idade mínima
 * @param {Date|string} birthDate - Data de nascimento
 * @param {number} minAge - Idade mínima (padrão: 0)
 * @returns {boolean} True se idade válida
 */
export const isValidAge = (birthDate, minAge = 0) => {
  if (!isValidDate(birthDate)) return false;
  
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return (age - 1) >= minAge;
  }
  
  return age >= minAge;
};

// ==================== VALIDADORES DE CRM ====================

/**
 * Valida CRM brasileiro
 * @param {string} crm - CRM a ser validado
 * @param {string} state - Estado do CRM
 * @returns {boolean} True se válido
 */
export const isValidCRM = (crm, state) => {
  if (!crm || !state) return false;
  
  const numbers = crm.replace(/\D/g, '');
  
  // CRM deve ter entre 4 e 6 dígitos
  if (numbers.length < 4 || numbers.length > 6) return false;
  
  // Estado deve ter 2 letras
  if (state.length !== 2) return false;
  
  // Estados válidos do Brasil
  const validStates = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
    'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
    'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];
  
  return validStates.includes(state.toUpperCase());
};

// ==================== VALIDADORES DE HORÁRIO ====================

/**
 * Valida horário no formato HH:MM
 * @param {string} time - Horário a ser validado
 * @returns {boolean} True se válido
 */
export const isValidTime = (time) => {
  if (!time) return false;
  
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

/**
 * Valida se horário está dentro do expediente
 * @param {string} time - Horário a ser validado
 * @param {string} startTime - Horário de início (padrão: '08:00')
 * @param {string} endTime - Horário de fim (padrão: '18:00')
 * @returns {boolean} True se dentro do expediente
 */
export const isWithinBusinessHours = (time, startTime = '08:00', endTime = '18:00') => {
  if (!isValidTime(time) || !isValidTime(startTime) || !isValidTime(endTime)) {
    return false;
  }
  
  const timeMinutes = timeToMinutes(time);
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  
  return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
};

/**
 * Converte horário para minutos
 * @param {string} time - Horário no formato HH:MM
 * @returns {number} Minutos desde meia-noite
 */
export const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// ==================== VALIDADORES DE VALORES MÉDICOS ====================

/**
 * Valida altura em metros
 * @param {number} height - Altura em metros
 * @returns {boolean} True se válida
 */
export const isValidHeight = (height) => {
  if (typeof height !== 'number' || isNaN(height)) return false;
  return height >= 0.5 && height <= 3.0; // Entre 50cm e 3m
};

/**
 * Valida peso em kg
 * @param {number} weight - Peso em kg
 * @returns {boolean} True se válido
 */
export const isValidWeight = (weight) => {
  if (typeof weight !== 'number' || isNaN(weight)) return false;
  return weight >= 0.5 && weight <= 500; // Entre 500g e 500kg
};

/**
 * Valida IMC
 * @param {number} bmi - Índice de Massa Corporal
 * @returns {boolean} True se válido
 */
export const isValidBMI = (bmi) => {
  if (typeof bmi !== 'number' || isNaN(bmi)) return false;
  return bmi >= 10 && bmi <= 60; // IMC entre 10 e 60
};

/**
 * Calcula IMC
 * @param {number} weight - Peso em kg
 * @param {number} height - Altura em metros
 * @returns {number} IMC calculado
 */
export const calculateBMI = (weight, height) => {
  if (!isValidWeight(weight) || !isValidHeight(height)) return null;
  return weight / (height * height);
};

// ==================== VALIDADORES DE VALORES MONETÁRIOS ====================

/**
 * Valida valor monetário
 * @param {number} value - Valor a ser validado
 * @param {number} min - Valor mínimo (padrão: 0)
 * @param {number} max - Valor máximo (padrão: 1000000)
 * @returns {boolean} True se válido
 */
export const isValidMonetaryValue = (value, min = 0, max = 1000000) => {
  if (typeof value !== 'number' || isNaN(value)) return false;
  return value >= min && value <= max;
};

// ==================== VALIDADORES DE STRING ====================

/**
 * Valida se string contém apenas letras e espaços
 * @param {string} str - String a ser validada
 * @returns {boolean} True se válida
 */
export const isAlphaSpace = (str) => {
  if (!str || typeof str !== 'string') return false;
  return /^[a-zA-ZÀ-ÿ\s]+$/.test(str);
};

/**
 * Valida se string contém apenas números
 * @param {string} str - String a ser validada
 * @returns {boolean} True se válida
 */
export const isNumeric = (str) => {
  if (!str || typeof str !== 'string') return false;
  return /^\d+$/.test(str);
};

/**
 * Valida comprimento de string
 * @param {string} str - String a ser validada
 * @param {number} min - Comprimento mínimo
 * @param {number} max - Comprimento máximo
 * @returns {boolean} True se válida
 */
export const isValidLength = (str, min, max) => {
  if (!str || typeof str !== 'string') return false;
  return str.length >= min && str.length <= max;
};
