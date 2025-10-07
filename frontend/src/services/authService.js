import { post, get, patch, setAuthToken, setCurrentUser, removeAuthToken } from './api';
import { API_BASE_URL } from '../utils/constants';

// ==================== SERVIÇO DE AUTENTICAÇÃO ====================

/**
 * Faz login do usuário
 * @param {string} email - Email do usuário
 * @param {string} password - Senha do usuário
 * @returns {Promise<Object>} Dados do usuário e token
 */
export const login = async (email, password) => {
  try {
    const response = await post('/auth/login', { email, password });
    
    console.log('📥 Resposta completa do login:', response);
    
    // Backend retorna { success, message, data: { token, user } }
    // O post() já retorna response.data, então temos { success, message, data: {...} }
    const { token, user } = response.data;
    
    if (!token || !user) {
      console.error('❌ Token ou usuário não encontrado na resposta:', response);
      throw new Error('Resposta inválida do servidor');
    }
    
    console.log('🔑 Token recebido:', token ? '✓' : '✗');
    console.log('👤 Usuário recebido:', user);
    
    // Armazenar token e dados do usuário
    setAuthToken(token);
    setCurrentUser(user);
    
    // Verificar se foi salvo
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    console.log('💾 Token salvo:', savedToken ? '✓' : '✗');
    console.log('💾 User salvo:', savedUser ? '✓' : '✗');
    
    return { token, user };
  } catch (error) {
    console.error('❌ Erro no authService.login:', error);
    throw error;
  }
};

/**
 * Faz logout do usuário
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    // Chamar endpoint de logout (se existir)
    await post('/auth/logout');
  } catch (error) {
    // Ignorar erros de logout
    console.warn('Erro ao fazer logout:', error);
  } finally {
    // Sempre limpar dados locais
    removeAuthToken();
  }
};

/**
 * Obtém dados do perfil do usuário
 * @returns {Promise<Object>} Dados do usuário
 */
export const getProfile = async () => {
  try {
    const response = await get('/auth/me');
    const user = response.data;
    setCurrentUser(user);
    return { user };
  } catch (error) {
    throw error;
  }
};

/**
 * Atualiza dados do perfil do usuário
 * @param {Object} data - Dados a serem atualizados
 * @returns {Promise<Object>} Dados atualizados
 */
export const updateProfile = async (data) => {
  try {
    const response = await patch('/auth/profile', data);
    const user = response.data;
    setCurrentUser(user);
    return { user };
  } catch (error) {
    throw error;
  }
};

/**
 * Altera senha do usuário
 * @param {string} currentPassword - Senha atual
 * @param {string} newPassword - Nova senha
 * @returns {Promise<Object>} Resposta da API
 */
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await patch('/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Solicita reset de senha
 * @param {string} email - Email do usuário
 * @returns {Promise<Object>} Resposta da API
 */
export const forgotPassword = async (email) => {
  try {
    const response = await post('/auth/forgot-password', { email });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Reseta senha com token
 * @param {string} token - Token de reset
 * @param {string} password - Nova senha
 * @returns {Promise<Object>} Resposta da API
 */
export const resetPassword = async (token, password) => {
  try {
    const response = await post(`/auth/reset-password/${token}`, { password });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Verifica se o token é válido
 * @returns {Promise<boolean>} True se válido
 */
export const verifyToken = async () => {
  try {
    await get('/auth/me');
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Renova o token de autenticação
 * @returns {Promise<Object>} Novo token
 */
export const refreshToken = async () => {
  try {
    const response = await post('/auth/refresh');
    setAuthToken(response.token);
    return response;
  } catch (error) {
    throw error;
  }
};

// ==================== FUNÇÕES UTILITÁRIAS ====================

/**
 * Verifica se o usuário tem uma role específica
 * @param {string} role - Role a ser verificada
 * @returns {boolean} True se tem a role
 */
export const hasRole = (role) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.role === role;
};

/**
 * Verifica se o usuário tem uma das roles especificadas
 * @param {Array<string>} roles - Roles a serem verificadas
 * @returns {boolean} True se tem uma das roles
 */
export const hasAnyRole = (roles) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return roles.includes(user.role);
};

/**
 * Verifica se o usuário é admin
 * @returns {boolean} True se é admin
 */
export const isAdmin = () => {
  return hasRole('admin');
};

/**
 * Verifica se o usuário é médico
 * @returns {boolean} True se é médico
 */
export const isDoctor = () => {
  return hasRole('doctor');
};

/**
 * Verifica se o usuário é recepcionista
 * @returns {boolean} True se é recepcionista
 */
export const isReceptionist = () => {
  return hasRole('receptionist');
};

/**
 * Obtém o nome do usuário logado
 * @returns {string} Nome do usuário
 */
export const getUserName = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.name || '';
};

/**
 * Obtém o email do usuário logado
 * @returns {string} Email do usuário
 */
export const getUserEmail = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.email || '';
};

/**
 * Obtém a role do usuário logado
 * @returns {string} Role do usuário
 */
export const getUserRole = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.role || '';
};

/**
 * Obtém o ID do usuário logado
 * @returns {string} ID do usuário
 */
export const getUserId = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.id || '';
};

/**
 * Verifica se o usuário está ativo
 * @returns {boolean} True se ativo
 */
export const isUserActive = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.is_active === true;
};

/**
 * Obtém a última data de login
 * @returns {string|null} Data de login ou null
 */
export const getLastLogin = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.last_login || null;
};

/**
 * Obtém o avatar do usuário
 * @returns {string|null} URL do avatar ou null
 */
export const getUserAvatar = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.avatar || null;
};

/**
 * Obtém o telefone do usuário
 * @returns {string|null} Telefone ou null
 */
export const getUserPhone = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.phone || null;
};

/**
 * Formata a role do usuário para exibição
 * @param {string} role - Role do usuário
 * @returns {string} Role formatada
 */
export const formatUserRole = (role) => {
  const roleMap = {
    admin: 'Administrador',
    doctor: 'Médico',
    receptionist: 'Recepcionista'
  };
  
  return roleMap[role] || role;
};

/**
 * Obtém as permissões do usuário baseadas na role
 * @returns {Object} Permissões do usuário
 */
export const getUserPermissions = () => {
  const role = getUserRole();
  
  const permissions = {
    admin: {
      canManageUsers: true,
      canManageDoctors: true,
      canManagePatients: true,
      canManageAppointments: true,
      canViewReports: true,
      canManageFinancial: true,
      canManageSettings: true,
      canViewMedicalRecords: true,
      canManageBackups: true
    },
    doctor: {
      canManageUsers: false,
      canManageDoctors: false,
      canManagePatients: false,
      canManageAppointments: true,
      canViewReports: false,
      canManageFinancial: false,
      canManageSettings: false,
      canViewMedicalRecords: true,
      canManageBackups: false
    },
    receptionist: {
      canManageUsers: false,
      canManageDoctors: false,
      canManagePatients: true,
      canManageAppointments: true,
      canViewReports: false,
      canManageFinancial: true,
      canManageSettings: false,
      canViewMedicalRecords: false,
      canManageBackups: false
    }
  };
  
  return permissions[role] || {};
};

/**
 * Verifica se o usuário tem uma permissão específica
 * @param {string} permission - Permissão a ser verificada
 * @returns {boolean} True se tem a permissão
 */
export const hasPermission = (permission) => {
  const permissions = getUserPermissions();
  return permissions[permission] === true;
};

/**
 * Obtém o menu baseado nas permissões do usuário
 * @returns {Array} Itens do menu
 */
export const getUserMenu = () => {
  const permissions = getUserPermissions();
  
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/dashboard',
      icon: 'dashboard',
      visible: true
    },
    {
      id: 'patients',
      label: 'Pacientes',
      path: '/patients',
      icon: 'users',
      visible: permissions.canManagePatients
    },
    {
      id: 'doctors',
      label: 'Médicos',
      path: '/doctors',
      icon: 'user-md',
      visible: permissions.canManageDoctors
    },
    {
      id: 'appointments',
      label: 'Agendamentos',
      path: '/appointments',
      icon: 'calendar',
      visible: permissions.canManageAppointments
    },
    {
      id: 'medical-records',
      label: 'Prontuários',
      path: '/medical-records',
      icon: 'file-medical',
      visible: permissions.canViewMedicalRecords
    },
    {
      id: 'financial',
      label: 'Financeiro',
      path: '/financial',
      icon: 'dollar-sign',
      visible: permissions.canManageFinancial
    },
    {
      id: 'reports',
      label: 'Relatórios',
      path: '/reports',
      icon: 'chart-bar',
      visible: permissions.canViewReports
    },
    {
      id: 'users',
      label: 'Usuários',
      path: '/users',
      icon: 'user-cog',
      visible: permissions.canManageUsers
    },
    {
      id: 'settings',
      label: 'Configurações',
      path: '/settings',
      icon: 'cog',
      visible: permissions.canManageSettings
    }
  ];
  
  return menuItems.filter(item => item.visible);
};
