'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import AuthButton from './AuthButton';
import { useState } from 'react';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/matches', label: 'Matches' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/profile', label: 'Profile' },
];

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!session && (pathname === '/' || pathname === '/not-authorized')) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 bg-dark-card/90 backdrop-blur-md border-b border-dark-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href={session ? '/dashboard' : '/'} className="flex items-center gap-2 font-black text-lg">
          <span className="text-2xl">⚽</span>
          <span className="gradient-text hidden sm:block">WC2026</span>
        </Link>

        {/* Desktop nav */}
        {session && (
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-primary/20 text-primary'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3">
          {session ? (
            <>
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-gold font-bold text-sm">{session.user?.points ?? 0} pts</span>
              </div>
              <Image
                src={session.user?.avatar || `https://cdn.discordapp.com/embed/avatars/0.png`}
                alt={session.user?.username ?? 'User'}
                width={32}
                height={32}
                className="rounded-full border border-dark-border"
              />
              <AuthButton />

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </>
          ) : (
            <AuthButton />
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {session && mobileOpen && (
        <div className="md:hidden border-t border-dark-border bg-dark-card">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 text-sm font-medium border-b border-dark-border/50 ${
                pathname === link.href ? 'text-primary bg-primary/10' : 'text-gray-400'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
