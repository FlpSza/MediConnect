import React from 'react';
import { BarChart3, Download, Calendar } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

/**
 * Página de Relatórios
 * @returns {JSX.Element} Página de Relatórios
 */
const Reports = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="mt-1 text-sm text-gray-600">
            Análises e relatórios do consultório
          </p>
        </div>
        <Button icon={Download}>
          Exportar Relatório
        </Button>
      </div>

      {/* Content */}
      <Card>
        <div className="text-center py-12">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Relatórios e Análises
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Esta funcionalidade será implementada em breve.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Reports;
