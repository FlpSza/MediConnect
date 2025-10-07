import React, { useState } from 'react';
import { Plus, Search, Filter, Download, Calendar } from 'lucide-react';
import { usePagination } from '../hooks/useApi';
import { getAppointments } from '../services/appointmentService';
import { formatDateTime, formatCurrency } from '../utils/formatters';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Table, { TableActions, TableActionButton, TableStatusBadge } from '../components/common/Table';
import Card from '../components/common/Card';

/**
 * Página de Agendamentos
 * @returns {JSX.Element} Página de Agendamentos
 */
const Appointments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    doctor: '',
    date: ''
  });

  const {
    data: appointments,
    loading,
    params,
    total,
    currentPage,
    totalPages,
    updateParams,
    refresh
  } = usePagination(getAppointments, { search: searchTerm, ...filters });

  const columns = [
    {
      key: 'patient_name',
      title: 'Paciente',
      render: (value, row) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-sm font-medium text-primary-600">
              {value?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{row.patient_phone}</div>
          </div>
        </div>
      )
    },
    {
      key: 'doctor_name',
      title: 'Médico',
      render: (value) => (
        <div className="text-sm font-medium text-gray-900">{value}</div>
      )
    },
    {
      key: 'appointment_date',
      title: 'Data/Hora',
      render: (value, row) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {formatDateTime(value)}
          </div>
          <div className="text-sm text-gray-500">
            {row.appointment_time}
          </div>
        </div>
      )
    },
    {
      key: 'appointment_type',
      title: 'Tipo',
      render: (value) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          {value === 'first_visit' ? 'Primeira Consulta' :
           value === 'return' ? 'Retorno' :
           value === 'follow_up' ? 'Acompanhamento' :
           value === 'emergency' ? 'Emergência' : value}
        </span>
      )
    },
    {
      key: 'price',
      title: 'Valor',
      render: (value) => formatCurrency(value)
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => (
        <TableStatusBadge status={value} />
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

  const handleEdit = (appointment) => {
    console.log('Edit appointment:', appointment);
  };

  const handleCreate = () => {
    console.log('Create new appointment');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agendamentos</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gerencie os agendamentos de consultas
          </p>
        </div>
        <Button onClick={handleCreate} icon={Plus}>
          Novo Agendamento
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar agendamentos..."
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
                <option value="scheduled">Agendado</option>
                <option value="confirmed">Confirmado</option>
                <option value="in_progress">Em andamento</option>
                <option value="completed">Concluído</option>
                <option value="cancelled">Cancelado</option>
                <option value="no_show">Não compareceu</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Médico
              </label>
              <select
                value={filters.doctor}
                onChange={(e) => handleFilterChange('doctor', e.target.value)}
                className="input"
              >
                <option value="">Todos</option>
                <option value="1">Dr. João Silva</option>
                <option value="2">Dra. Ana Costa</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data
              </label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => handleFilterChange('date', e.target.value)}
                className="input"
              />
            </div>
          </div>
        )}
      </Card>

      {/* Table */}
      <Card>
        <Table
          data={appointments || []}
          columns={columns}
          loading={loading}
          emptyMessage="Nenhum agendamento encontrado"
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

export default Appointments;
