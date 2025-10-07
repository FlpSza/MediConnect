// Removendo dependência do date-fns para compatibilidade
// const { format } = require('date-fns');
// const { ptBR } = require('date-fns/locale');

/**
 * Utilitários de formatação para o sistema MediConnect
 */

// ==================== FORMATAÇÃO DE DATAS ====================

/**
 * Formata data para exibição brasileira
 * @param {Date|string} date - Data a ser formatada
 * @param {string} formatStr - Formato desejado (padrão: 'dd/MM/yyyy')
 * @returns {string} Data formatada
 */
const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '';
    
    // Implementação manual para compatibilidade
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    return '';
  }
};

/**
 * Formata data e hora para exibição brasileira
 * @param {Date|string} date - Data a ser formatada
 * @returns {string} Data e hora formatada
 */
const formatDateTime = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '';
    
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    return '';
  }
};

/**
 * Formata apenas a hora
 * @param {Date|string} date - Data a ser formatada
 * @returns {string} Hora formatada
 */
const formatTime = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '';
    
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    
    return `${hours}:${minutes}`;
  } catch (error) {
    return '';
  }
};

/**
 * Formata data para input HTML (YYYY-MM-DD)
 * @param {Date|string} date - Data a ser formatada
 * @returns {string} Data no formato YYYY-MM-DD
 */
const formatDateForInput = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '';
    
    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObj.getDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    return '';
  }
};

/**
 * Formata data relativa (ex: "há 2 dias")
 * @param {Date|string} date - Data a ser formatada
 * @returns {string} Data relativa
 */
const formatRelativeDate = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInMs = now - dateObj;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Hoje';
    if (diffInDays === 1) return 'Ontem';
    if (diffInDays === -1) return 'Amanhã';
    if (diffInDays > 1) return `Há ${diffInDays} dias`;
    if (diffInDays < -1) return `Em ${Math.abs(diffInDays)} dias`;
    
    return formatDate(dateObj);
  } catch (error) {
    return '';
  }
};

// ==================== FORMATAÇÃO DE VALORES MONETÁRIOS ====================

/**
 * Formata valor monetário para exibição brasileira
 * @param {number} value - Valor a ser formatado
 * @param {string} currency - Moeda (padrão: 'BRL')
 * @returns {string} Valor formatado
 */
const formatCurrency = (value, currency = 'BRL') => {
  if (value === null || value === undefined || isNaN(value)) return 'R$ 0,00';
  
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(value);
  } catch (error) {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  }
};

/**
 * Formata valor monetário sem símbolo da moeda
 * @param {number} value - Valor a ser formatado
 * @returns {string} Valor formatado
 */
const formatCurrencyValue = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '0,00';
  
  try {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  } catch (error) {
    return value.toFixed(2).replace('.', ',');
  }
};

// ==================== FORMATAÇÃO DE DOCUMENTOS ====================

/**
 * Formata CPF para exibição
 * @param {string} cpf - CPF a ser formatado
 * @returns {string} CPF formatado
 */
const formatCPF = (cpf) => {
  if (!cpf) return '';
  
  // Remove caracteres não numéricos
  const numbers = cpf.replace(/\D/g, '');
  
  // Aplica máscara
  if (numbers.length === 11) {
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  
  return cpf;
};

/**
 * Formata CNPJ para exibição
 * @param {string} cnpj - CNPJ a ser formatado
 * @returns {string} CNPJ formatado
 */
const formatCNPJ = (cnpj) => {
  if (!cnpj) return '';
  
  // Remove caracteres não numéricos
  const numbers = cnpj.replace(/\D/g, '');
  
  // Aplica máscara
  if (numbers.length === 14) {
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  
  return cnpj;
};

/**
 * Formata CRM para exibição
 * @param {string} crm - CRM a ser formatado
 * @param {string} state - Estado do CRM
 * @returns {string} CRM formatado
 */
const formatCRM = (crm, state) => {
  if (!crm) return '';
  
  const numbers = crm.replace(/\D/g, '');
  return state ? `${numbers}/${state}` : numbers;
};

// ==================== FORMATAÇÃO DE TELEFONES ====================

/**
 * Formata telefone para exibição brasileira
 * @param {string} phone - Telefone a ser formatado
 * @returns {string} Telefone formatado
 */
const formatPhone = (phone) => {
  if (!phone) return '';
  
  // Remove caracteres não numéricos
  const numbers = phone.replace(/\D/g, '');
  
  // Aplica máscara baseada no tamanho
  if (numbers.length === 11) {
    // Celular: (11) 99999-9999
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (numbers.length === 10) {
    // Fixo: (11) 9999-9999
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
};

/**
 * Formata CEP para exibição
 * @param {string} zip - CEP a ser formatado
 * @returns {string} CEP formatado
 */
const formatCEP = (zip) => {
  if (!zip) return '';
  
  const numbers = zip.replace(/\D/g, '');
  
  if (numbers.length === 8) {
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  }
  
  return zip;
};

// ==================== FORMATAÇÃO DE NOMES ====================

/**
 * Formata nome para exibição (primeira letra maiúscula)
 * @param {string} name - Nome a ser formatado
 * @returns {string} Nome formatado
 */
const formatName = (name) => {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Formata nome para iniciais
 * @param {string} name - Nome a ser formatado
 * @returns {string} Iniciais
 */
const formatInitials = (name) => {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
};

// ==================== FORMATAÇÃO DE STATUS ====================

/**
 * Formata status de agendamento para exibição
 * @param {string} status - Status do agendamento
 * @returns {string} Status formatado
 */
const formatAppointmentStatus = (status) => {
  const statusMap = {
    'scheduled': 'Agendado',
    'confirmed': 'Confirmado',
    'in_progress': 'Em andamento',
    'completed': 'Concluído',
    'cancelled': 'Cancelado',
    'no_show': 'Não compareceu'
  };
  
  return statusMap[status] || status;
};

/**
 * Formata status de pagamento para exibição
 * @param {string} status - Status do pagamento
 * @returns {string} Status formatado
 */
const formatPaymentStatus = (status) => {
  const statusMap = {
    'pending': 'Pendente',
    'paid': 'Pago',
    'cancelled': 'Cancelado',
    'refunded': 'Reembolsado',
    'overdue': 'Vencido'
  };
  
  return statusMap[status] || status;
};

/**
 * Formata tipo de agendamento para exibição
 * @param {string} type - Tipo do agendamento
 * @returns {string} Tipo formatado
 */
const formatAppointmentType = (type) => {
  const typeMap = {
    'first_visit': 'Primeira consulta',
    'return': 'Retorno',
    'follow_up': 'Acompanhamento',
    'emergency': 'Emergência'
  };
  
  return typeMap[type] || type;
};

// ==================== FORMATAÇÃO DE DADOS MÉDICOS ====================

/**
 * Formata tipo sanguíneo para exibição
 * @param {string} bloodType - Tipo sanguíneo
 * @returns {string} Tipo sanguíneo formatado
 */
const formatBloodType = (bloodType) => {
  if (!bloodType) return '';
  return bloodType.toUpperCase();
};

/**
 * Formata altura para exibição
 * @param {number} height - Altura em metros
 * @returns {string} Altura formatada
 */
const formatHeight = (height) => {
  if (!height || isNaN(height)) return '';
  return `${(height * 100).toFixed(0)} cm`;
};

/**
 * Formata peso para exibição
 * @param {number} weight - Peso em kg
 * @returns {string} Peso formatado
 */
const formatWeight = (weight) => {
  if (!weight || isNaN(weight)) return '';
  return `${weight.toFixed(1)} kg`;
};

/**
 * Formata IMC para exibição
 * @param {number} bmi - Índice de Massa Corporal
 * @returns {string} IMC formatado
 */
const formatBMI = (bmi) => {
  if (!bmi || isNaN(bmi)) return '';
  return bmi.toFixed(1);
};

// ==================== FORMATAÇÃO DE DURAÇÃO ====================

/**
 * Formata duração em minutos para exibição
 * @param {number} minutes - Duração em minutos
 * @returns {string} Duração formatada
 */
const formatDuration = (minutes) => {
  if (!minutes || isNaN(minutes)) return '';
  
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}min`;
};

// ==================== FORMATAÇÃO DE NÚMEROS ====================

/**
 * Formata número para exibição brasileira
 * @param {number} number - Número a ser formatado
 * @param {number} decimals - Casas decimais (padrão: 0)
 * @returns {string} Número formatado
 */
const formatNumber = (number, decimals = 0) => {
  if (number === null || number === undefined || isNaN(number)) return '0';
  
  try {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(number);
  } catch (error) {
    return number.toFixed(decimals).replace('.', ',');
  }
};

/**
 * Formata porcentagem para exibição
 * @param {number} value - Valor da porcentagem
 * @param {number} decimals - Casas decimais (padrão: 1)
 * @returns {string} Porcentagem formatada
 */
const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value / 100);
  } catch (error) {
    return `${value.toFixed(decimals)}%`;
  }
};

// ==================== FORMATAÇÃO DE ENDEREÇO ====================

/**
 * Formata endereço completo para exibição
 * @param {Object} address - Objeto com dados do endereço
 * @returns {string} Endereço formatado
 */
const formatAddress = (address) => {
  if (!address) return '';
  
  const parts = [];
  
  if (address.street) {
    let streetPart = address.street;
    if (address.number) streetPart += `, ${address.number}`;
    if (address.complement) streetPart += `, ${address.complement}`;
    parts.push(streetPart);
  }
  
  if (address.neighborhood) parts.push(address.neighborhood);
  
  if (address.city) {
    let cityPart = address.city;
    if (address.state) cityPart += ` - ${address.state}`;
    if (address.zip) cityPart += `, CEP: ${formatCEP(address.zip)}`;
    parts.push(cityPart);
  }
  
  return parts.join(', ');
};

// ==================== EXPORT ====================

module.exports = {
  // Datas
  formatDate,
  formatDateTime,
  formatTime,
  formatDateForInput,
  formatRelativeDate,
  
  // Valores monetários
  formatCurrency,
  formatCurrencyValue,
  
  // Documentos
  formatCPF,
  formatCNPJ,
  formatCRM,
  
  // Telefones e CEP
  formatPhone,
  formatCEP,
  
  // Nomes
  formatName,
  formatInitials,
  
  // Status
  formatAppointmentStatus,
  formatPaymentStatus,
  formatAppointmentType,
  
  // Dados médicos
  formatBloodType,
  formatHeight,
  formatWeight,
  formatBMI,
  
  // Duração e números
  formatDuration,
  formatNumber,
  formatPercentage,
  
  // Endereço
  formatAddress
};
