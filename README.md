# CarManager

Aplicação web para gerenciar veículos e acompanhar as obrigações de cada um, como **IPVA** e **licenciamento**. O sistema avisa quais carros estão em dia, perto do vencimento ou atrasados, para evitar multas e juros.

**Demonstração:** [LINK_DO_DEPLOY](LINK_DO_DEPLOY)

> Os dados da demonstração são **fictícios**. Qualquer pessoa com o login abaixo pode alterar ou apagar os registros, e eles são recriados de tempos em tempos.

| Acesso de demonstração | |
|---|---|
| E-mail | `EMAIL_DEMO` |
| Senha | `SENHA_DEMO` |

## Funcionalidades

- Cadastro, edição e exclusão de veículos
- Controle de IPVA e licenciamento, com a opção de o veículo não pagar IPVA
- Status de cada veículo: **em dia**, **próximo do vencimento** (menos de 1 mês) e **atrasado**
- Botão "Marcar como pago", que registra o pagamento e renova o vencimento para o ano seguinte
- Dashboard com resumo e filtros por situação
- Busca por marca, modelo ou placa, e ordenação por nome ou vencimento
- Login com sessão por cookie, rotas e ações protegidas no servidor
- Layout responsivo: no celular, a tabela vira cards e a sidebar vira menu

## Tecnologias

- [Next.js](https://nextjs.org/) (App Router, Server Actions)
- React e TypeScript
- Tailwind CSS
- Firebase: Authentication e Firestore, acessados no servidor com o Admin SDK
- Lucide React (ícones)
- Jest e React Testing Library

## Como rodar localmente

### 1. Clone e instale

```bash
git clone https://github.com/DevCarlos779/NOME-DO-REPO.git
cd NOME-DO-REPO
npm install
```

### 2. Crie um projeto no Firebase

1. Crie um projeto no [console do Firebase](https://console.firebase.google.com).
2. Em **Firestore Database**, crie um banco em modo de produção (regras fechadas).
3. Em **Authentication**, ative o provedor **E-mail/senha** e crie um usuário. Se quiser, desative a criação de novas contas nas configurações.
4. Em **Configurações do projeto**, adicione um app Web e copie a `apiKey`.
5. Em **Contas de serviço**, gere uma chave privada e copie `project_id`, `client_email` e `private_key`.

### 3. Configure as variáveis de ambiente

Copie o arquivo de exemplo e preencha:

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

> **Nunca** envie o `.env.local` ou o `.json` da chave de serviço para o GitHub.

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
- Cada Server Action e cada leitura de dados confere a sessão antes de acessar o banco.
- As regras do Firestore ficam fechadas: o banco só é acessado pelo servidor.
- Credenciais ficam em variáveis de ambiente e fora do repositório.

## Autor

Feito por **Carlos Emanuel**, [@DevCarlos779](https://github.com/DevCarlos779).