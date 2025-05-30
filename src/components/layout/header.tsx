
"use client";

import { Briefcase, LogIn, LogOut, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const MOCK_AUTH_TOKEN_KEY = 'jobmatcher_mock_auth_token';

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check localStorage on mount (client-side only)
    const token = localStorage.getItem(MOCK_AUTH_TOKEN_KEY);
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(MOCK_AUTH_TOKEN_KEY);
    setIsLoggedIn(false);
    router.push('/'); // Redirect to home page after logout
    router.refresh(); // Refresh server components if needed
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Briefcase className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block text-lg">
            JobMatcher AI
          </span>
        </Link>
        <div className="ml-auto flex items-center space-x-2">
          {isLoggedIn ? (
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Link>
              </Button>
              <Button variant="default" size="sm" asChild>
                <Link href="/register">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
