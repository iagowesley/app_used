# used - marketplace de itens usados

![Logo](https://img.shields.io/badge/used-marketplace-FF7A00?style=for-the-badge)

Aplicação web minimalista e moderna para compra e venda de itens usados. Desenvolvida com Next.js, React e Supabase.

## 🎨 design

- **Paleta de cores:** Branco puro (`#FFFFFF`) e Laranja vibrante (`#FF7A00`)
- **Estética:** Design flat com elementos arredondados
- **Tipografia:** Todos os textos em minúsculo para um visual moderno e descontraído

## 🚀 tecnologias

- **Frontend:** Next.js 14 + React 18 + TypeScript
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Estilização:** CSS Modules

## 📋 funcionalidades

- ✅ Autenticação de usuários (cadastro e login)
- ✅ Listagem de produtos com busca
- ✅ Criação de anúncios com upload de imagem
- ✅ Design responsivo e moderno
- ✅ Integração completa com Supabase

## 🛠️ configuração do projeto

### 1. pré-requisitos

- Node.js 18+ instalado
- Conta no [Supabase](https://supabase.com)

### 2. instalação

Clone o repositório e instale as dependências:

```bash
npm install
```

### 3. configuração do supabase

#### 3.1. criar projeto no supabase

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto
2. Anote a **URL do projeto** e a **chave anônima** (disponíveis em Settings > API)

#### 3.2. configurar tabela de produtos

Execute o seguinte SQL no editor SQL do Supabase:

```sql
-- Criar tabela de produtos
create table produtos (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users not null,
  nome text not null,
  descricao text not null,
  preco numeric not null,
  url_imagem text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS (Row Level Security)
alter table produtos enable row level security;

-- Política: Todos podem ver produtos
create policy "produtos são públicos"
  on produtos for select
  using (true);

-- Política: Usuários autenticados podem criar produtos
create policy "usuários autenticados podem criar produtos"
  on produtos for insert
  with check (auth.uid() = user_id);

-- Política: Usuários podem atualizar seus próprios produtos
create policy "usuários podem atualizar seus produtos"
  on produtos for update
  using (auth.uid() = user_id);

-- Política: Usuários podem deletar seus próprios produtos
create policy "usuários podem deletar seus produtos"
  on produtos for delete
  using (auth.uid() = user_id);
```

#### 3.3. configurar storage para imagens

No painel do Supabase, vá em **Storage** e:

1. Crie um novo bucket chamado `imagens`
2. Configure como **público**
3. Adicione a seguinte política para permitir uploads:

```sql
-- Política: Usuários autenticados podem fazer upload
create policy "usuários autenticados podem fazer upload"
  on storage.objects for insert
  with check (
    bucket_id = 'imagens' and
    auth.role() = 'authenticated'
  );
```

#### 3.4. configurar autenticação

No painel do Supabase, vá em **Authentication > Providers** e:

1. Certifique-se de que o **Email Provider** está habilitado
2. Configure conforme necessário (confirmação de email, etc.)

### 4. variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` e adicione suas credenciais do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```

### 5. executar o projeto

```bash
npm run dev
```

Acesse http://localhost:3000 no seu navegador.

## 📁 estrutura do projeto

```
used/
├── app/
│   ├── cadastro/          # Página de cadastro
│   ├── login/             # Página de login
│   ├── novo-anuncio/      # Página de criação de anúncio
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página inicial (listagem)
├── components/
│   ├── Header.tsx         # Cabeçalho da aplicação
│   └── ProductCard.tsx    # Card de produto
├── lib/
│   └── supabase.ts        # Cliente Supabase
├── styles/
│   └── globals.css        # Estilos globais
└── public/                # Arquivos estáticos
```

## 🗃️ schema do banco de dados

### tabela: produtos

| Coluna      | Tipo      | Descrição                          |
|-------------|-----------|------------------------------------|
| id          | bigint    | ID único (PK, auto-incremento)     |
| user_id     | uuid      | ID do usuário (FK para auth.users) |
| nome        | text      | Nome do produto                    |
| descricao   | text      | Descrição detalhada                |
| preco       | numeric   | Preço do produto                   |
| url_imagem  | text      | URL da imagem no Supabase Storage  |
| created_at  | timestamp | Data de criação                    |

## 🎯 fluxo de uso

1. **Visitante:** Pode visualizar todos os anúncios e buscar produtos
2. **Cadastro:** Criar uma conta com email e senha
3. **Login:** Entrar com as credenciais criadas
4. **Criar anúncio:** Após login, clicar em "anunciar" e preencher o formulário
5. **Upload de foto:** Selecionar uma imagem do produto (máx 5MB)
6. **Visualizar:** O anúncio aparecerá na página inicial

## 🔒 segurança

- Autenticação implementada via Supabase Auth
- Row Level Security (RLS) configurado no banco de dados
- Validações de formulário no frontend
- Upload de imagens restrito a usuários autenticados

## 🚀 deploy

### Vercel (recomendado)

1. Faça push do código para um repositório Git
2. Importe o projeto na [Vercel](https://vercel.com)
3. Adicione as variáveis de ambiente (`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
4. Deploy automático!

## 📝 próximos passos (melhorias futuras)

- [ ] Página de detalhes do produto
- [ ] Perfil do usuário
- [ ] Edição e exclusão de anúncios
- [ ] Filtros avançados (preço, categoria)
- [ ] Sistema de favoritos
- [ ] Chat entre comprador e vendedor
- [ ] Notificações

## 📄 licença

Este projeto é de código aberto e está disponível para uso educacional e comercial.

---

desenvolvido com ❤️ usando next.js e supabase

