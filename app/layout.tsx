// Layout principal da aplicação
import Header from '@/components/Header';
import '@/styles/globals.css';

export const metadata = {
  title: 'used - marketplace de itens usados',
  description: 'compre e venda itens usados de forma simples',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Familjen+Grotesk:ital,wght@0,400..700;1,400..700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Header />
        <main style={{ minHeight: '80vh', padding: '40px 0' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
