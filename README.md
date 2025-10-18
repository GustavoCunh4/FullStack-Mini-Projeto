# FullStack Mini Projeto — Backend (Node.js, TypeScript, Express, MongoDB, JWT)

Aplicação backend com autenticação JWT, organizada em camadas (middlewares, routes, controllers, services, models, database), com conexão MongoDB local e em produção (Atlas/Vercel). Inclui coleção de requisições para Insomnia em `requests/requests.yaml`.

## Sumário
- Stack e Arquitetura
- Requisitos
- Configuração do Ambiente
- Executando Localmente
- Testando com Insomnia
- Deploy (Vercel)
- MongoDB Atlas (produção)
- Docker (opcional para desenvolvimento)
- Endpoints
- Erros e Logs
- Troubleshooting

## Stack e Arquitetura
- Node.js + TypeScript
- Express 5
- MongoDB com Mongoose
- Autenticação JWT (`jsonwebtoken`)
- Hash de senha (`bcrypt`)
- Validação (`express-validator`)
- Logs: `winston` + `morgan`
- Serverless handler para Vercel

Estrutura de camadas:
- `middlewares/` autenticação, validação, tratamento de erros
- `routes/` define rotas públicas e protegidas
- `controllers/` orquestram entrada/saída HTTP
- `services/` regras de negócio (registro/login)
- `models/` Mongoose Schemas e Models
- `database/` conexão MongoDB

## Requisitos
- Node.js 18+
- MongoDB local rodando OU conta no MongoDB Atlas
- Opcional: Docker (para subir MongoDB local)

## Configuração do Ambiente
Crie um arquivo `.env` na raiz do projeto com as variáveis:

```
PORT=3000
NODE_ENV=development

# Desenvolvimento (local)
MONGO_URI=mongodb://127.0.0.1:27017/fullstack_mini_projeto

# Produção (Atlas)
MONGO_URI_PROD=mongodb+srv://<usuario>:<senha>@<cluster>/<database>?retryWrites=true&w=majority

# JWT
JWT_SECRET=sua_chave_bem_grande_e_secreta
JWT_EXPIRES=1h
```

Notas:
- Em desenvolvimento, o app usa `MONGO_URI`. Em produção (`NODE_ENV=production`), usa `MONGO_URI_PROD`.
- O banco e a collection são criados automaticamente na primeira escrita.

## Executando Localmente
1) Instale dependências:
```
npm install
```
2) Garanta um MongoDB ouvindo em `127.0.0.1:27017` (veja seção Troubleshooting e Docker abaixo).
3) Rode a aplicação em dev:
```
npm run dev
```
- Logs esperados: Ambiente, URI mascarada e “MongoDB conectado com sucesso”, seguido do “Servidor rodando em http://localhost:3000”.

## Testando com Insomnia
- Importe `requests/requests.yaml` no Insomnia.
- Coleções incluídas: Auth (register/login) e Protected (/protected) com cenários de sucesso e erro.
- Para “Protected - with valid token”, rode “Login - success” antes; a requisição já referencia o token dinamicamente.

## Deploy (Vercel)
1) Suba o repositório ao GitHub (já configurado).
2) No painel Vercel, importe o projeto e configure as Variáveis de Ambiente (Production):
   - `NODE_ENV=production`
   - `MONGO_URI_PROD` (URI do Atlas)
   - `JWT_SECRET`
   - `JWT_EXPIRES=1h` (opcional)
3) Deploy. O projeto já possui `vercel.json` e handler serverless em `api/index.ts` que aguarda a conexão com o banco.
4) No Insomnia, altere o ambiente para “Production” (já incluso no `requests.yaml`) e teste.

## MongoDB Atlas (produção)
Passos no Atlas:
- Crie um Cluster (Free Tier serve).
- Crie um usuário de banco (username/senha) com acesso ao DB desejado.
- Em “Network Access”, adicione seu IP público ou “Allow Access from Anywhere (0.0.0.0/0)” para testes.
- Obtenha a Connection String (SRV), por exemplo:
  `mongodb+srv://usuario:senha@cluster0.xxxxx.mongodb.net/fullstack_mini_projeto?retryWrites=true&w=majority`
- Coloque esta string em `MONGO_URI_PROD` no `.env` local (para testar em dev com Atlas) e também nas variáveis de ambiente da Vercel.

## Docker (opcional para desenvolvimento)
Subir MongoDB local rapidamente com Docker:

Sem autenticação (mais simples para dev):
```
docker run -d --name mongo \
  -p 27017:27017 \
  -v mongo_data:/data/db \
  mongo:6
```
- Use `MONGO_URI=mongodb://127.0.0.1:27017/fullstack_mini_projeto`.

Com autenticação:
```
docker run -d --name mongo \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=root \
  -e MONGO_INITDB_ROOT_PASSWORD=secret \
  -v mongo_data:/data/db \
  mongo:6
```
- A URI muda para: `mongodb://root:secret@127.0.0.1:27017/fullstack_mini_projeto?authSource=admin`.

## Endpoints
- POST `/register`
  - body: `{ name, email, password }`
  - 201 em sucesso; 409 se email já existe; 422 para dados inválidos.
- POST `/login`
  - body: `{ email, password }`
  - 200 em sucesso: `{ token }`; 401 credenciais inválidas; 422 inválido/mal formatado.
- GET `/protected`
  - Header `Authorization: Bearer <token>`
  - 200 em sucesso: `{ message: 'Acesso autorizado' }`
  - 401 se sem token/invalid token.

## Erros e Logs
- Logs com `winston` (nível `debug` em dev, `info` em prod) e `morgan` HTTP.
- Middleware de erros retorna `{ error: <mensagem> }` e status coerente (422/401/409/500 etc.).

## Troubleshooting
- Erro: `connect ECONNREFUSED 127.0.0.1:27017`
  - Significa que não há processo MongoDB escutando localmente.
  - Soluções:
    - Instalar MongoDB Community Server (Windows):
      - Após instalar, verifique o serviço “MongoDB” em execução (Services). Porta padrão 27017.
      - No Compass, você pode apenas conectar em `mongodb://127.0.0.1:27017` (o DB será criado automaticamente no primeiro insert).
    - OU subir via Docker (veja seção Docker) e manter a `MONGO_URI` apontando para `127.0.0.1:27017`.
    - OU usar o Atlas também no desenvolvimento: copie a `mongodb+srv://...` para `MONGO_URI` e rode com ela.
  - Firewalls/Antivírus podem bloquear a porta 27017; libere se necessário.

- Erro: `MongoNetworkError: failed to connect to server` com Atlas
  - Verifique se seu IP está na allowlist do Atlas.
  - Confirme usuário/senha corretos e se o database name existe na string.
  - Mantenha `retryWrites=true&w=majority`.

- Erro: `JWT_SECRET não definido`
  - Garanta que `.env` tem `JWT_SECRET` e que `npm run dev` carrega `dotenv/config` (já está configurado no `server.ts`).

- 404 inesperado
  - Confirme a URL base e path (`/register`, `/login`, `/protected`) e que a app está rodando na porta certa (`PORT`).

## Licença
Uso educacional — sem licença explícita adicionada.

