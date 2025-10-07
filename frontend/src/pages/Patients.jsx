import React, { useState } from 'react';
import { Plus, Search, Filter, Download } from 'lucide-react';
import { usePagination } from '../hooks/useApi';
import { getPatients } from '../services/patientService';
import { formatCPF, formatPhone, formatDate } from '../utils/formatters';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Table, { TableActions, TableActionButton, TableStatusBadge } from '../components/common/Table';
import Card from '../components/common/Card';

/**
 * Página de Pacientes
 * @returns {JSX.Element} Página de Pacientes
 */
const Patients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    insurance: '',
    gender: ''
  });

  const {
    data: patients,
    loading,
    params,
    total,
    currentPage,
    totalPages,
    updateParams,
    refresh
  } = usePagination(getPatients, { search: searchTerm, ...filters });

  const columns = [
    {
      key: 'name',
      title: 'Nome',
      render: (value, row) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-sm font-medium text-primary-600">
              {value?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'cpf',
      title: 'CPF',
      render: (value) => formatCPF(value)
    },
    {
      key: 'phone',
      title: 'Telefone',
      render: (value) => formatPhone(value)
    },
    {
      key: 'birth_date',
      title: 'Data de Nascimento',
      render: (value) => formatDate(value)
    },
    {
      key: 'is_active',
      title: 'Status',
      render: (value) => (
        <TableStatusBadge status={value ? 'active' : 'inactive'} />
      )
    },
    {
      key: 'actions',
      title: 'Ações',
      sortable: false,
      render: (_, row) => (
        <TableActions>
          <TableActionButton onClick={() => handleEdit(row)} />
        </TableActions>
      )
    }
  ];

  const handleSearch = (value) => {
    setSearchTerm(value);
    updateParams({ search: value, page: 1 });
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    updateParams({ ...newFilters, page: 1 });
  };

  const handleEdit = (patient) => {
    console.log('Edit patient:', patient);
  };

  const handleCreate = () => {
    console.log('Create new patient');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gerencie o cadastro de pacientes
          </p>
        </div>
        <Button onClick={handleCreate} icon={Plus}>
          Novo Paciente
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar pacientes..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              icon={Search}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            icon={Filter}
          >
            Filtros
          </Button>
          <Button variant="outline" icon={Download}>
            Exportar
          </Button>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="input"
              >
                <option value="">Todos</option>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gênero
              </label>
              <select
                value={filters.gender}
                onChange={(e) => handleFilterChange('gender', e.target.value)}
                className="input"
              >
                <option value="">Todos</option>
                <option value="male">Masculino</option>
                <option value="female">Feminino</option>
                <option value="other">Outro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Convênio
              </label>
              <select
                value={filters.insurance}
                onChange={(e) => handleFilterChange('insurance', e.target.value)}
                className="input"
              >
                <option value="">Todos</option>
                <option value="unimed">Unimed</option>
                <option value="bradesco">Bradesco</option>
                <option value="particular">Particular</option>
              </select>
            </div>
          </div>
        )}
      </Card>

      {/* Table */}
      <Card>
        <Table
          data={patients || []}
          columns={columns}
          loading={loading}
          emptyMessage="Nenhum paciente encontrado"
          onSort={(column, direction) => {
            updateParams({ sortBy: column, sortOrder: direction });
          }}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Mostrando {((currentPage - 1) * params.limit) + 1} a {Math.min(currentPage * params.limit, total)} de {total} resultados
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="small"
                disabled={currentPage === 1}
                onClick={() => updateParams({ page: currentPage - 1 })}
              >
                Anterior
              </Button>
              <span className="text-sm text-gray-700">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="small"
                disabled={currentPage === totalPages}
                onClick={() => updateParams({ page: currentPage + 1 })}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Patients;
