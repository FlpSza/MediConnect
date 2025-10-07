import React, { useState } from 'react';
import { Plus, Search, Filter, Download } from 'lucide-react';
import { usePagination } from '../hooks/useApi';
import { getDoctors } from '../services/doctorService';
import { formatCRM, formatPhone } from '../utils/formatters';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Table, { TableActions, TableActionButton, TableStatusBadge } from '../components/common/Table';
import Card from '../components/common/Card';

/**
 * Página de Médicos
 * @returns {JSX.Element} Página de Médicos
 */
const Doctors = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    specialty: '',
    status: ''
  });

  const {
    data: doctors,
    loading,
    params,
    total,
    currentPage,
    totalPages,
    updateParams,
    refresh
  } = usePagination(getDoctors, { search: searchTerm, ...filters });

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
      key: 'crm',
      title: 'CRM',
      render: (value, row) => formatCRM(value, row.crm_state)
    },
    {
      key: 'specialty',
      title: 'Especialidade',
      render: (value) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {value}
        </span>
      )
    },
    {
      key: 'phone',
      title: 'Telefone',
      render: (value) => formatPhone(value)
    },
    {
      key: 'consultation_price',
      title: 'Valor da Consulta',
      render: (value) => `R$ ${value?.toFixed(2) || '0,00'}`
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

  const handleEdit = (doctor) => {
    console.log('Edit doctor:', doctor);
  };

  const handleCreate = () => {
    console.log('Create new doctor');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Médicos</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gerencie o cadastro de médicos
          </p>
        </div>
        <Button onClick={handleCreate} icon={Plus}>
          Novo Médico
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar médicos..."
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
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Especialidade
              </label>
              <select
                value={filters.specialty}
                onChange={(e) => handleFilterChange('specialty', e.target.value)}
                className="input"
              >
                <option value="">Todas</option>
                <option value="Cardiologia">Cardiologia</option>
                <option value="Dermatologia">Dermatologia</option>
                <option value="Pediatria">Pediatria</option>
                <option value="Clínica Geral">Clínica Geral</option>
              </select>
            </div>
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
          </div>
        )}
      </Card>

      {/* Table */}
      <Card>
        <Table
          data={doctors || []}
          columns={columns}
          loading={loading}
          emptyMessage="Nenhum médico encontrado"
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

export default Doctors;
