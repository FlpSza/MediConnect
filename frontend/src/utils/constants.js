// ==================== CONSTANTES DA APLICAÇÃO ====================

// URLs da API
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Roles de usuário
export const USER_ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  RECEPTIONIST: 'receptionist'
};

// Status de agendamento
export const APPOINTMENT_STATUS = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show'
};

// Status de pagamento
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  OVERDUE: 'overdue'
};

// Tipos de agendamento
export const APPOINTMENT_TYPES = {
  FIRST_VISIT: 'first_visit',
  RETURN: 'return',
  FOLLOW_UP: 'follow_up',
  EMERGENCY: 'emergency'
};

// Métodos de pagamento
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  PIX: 'pix',
  BANK_TRANSFER: 'bank_transfer',
  HEALTH_INSURANCE: 'health_insurance'
};

// Gêneros
export const GENDERS = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other'
};

// Tipos sanguíneos
export const BLOOD_TYPES = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
];

// Estados brasileiros
export const BRAZILIAN_STATES = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' }
];

// Especialidades médicas
export const MEDICAL_SPECIALTIES = [
  'Cardiologia',
  'Dermatologia',
  'Endocrinologia',
  'Gastroenterologia',
  'Ginecologia',
  'Neurologia',
  'Oftalmologia',
  'Ortopedia',
  'Pediatria',
  'Psiquiatria',
  'Urologia',
  'Clínica Geral',
  'Medicina do Trabalho',
  'Medicina Esportiva',
  'Medicina Preventiva'
];

// Dias da semana
export const WEEKDAYS = [
  { value: 'monday', label: 'Segunda-feira' },
  { value: 'tuesday', label: 'Terça-feira' },
  { value: 'wednesday', label: 'Quarta-feira' },
  { value: 'thursday', label: 'Quinta-feira' },
  { value: 'friday', label: 'Sexta-feira' },
  { value: 'saturday', label: 'Sábado' },
  { value: 'sunday', label: 'Domingo' }
];

// Horários padrão
export const DEFAULT_TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00'
];

// Configurações de paginação
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100]
};

// Configurações de upload
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
};

// Mensagens de validação
export const VALIDATION_MESSAGES = {
  REQUIRED: 'Este campo é obrigatório',
  EMAIL_INVALID: 'Email inválido',
  CPF_INVALID: 'CPF inválido',
  PHONE_INVALID: 'Telefone inválido',
  CEP_INVALID: 'CEP inválido',
  PASSWORD_WEAK: 'Senha muito fraca',
  PASSWORD_MISMATCH: 'Senhas não coincidem',
  MIN_LENGTH: (min) => `Mínimo de ${min} caracteres`,
  MAX_LENGTH: (max) => `Máximo de ${max} caracteres`
};

// Mensagens de sucesso
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login realizado com sucesso',
  LOGOUT: 'Logout realizado com sucesso',
  SAVE: 'Dados salvos com sucesso',
  UPDATE: 'Dados atualizados com sucesso',
  DELETE: 'Item excluído com sucesso',
  CREATE: 'Item criado com sucesso',
  SEND: 'Enviado com sucesso'
};

// Mensagens de erro
export const ERROR_MESSAGES = {
  LOGIN_FAILED: 'Email ou senha incorretos',
  UNAUTHORIZED: 'Acesso não autorizado',
  FORBIDDEN: 'Acesso negado',
  NOT_FOUND: 'Item não encontrado',
  SERVER_ERROR: 'Erro interno do servidor',
  NETWORK_ERROR: 'Erro de conexão',
  VALIDATION_ERROR: 'Dados inválidos',
  UNKNOWN_ERROR: 'Erro desconhecido'
};

// Configurações de notificação
export const NOTIFICATION_CONFIG = {
  DURATION: 5000,
  POSITION: 'top-right'
};

// Configurações de tema
export const THEME_CONFIG = {
  DEFAULT_THEME: 'light',
  AVAILABLE_THEMES: ['light', 'dark']
};

// Configurações de cache
export const CACHE_CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutos
  USER_DATA_TTL: 10 * 60 * 1000, // 10 minutos
  APPOINTMENTS_TTL: 2 * 60 * 1000 // 2 minutos
};

// Configurações de relatórios
export const REPORT_CONFIG = {
  DEFAULT_DATE_RANGE: 30, // dias
  MAX_DATE_RANGE: 365, // dias
  EXPORT_FORMATS: ['pdf', 'excel', 'csv']
};

// Configurações de backup
export const BACKUP_CONFIG = {
  AUTO_BACKUP_ENABLED: true,
  BACKUP_RETENTION_DAYS: 30,
  BACKUP_SCHEDULE: '0 2 * * *' // Todo dia às 2h
};

// Configurações de segurança
export const SECURITY_CONFIG = {
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutos
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000 // 15 minutos
};

// Configurações de dashboard
export const DASHBOARD_CONFIG = {
  REFRESH_INTERVAL: 30 * 1000, // 30 segundos
  CHART_COLORS: [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
    '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
  ]
};

// Configurações de calendário
export const CALENDAR_CONFIG = {
  DEFAULT_VIEW: 'month',
  AVAILABLE_VIEWS: ['month', 'week', 'day'],
  WORKING_HOURS: {
    START: '08:00',
    END: '18:00'
  }
};

// Configurações de impressão
export const PRINT_CONFIG = {
  PAGE_SIZE: 'A4',
  MARGIN: '1cm',
  FONT_SIZE: '12px',
  FONT_FAMILY: 'Arial, sans-serif'
};

// Configurações de exportação
export const EXPORT_CONFIG = {
  DEFAULT_FORMAT: 'pdf',
  AVAILABLE_FORMATS: ['pdf', 'excel', 'csv', 'json'],
  MAX_RECORDS: 10000
};

// Configurações de integração
export const INTEGRATION_CONFIG = {
  EMAIL_ENABLED: true,
  SMS_ENABLED: true,
  BACKUP_ENABLED: true,
  REPORTS_ENABLED: true
};

// Configurações de desenvolvimento
export const DEV_CONFIG = {
  DEBUG_MODE: import.meta.env.DEV,
  MOCK_API: import.meta.env.VITE_MOCK_API === 'true',
  LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL || 'info'
};
