import type { ReactNode } from 'react';
import { Header } from './header';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">{children}</main>
      <footer className="py-6 md:px-8 md:py-0 bg-background border-t">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-20 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built with ❤️ by AI.
          </p>
        </div>
      </footer>
    </div>
  );
}
