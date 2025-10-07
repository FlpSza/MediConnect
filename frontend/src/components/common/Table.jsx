import React from 'react';
import { ChevronUp, ChevronDown, MoreHorizontal } from 'lucide-react';

/**
 * Componente Table reutilizável
 * @param {Object} props - Props do componente
 * @returns {JSX.Element} Componente Table
 */
const Table = ({
  data = [],
  columns = [],
  loading = false,
  emptyMessage = 'Nenhum dado encontrado',
  className = '',
  onRowClick = null,
  sortable = true,
  onSort = null,
  sortColumn = null,
  sortDirection = 'asc',
  ...props
}) => {
  const handleSort = (column) => {
    if (!sortable || !onSort) return;
    
    const direction = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(column, direction);
  };
  
  const getSortIcon = (column) => {
    if (sortColumn !== column) {
      return <ChevronUp className="h-4 w-4 text-gray-400" />;
    }
    
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4 text-primary-600" />
    ) : (
      <ChevronDown className="h-4 w-4 text-primary-600" />
    );
  };
  
  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded-t-lg"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 border-b border-gray-200"></div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className={`bg-white shadow rounded-lg overflow-hidden ${className}`} {...props}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Header */}
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    sortable && column.sortable !== false ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.title}</span>
                    {sortable && column.sortable !== false && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          {/* Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={row.id || index}
                  className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * Componente Table Actions
 */
export const TableActions = ({ children, className = '', ...props }) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`} {...props}>
      {children}
    </div>
  );
};

/**
 * Componente Table Action Button
 */
export const TableActionButton = ({ 
  icon: Icon = MoreHorizontal, 
  onClick, 
  className = '',
  ...props 
}) => {
  return (
    <button
      onClick={onClick}
      className={`p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors ${className}`}
      {...props}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
};

/**
 * Componente Table Status Badge
 */
export const TableStatusBadge = ({ status, className = '', ...props }) => {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
    scheduled: 'bg-purple-100 text-purple-800',
    confirmed: 'bg-green-100 text-green-800',
    in_progress: 'bg-blue-100 text-blue-800',
    no_show: 'bg-red-100 text-red-800'
  };
  
  const statusLabels = {
    active: 'Ativo',
    inactive: 'Inativo',
    pending: 'Pendente',
    completed: 'Concluído',
    cancelled: 'Cancelado',
    scheduled: 'Agendado',
    confirmed: 'Confirmado',
    in_progress: 'Em andamento',
    no_show: 'Não compareceu'
  };
  
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        statusColors[status] || 'bg-gray-100 text-gray-800'
      } ${className}`}
      {...props}
    >
      {statusLabels[status] || status}
    </span>
  );
};

/**
 * Componente Table Avatar
 */
export const TableAvatar = ({ src, name, className = '', ...props }) => {
  const initials = name
    ?.split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2) || '';
  
  return (
    <div className={`flex items-center ${className}`} {...props}>
      {src ? (
        <img
          className="h-8 w-8 rounded-full object-cover"
          src={src}
          alt={name}
        />
      ) : (
        <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
          <span className="text-xs font-medium text-white">
            {initials}
          </span>
        </div>
      )}
      {name && (
        <span className="ml-3 text-sm font-medium text-gray-900">
          {name}
        </span>
      )}
    </div>
  );
};

export default Table;
