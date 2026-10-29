# CarManager

![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black)

Sistema web para controlar os veículos de uma empresa e acompanhar os vencimentos de **IPVA** e **licenciamento**. Ele mostra, de relance, quais carros estão em dia, quais estão perto do vencimento e quais já atrasaram, para evitar multas e juros.

## Demonstração

**[car-manager-demo-ashen.vercel.app](https://car-manager-demo-ashen.vercel.app)**

| Acesso de demonstração | |
|---|---|
| E-mail | `demo@carmanager.com` |
| Senha | `123456` |

> Os dados da demonstração são **fictícios**. Qualquer visitante com esse login pode criar, editar e apagar registros, então os veículos podem mudar de uma visita para outra.

## Sobre o projeto

O CarManager nasceu de uma necessidade real: controlar os pagamentos de IPVA e licenciamento da frota de uma empresa familiar, sem depender de planilha nem de memória. Esta é a versão de demonstração, com banco de dados e login próprios e dados de exemplo.

Foi também o meu primeiro projeto em **Next.js**. Usei ele para praticar o App Router, Server Actions e autenticação no servidor.

## Funcionalidades

- Cadastro, edição e exclusão de veículos
- Controle de IPVA e licenciamento, com suporte a veículos isentos de IPVA
- Status de cada veículo: **em dia**, **próximo do vencimento** e **atrasado**
- Botão **Marcar como pago**, que registra o pagamento e renova o vencimento para o ano seguinte
- Dashboard com o resumo da frota e filtros por situação
- Busca por marca, modelo ou placa e ordenação por nome ou vencimento
- Login com sessão por cookie e rotas protegidas
- Layout responsivo: no celular a tabela vira cards e a sidebar vira menu

## Como o status é definido

| Status | Regra |
|---|---|
| Atrasado | O vencimento de alguma obrigação já passou |
| Próximo | Falta menos de 1 mês para o vencimento |
| Em dia | Nenhuma das duas situações acima |

Um veículo com mais de uma obrigação assume a situação mais urgente.

## Tecnologias

- [Next.js](https://nextjs.org/) com App Router e Server Actions
- React e TypeScript
- Tailwind CSS
- Firebase Authentication e Firestore, acessados no servidor com o Admin SDK
- Lucide React para os ícones
- Jest e React Testing Library

## Como rodar localmente

### 1. Clone e instale

```bash
git clone https://github.com/DevCarlos779/car-manager-demo.git
cd car-manager-demo
npm install
```

### 2. Crie um projeto no Firebase

1. Crie um projeto no [console do Firebase](https://console.firebase.google.com).
2. Em **Firestore Database**, crie um banco em modo de produção (regras fechadas).
3. Em **Authentication**, ative o provedor **E-mail/senha** e crie um usuário. Se quiser, desative a criação de novas contas nas configurações.
4. Em **Configurações do projeto**, adicione um app Web e copie a `apiKey`.
5. Em **Contas de serviço**, gere uma chave privada e copie `project_id`, `client_email` e `private_key`.

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env.local
```

No Windows (PowerShell): `Copy-Item .env.example .env.local`

| Variável | Descrição |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `apiKey` do app Web |
| `FIREBASE_PROJECT_ID` | `project_id` da chave de serviço |
| `FIREBASE_CLIENT_EMAIL` | `client_email` da chave de serviço |
| `FIREBASE_PRIVATE_KEY` | `private_key` da chave de serviço, entre aspas e com os `\n` como texto |

> Nunca envie o `.env.local` ou o `.json` da chave de serviço para o GitHub.

### 4. Inicie o projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) e entre com o usuário criado no passo 2.

### Testes

```bash
npm test
```

## Estrutura

```
src/
  app/
    (app)/         páginas com sidebar (dashboard, veículos)
    (auth)/        páginas sem sidebar (login)
    actions/       Server Actions (veículos e autenticação)
  components/
    app/           componentes do sistema
    auth/          componentes do login
  lib/             sessão, Admin SDK e leitura de dados
  types/           tipos TypeScript
  utils/           funções auxiliares
  proxy.ts         bloqueia rotas sem sessão
```

## Segurança

- A sessão fica em um cookie `httpOnly`, criado no servidor com o Firebase Admin SDK.
- Cada Server Action e cada leitura de dados conferem a sessão antes de acessar o banco.
- As regras do Firestore ficam fechadas: o banco só é acessado pelo servidor.
- As credenciais ficam em variáveis de ambiente, fora do repositório.

## O que aprendi

- Organizar um projeto em Next.js com Route Groups e layouts diferentes (com e sem sidebar)
- Server Actions para escrita de dados e leitura em Server Components
- Autenticação com cookie de sessão e verificação no servidor
- Regras de negócio com datas (vencimentos, renovação anual e status calculados)
- Layout responsivo com Tailwind, incluindo tabela que vira cards no celular

## Autor

Feito por **Carlos Emanuel**.

[GitHub](https://github.com/DevCarlos779) · [LinkedIn](https://www.linkedin.com/in/carlos-emanuel-developer/)