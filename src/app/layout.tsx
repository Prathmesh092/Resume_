import type { Metadata } from 'next';
import { GeistSans } from 'next/font/google';
import { GeistMono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

const geistSans = GeistSans({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = GeistMono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'JobMatcher AI',
  description: 'AI-powered job matching based on your resume.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
