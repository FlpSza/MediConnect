import React from 'react';

/**
 * Componente Footer
 * @returns {JSX.Element} Componente Footer
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              © {currentYear} MediConnect. Todos os direitos reservados.
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Versão 1.0.0</span>
              <span>•</span>
              <span>Desenvolvido com ❤️</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
