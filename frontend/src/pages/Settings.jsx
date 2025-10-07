import React from 'react';
import { Settings as SettingsIcon, User, Bell, Shield } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

/**
 * Página de Configurações
 * @returns {JSX.Element} Página de Configurações
 */
const Settings = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="mt-1 text-sm text-gray-600">
          Configure as preferências do sistema
        </p>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Profile Settings */}
        <Card title="Perfil" icon={User}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome
              </label>
              <input
                type="text"
                className="input"
                defaultValue="Administrador Sistema"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                className="input"
                defaultValue="admin@mediconnect.com"
              />
            </div>
            <Button>Salvar Alterações</Button>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card title="Notificações" icon={Bell}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">
                  Notificações por Email
                </div>
                <div className="text-sm text-gray-500">
                  Receber notificações por email
                </div>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                defaultChecked
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">
                  Notificações por SMS
                </div>
                <div className="text-sm text-gray-500">
                  Receber notificações por SMS
                </div>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>
            <Button>Salvar Configurações</Button>
          </div>
        </Card>

        {/* Security Settings */}
        <Card title="Segurança" icon={Shield}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha Atual
              </label>
              <input
                type="password"
                className="input"
                placeholder="Digite sua senha atual"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nova Senha
              </label>
              <input
                type="password"
                className="input"
                placeholder="Digite a nova senha"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                className="input"
                placeholder="Confirme a nova senha"
              />
            </div>
            <Button>Alterar Senha</Button>
          </div>
        </Card>

        {/* System Settings */}
        <Card title="Sistema" icon={SettingsIcon}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tema
              </label>
              <select className="input">
                <option value="light">Claro</option>
                <option value="dark">Escuro</option>
                <option value="auto">Automático</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Idioma
              </label>
              <select className="input">
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
                <option value="es-ES">Español</option>
              </select>
            </div>
            <Button>Salvar Configurações</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
