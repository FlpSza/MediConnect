import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Componente Modal reutilizável
 * @param {Object} props - Props do componente
 * @returns {JSX.Element} Componente Modal
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = '',
  overlayClassName = '',
  ...props
}) => {
  // Fechar modal com ESC
  useEffect(() => {
    if (!closeOnEscape) return;
    
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscape]);
  
  // Prevenir scroll do body quando modal estiver aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  // Tamanhos
  const sizes = {
    small: 'max-w-md',
    medium: 'max-w-lg',
    large: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };
  
  // Classes do overlay
  const overlayClasses = [
    'fixed inset-0 z-50 flex items-center justify-center',
    'bg-black bg-opacity-50 transition-opacity duration-300',
    overlayClassName
  ].filter(Boolean).join(' ');
  
  // Classes do modal
  const modalClasses = [
    'bg-white rounded-lg shadow-xl',
    'transform transition-all duration-300',
    'max-h-[90vh] overflow-y-auto',
    sizes[size],
    'mx-4',
    className
  ].filter(Boolean).join(' ');
  
  const handleOverlayClick = (event) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };
  
  return (
    <div className={overlayClasses} onClick={handleOverlayClick} {...props}>
      <div className={modalClasses}>
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            {title && (
              <h2 className="text-lg font-semibold text-gray-900">
                {title}
              </h2>
            )}
            
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

/**
 * Componente Modal Header
 */
export const ModalHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={`flex items-center justify-between p-6 border-b border-gray-200 ${className}`} {...props}>
      {children}
    </div>
  );
};

/**
 * Componente Modal Body
 */
export const ModalBody = ({ children, className = '', ...props }) => {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

/**
 * Componente Modal Footer
 */
export const ModalFooter = ({ children, className = '', ...props }) => {
  return (
    <div className={`flex items-center justify-end space-x-3 p-6 border-t border-gray-200 ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Modal;
