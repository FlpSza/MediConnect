import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Componente Button reutilizável
 * @param {Object} props - Props do componente
 * @returns {JSX.Element} Componente Button
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon: Icon = null,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  // Classes base
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  // Variantes
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
    info: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white focus:ring-primary-500',
    ghost: 'text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
    link: 'text-primary-600 hover:text-primary-700 underline focus:ring-primary-500'
  };
  
  // Tamanhos
  const sizes = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-sm',
    large: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };
  
  // Classes finais
  const classes = [
    baseClasses,
    variants[variant],
    sizes[size],
    fullWidth ? 'w-full' : '',
    className
  ].filter(Boolean).join(' ');
  
  // Ícone de loading
  const LoadingIcon = () => (
    <Loader2 className="animate-spin" size={size === 'small' ? 14 : size === 'large' ? 20 : 16} />
  );
  
  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <LoadingIcon />
      )}
      
      {!loading && Icon && iconPosition === 'left' && (
        <Icon className="mr-2" size={size === 'small' ? 14 : size === 'large' ? 20 : 16} />
      )}
      
      {children && (
        <span className={loading || (Icon && iconPosition === 'left') ? 'ml-2' : ''}>
          {children}
        </span>
      )}
      
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className="ml-2" size={size === 'small' ? 14 : size === 'large' ? 20 : 16} />
      )}
    </button>
  );
};

export default Button;
