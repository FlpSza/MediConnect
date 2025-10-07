# 🚀 Guia de Início Rápido - MediConnect

## ⚡ Setup Rápido (5 minutos)

### 1. Instalar Dependências
```bash
npm install
```

### 2. Criar Banco de Dados MySQL
```bash
mysql -u root -p
```
```sql
CREATE DATABASE mediconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 3. Configurar Variáveis de Ambiente
```bash
cp .env.example .env
```

Edite o `.env` e configure:
```env
DB_NAME=mediconnect
DB_USER=root
DB_PASSWORD=sua_senha_mysql

JWT_SECRET=minha_chave_secreta_super_segura_123
```

### 4. Popular Banco com Dados de Exemplo
```bash
node src/utils/seedDatabase.js
```

### 5. Iniciar Servidor
```bash
npm run dev
```

Acesse: http://localhost:5000/api/health

---

## 🧪 Testar a API

### 1. Login como Admin
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mediconnect.com",
    "password": "admin123"
  }'
```

**Copie o TOKEN da resposta**

### 2. Listar Pacientes
```bash
curl http://localhost:5000/api/patients \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 3. Listar Médicos
```bash
curl http://localhost:5000/api/doctors \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 4. Listar Agendamentos
```bash
curl http://localhost:5000/api/appointments \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 📝 Credenciais de Teste

Após executar o seed, você terá:

**Administrador:**
- Email: `admin@mediconnect.com`
- Senha: `admin123`
- Acesso: Total

**Recepcionista:**
- Email: `recepcao@mediconnect.com`
- Senha: `recepcao123`
- Acesso: Gerenciar pacientes e agendamentos

**Médico:**
- Email: `medico@mediconnect.com`
- Senha: `medico123`
- Acesso: Visualizar agendamentos e prontuários

---

## 🔧 Comandos Úteis

```bash
# Modo desenvolvimento (auto-reload)
npm run dev

# Modo produção
npm start

# Popular banco (⚠️ apaga dados existentes)
node src/utils/seedDatabase.js

# Ver logs em tempo real
tail -f logs/combined.log
```

---

## 📚 Endpoints Principais

### Autenticação
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Perfil do usuário
- `PUT /api/auth/profile` - Atualizar perfil
- `PUT /api/auth/change-password` - Alterar senha

### Pacientes
- `GET /api/patients` - Listar
- `GET /api/patients/:id` - Buscar por ID
- `POST /api/patients` - Criar
- `PUT /api/patients/:id` - Atualizar
- `DELETE /api/patients/:id` - Desativar

### Médicos
- `GET /api/doctors` - Listar
- `GET /api/doctors/:id` - Buscar por ID
- `GET /api/doctors/specialties` - Listar especialidades
- `POST /api/doctors` - Criar (Admin)
- `PUT /api/doctors/:id` - Atualizar (Admin)

### Agendamentos
- `GET /api/appointments` - Listar
- `GET /api/appointments/:id` - Buscar por ID
- `POST /api/appointments` - Criar
- `PUT /api/appointments/:id` - Atualizar
- `PATCH /api/appointments/:id/cancel` - Cancelar
- `PATCH /api/appointments/:id/confirm` - Confirmar
- `PATCH /api/appointments/:id/complete` - Concluir
- `GET /api/appointments/doctor/:id/available-slots` - Horários disponíveis

### Usuários (Admin)
- `GET /api/users` - Listar
- `POST /api/users` - Criar
- `PUT /api/users/:id` - Atualizar
- `DELETE /api/users/:id` - Desativar

---

## 🐛 Solução de Problemas

### Erro de conexão com banco
```bash
# Verifique se o MySQL está rodando
sudo systemctl status mysql

# Teste a conexão
mysql -u root -p -e "SHOW DATABASES;"
```

### Porta 5000 já em uso
Altere no `.env`:
```env
PORT=3001
```

### Erro "JWT_SECRET não definido"
Certifique-se de ter configurado o `.env` corretamente.

### Tabelas não criadas
Execute o servidor uma vez em modo dev:
```bash
npm run dev
```

---

## 📦 Estrutura de Resposta Padrão

### Sucesso
```json
{
  "success": true,
  "message": "Operação realizada com sucesso",
  "data": { ... }
}
```

### Erro
```json
{
  "success": false,
  "message": "Descrição do erro",
  "errors": [ ... ] // opcional
}
```

### Lista com Paginação
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

## 🎯 Próximos Passos

1. ✅ Configure o backend
2. 📱 Desenvolva o frontend em React
3. 📊 Implemente dashboard com gráficos
4. 📧 Configure sistema de emails
5. 💳 Integre sistema de pagamentos
6. 📝 Crie sistema de prontuário eletrônico
7. 🚀 Faça deploy em produção

---

## 💡 Dicas

- Use **Postman** ou **Insomnia** para testar a API
- Verifique os logs em `logs/` para debug
- Todos os endpoints (exceto login) requerem token JWT
- Senhas são automaticamente criptografadas
- CPF e CRM devem ser únicos no sistema

---

## 🤝 Suporte

Problemas? Abra uma issue no GitHub ou envie email para suporte@mediconnect.com

**Bom desenvolvimento! 🎉**