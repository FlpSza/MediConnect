import React from 'react';
import {
  Users,
  UserCheck,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';
import { CardStats } from '../components/common/Card';
import { useApi } from '../hooks/useApi';
import { getPatientsGeneralStats } from '../services/patientService';
import { getDoctorsGeneralStats } from '../services/doctorService';
import { getAppointmentStats } from '../services/appointmentService';

/**
 * Página Dashboard
 * @returns {JSX.Element} Página Dashboard
 */
const Dashboard = () => {
  // Estatísticas de pacientes
  const { data: patientStats, loading: patientLoading } = useApi(
    getPatientsGeneralStats,
    [],
    { showErrorNotification: false }
  );

  // Estatísticas de médicos
  const { data: doctorStats, loading: doctorLoading } = useApi(
    getDoctorsGeneralStats,
    [],
    { showErrorNotification: false }
  );

  // Estatísticas de agendamentos
  const { data: appointmentStats, loading: appointmentLoading } = useApi(
    getAppointmentStats,
    [],
    { showErrorNotification: false }
  );

  const stats = [
    {
      title: 'Total de Pacientes',
      value: patientStats?.total || 0,
      change: patientStats?.growth || '0%',
      changeType: patientStats?.growth > 0 ? 'positive' : 'neutral',
      icon: Users
    },
    {
      title: 'Médicos Ativos',
      value: doctorStats?.active || 0,
      change: doctorStats?.growth || '0%',
      changeType: doctorStats?.growth > 0 ? 'positive' : 'neutral',
      icon: UserCheck
    },
    {
      title: 'Agendamentos Hoje',
      value: appointmentStats?.today || 0,
      change: appointmentStats?.todayGrowth || '0%',
      changeType: appointmentStats?.todayGrowth > 0 ? 'positive' : 'neutral',
      icon: Calendar
    },
    {
      title: 'Receita do Mês',
      value: `R$ ${appointmentStats?.monthlyRevenue || 0}`,
      change: appointmentStats?.revenueGrowth || '0%',
      changeType: appointmentStats?.revenueGrowth > 0 ? 'positive' : 'neutral',
      icon: DollarSign
    }
  ];

  const loading = patientLoading || doctorLoading || appointmentLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Visão geral do seu consultório médico
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <CardStats
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            changeType={stat.changeType}
            icon={stat.icon}
            loading={loading}
          />
        ))}
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Appointments */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Próximos Agendamentos
            </h3>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="animate-pulse space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {appointmentStats?.upcoming?.map((appointment, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.patientName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {appointment.time} - {appointment.doctorName}
                      </div>
                    </div>
                  </div>
                )) || (
                  <p className="text-sm text-gray-500">
                    Nenhum agendamento próximo
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Ações Rápidas
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Users className="h-8 w-8 text-primary-600 mb-2" />
                <div className="text-sm font-medium text-gray-900">
                  Novo Paciente
                </div>
                <div className="text-xs text-gray-500">
                  Cadastrar paciente
                </div>
              </button>
              
              <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Calendar className="h-8 w-8 text-primary-600 mb-2" />
                <div className="text-sm font-medium text-gray-900">
                  Novo Agendamento
                </div>
                <div className="text-xs text-gray-500">
                  Agendar consulta
                </div>
              </button>
              
              <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <DollarSign className="h-8 w-8 text-primary-600 mb-2" />
                <div className="text-sm font-medium text-gray-900">
                  Registrar Pagamento
                </div>
                <div className="text-xs text-gray-500">
                  Receber pagamento
                </div>
              </button>
              
              <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Activity className="h-8 w-8 text-primary-600 mb-2" />
                <div className="text-sm font-medium text-gray-900">
                  Ver Relatórios
                </div>
                <div className="text-xs text-gray-500">
                  Análises e gráficos
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
