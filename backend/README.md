# MediConnect - Sistema de Gestão de Consultório Médico

Sistema completo para gerenciamento de consultórios médicos, incluindo cadastro de pacientes, médicos, agendamentos, prontuário eletrônico e controle financeiro.

## 🚀 Tecnologias

### Backend
- **Node.js** + **Express.js**
- **MySQL** com **Sequelize ORM**
- **JWT** para autenticação
- **Joi** para validação
- **Winston** para logs
- **Bcrypt** para criptografia de senhas

### Frontend (Em desenvolvimento)
- React
- TailwindCSS
- Axios
- Chart.js/Recharts

## 📋 Pré-requisitos

- Node.js (v14 ou superior)
- MySQL (v5.7 ou superior)
- NPM ou Yarn

## 🔧 Instalação

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/mediconnect.git
cd mediconnect/backend
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o banco de dados

Crie um banco de dados MySQL:
```sql
CREATE DATABASE mediconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e configure:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
NODE_ENV=development
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=mediconnect
DB_USER=root
DB_PASSWORD=sua_senha

JWT_SECRET=gere_uma_chave_segura_aqui
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:3000
```

### 5. Execute as migrations (sincronize o banco)
```bash
npm run dev
```

O Sequelize irá criar automaticamente todas as tabelas no primeiro start em modo development.

### 6. (Opcional) Crie um usuário admin inicial

Após iniciar o servidor, você pode criar um usuário admin fazendo uma requisição POST:

```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Administrador",
    "email": "admin@mediconnect.com",
    "password": "admin123",
    "role": "admin"
  }'
```

## 🏃 Executando o projeto

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

O servidor estará rodando em `http://localhost:5000`

## 📚 Documentação da API

### Autenticação

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "name": "Nome do Usuário",
      "email": "usuario@exemplo.com",
      "role": "admin"
    }
  }
}
```

#### Obter Perfil
```http
GET /api/auth/me
Authorization: Bearer {token}
```

### Pacientes

#### Listar Pacientes
```http
GET /api/patients?page=1&limit=10&search=nome
Authorization: Bearer {token}
```

#### Criar Paciente
```http
POST /api/patients
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "João Silva",
  "cpf": "123.456.789-00",
  "birth_date": "1990-01-15",
  "gender": "male",
  "phone": "(11) 98765-4321",
  "email": "joao@exemplo.com",
  "address_street": "Rua Exemplo",
  "address_number": "123",
  "address_city": "São Paulo",
  "address_state": "SP",
  "health_insurance": "Unimed"
}
```

### Médicos

#### Listar Médicos
```http
GET /api/doctors?page=1&limit=10&specialty=Cardiologia
Authorization: Bearer {token}
```

#### Criar Médico
```http
POST /api/doctors
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Dra. Maria Santos",
  "crm": "123456",
  "crm_state": "SP",
  "cpf": "987.654.321-00",
  "specialty": "Cardiologia",
  "email": "maria@exemplo.com",
  "phone": "(11) 99999-8888",
  "consultation_price": 200.00,
  "consultation_duration": 30
}
```

### Agendamentos

#### Listar Agendamentos
```http
GET /api/appointments?date=2025-10-10&doctor_id=uuid
Authorization: Bearer {token}
```

#### Criar Agendamento
```http
POST /api/appointments
Authorization: Bearer {token}
Content-Type: application/json

{
  "patient_id": "uuid",
  "doctor_id": "uuid",
  "appointment_date": "2025-10-15",
  "appointment_time": "14:30",
  "duration": 30,
  "appointment_type": "first_visit",
  "reason": "Consulta de rotina"
}
```

#### Cancelar Agendamento
```http
PATCH /api/appointments/{id}/cancel
Authorization: Bearer {token}
Content-Type: application/json

{
  "cancellation_reason": "Paciente solicitou cancelamento"
}
```

#### Verificar Horários Disponíveis
```http
GET /api/appointments/doctor/{doctor_id}/available-slots?date=2025-10-15
Authorization: Bearer {token}
```

## 🔐 Níveis de Permissão

### Admin
- Acesso completo ao sistema
- Gerenciar usuários
- Gerenciar médicos e pacientes
- Visualizar relatórios financeiros

### Doctor (Médico)
- Visualizar seus agendamentos
- Acessar prontuários
- Atualizar seus horários de atendimento

### Receptionist (Recepcionista)
- Cadastrar e editar pacientes
- Criar e gerenciar agendamentos
- Visualizar informações de médicos
- Registrar pagamentos

## 📁 Estrutura de Pastas

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Configuração do Sequelize
│   ├── controllers/
│   │   ├── authController.js    # Controlador de autenticação
│   │   ├── patientController.js # Controlador de pacientes
│   │   └── doctorController.js  # Controlador de médicos
│   ├── middlewares/
│   │   ├── authMiddleware.js    # Middleware de autenticação JWT
│   │   └── validation.js        # Middleware de validação com Joi
│   ├── models/
│   │   ├── index.js            # Associações entre modelos
│   │   ├── User.js             # Modelo de usuário
│   │   ├── Patient.js          # Modelo de paciente
│   │   ├── Doctor.js           # Modelo de médico
│   │   └── Appointment.js      # Modelo de agendamento
│   ├── routes/
│   │   ├── authRoutes.js       # Rotas de autenticação
│   │   ├── userRoutes.js       # Rotas de usuários
│   │   ├── patientRoutes.js    # Rotas de pacientes
│   │   ├── doctorRoutes.js     # Rotas de médicos
│   │   └── appointmentRoutes.js # Rotas de agendamentos
│   ├── utils/
│   │   └── logger.js           # Sistema de logs com Winston
│   └── server.js               # Arquivo principal do servidor
├── logs/                        # Logs da aplicação
├── uploads/                     # Arquivos enviados
├── .env                         # Variáveis de ambiente
├── .env.example                 # Exemplo de variáveis
├── .gitignore                   # Arquivos ignorados pelo Git
├── package.json                 # Dependências do projeto
└── README.md                    # Este arquivo
```

## 🗃️ Estrutura do Banco de Dados

### Tabela: users
- **id** (UUID, PK)
- name, email, password
- role (admin, doctor, receptionist)
- phone, avatar
- is_active, last_login
- timestamps

### Tabela: patients
- **id** (UUID, PK)
- name, cpf (unique), birth_date, gender
- email, phone, phone_secondary
- address_* (street, number, complement, neighborhood, city, state, zip)
- health_insurance, health_insurance_number
- blood_type, allergies, chronic_diseases, medications
- emergency_contact_*
- medical_notes, photo
- is_active, timestamps

### Tabela: doctors
- **id** (UUID, PK)
- user_id (FK to users, nullable)
- name, crm, crm_state, cpf (unique)
- specialty, sub_specialties (JSON)
- email, phone, phone_secondary, birth_date
- consultation_price, consultation_duration
- accepts_health_insurance, health_insurances (JSON)
- working_hours (JSON)
- bio, photo, signature, formation
- is_active, timestamps

### Tabela: appointments
- **id** (UUID, PK)
- patient_id (FK to patients)
- doctor_id (FK to doctors)
- appointment_date, appointment_time, duration
- status (scheduled, confirmed, in_progress, completed, cancelled, no_show)
- appointment_type (first_visit, return, follow_up, emergency)
- reason, notes
- price, payment_status, payment_method
- health_insurance_authorization
- cancellation_reason, cancelled_at, cancelled_by (FK to users)
- confirmed_at, completed_at
- reminder_sent, reminder_sent_at
- created_by (FK to users)
- timestamps

## 🛡️ Segurança

- ✅ Senhas criptografadas com bcrypt (salt rounds: 10)
- ✅ Autenticação JWT com expiração configurável
- ✅ Middleware de autorização por role
- ✅ Validação de dados com Joi
- ✅ Proteção contra ataques de força bruta (rate limiting)
- ✅ Headers de segurança com Helmet
- ✅ CORS configurado
- ✅ Logs de auditoria
- ✅ Soft delete para preservar histórico

## 📊 Logs

Os logs são salvos automaticamente em:
- `logs/error.log` - Apenas erros
- `logs/combined.log` - Todos os logs
- `logs/exceptions.log` - Exceções não tratadas
- `logs/rejections.log` - Promises rejeitadas

## 🧪 Testes

```bash
# Executar testes (a implementar)
npm test
```

## 🚀 Deploy

### Opção 1: Render.com

1. Crie uma conta no [Render](https://render.com)
2. Crie um novo Web Service
3. Conecte seu repositório GitHub
4. Configure as variáveis de ambiente
5. Deploy automático!

### Opção 2: AWS EC2

1. Lance uma instância EC2
2. Instale Node.js e MySQL
3. Clone o repositório
4. Configure o PM2 para gerenciar o processo
5. Configure NGINX como reverse proxy

### Opção 3: Vercel (Backend)

```bash
npm install -g vercel
vercel
```

## 🔄 Próximos Passos

### Backend
- [ ] Implementar modelo de Prontuário
- [ ] Sistema de notificações (email/SMS)
- [ ] Upload de arquivos (exames, documentos)
- [ ] Relatórios financeiros
- [ ] Dashboard com estatísticas
- [ ] Sistema de backup automático
- [ ] API de webhooks
- [ ] Integração com sistemas de pagamento

### Frontend
- [ ] Criar interface em React
- [ ] Implementar dashboard interativo
- [ ] Tela de agendamento com calendário
- [ ] Formulários de cadastro
- [ ] Gestão de prontuários
- [ ] Relatórios visuais
- [ ] Sistema de notificações
- [ ] Modo escuro

## 🤝 Contribuindo

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Autor

Desenvolvido por [Seu Nome]

## 📞 Suporte

Para suporte, envie um email para suporte@mediconnect.com ou abra uma issue no GitHub.

---

**MediConnect** - Transformando a gestão de consultórios médicos 🏥