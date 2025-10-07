import { useAuth as useAuthContext } from '../contexts/AuthContext';

/**
 * Hook para autenticação
 * @returns {Object} Dados e funções de autenticação
 */
export const useAuth = () => {
  return useAuthContext();
};

export default useAuth;
