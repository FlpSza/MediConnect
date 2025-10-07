import React from 'react';

/**
 * Componente Card reutilizável
 * @param {Object} props - Props do componente
 * @returns {JSX.Element} Componente Card
 */
const Card = ({
  children,
  title,
  subtitle,
  header,
  footer,
  loading = false,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  ...props
}) => {
  if (loading) {
    return (
      <div className={`bg-white shadow rounded-lg ${className}`} {...props}>
        <div className="animate-pulse">
          {title && (
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          )}
          <div className="px-6 py-4">
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`bg-white shadow rounded-lg ${className}`} {...props}>
      {/* Header */}
      {(title || subtitle || header) && (
        <div className={`px-6 py-4 border-b border-gray-200 ${headerClassName}`}>
          {header || (
            <>
              {title && (
                <h3 className="text-lg font-medium text-gray-900">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-gray-500">
                  {subtitle}
                </p>
              )}
            </>
          )}
        </div>
      )}
      
      {/* Body */}
      <div className={`px-6 py-4 ${bodyClassName}`}>
        {children}
      </div>
      
      {/* Footer */}
      {footer && (
        <div className={`px-6 py-4 border-t border-gray-200 ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

/**
 * Componente Card Header
 */
export const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={`px-6 py-4 border-b border-gray-200 ${className}`} {...props}>
      {children}
    </div>
  );
};

/**
 * Componente Card Body
 */
export const CardBody = ({ children, className = '', ...props }) => {
  return (
    <div className={`px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

/**
 * Componente Card Footer
 */
export const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div className={`px-6 py-4 border-t border-gray-200 ${className}`} {...props}>
      {children}
    </div>
  );
};

/**
 * Componente Card Stats
 */
export const CardStats = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral',
  icon: Icon = null,
  className = '',
  ...props 
}) => {
  const changeColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600'
  };
  
  const changeIcons = {
    positive: '↗',
    negative: '↘',
    neutral: '→'
  };
  
  return (
    <div className={`bg-white overflow-hidden shadow rounded-lg ${className}`} {...props}>
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {Icon && <Icon className="h-6 w-6 text-gray-400" />}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {value}
                </div>
                {change && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${changeColors[changeType]}`}>
                    <span>{changeIcons[changeType]}</span>
                    <span className="ml-1">{change}</span>
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
