import React, { createContext, useContext, useReducer } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ==================== CONTEXT ====================

const NotificationContext = createContext();

// ==================== REDUCER ====================

const initialState = {
  notifications: [],
  unreadCount: 0
};

const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications].slice(0, 50), // Manter apenas 50 notificações
        unreadCount: state.unreadCount + 1
      };
    
    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, read: true }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };
    
    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification => ({
          ...notification,
          read: true
        })),
        unreadCount: 0
      };
    
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification.id !== action.payload
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };
    
    case 'CLEAR_ALL_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
        unreadCount: 0
      };
    
    default:
      return state;
  }
};

// ==================== PROVIDER ====================

export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // ==================== ACTIONS ====================

  /**
   * Adiciona uma notificação
   * @param {Object} notification - Dados da notificação
   */
  const addNotification = (notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: 'info',
      title: '',
      message: '',
      timestamp: new Date(),
      read: false,
      ...notification
    };
    
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: newNotification
    });
  };

  /**
   * Marca notificação como lida
   * @param {string} id - ID da notificação
   */
  const markAsRead = (id) => {
    dispatch({
      type: 'MARK_AS_READ',
      payload: id
    });
  };

  /**
   * Marca todas as notificações como lidas
   */
  const markAllAsRead = () => {
    dispatch({ type: 'MARK_ALL_AS_READ' });
  };

  /**
   * Remove notificação
   * @param {string} id - ID da notificação
   */
  const removeNotification = (id) => {
    dispatch({
      type: 'REMOVE_NOTIFICATION',
      payload: id
    });
  };

  /**
   * Limpa todas as notificações
   */
  const clearAllNotifications = () => {
    dispatch({ type: 'CLEAR_ALL_NOTIFICATIONS' });
  };

  // ==================== TOAST NOTIFICATIONS ====================

  /**
   * Mostra notificação de sucesso
   * @param {string} message - Mensagem
   * @param {Object} options - Opções adicionais
   */
  const showSuccess = (message, options = {}) => {
    toast.success(message, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    });
    
    addNotification({
      type: 'success',
      title: 'Sucesso',
      message,
      ...options
    });
  };

  /**
   * Mostra notificação de erro
   * @param {string} message - Mensagem
   * @param {Object} options - Opções adicionais
   */
  const showError = (message, options = {}) => {
    toast.error(message, {
      position: 'top-right',
      autoClose: 7000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    });
    
    addNotification({
      type: 'error',
      title: 'Erro',
      message,
      ...options
    });
  };

  /**
   * Mostra notificação de aviso
   * @param {string} message - Mensagem
   * @param {Object} options - Opções adicionais
   */
  const showWarning = (message, options = {}) => {
    toast.warning(message, {
      position: 'top-right',
      autoClose: 6000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    });
    
    addNotification({
      type: 'warning',
      title: 'Aviso',
      message,
      ...options
    });
  };

  /**
   * Mostra notificação de informação
   * @param {string} message - Mensagem
   * @param {Object} options - Opções adicionais
   */
  const showInfo = (message, options = {}) => {
    toast.info(message, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    });
    
    addNotification({
      type: 'info',
      title: 'Informação',
      message,
      ...options
    });
  };

  /**
   * Mostra notificação de confirmação
   * @param {string} message - Mensagem
   * @param {Function} onConfirm - Callback de confirmação
   * @param {Function} onCancel - Callback de cancelamento
   * @param {Object} options - Opções adicionais
   */
  const showConfirm = (message, onConfirm, onCancel = null, options = {}) => {
    const toastId = toast(
      ({ closeToast }) => (
        <div className="flex flex-col space-y-2">
          <p className="text-sm">{message}</p>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                onConfirm();
                closeToast();
              }}
              className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
            >
              Confirmar
            </button>
            <button
              onClick={() => {
                if (onCancel) onCancel();
                closeToast();
              }}
              className="px-3 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
            >
              Cancelar
            </button>
          </div>
        </div>
      ),
      {
        position: 'top-right',
        autoClose: false,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        ...options
      }
    );
    
    return toastId;
  };

  /**
   * Mostra notificação de loading
   * @param {string} message - Mensagem
   * @returns {string} ID do toast
   */
  const showLoading = (message = 'Carregando...') => {
    const toastId = toast.loading(message, {
      position: 'top-right'
    });
    
    return toastId;
  };

  /**
   * Atualiza notificação de loading
   * @param {string} toastId - ID do toast
   * @param {string} message - Nova mensagem
   * @param {string} type - Tipo da notificação
   */
  const updateLoading = (toastId, message, type = 'success') => {
    toast.update(toastId, {
      render: message,
      type: type,
      isLoading: false,
      autoClose: 5000
    });
  };

  /**
   * Remove notificação de loading
   * @param {string} toastId - ID do toast
   */
  const dismissLoading = (toastId) => {
    toast.dismiss(toastId);
  };

  // ==================== CONTEXT VALUE ====================

  const value = {
    // State
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    
    // Actions
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    
    // Toast notifications
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    showLoading,
    updateLoading,
    dismissLoading
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </NotificationContext.Provider>
  );
};

// ==================== HOOK ====================

/**
 * Hook para usar o contexto de notificações
 * @returns {Object} Contexto de notificações
 */
export const useNotification = () => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotification deve ser usado dentro de um NotificationProvider');
  }
  
  return context;
};

// ==================== HOOKS ESPECÍFICOS ====================

/**
 * Hook para notificações de sucesso
 * @returns {Function} Função para mostrar sucesso
 */
export const useSuccessNotification = () => {
  const { showSuccess } = useNotification();
  return showSuccess;
};

/**
 * Hook para notificações de erro
 * @returns {Function} Função para mostrar erro
 */
export const useErrorNotification = () => {
  const { showError } = useNotification();
  return showError;
};

/**
 * Hook para notificações de aviso
 * @returns {Function} Função para mostrar aviso
 */
export const useWarningNotification = () => {
  const { showWarning } = useNotification();
  return showWarning;
};

/**
 * Hook para notificações de informação
 * @returns {Function} Função para mostrar informação
 */
export const useInfoNotification = () => {
  const { showInfo } = useNotification();
  return showInfo;
};

/**
 * Hook para notificações de confirmação
 * @returns {Function} Função para mostrar confirmação
 */
export const useConfirmNotification = () => {
  const { showConfirm } = useNotification();
  return showConfirm;
};

/**
 * Hook para notificações de loading
 * @returns {Object} Funções para loading
 */
export const useLoadingNotification = () => {
  const { showLoading, updateLoading, dismissLoading } = useNotification();
  return { showLoading, updateLoading, dismissLoading };
};

export default NotificationContext;
