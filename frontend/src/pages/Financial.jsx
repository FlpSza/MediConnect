import React from 'react';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { CardStats } from '../components/common/Card';
import Card from '../components/common/Card';

/**
 * Página Financeiro
 * @returns {JSX.Element} Página Financeiro
 */
const Financial = () => {
  const stats = [
    {
      title: 'Receita do Mês',
      value: 'R$ 45.230,00',
      change: '+12%',
      changeType: 'positive',
      icon: DollarSign
    },
    {
      title: 'Receita Pendente',
      value: 'R$ 8.450,00',
      change: '-5%',
      changeType: 'negative',
      icon: TrendingUp
    },
    {
      title: 'Total de Pagamentos',
      value: '156',
      change: '+8%',
      changeType: 'positive',
      icon: TrendingDown
    },
    {
      title: 'Média por Consulta',
      value: 'R$ 180,00',
      change: '+3%',
      changeType: 'positive',
      icon: DollarSign
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
        <p className="mt-1 text-sm text-gray-600">
          Controle financeiro do consultório
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
          />
        ))}
      </div>

      {/* Content */}
      <Card>
        <div className="text-center py-12">
          <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Controle Financeiro
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Esta funcionalidade será implementada em breve.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Financial;
