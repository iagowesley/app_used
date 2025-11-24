'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface LayoutControllerProps {
    onShowHeaderFooter: (show: boolean) => void;
}

export default function LayoutController({ onShowHeaderFooter }: LayoutControllerProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Verificar se está na página de login com reset (tela de redefinição)
        if (pathname === '/login') {
            const reset = searchParams?.get('reset');
            const hash = typeof window !== 'undefined' ? window.location.hash : '';
            const isResetPage = reset === 'true' || (hash.length > 0 && (hash.includes('access_token') || hash.includes('recovery')));

            // Esconder Header e Footer quando estiver na tela de redefinição
            onShowHeaderFooter(!isResetPage);
        } else {
            // Sempre mostrar Header e Footer em outras páginas
            onShowHeaderFooter(true);
        }
    }, [pathname, searchParams, onShowHeaderFooter]);

    return null;
}
