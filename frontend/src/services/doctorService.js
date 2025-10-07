import { get, post, put, patch, del, getCached } from './api';

// ==================== SERVIÇO DE MÉDICOS ====================

/**
 * Obtém lista de médicos
 * @param {Object} params - Parâmetros de filtro e paginação
 * @returns {Promise<Object>} Lista de médicos
 */
export const getDoctors = async (params = {}) => {
  try {
    const response = await get('/doctors', params);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém médico por ID
 * @param {string} id - ID do médico
 * @returns {Promise<Object>} Dados do médico
 */
export const getDoctorById = async (id) => {
  try {
    const response = await get(`/doctors/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Cria novo médico
 * @param {Object} data - Dados do médico
 * @returns {Promise<Object>} Médico criado
 */
export const createDoctor = async (data) => {
  try {
    const response = await post('/doctors', data);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Atualiza médico
 * @param {string} id - ID do médico
 * @param {Object} data - Dados a serem atualizados
 * @returns {Promise<Object>} Médico atualizado
 */
export const updateDoctor = async (id, data) => {
  try {
    const response = await put(`/doctors/${id}`, data);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Remove médico (soft delete)
 * @param {string} id - ID do médico
 * @returns {Promise<Object>} Resposta da API
 */
export const deleteDoctor = async (id) => {
  try {
    const response = await del(`/doctors/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Alterna status do médico
 * @param {string} id - ID do médico
 * @returns {Promise<Object>} Resposta da API
 */
export const toggleDoctorStatus = async (id) => {
  try {
    const response = await patch(`/doctors/${id}/toggle-status`);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém especialidades disponíveis
 * @returns {Promise<Object>} Lista de especialidades
 */
export const getSpecialties = async () => {
  try {
    const response = await get('/doctors/specialties');
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém médicos por especialidade
 * @param {string} specialty - Especialidade
 * @param {Object} params - Parâmetros de filtro
 * @returns {Promise<Object>} Lista de médicos
 */
export const getDoctorsBySpecialty = async (specialty, params = {}) => {
  try {
    const response = await get(`/doctors/specialty/${specialty}`, params);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém agendamentos do médico
 * @param {string} id - ID do médico
 * @param {Object} params - Parâmetros de filtro
 * @returns {Promise<Object>} Lista de agendamentos
 */
export const getDoctorAppointments = async (id, params = {}) => {
  try {
    const response = await get(`/doctors/${id}/appointments`, params);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém agenda do médico
 * @param {string} id - ID do médico
 * @param {string} date - Data (YYYY-MM-DD)
 * @returns {Promise<Object>} Agenda do médico
 */
export const getDoctorSchedule = async (id, date) => {
  try {
    const response = await get(`/doctors/${id}/schedule`, { date });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Atualiza horários de trabalho do médico
 * @param {string} id - ID do médico
 * @param {Object} workingHours - Horários de trabalho
 * @returns {Promise<Object>} Resposta da API
 */
export const updateDoctorWorkingHours = async (id, workingHours) => {
  try {
    const response = await patch(`/doctors/${id}/working-hours`, { workingHours });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém estatísticas do médico
 * @param {string} id - ID do médico
 * @returns {Promise<Object>} Estatísticas do médico
 */
export const getDoctorStats = async (id) => {
  try {
    const response = await get(`/doctors/${id}/stats`);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém disponibilidade do médico
 * @param {string} id - ID do médico
 * @param {string} date - Data (YYYY-MM-DD)
 * @returns {Promise<Object>} Horários disponíveis
 */
export const getDoctorAvailability = async (id, date) => {
  try {
    const response = await get(`/doctors/${id}/availability`, { date });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Verifica se médico está disponível
 * @param {string} id - ID do médico
 * @param {string} date - Data (YYYY-MM-DD)
 * @param {string} time - Horário (HH:MM)
 * @returns {Promise<Object>} Status de disponibilidade
 */
export const checkDoctorAvailability = async (id, date, time) => {
  try {
    const response = await get(`/doctors/${id}/availability/check`, { date, time });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém médicos disponíveis para agendamento
 * @param {string} date - Data (YYYY-MM-DD)
 * @param {string} time - Horário (HH:MM)
 * @param {string} specialty - Especialidade (opcional)
 * @returns {Promise<Object>} Lista de médicos disponíveis
 */
export const getAvailableDoctors = async (date, time, specialty = null) => {
  try {
    const params = { date, time };
    if (specialty) params.specialty = specialty;
    
    const response = await get('/doctors/available', params);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Busca médicos por termo
 * @param {string} term - Termo de busca
 * @param {Object} params - Parâmetros adicionais
 * @returns {Promise<Object>} Lista de médicos
 */
export const searchDoctors = async (term, params = {}) => {
  try {
    const response = await get('/doctors/search', { term, ...params });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém médicos com cache
 * @param {Object} params - Parâmetros de filtro
 * @param {number} ttl - Tempo de vida do cache
 * @returns {Promise<Object>} Lista de médicos
 */
export const getDoctorsCached = async (params = {}, ttl = 5 * 60 * 1000) => {
  try {
    const response = await getCached('/doctors', params, ttl);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém médicos ativos
 * @param {Object} params - Parâmetros de filtro
 * @returns {Promise<Object>} Lista de médicos ativos
 */
export const getActiveDoctors = async (params = {}) => {
  try {
    const response = await get('/doctors/active', params);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém médicos inativos
 * @param {Object} params - Parâmetros de filtro
 * @returns {Promise<Object>} Lista de médicos inativos
 */
export const getInactiveDoctors = async (params = {}) => {
  try {
    const response = await get('/doctors/inactive', params);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém médicos recentes
 * @param {number} limit - Limite de resultados
 * @returns {Promise<Object>} Lista de médicos recentes
 */
export const getRecentDoctors = async (limit = 10) => {
  try {
    const response = await get('/doctors/recent', { limit });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém estatísticas gerais de médicos
 * @returns {Promise<Object>} Estatísticas gerais
 */
export const getDoctorsGeneralStats = async () => {
  try {
    const response = await get('/doctors/stats/general');
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Exporta lista de médicos
 * @param {Object} params - Parâmetros de filtro
 * @param {string} format - Formato de exportação (pdf, excel, csv)
 * @returns {Promise<Blob>} Arquivo de exportação
 */
export const exportDoctors = async (params = {}, format = 'pdf') => {
  try {
    const response = await get('/doctors/export', { ...params, format });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém histórico de alterações do médico
 * @param {string} id - ID do médico
 * @returns {Promise<Object>} Histórico de alterações
 */
export const getDoctorHistory = async (id) => {
  try {
    const response = await get(`/doctors/${id}/history`);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Valida dados do médico
 * @param {Object} data - Dados do médico
 * @returns {Promise<Object>} Resultado da validação
 */
export const validateDoctorData = async (data) => {
  try {
    const response = await post('/doctors/validate', data);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém médicos por convênio
 * @param {string} insuranceId - ID do convênio
 * @returns {Promise<Object>} Lista de médicos
 */
export const getDoctorsByInsurance = async (insuranceId) => {
  try {
    const response = await get(`/doctors/insurance/${insuranceId}`);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém médicos com maior número de consultas
 * @param {Object} params - Parâmetros de filtro
 * @returns {Promise<Object>} Lista de médicos
 */
export const getTopDoctors = async (params = {}) => {
  try {
    const response = await get('/doctors/top', params);
    return response;
  } catch (error) {
    throw error;
  }
};
