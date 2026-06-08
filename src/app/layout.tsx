import type { Metadata } from 'next';
import './globals.css';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/lib/auth';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'InjAfrica WC2026 Predictor',
  description: 'Predict World Cup 2026 match scores and compete with the Injective community',
  icons: {
    icon: '/favicon.ico',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en">
      <body className="bg-dark text-white min-h-screen">
        <SessionProvider session={session}>
          <Navbar />
          <main className="min-h-[calc(100vh-64px)]">{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
