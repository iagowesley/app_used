# Instruções para Deploy no Netlify

## Configuração do Login via Google

### 1. Configurar URL de Redirecionamento no Supabase

1. Acesse o [Dashboard do Supabase](https://app.supabase.com)
2. Vá em **Authentication** → **URL Configuration**
3. Adicione a URL do seu site Netlify em **Redirect URLs**:
   - Exemplo: `https://seu-site.netlify.app/**`
   - Exemplo: `https://seu-dominio.com/**`

### 2. Configurar Variável de Ambiente no Netlify

1. No Netlify, vá em **Site settings** → **Environment variables**
2. Adicione a variável:
   - **Key**: `NEXT_PUBLIC_SITE_URL`
   - **Value**: `https://seu-site.netlify.app` (ou seu domínio customizado)

**Nota**: Se você não configurar esta variável, o sistema usará automaticamente `window.location.origin`, que funciona na maioria dos casos. Mas é recomendado configurar para garantir compatibilidade.

### 3. Configurar Email Admin no Netlify

1. No Netlify, vá em **Site settings** → **Environment variables**
2. Adicione a variável:
   - **Key**: `ADMIN_EMAILS`
   - **Value**: `seu-email@admin.com,outro-email@admin.com` (separado por vírgula)

**Importante**: 
- Use o email exato que você usa para fazer login
- O email é case-insensitive (não diferencia maiúsculas/minúsculas)
- Separe múltiplos emails por vírgula

### 4. Verificar Configuração do Google OAuth

1. No [Google Cloud Console](https://console.cloud.google.com)
2. Vá em **APIs & Services** → **Credentials**
3. Edite seu OAuth 2.0 Client ID
4. Adicione a URL de autorização:
   - `https://seu-site.netlify.app`
   - `https://seu-dominio.com` (se tiver domínio customizado)

## 🔄 Mudando o Domínio do Site

Quando você mudar o domínio do seu site, precisa atualizar em **3 lugares**:

### 1. Netlify (Variável de Ambiente)
- Vá em **Site settings** → **Environment variables**
- Atualize o valor de `NEXT_PUBLIC_SITE_URL` para o novo domínio

### 2. Supabase (Redirect URLs)
- Acesse o [Dashboard do Supabase](https://app.supabase.com)
- Vá em **Authentication** → **URL Configuration**
- Adicione o novo domínio em **Redirect URLs**:
  - `https://novo-dominio.com/**`
- Você pode manter os antigos também (não precisa remover)

### 3. Google Cloud Console (OAuth)
- No [Google Cloud Console](https://console.cloud.google.com)
- Vá em **APIs & Services** → **Credentials**
- Edite seu OAuth 2.0 Client ID
- Adicione o novo domínio em **Authorized JavaScript origins** e **Authorized redirect URIs**

**Dica**: O código da aplicação usa a função `getSiteUrl()` que prioriza `NEXT_PUBLIC_SITE_URL`, mas se não estiver configurado, usa automaticamente `window.location.origin`. Isso significa que se você mudar o domínio mas esquecer de atualizar a variável, ainda funcionará na maioria dos casos!

## Troubleshooting

### Login via Google redireciona para localhost

**Causa**: O Supabase está configurado com localhost nas URLs permitidas.

**Solução**: 
1. Verifique se adicionou a URL do Netlify no Supabase (passo 1)
2. Verifique se a variável `NEXT_PUBLIC_SITE_URL` está configurada no Netlify (passo 2)

### Botão Dashboard não aparece

**Causa**: O email não está na lista de admins ou a verificação falhou.

**Solução**:
1. Verifique se o email está exatamente como você faz login (incluindo maiúsculas/minúsculas)
2. Verifique se a variável `ADMIN_EMAILS` está configurada no Netlify (passo 3)
3. Verifique os logs do Netlify para erros na API `/api/admin/verificar`

### Não consigo deletar anúncios como admin

**Causa**: A verificação de admin não está funcionando corretamente.

**Solução**:
1. Verifique se o email está em `ADMIN_EMAILS`
2. Faça logout e login novamente
3. Verifique os logs do console do navegador (F12) para erros

