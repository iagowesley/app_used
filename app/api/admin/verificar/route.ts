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

    const admin = isAdmin(email);

    return NextResponse.json({ isAdmin: admin });
  } catch (error) {
    console.error('erro ao verificar admin:', error);
    return NextResponse.json(
      { isAdmin: false },
      { status: 500 }
    );
  }
}

