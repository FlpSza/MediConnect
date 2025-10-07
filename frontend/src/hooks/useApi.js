import { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../contexts/NotificationContext';

/**
 * Hook para fazer requisições à API
 * @param {Function} apiFunction - Função da API
 * @param {Array} dependencies - Dependências do useEffect
 * @param {Object} options - Opções adicionais
 * @returns {Object} Estado e funções da requisição
 */
export const useApi = (apiFunction, dependencies = [], options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showError } = useNotification();

  const {
    autoFetch = true,
    onSuccess = null,
    onError = null,
    showErrorNotification = true
  } = options;

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiFunction(...args);
      setData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Erro desconhecido';
      setError(errorMessage);
      
      if (showErrorNotification) {
        showError(errorMessage);
      }
      
      if (onError) {
        onError(err);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError, showErrorNotification, showError]);

  useEffect(() => {
    if (autoFetch) {
      execute();
    }
  }, dependencies);

  const refetch = useCallback(() => {
    return execute();
  }, [execute]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    refetch,
    reset
  };
};

/**
 * Hook para fazer requisições POST/PUT/DELETE
 * @param {Function} apiFunction - Função da API
 * @param {Object} options - Opções adicionais
 * @returns {Object} Estado e funções da requisição
 */
export const useMutation = (apiFunction, options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showSuccess, showError } = useNotification();

  const {
    onSuccess = null,
    onError = null,
    showSuccessNotification = true,
    showErrorNotification = true,
    successMessage = 'Operação realizada com sucesso'
  } = options;

  const mutate = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiFunction(...args);
      
      if (showSuccessNotification) {
        showSuccess(successMessage);
      }
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Erro desconhecido';
      setError(errorMessage);
      
      if (showErrorNotification) {
        showError(errorMessage);
      }
      
      if (onError) {
        onError(err);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError, showSuccessNotification, showErrorNotification, successMessage, showSuccess, showError]);

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  return {
    loading,
    error,
    mutate,
    reset
  };
};

/**
 * Hook para paginação
 * @param {Function} apiFunction - Função da API
 * @param {Object} initialParams - Parâmetros iniciais
 * @returns {Object} Estado e funções de paginação
 */
export const usePagination = (apiFunction, initialParams = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    ...initialParams
  });
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const { showError } = useNotification();

  const fetchData = useCallback(async (newParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const requestParams = { ...params, ...newParams };
      const result = await apiFunction(requestParams);
      
      if (requestParams.page === 1) {
        setData(result.data || result.items || []);
      } else {
        setData(prev => [...prev, ...(result.data || result.items || [])]);
      }
      
      setTotal(result.total || result.count || 0);
      setHasMore((result.data || result.items || []).length === requestParams.limit);
      setParams(requestParams);
      
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Erro desconhecido';
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, params, showError]);

  const nextPage = useCallback(() => {
    if (hasMore && !loading) {
      fetchData({ page: params.page + 1 });
    }
  }, [hasMore, loading, params.page, fetchData]);

  const prevPage = useCallback(() => {
    if (params.page > 1) {
      fetchData({ page: params.page - 1 });
    }
  }, [params.page, fetchData]);

  const goToPage = useCallback((page) => {
    fetchData({ page });
  }, [fetchData]);

  const refresh = useCallback(() => {
    fetchData({ page: 1 });
  }, [fetchData]);

  const updateParams = useCallback((newParams) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  const reset = useCallback(() => {
    setData([]);
    setError(null);
    setLoading(false);
    setParams({ page: 1, limit: 10, ...initialParams });
    setTotal(0);
    setHasMore(true);
  }, [initialParams]);

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    params,
    total,
    hasMore,
    currentPage: params.page,
    totalPages: Math.ceil(total / params.limit),
    nextPage,
    prevPage,
    goToPage,
    refresh,
    updateParams,
    reset
  };
};

/**
 * Hook para busca com debounce
 * @param {Function} apiFunction - Função da API
 * @param {number} delay - Delay em milissegundos
 * @returns {Object} Estado e funções de busca
 */
export const useSearch = (apiFunction, delay = 300) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { showError } = useNotification();

  const search = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await apiFunction(searchQuery);
      setResults(result.data || result.items || []);
    } catch (err) {
      const errorMessage = err.message || 'Erro na busca';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [apiFunction, showError]);

  const debouncedSearch = useDebounce(search, delay);

  const handleSearch = useCallback((searchQuery) => {
    setQuery(searchQuery);
    debouncedSearch(searchQuery);
  }, [debouncedSearch]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
  }, []);

  return {
    query,
    results,
    loading,
    error,
    handleSearch,
    clearSearch
  };
};

/**
 * Hook para debounce
 * @param {Function} func - Função a ser executada
 * @param {number} delay - Delay em milissegundos
 * @returns {Function} Função com debounce
 */
export const useDebounce = (func, delay) => {
  const [debouncedFunc, setDebouncedFunc] = useState(() => func);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFunc(() => func);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [func, delay]);

  return debouncedFunc;
};

export default useApi;
