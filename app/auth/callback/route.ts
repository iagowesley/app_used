import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const type = requestUrl.searchParams.get('type');

    if (code) {
        const supabase = createRouteHandlerClient({ cookies });
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
            // Se houver erro, redirecionar para login com mensagem de erro
            return NextResponse.redirect(new URL('/login?error=invalid_link', requestUrl.origin));
        }

        // Verificar o tipo de callback
        // type=signup ou type=email -> confirmação de email
        // type=recovery -> redefinição de senha  
        if (type === 'recovery') {
            // Redefinição de senha - redirecionar para login com parâmetro reset
            return NextResponse.redirect(new URL('/login?reset=true', requestUrl.origin));
        } else if (type === 'signup' || type === 'email') {
            // Confirmação de email - redirecionar para login com parâmetro confirmed
            return NextResponse.redirect(new URL('/login?confirmed=true', requestUrl.origin));
        }
    }

    // Caso padrão: redirecionar para página inicial já logado
    return NextResponse.redirect(new URL('/', requestUrl.origin));
}
