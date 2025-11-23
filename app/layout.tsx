// Layout principal da aplicação
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ReportBugButton from '@/components/ReportBugButton';
import '@/styles/globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mostrarHeaderFooter, setMostrarHeaderFooter] = useState(true);

  useEffect(() => {
    // Verificar se está na página de login com reset (tela de redefinição)
    if (pathname === '/login') {
      const reset = searchParams?.get('reset');
      const hash = typeof window !== 'undefined' ? window.location.hash : '';
      const isResetPage = reset === 'true' || (hash.length > 0 && (hash.includes('access_token') || hash.includes('recovery')));
      
      // Esconder Header e Footer quando estiver na tela de redefinição
      setMostrarHeaderFooter(!isResetPage);
    } else {
      // Sempre mostrar Header e Footer em outras páginas
      setMostrarHeaderFooter(true);
    }
  }, [pathname, searchParams]);

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="icon" href="/logoused.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Familjen+Grotesk:ital,wght@0,400..700;1,400..700&display=swap" rel="stylesheet" />
        <title>used | marketplace de itens usados</title>
        <meta name="description" content="compre e venda itens usados de forma simples" />
      </head>
      <body suppressHydrationWarning>
        {mostrarHeaderFooter && <Header />}
        <main style={{ minHeight: mostrarHeaderFooter ? '80vh' : '100vh' }}>
          {children}
        </main>
        {mostrarHeaderFooter && <Footer />}
        {mostrarHeaderFooter && <ReportBugButton />}
      </body>
    </html>
  );
}
