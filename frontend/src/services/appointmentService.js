import { get, post, put, patch, del, getCached } from './api';

// ==================== SERVIÇO DE AGENDAMENTOS ====================

/**
 * Obtém lista de agendamentos
 * @param {Object} params - Parâmetros de filtro e paginação
 * @returns {Promise<Object>} Lista de agendamentos
 */
export const getAppointments = async (params = {}) => {
  try {
    const response = await get('/appointments', params);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém agendamento por ID
 * @param {string} id - ID do agendamento
 * @returns {Promise<Object>} Dados do agendamento
 */
export const getAppointmentById = async (id) => {
  try {
    const response = await get(`/appointments/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Cria novo agendamento
 * @param {Object} data - Dados do agendamento
 * @returns {Promise<Object>} Agendamento criado
 */
export const createAppointment = async (data) => {
  try {
    const response = await post('/appointments', data);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Atualiza agendamento
 * @param {string} id - ID do agendamento
 * @param {Object} data - Dados a serem atualizados
 * @returns {Promise<Object>} Agendamento atualizado
 */
export const updateAppointment = async (id, data) => {
  try {
    const response = await put(`/appointments/${id}`, data);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Remove agendamento (soft delete)
 * @param {string} id - ID do agendamento
 * @returns {Promise<Object>} Resposta da API
 */
export const deleteAppointment = async (id) => {
  try {
    const response = await del(`/appointments/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Confirma agendamento
 * @param {string} id - ID do agendamento
 * @returns {Promise<Object>} Resposta da API
 */
export const confirmAppointment = async (id) => {
  try {
    const response = await patch(`/appointments/${id}/confirm`);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Inicia agendamento
 * @param {string} id - ID do agendamento
 * @returns {Promise<Object>} Resposta da API
 */
export const startAppointment = async (id) => {
  try {
    const response = await patch(`/appointments/${id}/start`);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Completa agendamento
 * @param {string} id - ID do agendamento
 * @returns {Promise<Object>} Resposta da API
 */
export const completeAppointment = async (id) => {
  try {
    const response = await patch(`/appointments/${id}/complete`);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Cancela agendamento
 * @param {string} id - ID do agendamento
 * @param {string} reason - Motivo do cancelamento
 * @returns {Promise<Object>} Resposta da API
 */
export const cancelAppointment = async (id, reason) => {
  try {
    const response = await patch(`/appointments/${id}/cancel`, { reason });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Marca agendamento como não compareceu
 * @param {string} id - ID do agendamento
 * @returns {Promise<Object>} Resposta da API
 */
export const markAsNoShow = async (id) => {
  try {
    const response = await patch(`/appointments/${id}/no-show`);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém horários disponíveis para um médico
 * @param {string} doctorId - ID do médico
 * @param {string} date - Data (YYYY-MM-DD)
 * @returns {Promise<Object>} Horários disponíveis
 */
export const getAvailableSlots = async (doctorId, date) => {
  try {
    const response = await get(`/appointments/doctor/${doctorId}/available-slots`, { date });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém agendamentos por data
 * @param {string} date - Data (YYYY-MM-DD)
 * @param {Object} params - Parâmetros adicionais
 * @returns {Promise<Object>} Lista de agendamentos
 */
export const getAppointmentsByDate = async (date, params = {}) => {
  try {
    const response = await get('/appointments/date', { date, ...params });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém agendamentos por médico
 * @param {string} doctorId - ID do médico
 * @param {Object} params - Parâmetros de filtro
 * @returns {Promise<Object>} Lista de agendamentos
 */
export const getAppointmentsByDoctor = async (doctorId, params = {}) => {
  try {
    const response = await get(`/appointments/doctor/${doctorId}`, params);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém agendamentos por paciente
 * @param {string} patientId - ID do paciente
 * @param {Object} params - Parâmetros de filtro
 * @returns {Promise<Object>} Lista de agendamentos
 */
export const getAppointmentsByPatient = async (patientId, params = {}) => {
  try {
    const response = await get(`/appointments/patient/${patientId}`, params);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém agendamentos por status
 * @param {string} status - Status do agendamento
 * @param {Object} params - Parâmetros de filtro
 * @returns {Promise<Object>} Lista de agendamentos
 */
export const getAppointmentsByStatus = async (status, params = {}) => {
  try {
    const response = await get('/appointments/status', { status, ...params });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém agendamentos do dia
 * @param {string} date - Data (YYYY-MM-DD)
 * @returns {Promise<Object>} Lista de agendamentos
 */
export const getTodayAppointments = async (date = null) => {
  try {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const response = await get('/appointments/today', { date: targetDate });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém próximos agendamentos
 * @param {number} limit - Limite de resultados
 * @returns {Promise<Object>} Lista de próximos agendamentos
 */
export const getUpcomingAppointments = async (limit = 10) => {
  try {
    const response = await get('/appointments/upcoming', { limit });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém agendamentos atrasados
 * @returns {Promise<Object>} Lista de agendamentos atrasados
 */
export const getOverdueAppointments = async () => {
  try {
    const response = await get('/appointments/overdue');
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém estatísticas de agendamentos
 * @param {Object} params - Parâmetros de filtro
 * @returns {Promise<Object>} Estatísticas
 */
export const getAppointmentStats = async (params = {}) => {
  try {
    const response = await get('/appointments/stats', params);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Busca agendamentos por termo
 * @param {string} term - Termo de busca
 * @param {Object} params - Parâmetros adicionais
 * @returns {Promise<Object>} Lista de agendamentos
 */
export const searchAppointments = async (term, params = {}) => {
  try {
    const response = await get('/appointments/search', { term, ...params });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém agendamentos com cache
 * @param {Object} params - Parâmetros de filtro
 * @param {number} ttl - Tempo de vida do cache
 * @returns {Promise<Object>} Lista de agendamentos
 */
export const getAppointmentsCached = async (params = {}, ttl = 1 * 60 * 1000) => {
  try {
    const response = await getCached('/appointments', params, ttl);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém agenda do médico para um período
 * @param {string} doctorId - ID do médico
 * @param {string} startDate - Data de início (YYYY-MM-DD)
 * @param {string} endDate - Data de fim (YYYY-MM-DD)
 * @returns {Promise<Object>} Agenda do médico
 */
export const getDoctorSchedule = async (doctorId, startDate, endDate) => {
  try {
    const response = await get(`/appointments/doctor/${doctorId}/schedule`, {
      startDate,
      endDate
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém agenda do paciente para um período
 * @param {string} patientId - ID do paciente
 * @param {string} startDate - Data de início (YYYY-MM-DD)
 * @param {string} endDate - Data de fim (YYYY-MM-DD)
 * @returns {Promise<Object>} Agenda do paciente
 */
export const getPatientSchedule = async (patientId, startDate, endDate) => {
  try {
    const response = await get(`/appointments/patient/${patientId}/schedule`, {
      startDate,
      endDate
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Verifica conflitos de agendamento
 * @param {string} doctorId - ID do médico
 * @param {string} date - Data (YYYY-MM-DD)
 * @param {string} time - Horário (HH:MM)
 * @param {string} duration - Duração em minutos
 * @param {string} excludeId - ID do agendamento a excluir da verificação
 * @returns {Promise<Object>} Resultado da verificação
 */
export const checkAppointmentConflict = async (doctorId, date, time, duration, excludeId = null) => {
  try {
    const params = { doctorId, date, time, duration };
    if (excludeId) params.excludeId = excludeId;
    
    const response = await get('/appointments/check-conflict', params);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém agendamentos por período
 * @param {string} startDate - Data de início (YYYY-MM-DD)
 * @param {string} endDate - Data de fim (YYYY-MM-DD)
 * @param {Object} params - Parâmetros adicionais
 * @returns {Promise<Object>} Lista de agendamentos
 */
export const getAppointmentsByPeriod = async (startDate, endDate, params = {}) => {
  try {
    const response = await get('/appointments/period', {
      startDate,
      endDate,
      ...params
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Exporta lista de agendamentos
 * @param {Object} params - Parâmetros de filtro
 * @param {string} format - Formato de exportação (pdf, excel, csv)
 * @returns {Promise<Blob>} Arquivo de exportação
 */
export const exportAppointments = async (params = {}, format = 'pdf') => {
  try {
    const response = await get('/appointments/export', { ...params, format });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém histórico de alterações do agendamento
 * @param {string} id - ID do agendamento
 * @returns {Promise<Object>} Histórico de alterações
 */
export const getAppointmentHistory = async (id) => {
  try {
    const response = await get(`/appointments/${id}/history`);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Valida dados do agendamento
 * @param {Object} data - Dados do agendamento
 * @returns {Promise<Object>} Resultado da validação
 */
export const validateAppointmentData = async (data) => {
  try {
    const response = await post('/appointments/validate', data);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém agendamentos recorrentes
 * @param {string} id - ID do agendamento base
 * @returns {Promise<Object>} Lista de agendamentos recorrentes
 */
export const getRecurringAppointments = async (id) => {
  try {
    const response = await get(`/appointments/${id}/recurring`);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Cria agendamento recorrente
 * @param {Object} data - Dados do agendamento
 * @param {Object} recurrence - Configuração de recorrência
 * @returns {Promise<Object>} Agendamentos criados
 */
export const createRecurringAppointment = async (data, recurrence) => {
  try {
    const response = await post('/appointments/recurring', { data, recurrence });
    return response;
  } catch (error) {
    throw error;
  }
};
