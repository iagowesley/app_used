# used - marketplace de itens usados

![Logo](https://img.shields.io/badge/used-marketplace-FF7A00?style=for-the-badge)

Aplicação web minimalista e moderna para compra e venda de itens usados. Desenvolvida com Next.js, React e Supabase.

##  design

- **Paleta de cores:** Branco puro (`#FFFFFF`) e Laranja vibrante (`#FF7A00`)
- **Estética:** Design flat com elementos arredondados
- **Tipografia:** Todos os textos em minúsculo para um visual moderno e descontraído

##  tecnologias

- **Frontend:** Next.js 14 + React 18 + TypeScript
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Estilização:** CSS Modules

##  funcionalidades

- ✅ Autenticação de usuários (cadastro e login)
- ✅ Listagem de produtos com busca
- ✅ Criação de anúncios com upload de imagem
- ✅ Design responsivo e moderno
- ✅ Integração completa com Supabase



##  estrutura do projeto

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

##  schema do banco de dados

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

##  fluxo de uso

1. **Visitante:** Pode visualizar todos os anúncios e buscar produtos
2. **Cadastro:** Criar uma conta com email e senha
3. **Login:** Entrar com as credenciais criadas
4. **Criar anúncio:** Após login, clicar em "anunciar" e preencher o formulário
5. **Upload de foto:** Selecionar uma imagem do produto (máx 5MB)
6. **Visualizar:** O anúncio aparecerá na página inicial

##  segurança

- Autenticação implementada via Supabase Auth
- Row Level Security (RLS) configurado no banco de dados
- Validações de formulário no frontend
- Upload de imagens restrito a usuários autenticados

desenvolvido usando next.js e supabase

