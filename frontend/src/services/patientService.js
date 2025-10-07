import { get, post, put, patch, del, getCached } from './api';

// ==================== SERVIÇO DE PACIENTES ====================

/**
 * Obtém lista de pacientes
 * @param {Object} params - Parâmetros de filtro e paginação
 * @returns {Promise<Object>} Lista de pacientes
 */
export const getPatients = async (params = {}) => {
  try {
    const response = await get('/patients', params);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém paciente por ID
 * @param {string} id - ID do paciente
 * @returns {Promise<Object>} Dados do paciente
 */
export const getPatientById = async (id) => {
  try {
    const response = await get(`/patients/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém paciente por CPF
 * @param {string} cpf - CPF do paciente
 * @returns {Promise<Object>} Dados do paciente
 */
export const getPatientByCPF = async (cpf) => {
  try {
    const response = await get(`/patients/cpf/${cpf}`);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Cria novo paciente
 * @param {Object} data - Dados do paciente
 * @returns {Promise<Object>} Paciente criado
 */
export const createPatient = async (data) => {
  try {
    const response = await post('/patients', data);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Atualiza paciente
 * @param {string} id - ID do paciente
 * @param {Object} data - Dados a serem atualizados
 * @returns {Promise<Object>} Paciente atualizado
 */
export const updatePatient = async (id, data) => {
  try {
    const response = await put(`/patients/${id}`, data);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Remove paciente (soft delete)
 * @param {string} id - ID do paciente
 * @returns {Promise<Object>} Resposta da API
 */
export const deletePatient = async (id) => {
  try {
    const response = await del(`/patients/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Reativa paciente
 * @param {string} id - ID do paciente
 * @returns {Promise<Object>} Resposta da API
 */
export const reactivatePatient = async (id) => {
  try {
    const response = await patch(`/patients/${id}/reactivate`);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Alterna status do paciente
 * @param {string} id - ID do paciente
 * @returns {Promise<Object>} Resposta da API
 */
export const togglePatientStatus = async (id) => {
  try {
    const response = await patch(`/patients/${id}/toggle-status`);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém agendamentos do paciente
 * @param {string} id - ID do paciente
 * @param {Object} params - Parâmetros de filtro
 * @returns {Promise<Object>} Lista de agendamentos
 */
export const getPatientAppointments = async (id, params = {}) => {
  try {
    const response = await get(`/patients/${id}/appointments`, params);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém prontuários do paciente
 * @param {string} id - ID do paciente
 * @param {Object} params - Parâmetros de filtro
 * @returns {Promise<Object>} Lista de prontuários
 */
export const getPatientMedicalRecords = async (id, params = {}) => {
  try {
    const response = await get(`/patients/${id}/medical-records`, params);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém pagamentos do paciente
 * @param {string} id - ID do paciente
 * @param {Object} params - Parâmetros de filtro
 * @returns {Promise<Object>} Lista de pagamentos
 */
export const getPatientPayments = async (id, params = {}) => {
  try {
    const response = await get(`/patients/${id}/payments`, params);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém estatísticas do paciente
 * @param {string} id - ID do paciente
 * @returns {Promise<Object>} Estatísticas do paciente
 */
export const getPatientStats = async (id) => {
  try {
    const response = await get(`/patients/${id}/stats`);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém pacientes por convênio
 * @param {string} insuranceId - ID do convênio
 * @param {Object} params - Parâmetros de filtro
 * @returns {Promise<Object>} Lista de pacientes
 */
export const getPatientsByInsurance = async (insuranceId, params = {}) => {
  try {
    const response = await get(`/patients/insurance/${insuranceId}`, params);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém pacientes com aniversário no mês
 * @param {number} month - Mês (1-12)
 * @returns {Promise<Object>} Lista de pacientes
 */
export const getPatientsBirthday = async (month) => {
  try {
    const response = await get(`/patients/birthday/${month}`);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Adiciona documento ao paciente
 * @param {string} id - ID do paciente
 * @param {Object} document - Dados do documento
 * @returns {Promise<Object>} Resposta da API
 */
export const addPatientDocument = async (id, document) => {
  try {
    const response = await post(`/patients/${id}/documents`, document);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Remove documento do paciente
 * @param {string} id - ID do paciente
 * @param {string} documentId - ID do documento
 * @returns {Promise<Object>} Resposta da API
 */
export const removePatientDocument = async (id, documentId) => {
  try {
    const response = await del(`/patients/${id}/documents/${documentId}`);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Busca pacientes por termo
 * @param {string} term - Termo de busca
 * @param {Object} params - Parâmetros adicionais
 * @returns {Promise<Object>} Lista de pacientes
 */
export const searchPatients = async (term, params = {}) => {
  try {
    const response = await get('/patients/search', { term, ...params });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém pacientes com cache
 * @param {Object} params - Parâmetros de filtro
 * @param {number} ttl - Tempo de vida do cache
 * @returns {Promise<Object>} Lista de pacientes
 */
export const getPatientsCached = async (params = {}, ttl = 2 * 60 * 1000) => {
  try {
    const response = await getCached('/patients', params, ttl);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Exporta lista de pacientes
 * @param {Object} params - Parâmetros de filtro
 * @param {string} format - Formato de exportação (pdf, excel, csv)
 * @returns {Promise<Blob>} Arquivo de exportação
 */
export const exportPatients = async (params = {}, format = 'pdf') => {
  try {
    const response = await get('/patients/export', { ...params, format });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém histórico de alterações do paciente
 * @param {string} id - ID do paciente
 * @returns {Promise<Object>} Histórico de alterações
 */
export const getPatientHistory = async (id) => {
  try {
    const response = await get(`/patients/${id}/history`);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Valida dados do paciente
 * @param {Object} data - Dados do paciente
 * @returns {Promise<Object>} Resultado da validação
 */
export const validatePatientData = async (data) => {
  try {
    const response = await post('/patients/validate', data);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém pacientes recentes
 * @param {number} limit - Limite de resultados
 * @returns {Promise<Object>} Lista de pacientes recentes
 */
export const getRecentPatients = async (limit = 10) => {
  try {
    const response = await get('/patients/recent', { limit });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém pacientes inativos
 * @param {Object} params - Parâmetros de filtro
 * @returns {Promise<Object>} Lista de pacientes inativos
 */
export const getInactivePatients = async (params = {}) => {
  try {
    const response = await get('/patients/inactive', params);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém estatísticas gerais de pacientes
 * @returns {Promise<Object>} Estatísticas gerais
 */
export const getPatientsGeneralStats = async () => {
  try {
    const response = await get('/patients/stats/general');
    return response;
  } catch (error) {
    throw error;
  }
};
