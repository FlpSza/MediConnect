import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

// ==================== CONFIGURAÇÃO DO AXIOS ====================

// Criar instância do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== INTERCEPTORS ====================

// Request interceptor - Adiciona token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Trata erros de autenticação
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== FUNÇÕES UTILITÁRIAS ====================

/**
 * Trata erros da API
 * @param {Error} error - Erro da API
 * @returns {string} Mensagem de erro amigável
 */
export const handleApiError = (error) => {
  if (error.response) {
    // Erro de resposta do servidor
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return data.message || 'Dados inválidos';
      case 401:
        return 'Não autorizado';
      case 403:
        return 'Acesso negado';
      case 404:
        return 'Recurso não encontrado';
      case 422:
        return data.message || 'Dados de validação inválidos';
      case 500:
        return 'Erro interno do servidor';
      default:
        return data.message || 'Erro desconhecido';
    }
  } else if (error.request) {
    // Erro de rede
    return 'Erro de conexão com o servidor';
  } else {
    // Outro tipo de erro
    return error.message || 'Erro desconhecido';
  }
};

/**
 * Faz requisição GET
 * @param {string} url - URL da requisição
 * @param {Object} params - Parâmetros da query
 * @returns {Promise} Resposta da API
 */
export const get = async (url, params = {}) => {
  try {
    const response = await api.get(url, { params });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Faz requisição POST
 * @param {string} url - URL da requisição
 * @param {Object} data - Dados a serem enviados
 * @returns {Promise} Resposta da API
 */
export const post = async (url, data = {}) => {
  try {
    const response = await api.post(url, data);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Faz requisição PUT
 * @param {string} url - URL da requisição
 * @param {Object} data - Dados a serem enviados
 * @returns {Promise} Resposta da API
 */
export const put = async (url, data = {}) => {
  try {
    const response = await api.put(url, data);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Faz requisição PATCH
 * @param {string} url - URL da requisição
 * @param {Object} data - Dados a serem enviados
 * @returns {Promise} Resposta da API
 */
export const patch = async (url, data = {}) => {
  try {
    const response = await api.patch(url, data);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Faz requisição DELETE
 * @param {string} url - URL da requisição
 * @returns {Promise} Resposta da API
 */
export const del = async (url) => {
  try {
    const response = await api.delete(url);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Faz upload de arquivo
 * @param {string} url - URL da requisição
 * @param {FormData} formData - Dados do formulário
 * @param {Function} onProgress - Callback de progresso
 * @returns {Promise} Resposta da API
 */
export const upload = async (url, formData, onProgress) => {
  try {
    const response = await api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Faz download de arquivo
 * @param {string} url - URL da requisição
 * @param {string} filename - Nome do arquivo
 * @returns {Promise} Resposta da API
 */
export const download = async (url, filename) => {
  try {
    const response = await api.get(url, {
      responseType: 'blob',
    });
    
    // Criar link para download
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// ==================== FUNÇÕES DE AUTENTICAÇÃO ====================

/**
 * Define o token de autenticação
 * @param {string} token - Token JWT
 */
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }
};

/**
 * Remove o token de autenticação
 */
export const removeAuthToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  delete api.defaults.headers.common['Authorization'];
};

/**
 * Verifica se o usuário está autenticado
 * @returns {boolean} True se autenticado
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

/**
 * Obtém o token de autenticação
 * @returns {string|null} Token ou null
 */
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

/**
 * Obtém os dados do usuário logado
 * @returns {Object|null} Dados do usuário ou null
 */
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

/**
 * Define os dados do usuário logado
 * @param {Object} user - Dados do usuário
 */
export const setCurrentUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

// ==================== FUNÇÕES DE CACHE ====================

/**
 * Cache simples em memória
 */
const cache = new Map();

/**
 * Obtém dados do cache
 * @param {string} key - Chave do cache
 * @returns {any|null} Dados do cache ou null
 */
export const getFromCache = (key) => {
  const cached = cache.get(key);
  if (cached && cached.expiry > Date.now()) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

/**
 * Define dados no cache
 * @param {string} key - Chave do cache
 * @param {any} data - Dados a serem armazenados
 * @param {number} ttl - Tempo de vida em milissegundos
 */
export const setCache = (key, data, ttl = 5 * 60 * 1000) => {
  cache.set(key, {
    data,
    expiry: Date.now() + ttl,
  });
};

/**
 * Remove dados do cache
 * @param {string} key - Chave do cache
 */
export const removeFromCache = (key) => {
  cache.delete(key);
};

/**
 * Limpa todo o cache
 */
export const clearCache = () => {
  cache.clear();
};

// ==================== FUNÇÕES DE REQUISIÇÃO COM CACHE ====================

/**
 * Faz requisição GET com cache
 * @param {string} url - URL da requisição
 * @param {Object} params - Parâmetros da query
 * @param {number} ttl - Tempo de vida do cache em milissegundos
 * @returns {Promise} Resposta da API
 */
export const getCached = async (url, params = {}, ttl = 5 * 60 * 1000) => {
  const cacheKey = `${url}?${new URLSearchParams(params).toString()}`;
  
  // Verificar cache
  const cached = getFromCache(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Fazer requisição
  const data = await get(url, params);
  
  // Armazenar no cache
  setCache(cacheKey, data, ttl);
  
  return data;
};

// ==================== EXPORT ====================

export default api;
