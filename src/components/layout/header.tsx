
"use client";

import { Briefcase, LogIn, LogOut, UserPlus, Home, Upload, ListChecks, Bookmark } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const MOCK_AUTH_TOKEN_KEY = 'jobmatcher_mock_auth_token';

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem(MOCK_AUTH_TOKEN_KEY);
    setIsLoggedIn(!!token);
  }, [pathname]); // Re-check on pathname change for SPA behavior

  const handleLogout = () => {
    localStorage.removeItem(MOCK_AUTH_TOKEN_KEY);
    localStorage.removeItem('jobmatcher_parsed_resume'); // Clear resume data on logout
    localStorage.removeItem('jobmatcher_saved_jobs'); // Clear saved jobs on logout
    setIsLoggedIn(false);
    router.push('/'); 
    router.refresh(); 
  };

  const navItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/upload', label: 'Upload Resume', icon: Upload },
    { href: '/matches', label: 'My Matches', icon: ListChecks },
    { href: '/saved-jobs', label: 'Saved Jobs', icon: Bookmark },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Briefcase className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block text-lg">
            JobMatcher AI
          </span>
        </Link>

        {isLoggedIn && (
          <nav className="ml-6 hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                asChild
                className={cn(
                  "text-sm font-medium",
                  pathname === item.href
                    ? "text-primary bg-accent"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            ))}
          </nav>
        )}

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
      {/* Mobile Nav */}
      {isLoggedIn && (
        <nav className="md:hidden flex justify-around p-2 border-t">
            {navItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                asChild
                className={cn(
                  "flex-col h-auto p-1 text-xs w-1/4", // Adjusted for 4 items
                  pathname === item.href
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                <Link href={item.href} className="flex flex-col items-center">
                  <item.icon className="h-5 w-5 mb-0.5" />
                  <span className="text-center leading-tight">{item.label}</span>
                </Link>
              </Button>
            ))}
        </nav>
      )}
    </header>
  );
}
