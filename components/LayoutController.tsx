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
        // Sempre mostrar Header e Footer em todas as páginas, incluindo redefinição de senha
        onShowHeaderFooter(true);
    }, [pathname, searchParams, onShowHeaderFooter]);

    return null;
}
