// API Route para verificar se usuário é admin
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isAdmin } from '@/lib/admin';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { isAdmin: false },
        { status: 400 }
      );
    }

    // Normalizar email (lowercase e trim)
    const emailNormalizado = email.trim().toLowerCase();
    
    // Verificar se é admin
    const admin = isAdmin(emailNormalizado);
    
    // Log para debug (remover em produção se necessário)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[admin check] email: ${emailNormalizado}, isAdmin: ${admin}`);
    }

    return NextResponse.json({ isAdmin: admin });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('erro ao verificar admin:', error);
    }
    return NextResponse.json(
      { isAdmin: false },
      { status: 500 }
    );
  }
}

