# 🏥 MediConnect

<div align="center">

![MediConnect Logo](https://img.shields.io/badge/MediConnect-Sistema_de_Gestão_Médica-00a8ff?style=for-the-badge)

**Sistema completo de gestão para consultórios e clínicas médicas**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)

[Características](#-características) •
[Tecnologias](#-tecnologias) •
[Instalação](#-instalação) •
[Uso](#-uso) •
[API](#-api) •
[Licença](#-licença)

</div>

---

## 📋 Sobre o Projeto

O **MediConnect** é um sistema completo de gestão para consultórios e clínicas médicas, desenvolvido com as mais modernas tecnologias do mercado. O sistema oferece uma solução integrada para gerenciamento de pacientes, médicos, agendamentos, prontuários eletrônicos, controle financeiro e muito mais.

### 🎯 Objetivo

Proporcionar uma ferramenta robusta, segura e fácil de usar para profissionais da saúde, otimizando processos administrativos e melhorando o atendimento aos pacientes.

---

## ✨ Características

### 👥 Gestão de Pacientes
- ✅ Cadastro completo com dados pessoais e endereço
- ✅ Histórico de consultas e prontuários
- ✅ Gerenciamento de convênios médicos
- ✅ Controle de documentos e exames
- ✅ Busca avançada e filtros

### 👨‍⚕️ Gestão de Médicos
- ✅ Cadastro com especialidades e CRM
- ✅ Controle de agenda e disponibilidade
- ✅ Definição de horários de atendimento
- ✅ Preços de consulta personalizados
- ✅ Estatísticas de atendimento

### 📅 Agendamento de Consultas
- ✅ Calendário interativo e intuitivo
- ✅ Agendamento online
- ✅ Confirmação automática por email/SMS
- ✅ Lembretes de consultas
- ✅ Gestão de fila de espera
- ✅ Reagendamento e cancelamento

### 📋 Prontuário Eletrônico
- ✅ Registro de anamnese completa
- ✅ Prescrições médicas
- ✅ Solicitação de exames
- ✅ Atestados e documentos médicos
- ✅ Histórico completo do paciente
- ✅ Armazenamento seguro (LGPD)

### 💰 Gestão Financeira
- ✅ Controle de pagamentos
- ✅ Emissão de recibos
- ✅ Relatórios financeiros
- ✅ Controle de convênios
- ✅ Dashboard com indicadores

### 📊 Relatórios e Estatísticas
- ✅ Relatórios de atendimento
- ✅ Estatísticas de consultas
- ✅ Análise de receitas
- ✅ Exportação em PDF/Excel
- ✅ Dashboards personalizados

### 🔐 Segurança e Controle
- ✅ Autenticação JWT
- ✅ Controle de permissões (RBAC)
- ✅ Criptografia de senhas (bcrypt)
- ✅ Logs de auditoria
- ✅ Backup automático
- ✅ Conformidade com LGPD

---

## 🚀 Tecnologias

### Backend
- **[Node.js](https://nodejs.org/)** - Runtime JavaScript
- **[Express.js](https://expressjs.com/)** - Framework web
- **[MySQL](https://www.mysql.com/)** - Banco de dados relacional
- **[Sequelize](https://sequelize.org/)** - ORM para Node.js
- **[JWT](https://jwt.io/)** - Autenticação stateless
- **[Bcrypt.js](https://github.com/dcodeIO/bcrypt.js)** - Hash de senhas
- **[Winston](https://github.com/winstonjs/winston)** - Sistema de logs
- **[Joi](https://joi.dev/)** - Validação de dados
- **[Nodemailer](https://nodemailer.com/)** - Envio de emails
- **[Node-cron](https://github.com/node-cron/node-cron)** - Agendamento de tarefas
- **[Multer](https://github.com/expressjs/multer)** - Upload de arquivos

### Frontend
- **[React](https://reactjs.org/)** - Biblioteca UI
- **[Vite](https://vitejs.dev/)** - Build tool e dev server
- **[React Router](https://reactrouter.com/)** - Roteamento
- **[Axios](https://axios-http.com/)** - Cliente HTTP
- **[TailwindCSS](https://tailwindcss.com/)** - Framework CSS
- **[Lucide React](https://lucide.dev/)** - Ícones
- **[React Hook Form](https://react-hook-form.com/)** - Gerenciamento de formulários
- **[React Query](https://tanstack.com/query/)** - Gerenciamento de estado servidor
- **[React Toastify](https://fkhadra.github.io/react-toastify/)** - Notificações
- **[Date-fns](https://date-fns.org/)** - Manipulação de datas
- **[Recharts](https://recharts.org/)** - Gráficos e visualizações

### Segurança
- **Helmet** - Proteção de headers HTTP
- **CORS** - Controle de acesso cross-origin
- **Rate Limiting** - Proteção contra DDoS
- **Express Validator** - Validação de entrada

---

## 📦 Instalação

### Pré-requisitos

Certifique-se de ter instalado:

- **Node.js** 20.x ou superior ([Download](https://nodejs.org/))
- **MySQL** 8.0 ou superior ([Download](https://www.mysql.com/downloads/))
- **npm** ou **yarn**
- **Git** ([Download](https://git-scm.com/))

### 1️⃣ Clone o Repositório

```bash
git clone https://github.com/seu-usuario/mediconnect.git
cd mediconnect
```

### 2️⃣ Configuração do Backend

#### Instalar Dependências

```bash
cd backend
npm install
```

#### Configurar Variáveis de Ambiente

Crie um arquivo `.env` na pasta `backend`:

```bash
# Servidor
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Banco de Dados
DB_HOST=localhost
DB_PORT=3306
DB_NAME=mediconnect
DB_USER=root
DB_PASSWORD=sua_senha_mysql

# JWT
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=seu_jwt_refresh_secret_aqui
JWT_REFRESH_EXPIRE=30d

# Email (Opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app

# SMS (Opcional)
SMS_API_KEY=sua_chave_api_sms
SMS_API_URL=https://api.sms-provider.com

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

#### Criar Banco de Dados

```bash
mysql -u root -p
```

```sql
CREATE DATABASE mediconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

#### Executar Migrations

```bash
npm run migrate
```

#### Popular Banco de Dados (Opcional)

Execute o script SQL de seed:

```bash
mysql -u root -p mediconnect < ../seed.sql
```

**Importante:** Antes de executar o `seed.sql`, você precisa gerar hashes bcrypt para as senhas. Execute no Node.js:

```javascript
const bcrypt = require('bcryptjs');

// Gerar hashes para as senhas
console.log('admin123:', bcrypt.hashSync('admin123', 10));
console.log('doctor123:', bcrypt.hashSync('doctor123', 10));
console.log('receptionist123:', bcrypt.hashSync('receptionist123', 10));
```

Substitua os hashes no arquivo `seed.sql` antes de executá-lo.

#### Iniciar Servidor Backend

```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

O backend estará rodando em: **http://localhost:5000**

### 3️⃣ Configuração do Frontend

#### Instalar Dependências

```bash
cd ../frontend
npm install
```

#### Configurar Variáveis de Ambiente (Opcional)

Crie um arquivo `.env` na pasta `frontend` se necessário:

```bash
VITE_API_URL=http://localhost:5000/api
```

**Nota:** O Vite já está configurado com proxy no `vite.config.js`, então não é necessário criar o `.env` para desenvolvimento local.

#### Iniciar Servidor Frontend

```bash
npm run dev
```

O frontend estará rodando em: **http://localhost:3000**

---

## 🎯 Uso

### Credenciais de Demonstração

Após popular o banco de dados com o `seed.sql`, você pode fazer login com:

| Usuário | Email | Senha | Permissões |
|---------|-------|-------|-----------|
| **Admin** | admin@mediconnect.com | admin123 | Acesso total ao sistema |
| **Médico** | joao.silva@mediconnect.com | doctor123 | Acesso a consultas e prontuários |
| **Recepcionista** | maria.santos@mediconnect.com | receptionist123 | Agendamentos e cadastros |

### Acessando o Sistema

1. Abra seu navegador em **http://localhost:3000**
2. Faça login com uma das credenciais acima
3. Explore o dashboard e as funcionalidades

### Estrutura de Permissões

O sistema possui 3 níveis de acesso:

- **👑 Admin**: Acesso completo a todas as funcionalidades
- **👨‍⚕️ Médico**: Consultas, prontuários, agenda
- **👨‍💼 Recepcionista**: Agendamentos, cadastros de pacientes

---

## 📡 API

### Documentação da API

A API REST segue os padrões RESTful e retorna respostas em JSON.

#### Base URL

```
http://localhost:5000/api
```

#### Autenticação

Todas as rotas protegidas requerem um token JWT no header:

```
Authorization: Bearer seu_token_jwt_aqui
```

### Principais Endpoints

#### 🔐 Autenticação

```http
POST   /auth/login           # Login
POST   /auth/logout          # Logout
GET    /auth/me              # Perfil do usuário
PATCH  /auth/profile         # Atualizar perfil
PATCH  /auth/change-password # Alterar senha
POST   /auth/forgot-password # Esqueci minha senha
POST   /auth/reset-password  # Resetar senha
```

#### 👥 Pacientes

```http
GET    /patients             # Listar pacientes
GET    /patients/:id         # Detalhes do paciente
POST   /patients             # Criar paciente
PUT    /patients/:id         # Atualizar paciente
DELETE /patients/:id         # Deletar paciente
GET    /patients/stats/general # Estatísticas gerais
```

#### 👨‍⚕️ Médicos

```http
GET    /doctors              # Listar médicos
GET    /doctors/:id          # Detalhes do médico
POST   /doctors              # Criar médico
PUT    /doctors/:id          # Atualizar médico
DELETE /doctors/:id          # Deletar médico
GET    /doctors/stats/general # Estatísticas gerais
```

#### 📅 Agendamentos

```http
GET    /appointments         # Listar agendamentos
GET    /appointments/:id     # Detalhes do agendamento
POST   /appointments         # Criar agendamento
PUT    /appointments/:id     # Atualizar agendamento
DELETE /appointments/:id     # Cancelar agendamento
PATCH  /appointments/:id/confirm # Confirmar agendamento
```

#### 📋 Prontuários

```http
GET    /medical-records      # Listar prontuários
GET    /medical-records/:id  # Detalhes do prontuário
POST   /medical-records      # Criar prontuário
PUT    /medical-records/:id  # Atualizar prontuário
```

#### 💰 Pagamentos

```http
GET    /payments             # Listar pagamentos
GET    /payments/:id         # Detalhes do pagamento
POST   /payments             # Criar pagamento
PUT    /payments/:id         # Atualizar pagamento
```

#### 📊 Relatórios

```http
GET    /reports/appointments # Relatório de consultas
GET    /reports/financial    # Relatório financeiro
GET    /reports/patients     # Relatório de pacientes
```

### Exemplo de Requisição

```javascript
// Login
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'admin@mediconnect.com',
    password: 'admin123'
  })
});

const { token, user } = await response.json();

// Listar pacientes (autenticado)
const patients = await fetch('http://localhost:5000/api/patients', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## 📁 Estrutura do Projeto

```
MediConnect/
├── backend/
│   ├── src/
│   │   ├── config/          # Configurações (DB, etc)
│   │   ├── controllers/     # Controladores da API
│   │   ├── middlewares/     # Middlewares (auth, validação, etc)
│   │   ├── models/          # Modelos Sequelize
│   │   ├── routes/          # Rotas da API
│   │   ├── services/        # Serviços (email, SMS, backup)
│   │   ├── utils/           # Utilitários (logger, formatters)
│   │   └── server.js        # Entrada do servidor
│   ├── logs/                # Logs do sistema
│   ├── uploads/             # Arquivos enviados
│   ├── tests/               # Testes automatizados
│   ├── package.json
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   │   ├── common/      # Componentes reutilizáveis
│   │   │   ├── layout/      # Layout (Header, Sidebar, etc)
│   │   │   ├── patients/    # Componentes de pacientes
│   │   │   ├── doctors/     # Componentes de médicos
│   │   │   └── appointments/# Componentes de agendamentos
│   │   ├── contexts/        # Context API (Auth, Theme, etc)
│   │   ├── hooks/           # Custom hooks
│   │   ├── pages/           # Páginas da aplicação
│   │   ├── services/        # Serviços de API
│   │   ├── utils/           # Utilitários
│   │   ├── App.jsx          # Componente principal
│   │   └── index.jsx        # Entrada da aplicação
│   ├── public/              # Arquivos estáticos
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── README.md
│
├── seed.sql                 # Script de seed do banco
└── README.md               # Este arquivo
```

---

## 🧪 Testes

### Backend

```bash
cd backend

# Rodar todos os testes
npm test

# Testes unitários
npm run test:unit

# Testes de integração
npm run test:integration

# Testes E2E
npm run test:e2e

# Coverage
npm run test:coverage
```

### Frontend

```bash
cd frontend

# Rodar testes
npm test

# Testes com coverage
npm run test:coverage
```

---

## 🚢 Deploy

### Backend (Node.js)

#### Opção 1: Heroku

```bash
# Login no Heroku
heroku login

# Criar app
heroku create mediconnect-api

# Adicionar MySQL
heroku addons:create jawsdb:kitefin

# Deploy
git subtree push --prefix backend heroku main

# Configurar variáveis de ambiente
heroku config:set JWT_SECRET=seu_secret
heroku config:set NODE_ENV=production
```

#### Opção 2: VPS (Ubuntu)

```bash
# No servidor
sudo apt update
sudo apt install nodejs npm mysql-server nginx

# Clonar projeto
git clone https://github.com/seu-usuario/mediconnect.git
cd mediconnect/backend

# Instalar dependências
npm install --production

# Configurar PM2
npm install -g pm2
pm2 start src/server.js --name mediconnect-api
pm2 startup
pm2 save

# Configurar Nginx como proxy reverso
sudo nano /etc/nginx/sites-available/mediconnect
```

Configuração Nginx:

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Frontend (React)

#### Build de Produção

```bash
cd frontend
npm run build
```

#### Deploy Vercel

```bash
npm install -g vercel
vercel login
vercel
```

#### Deploy Netlify

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

---

## 🔧 Solução de Problemas

### Erro: "Cannot connect to MySQL"

**Solução:**
- Verifique se o MySQL está rodando: `sudo service mysql status`
- Verifique as credenciais no arquivo `.env`
- Certifique-se de que o banco `mediconnect` existe

### Erro: "Port 5000 already in use"

**Solução:**
```bash
# Linux/Mac
lsof -ti:5000 | xargs kill -9

# Ou altere a porta no .env
PORT=5001
```

### Erro: "Token não existe" no frontend

**Solução:**
- Limpe o localStorage: `localStorage.clear()`
- Faça login novamente
- Verifique se o backend está rodando

### Erro: "EADDRINUSE" no Vite

**Solução:**
```bash
# Mate o processo na porta 3000
lsof -ti:3000 | xargs kill -9

# Ou altere a porta no vite.config.js
```

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrões de Código

- **ESLint** para linting
- **Prettier** para formatação
- Commits seguindo [Conventional Commits](https://www.conventionalcommits.org/)
- Testes para novas funcionalidades

---

## 📝 Roadmap

### Versão 1.1
- [ ] Integração com WhatsApp Business API
- [ ] Sistema de teleconsulta (vídeo)
- [ ] Aplicativo móvel (React Native)
- [ ] Assinatura digital de documentos

### Versão 1.2
- [ ] Integração com laboratórios
- [ ] Sistema de faturamento TISS
- [ ] Agenda inteligente com IA
- [ ] Chatbot para agendamentos

### Versão 2.0
- [ ] Multi-clínica (SaaS)
- [ ] Marketplace de serviços médicos
- [ ] BI e analytics avançados
- [ ] Integração com wearables

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

```
MIT License

Copyright (c) 2025 MediConnect

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👤 Autor

**Felps**

- GitHub: [@seu-usuario](https://github.com/seu-usuario)
- Email: seu-email@exemplo.com

---

## 🙏 Agradecimentos

- [Node.js](https://nodejs.org/)
- [React](https://reactjs.org/)
- [MySQL](https://www.mysql.com/)
- [Sequelize](https://sequelize.org/)
- [TailwindCSS](https://tailwindcss.com/)
- Comunidade Open Source

---

## 📞 Suporte

Se você encontrar algum problema ou tiver dúvidas:

- 🐛 [Reportar Bug](https://github.com/FlpSza/mediconnect/issues)
- 💡 [Solicitar Feature](https://github.com/FlpSza/mediconnect/issues)
- 📧 Email: suporte@mediconnect.com
- 💬 Discord: [Link do servidor](https://discord.gg/seu-servidor)

---

<div align="center">

**Desenvolvido com ❤️ para a comunidade médica**

[![Star on GitHub](https://img.shields.io/github/stars/FlpSza/mediconnect?style=social)](https://github.com/FlpSza/mediconnect)
[![Follow on GitHub](https://img.shields.io/github/followers/FlpSza?style=social)](https://github.com/FlpSza)

</div>

