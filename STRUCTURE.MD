# 📂 Estrutura Completa do Projeto MediConnect

## 🗂️ Árvore de Diretórios

```
mediconnect/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js              # Configuração Sequelize + MySQL
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js        # Login, logout, recuperação senha
│   │   │   ├── patientController.js     # CRUD pacientes
│   │   │   ├── doctorController.js      # CRUD médicos
│   │   │   └── appointmentController.js # Gestão de agendamentos (futuro)
│   │   │
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js        # JWT auth + autorização por role
│   │   │   ├── validation.js            # Validação com Joi
│   │   │   └── errorHandler.js          # Tratamento de erros (futuro)
│   │   │
│   │   ├── models/
│   │   │   ├── index.js                 # Relacionamentos entre modelos
│   │   │   ├── User.js                  # Usuários do sistema
│   │   │   ├── Patient.js               # Pacientes
│   │   │   ├── Doctor.js                # Médicos
│   │   │   ├── Appointment.js           # Agendamentos
│   │   │   ├── MedicalRecord.js         # Prontuário (futuro)
│   │   │   ├── Payment.js               # Pagamentos (futuro)
│   │   │   └── HealthInsurance.js       # Convênios (futuro)
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js            # Rotas de autenticação
│   │   │   ├── userRoutes.js            # Rotas de usuários
│   │   │   ├── patientRoutes.js         # Rotas de pacientes
│   │   │   ├── doctorRoutes.js          # Rotas de médicos
│   │   │   ├── appointmentRoutes.js     # Rotas de agendamentos
│   │   │   ├── medicalRecordRoutes.js   # Rotas de prontuário (futuro)
│   │   │   ├── paymentRoutes.js         # Rotas de pagamentos (futuro)
│   │   │   └── reportRoutes.js          # Rotas de relatórios (futuro)
│   │   │
│   │   ├── services/
│   │   │   ├── emailService.js          # Envio de emails (futuro)
│   │   │   ├── smsService.js            # Envio de SMS (futuro)
│   │   │   ├── backupService.js         # Backup automático (futuro)
│   │   │   └── reportService.js         # Geração de relatórios (futuro)
│   │   │
│   │   ├── utils/
│   │   │   ├── logger.js                # Sistema de logs Winston
│   │   │   ├── seedDatabase.js          # Popular banco com dados teste
│   │   │   ├── formatters.js            # Formatadores (CPF, data, etc)
│   │   │   └── validators.js            # Validadores customizados
│   │   │
│   │   └── server.js                    # Arquivo principal do servidor
│   │
│   ├── logs/                             # Logs da aplicação
│   │   ├── error.log                    # Apenas erros
│   │   ├── combined.log                 # Todos os logs
│   │   ├── exceptions.log               # Exceções não tratadas
│   │   └── rejections.log               # Promises rejeitadas
│   │
│   ├── uploads/                          # Arquivos enviados
│   │   ├── patients/                    # Fotos de pacientes
│   │   ├── doctors/                     # Fotos e assinaturas
│   │   ├── documents/                   # Documentos diversos
│   │   └── exams/                       # Exames médicos
│   │
│   ├── tests/                            # Testes (futuro)
│   │   ├── unit/                        # Testes unitários
│   │   ├── integration/                 # Testes de integração
│   │   └── e2e/                         # Testes end-to-end
│   │
│   ├── .env                              # Variáveis de ambiente (não commitar)
│   ├── .env.example                      # Exemplo de variáveis
│   ├── .gitignore                        # Arquivos ignorados pelo Git
│   ├── package.json                      # Dependências do projeto
│   ├── README.md                         # Documentação principal
│   ├── QUICKSTART.md                     # Guia de início rápido
│   └── PROJECT_STRUCTURE.md              # Este arquivo
│
└── frontend/                             # (A desenvolver)
    ├── public/
    │   ├── index.html
    │   └── favicon.ico
    │
    ├── src/
    │   ├── components/                   # Componentes React
    │   │   ├── common/                  # Componentes reutilizáveis
    │   │   │   ├── Button.jsx
    │   │   │   ├── Input.jsx
    │   │   │   ├── Modal.jsx
    │   │   │   ├── Table.jsx
    │   │   │   └── Card.jsx
    │   │   │
    │   │   ├── layout/                  # Layout da aplicação
    │   │   │   ├── Header.jsx
    │   │   │   ├── Sidebar.jsx
    │   │   │   └── Footer.jsx
    │   │   │
    │   │   ├── patients/                # Componentes de pacientes
    │   │   │   ├── PatientList.jsx
    │   │   │   ├── PatientForm.jsx
    │   │   │   └── PatientCard.jsx
    │   │   │
    │   │   ├── doctors/                 # Componentes de médicos
    │   │   │   ├── DoctorList.jsx
    │   │   │   ├── DoctorForm.jsx
    │   │   │   └── DoctorCard.jsx
    │   │   │
    │   │   └── appointments/            # Componentes de agendamentos
    │   │       ├── Calendar.jsx
    │   │       ├── AppointmentForm.jsx
    │   │       └── AppointmentList.jsx
    │   │
    │   ├── pages/                        # Páginas principais
    │   │   ├── Login.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Patients.jsx
    │   │   ├── Doctors.jsx
    │   │   ├── Appointments.jsx
    │   │   ├── MedicalRecords.jsx
    │   │   ├── Financial.jsx
    │   │   ├── Reports.jsx
    │   │   └── Settings.jsx
    │   │
    │   ├── contexts/                     # Context API
    │   │   ├── AuthContext.jsx
    │   │   ├── ThemeContext.jsx
    │   │   └── NotificationContext.jsx
    │   │
    │   ├── hooks/                        # Custom hooks
    │   │   ├── useAuth.js
    │   │   ├── useApi.js
    │   │   └── useDebounce.js
    │   │
    │   ├── services/                     # Serviços de API
    │   │   ├── api.js                   # Configuração Axios
    │   │   ├── authService.js
    │   │   ├── patientService.js
    │   │   ├── doctorService.js
    │   │   └── appointmentService.js
    │   │
    │   ├── routes/                       # Configuração de rotas
    │   │   ├── PrivateRoute.jsx
    │   │   └── routes.js
    │   │
    │   ├── utils/                        # Utilitários
    │   │   ├── formatters.js
    │   │   ├── validators.js
    │   │   └── constants.js
    │   │
    │   ├── assets/                       # Recursos estáticos
    │   │   ├── images/
    │   │   └── styles/
    │   │
    │   ├── App.jsx                       # Componente principal
    │   ├── index.js                      # Ponto de entrada
    │   └── index.css                     # Estilos globais
    │
    ├── .gitignore
    ├── package.json
    ├── tailwind.config.js
    └── README.md
```

---

## 📊 Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌──────────┐ │
│  │   React   │  │ TailwindCSS│  │   Axios   │  │ Context  │ │
│  └─────┬─────┘  └───────────┘  └─────┬─────┘  └──────────┘ │
└────────┼────────────────────────────┼─────────────────────┘
         │                            │
         │         HTTP/HTTPS         │
         │      (JWT Bearer Token)    │
         ▼                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API REST (Express)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐ │
│  │  Routes  │→ │Controllers│→ │  Models  │→ │  Database   │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────────┘ │
│       ↓              ↓              ↓                        │
│  Middlewares   Services      Sequelize                      │
│  - Auth        - Email       - Validação                    │
│  - Validation  - SMS         - Hooks                        │
│  - Logging     - Backup      - Associations                 │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                      MySQL Database                          │
│  ┌───────┐  ┌──────────┐  ┌─────────┐  ┌──────────────┐   │
│  │ Users │  │ Patients │  │ Doctors │  │ Appointments │   │
│  └───┬───┘  └────┬─────┘  └────┬────┘  └──────┬───────┘   │
│      │           │              │               │           │
│      └───────────┴──────────────┴───────────────┘           │
│                   Relationships                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo de Dados

### Exemplo: Criar Agendamento

```
1. Frontend (React)
   └─→ appointmentService.create(data)
        └─→ axios.post('/api/appointments', data, { headers: { Authorization: token }})

2. Backend (Express)
   └─→ POST /api/appointments
        ├─→ authMiddleware.authenticate()     # Valida JWT
        ├─→ authorize('admin', 'receptionist') # Verifica permissão
        ├─→ validate(createAppointmentSchema)  # Valida dados
        └─→ appointmentController.create()
             ├─→ Verifica médico disponível
             ├─→ Verifica conflito de horário
             ├─→ Appointment.create()
             └─→ Retorna JSON com sucesso

3. Database (MySQL)
   └─→ INSERT INTO appointments (...)
        └─→ Retorna ID gerado

4. Response
   └─→ { success: true, data: {...} }
```

---

## 🗄️ Relacionamentos do Banco

```
users                    doctors
┌─────────┐             ┌──────────┐
│ id (PK) │────┐        │ id (PK)  │
│ email   │    │   ┌────│ user_id  │
│ password│    │   │    │ name     │
│ role    │    │   │    │ crm      │
└─────────┘    │   │    │ specialty│
               │   │    └────┬─────┘
               │   │         │
               │   │         │
patients       │   │         │      appointments
┌─────────┐    │   │         │      ┌──────────────┐
│ id (PK) │    │   │         └──────│ doctor_id    │
│ name    │    │   │                │ patient_id ──┼───┐
│ cpf     │    │   │                │ date         │   │
│ phone   │    │   │           ┌────│ created_by   │   │
└────┬────┘    │   │           │    │ cancelled_by │   │
     │         │   │           │    └──────────────┘   │
     │         └───┼───────────┘                       │
     └─────────────┘───────────────────────────────────┘
```

---

## 🛠️ Tecnologias e Ferramentas

### Backend
| Tecnologia | Versão | Propósito |
|-----------|--------|-----------|
| Node.js | 14+ | Runtime JavaScript |
| Express | 4.18+ | Framework web |
| MySQL | 5.7+ | Banco de dados |
| Sequelize | 6.33+ | ORM |
| JWT | 9.0+ | Autenticação |
| Joi | 17.10+ | Validação |
| Bcrypt | 2.4+ | Criptografia |
| Winston | 3.11+ | Logging |
| Helmet | 7.0+ | Segurança |
| Multer | 1.4+ | Upload de arquivos |

### Frontend (Planejado)
| Tecnologia | Propósito |
|-----------|-----------|
| React | 18+ | Framework UI |
| TailwindCSS | 3+ | Estilização |
| Axios | 1.5+ | Cliente HTTP |
| React Router | 6+ | Roteamento |
| Recharts | 2+ | Gráficos |
| Date-fns | 2+ | Manipulação de datas |
| React Hook Form | 7+ | Formulários |

---

## 🎯 Módulos do Sistema

### ✅ Implementados
- [x] Autenticação JWT
- [x] CRUD de Usuários
- [x] CRUD de Pacientes
- [x] CRUD de Médicos
- [x] CRUD de Agendamentos
- [x] Sistema de Logs
- [x] Validação de dados
- [x] Controle de permissões

### 🚧 Em Desenvolvimento
- [ ] Prontuário Eletrônico
- [ ] Sistema Financeiro
- [ ] Relatórios e Dashboard
- [ ] Notificações (Email/SMS)
- [ ] Upload de arquivos

### 📋 Planejados
- [ ] Frontend React completo
- [ ] Sistema de Backup automático
- [ ] Integração com pagamentos
- [ ] API de Webhooks
- [ ] Aplicativo mobile
- [ ] Telemedicina (vídeo)

---

## 📈 Métricas e KPIs

O sistema permitirá acompanhar:
- Total de pacientes ativos
- Consultas realizadas por período
- Taxa de ocupação dos médicos
- Receita por especialidade
- Convênios mais utilizados
- Taxa de comparecimento
- Tempo médio de consulta
- Satisfação dos pacientes

---

## 🔐 Segurança Implementada

- ✅ Senhas criptografadas (bcrypt)
- ✅ Autenticação JWT
- ✅ Rate limiting
- ✅ Helmet security headers
- ✅ CORS configurado
- ✅ Validação de entrada
- ✅ SQL Injection protection (ORM)
- ✅ Logs de auditoria
- ✅ Soft delete (preserva histórico)

---

## 📞 Endpoints da API

Total de endpoints: **40+**

### Resumo por módulo:
- **Auth**: 7 endpoints
- **Users**: 5 endpoints  
- **Patients**: 7 endpoints
- **Doctors**: 7 endpoints
- **Appointments**: 9 endpoints
- **Medical Records**: 6 endpoints (futuro)
- **Payments**: 5 endpoints (futuro)
- **Reports**: 4 endpoints (futuro)

---

**Estrutura criada por: MediConnect Team**  
**Última atualização: Outubro 2025**