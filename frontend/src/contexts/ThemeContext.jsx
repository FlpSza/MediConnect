import React, { createContext, useContext, useReducer, useEffect } from 'react';

// ==================== CONTEXT ====================

const ThemeContext = createContext();

// ==================== REDUCER ====================

const initialState = {
  theme: localStorage.getItem('theme') || 'light',
  sidebarCollapsed: localStorage.getItem('sidebarCollapsed') === 'true',
  fontSize: localStorage.getItem('fontSize') || 'medium',
  language: localStorage.getItem('language') || 'pt-BR'
};

const themeReducer = (state, action) => {
  switch (action.type) {
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload
      };
    
    case 'TOGGLE_THEME':
      return {
        ...state,
        theme: state.theme === 'light' ? 'dark' : 'light'
      };
    
    case 'SET_SIDEBAR_COLLAPSED':
      return {
        ...state,
        sidebarCollapsed: action.payload
      };
    
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        sidebarCollapsed: !state.sidebarCollapsed
      };
    
    case 'SET_FONT_SIZE':
      return {
        ...state,
        fontSize: action.payload
      };
    
    case 'SET_LANGUAGE':
      return {
        ...state,
        language: action.payload
      };
    
    default:
      return state;
  }
};

// ==================== PROVIDER ====================

export const ThemeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  // ==================== EFFECTS ====================

  // Aplicar tema ao DOM
  useEffect(() => {
    const root = document.documentElement;
    
    if (state.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    localStorage.setItem('theme', state.theme);
  }, [state.theme]);

  // Aplicar tamanho da fonte
  useEffect(() => {
    const root = document.documentElement;
    
    switch (state.fontSize) {
      case 'small':
        root.style.fontSize = '14px';
        break;
      case 'medium':
        root.style.fontSize = '16px';
        break;
      case 'large':
        root.style.fontSize = '18px';
        break;
      default:
        root.style.fontSize = '16px';
    }
    
    localStorage.setItem('fontSize', state.fontSize);
  }, [state.fontSize]);

  // Salvar estado da sidebar
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', state.sidebarCollapsed.toString());
  }, [state.sidebarCollapsed]);

  // Salvar idioma
  useEffect(() => {
    localStorage.setItem('language', state.language);
  }, [state.language]);

  // ==================== ACTIONS ====================

  /**
   * Define o tema
   * @param {string} theme - Tema ('light' ou 'dark')
   */
  const setTheme = (theme) => {
    dispatch({
      type: 'SET_THEME',
      payload: theme
    });
  };

  /**
   * Alterna entre tema claro e escuro
   */
  const toggleTheme = () => {
    dispatch({ type: 'TOGGLE_THEME' });
  };

  /**
   * Define se a sidebar está colapsada
   * @param {boolean} collapsed - Estado da sidebar
   */
  const setSidebarCollapsed = (collapsed) => {
    dispatch({
      type: 'SET_SIDEBAR_COLLAPSED',
      payload: collapsed
    });
  };

  /**
   * Alterna estado da sidebar
   */
  const toggleSidebar = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  };

  /**
   * Define tamanho da fonte
   * @param {string} fontSize - Tamanho da fonte ('small', 'medium', 'large')
   */
  const setFontSize = (fontSize) => {
    dispatch({
      type: 'SET_FONT_SIZE',
      payload: fontSize
    });
  };

  /**
   * Define idioma
   * @param {string} language - Código do idioma
   */
  const setLanguage = (language) => {
    dispatch({
      type: 'SET_LANGUAGE',
      payload: language
    });
  };

  // ==================== CONTEXT VALUE ====================

  const value = {
    // State
    theme: state.theme,
    sidebarCollapsed: state.sidebarCollapsed,
    fontSize: state.fontSize,
    language: state.language,
    
    // Actions
    setTheme,
    toggleTheme,
    setSidebarCollapsed,
    toggleSidebar,
    setFontSize,
    setLanguage,
    
    // Computed values
    isDark: state.theme === 'dark',
    isLight: state.theme === 'light',
    isSidebarCollapsed: state.sidebarCollapsed,
    isSmallFont: state.fontSize === 'small',
    isMediumFont: state.fontSize === 'medium',
    isLargeFont: state.fontSize === 'large'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// ==================== HOOK ====================

/**
 * Hook para usar o contexto de tema
 * @returns {Object} Contexto de tema
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  
  return context;
};

// ==================== UTILITÁRIOS ====================

/**
 * Obtém classes CSS baseadas no tema
 * @param {string} lightClass - Classe para tema claro
 * @param {string} darkClass - Classe para tema escuro
 * @returns {string} Classe CSS
 */
export const getThemeClass = (lightClass, darkClass) => {
  return `${lightClass} dark:${darkClass}`;
};

/**
 * Obtém cor baseada no tema
 * @param {string} lightColor - Cor para tema claro
 * @param {string} darkColor - Cor para tema escuro
 * @returns {string} Cor
 */
export const getThemeColor = (lightColor, darkColor) => {
  const isDark = document.documentElement.classList.contains('dark');
  return isDark ? darkColor : lightColor;
};

export default ThemeContext;
