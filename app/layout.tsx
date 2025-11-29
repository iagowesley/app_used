// Layout principal da aplicação
'use client';

import { useState, Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ReportBugButton from '@/components/ReportBugButton';
import LayoutController from '@/components/LayoutController';
import SessionMonitor from '@/components/SessionMonitor';
import '@/styles/globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mostrarHeaderFooter, setMostrarHeaderFooter] = useState(true);

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
        <Suspense fallback={null}>
          <LayoutController onShowHeaderFooter={setMostrarHeaderFooter} />
        </Suspense>
        <SessionMonitor />
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
