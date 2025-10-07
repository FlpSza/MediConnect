# MediConnect - Frontend

Sistema de gestão de consultório médico - Interface React

## 🚀 Tecnologias

- **React 18** - Biblioteca para interfaces de usuário
- **Vite** - Build tool e dev server
- **TailwindCSS** - Framework CSS utilitário
- **React Router** - Roteamento
- **Axios** - Cliente HTTP
- **React Hook Form** - Gerenciamento de formulários
- **React Query** - Gerenciamento de estado do servidor
- **Lucide React** - Ícones
- **React Toastify** - Notificações
- **Date-fns** - Manipulação de datas
- **Recharts** - Gráficos

## 📋 Pré-requisitos

- Node.js (v16 ou superior)
- NPM ou Yarn
- Backend MediConnect rodando

## 🔧 Instalação

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=MediConnect
VITE_APP_VERSION=1.0.0
```

### 3. Executar em desenvolvimento
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

## 🏗️ Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── common/         # Componentes comuns (Button, Input, Modal, etc.)
│   ├── layout/         # Componentes de layout (Header, Sidebar, Footer)
│   ├── patients/       # Componentes específicos de pacientes
│   ├── doctors/        # Componentes específicos de médicos
│   └── appointments/   # Componentes específicos de agendamentos
├── contexts/           # Contextos React (Auth, Theme, Notification)
├── hooks/              # Hooks customizados
├── pages/              # Páginas da aplicação
├── routes/             # Configuração de rotas
├── services/           # Serviços de API
├── utils/              # Utilitários e constantes
├── assets/             # Assets estáticos
├── App.jsx             # Componente principal
└── index.jsx           # Ponto de entrada
```

## 🎨 Componentes Principais

### Componentes Comuns
- **Button** - Botão reutilizável com variantes
- **Input** - Campo de entrada com validação
- **Modal** - Modal reutilizável
- **Table** - Tabela com paginação e ordenação
- **Card** - Card para exibição de conteúdo

### Componentes de Layout
- **Header** - Cabeçalho com navegação e perfil
- **Sidebar** - Menu lateral com navegação
- **Footer** - Rodapé da aplicação

## 🔐 Autenticação

O sistema utiliza JWT para autenticação:

```javascript
import { useAuth } from '../contexts/AuthContext';

const { login, logout, user, isAuthenticated } = useAuth();
```

## 🎯 Funcionalidades

### ✅ Implementadas
- [x] Sistema de autenticação
- [x] Dashboard com estatísticas
- [x] Gestão de pacientes
- [x] Gestão de médicos
- [x] Gestão de agendamentos
- [x] Sistema de notificações
- [x] Tema claro/escuro
- [x] Responsividade
- [x] Validação de formulários
- [x] Paginação e filtros

### 🚧 Em Desenvolvimento
- [ ] Prontuários médicos
- [ ] Controle financeiro
- [ ] Relatórios e gráficos
- [ ] Upload de arquivos
- [ ] Calendário de agendamentos
- [ ] Notificações em tempo real

## 🎨 Temas e Personalização

### Cores Principais
```css
primary: {
  50: '#eff6ff',
  500: '#3b82f6',
  600: '#2563eb',
  700: '#1d4ed8'
}
```

### Tema Escuro
O sistema suporta tema escuro automático baseado nas preferências do sistema.

## 📱 Responsividade

- **Mobile First** - Design otimizado para dispositivos móveis
- **Breakpoints** - sm (640px), md (768px), lg (1024px), xl (1280px)
- **Componentes Adaptativos** - Sidebar colapsável, menu mobile

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Linting
npm run lint
```

## 🌐 API Integration

### Configuração Base
```javascript
// src/services/api.js
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000
});
```

### Interceptors
- **Request** - Adiciona token de autenticação
- **Response** - Trata erros de autenticação

## 📊 Estado da Aplicação

### Contextos
- **AuthContext** - Autenticação e usuário
- **ThemeContext** - Tema e preferências
- **NotificationContext** - Notificações e toasts

### Hooks Customizados
- **useApi** - Requisições à API
- **usePagination** - Paginação
- **useSearch** - Busca com debounce
- **useDebounce** - Debounce de valores

## 🧪 Testes

```bash
# Executar testes (a implementar)
npm test

# Coverage (a implementar)
npm run test:coverage
```

## 🚀 Deploy

### Vercel
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Upload da pasta dist/
```

### Docker
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🔄 Próximos Passos

### Backend Integration
- [ ] Implementar todas as rotas da API
- [ ] Adicionar tratamento de erros
- [ ] Implementar cache
- [ ] Adicionar loading states

### UX/UI Improvements
- [ ] Animações e transições
- [ ] Skeleton loading
- [ ] Drag & drop
- [ ] Keyboard shortcuts

### Performance
- [ ] Code splitting
- [ ] Lazy loading
- [ ] Image optimization
- [ ] Bundle analysis

## 📝 Licença

MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para suporte, entre em contato através do email: suporte@mediconnect.com
