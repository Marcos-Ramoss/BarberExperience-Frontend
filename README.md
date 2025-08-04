
## 📋 **Visão Geral do Projeto**

Frontend do sistema de agendamento de barbearia desenvolvido em **Angular 20** com arquitetura **multi-tenant**, oferecendo uma interface moderna e responsiva para gestão completa de barbearias, profissionais e clientes.

### **Público-Alvo**
- **Administradores**: Gestão de múltiplas barbearias
- **Profissionais**: Barbeiros e cabeleireiros
- **Clientes**: Usuários finais que agendam serviços

---

## 🏗️ **Arquitetura e Tecnologias**

### **Stack Tecnológico**
- **Framework**: Angular 20 (Standalone Components)
- **UI Framework**: PrimeNG 20 + PrimeUI Themes
- **Styling**: Tailwind CSS 4.1 + SCSS
- **Charts**: Chart.js 4.4.2
- **Icons**: PrimeIcons 7.0
- **State Management**: RxJS 7.8.2
- **Build Tool**: Angular CLI 20
- **Package Manager**: npm

### **Arquitetura Frontend**
- 🏛️ **Arquitetura Modular** com componentes standalone
- 🔄 **Lazy Loading** para otimização de performance
- 🎨 **Design System** unificado com PrimeNG + Tailwind
- 🔐 **Sistema de Autenticação** com interceptors
- 📱 **Responsive Design** mobile-first
- 🌙 **Tema Escuro/Claro** dinâmico

---

## 📁 **Estrutura de Pastas**

```
src/
├── app/
│   ├── components/           # Componentes da aplicação
│   │   ├── agendamentos/     # Módulo de agendamentos
│   │   ├── auth/            # Autenticação e autorização
│   │   ├── barbearias/      # Gestão de barbearias
│   │   ├── clientes/        # Gestão de clientes
│   │   ├── dashboard/       # Dashboards principais
│   │   ├── layout/          # Componentes de layout
│   │   ├── profissionais/   # Gestão de profissionais
│   │   ├── relatorios/      # Relatórios e analytics
│   │   ├── servicos/        # Gestão de serviços
│   │   └── shared/          # Componentes compartilhados
│   ├── dto/                 # Data Transfer Objects
│   ├── guards/              # Guards de rota
│   ├── interceptors/        # Interceptors HTTP
│   ├── pipes/               # Pipes customizados
│   ├── repository/          # Camada de acesso a dados
│   ├── services/            # Serviços de negócio
│   └── utils/               # Utilitários e helpers
├── assets/                  # Recursos estáticos
└── environments/            # Configurações de ambiente
```

---

## 🎯 **Módulos e Funcionalidades**

### **1. Módulo de Autenticação**
- 🔐 **Login/Registro** com validação de formulários
- 🔑 **JWT Token** management
- 🛡️ **Guards de rota** para proteção
- 🔄 **Refresh token** automático
- 👤 **Perfis de usuário** (Admin, Profissional, Cliente)

### **2. Dashboard Multi-Tenant**
- 📊 **Dashboard Administrativo** para gestão global
- 👨‍💼 **Dashboard Profissional** com agenda pessoal
- 👤 **Dashboard Cliente** com histórico e agendamentos
- 📈 **Métricas em tempo real** com Chart.js
- 🎨 **Temas personalizados** por barbearia

### **3. Gestão de Barbearias**
- 🏢 **CRUD completo** de barbearias
- ⚙️ **Configurações** por estabelecimento
- 🎨 **Personalização de marca** (cores, logo)
- 📍 **Gestão de endereços** e horários
- 💰 **Configuração de preços** e serviços

### **4. Gestão de Profissionais**
- 👨‍💼 **Perfil profissional** completo
- 📅 **Agenda individual** com horários
- 💼 **Portfólio** de trabalhos
- ⭐ **Sistema de avaliações** e comentários
- 💰 **Gestão de comissões** e pagamentos

### **5. Gestão de Clientes**
- 👤 **Cadastro e perfil** completo
- 📋 **Histórico de serviços** e preferências
- 🎁 **Sistema de fidelidade** com pontos
- 📸 **Fotos antes/depois** integradas
- 💬 **Comunicação** integrada

### **6. Sistema de Agendamentos**
- 📅 **Agendamento em tempo real** com calendário
- 🔄 **Reservas recorrentes** (semanal, quinzenal, mensal)
- ⏰ **Lista de espera** inteligente
- 📱 **Integração WhatsApp** para confirmações
- 🎯 **Agendamento por profissional** e serviço


### **7. Gestão de Serviços**
- ✂️ **Catálogo de serviços** por barbearia
- 💰 **Preços dinâmicos** e promoções
- ⏱️ **Duração estimada** dos serviços
- 🏷️ **Categorização** e filtros
- 📊 **Relatórios** de serviços mais populares

---

## 🛠️ **Configuração e Instalação**

### **Pré-requisitos**
- Node.js 18+ 
- npm 9+
- Angular CLI 20

### **Instalação**
```bash
# Clone o repositório
git clone [url-do-repositorio]
cd frontend

# Instale as dependências
npm install

# Execute em modo desenvolvimento
npm start

```
