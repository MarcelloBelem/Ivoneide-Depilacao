# Sistema de Agendamento Online

Um sistema completo de agendamento online para uma profissional da área de depilação.  
O projeto é composto por uma **API robusta (backend)** e uma **interface dinâmica (frontend)** que permitem que clientes agendem serviços e que profissionais gerenciem sua agenda de forma eficiente.

---

## 📑 Sumário

- [Tecnologias](#-tecnologias)  
- [Funcionalidades](#-funcionalidades)  
- [Instalação e Configuração](#-instalação-e-configuração)  
  - [Pré-requisitos](#pré-requisitos)  
  - [Backend](#backend)  
  - [Frontend](#frontend)  
- [Uso](#-uso)  
- [Exemplos de Fluxo](#-exemplos-de-fluxo)  
- [Contribuidores](#-contribuidores)  
- [Licença](#-licença)  

---

## 🛠 Tecnologias

### **Backend**
- **Node.js & Express.js** → API RESTful  
- **PostgreSQL** → Banco de dados relacional  
- **Sequelize & Sequelize CLI** → ORM e migrações  
- **JWT (JSON Web Tokens)** → Autenticação e autorização  
- **Bcrypt** → Hashing seguro de senhas  
- **Zod** → Validação rigorosa de dados  

### **Frontend**
- **React** → Interface do usuário  
- **React Router Dom** → Roteamento e navegação  
- **Axios** → Requisições HTTP para a API  

---

## ✨ Funcionalidades

- **Autenticação**  
  - Registro e login seguro de clientes e profissionais  

- **Validação de Horários**  
  - Horários fixos (08:00–18:00)  
  - Antecedência mínima de 1h e máxima de 30 dias  
  - Bloqueio de horários já ocupados  

- **Gerenciamento de Agendamentos**  
  - **Cliente**: Criar, visualizar, editar e cancelar agendamentos pendentes  
  - **Profissional**: Visualizar pendentes/confirmados e alterar status (confirmado, concluído, cancelado)  

- **Integridade de Dados**  
  - Transações no banco para garantir consistência (ex.: criação de agendamentos)  

---

## ⚙️ Instalação e Configuração

### Pré-requisitos
- **Node.js** + **npm**  
- **PostgreSQL** em execução  

---

### 🔹 Backend

#### Clone o repositório
```bash
git clone https://github.com/MarcelloBelem/Ivoneide-Depilacao.git

cd Back-end
```

#### Instale dependências
```bash
npm install
```

#### Crie um arquivo .env na pasta Back-end com as variáveis:

```bash
DATABASE_URL="postgresql://user:password@host:port/database"
JWT_SECRET="sua_chave_secreta_aqui"
```

#### Execute as migrations e seeders:

```bash
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

#### Inicie o servidor:
```bash
node --watch src/server
```
---

### 🔹 Frontend

```bash
cd Front-end
```
#### Instale dependências
```bash
npm install
```
#### Crie um arquivo .env na pasta Front-end:
```bash
REACT_APP_API_URL=http://localhost:3000/api
```
#### Inicie o servidor:
```bash
npm run dev
```

---

## 📄 Uso
- 1 - Acesse o frontend pelo navegador (o vite mostra a URL).

- 2 - Crie uma conta com o e-mail e senha desejados. O papel (role) padrão será client.

- 3 - Para usar como profissional, altere o campo role do usuário no banco de dados para professional e defina o id dele como 10. O backend está configurado para suportar apenas um profissional com esse ID no momento.

- 4 - Faça login com a conta e utilize os fluxos de agendamento como cliente ou profissional.

---

## 📌 Exemplos de Fluxo

* Cliente → Agenda depilação para uma data disponível

* Profissional → Recebe notificação de novo agendamento e confirma

* Cliente → Pode editar/cancelar o agendamento enquanto estiver pendente

* Profissional → Atualiza status para concluído após realizar o serviço

--- 

## 👥 Contribuidores

Projeto desenvolvido por [Marcéllo Bélem Alexandre]