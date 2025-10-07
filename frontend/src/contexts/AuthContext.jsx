import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { 
  login as loginService, 
  logout as logoutService, 
  getProfile
} from '../services/authService';
import {
  isAuthenticated,
  getCurrentUser,
  setCurrentUser
} from '../services/api';

// ==================== CONTEXT ====================

const AuthContext = createContext();

// ==================== REDUCER ====================

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: true,
  error: null
};

const authReducer = (state, action) => {
  console.log('🔄 AuthReducer:', action.type, action.payload);
  
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    
    case 'LOGIN_SUCCESS':
      console.log('✅ LOGIN_SUCCESS:', action.payload);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    
    case 'LOGIN_FAILURE':
      console.log('❌ LOGIN_FAILURE:', action.payload);
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };
    
    case 'LOGOUT':
      console.log('🚪 LOGOUT');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload
      };
    
    case 'SET_LOADING':
      console.log('⏳ SET_LOADING:', action.payload);
      return {
        ...state,
        isLoading: action.payload
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    
    default:
      return state;
  }
};

// ==================== PROVIDER ====================

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ==================== EFFECTS ====================

  // Verificar autenticação ao carregar
  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔍 Verificando autenticação...');
      
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        console.log('📦 Token:', token ? 'existe' : 'não existe');
        console.log('📦 User:', userStr ? 'existe' : 'não existe');
        
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            console.log('👤 Usuário recuperado:', user);
            
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: { user, token }
            });
          } catch (parseError) {
            console.error('❌ Erro ao parsear usuário:', parseError);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        } else {
          console.log('❌ Sem token ou usuário');
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('❌ Erro ao verificar autenticação:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, []);

  // Log de mudanças de estado
  useEffect(() => {
    console.log('📊 Estado atual:', {
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
      hasUser: !!state.user,
      hasToken: !!state.token
    });
  }, [state.isAuthenticated, state.isLoading, state.user, state.token]);

  // ==================== ACTIONS ====================

  /**
   * Faz login do usuário
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   */
  const login = async (email, password) => {
    try {
      console.log('🔐 Iniciando login...');
      dispatch({ type: 'LOGIN_START' });
      
      const response = await loginService(email, password);
      console.log('✅ Login bem-sucedido:', response);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.user,
          token: response.token
        }
      });
      
      return response;
    } catch (error) {
      console.error('❌ Erro no login:', error);
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.message
      });
      throw error;
    }
  };

  /**
   * Faz logout do usuário
   */
  const logout = async () => {
    try {
      await logoutService();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  /**
   * Atualiza dados do usuário
   * @param {Object} userData - Novos dados do usuário
   */
  const updateUser = (userData) => {
    setCurrentUser(userData);
    dispatch({
      type: 'UPDATE_USER',
      payload: userData
    });
  };

  /**
   * Define erro
   * @param {string} error - Mensagem de erro
   */
  const setError = (error) => {
    dispatch({
      type: 'SET_ERROR',
      payload: error
    });
  };

  /**
   * Limpa erro
   */
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  /**
   * Define loading
   * @param {boolean} loading - Estado de loading
   */
  const setLoading = (loading) => {
    dispatch({
      type: 'SET_LOADING',
      payload: loading
    });
  };

  // ==================== CONTEXT VALUE ====================

  const value = {
    // State
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    
    // Actions
    login,
    logout,
    updateUser,
    setError,
    clearError,
    setLoading,
    
    // Computed values
    userRole: state.user?.role,
    userName: state.user?.name,
    userEmail: state.user?.email,
    isAdmin: state.user?.role === 'admin',
    isDoctor: state.user?.role === 'doctor',
    isReceptionist: state.user?.role === 'receptionist'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ==================== HOOKS ====================

/**
 * Hook para acessar o contexto de autenticação
 * @returns {Object} Contexto de autenticação
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};

export default AuthContext;
