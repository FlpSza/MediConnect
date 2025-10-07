import React from 'react';
import { FileText, Search, Filter } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';

/**
 * Página de Prontuários
 * @returns {JSX.Element} Página de Prontuários
 */
const MedicalRecords = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prontuários</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gerencie os prontuários médicos
          </p>
        </div>
      </div>

      {/* Content */}
      <Card>
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Prontuários Médicos
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Esta funcionalidade será implementada em breve.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default MedicalRecords;
