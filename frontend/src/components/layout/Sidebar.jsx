import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Users,
  UserCheck,
  Calendar,
  FileText,
  DollarSign,
  BarChart3,
  Settings,
  UserCog,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Componente Sidebar
 * @returns {JSX.Element} Componente Sidebar
 */
const Sidebar = ({ collapsed, onToggle }) => {
  const { user } = useAuth();
  const { isDark } = useTheme();

  // Menu items baseado na role do usuário
  const getMenuItems = () => {
    const baseItems = [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: Home,
        roles: ['admin', 'doctor', 'receptionist']
      },
      {
        name: 'Pacientes',
        href: '/patients',
        icon: Users,
        roles: ['admin', 'receptionist']
      },
      {
        name: 'Médicos',
        href: '/doctors',
        icon: UserCheck,
        roles: ['admin']
      },
      {
        name: 'Agendamentos',
        href: '/appointments',
        icon: Calendar,
        roles: ['admin', 'doctor', 'receptionist']
      },
      {
        name: 'Prontuários',
        href: '/medical-records',
        icon: FileText,
        roles: ['admin', 'doctor']
      },
      {
        name: 'Financeiro',
        href: '/financial',
        icon: DollarSign,
        roles: ['admin', 'receptionist']
      },
      {
        name: 'Relatórios',
        href: '/reports',
        icon: BarChart3,
        roles: ['admin']
      },
      {
        name: 'Usuários',
        href: '/users',
        icon: UserCog,
        roles: ['admin']
      },
      {
        name: 'Configurações',
        href: '/settings',
        icon: Settings,
        roles: ['admin']
      }
    ];

    return baseItems.filter(item => item.roles.includes(user?.role));
  };

  const menuItems = getMenuItems();

  return (
    <div className={`bg-white shadow-sm border-r border-gray-200 transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed && (
          <h2 className="text-lg font-semibold text-gray-900">
            MediConnect
          </h2>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-4 px-2">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
                title={collapsed ? item.name : ''}
              >
                <Icon
                  className={`flex-shrink-0 h-5 w-5 ${
                    collapsed ? 'mx-auto' : 'mr-3'
                  }`}
                />
                {!collapsed && (
                  <span className="truncate">{item.name}</span>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* User info */}
      {!collapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-900">
                {user?.name}
              </div>
              <div className="text-xs text-gray-500">
                {user?.role === 'admin' ? 'Administrador' : 
                 user?.role === 'doctor' ? 'Médico' : 
                 user?.role === 'receptionist' ? 'Recepcionista' : user?.role}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
