'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import AuthButton from './AuthButton';
import { useState } from 'react';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Home' },
  { href: '/matches',   label: 'Matches' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/final-prediction', label: 'Final Pred.' },
  { href: '/profile',  label: 'My Account' },
];

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Top bar */}
      <nav className="sticky top-0 z-50 bg-sb-green-dark border-b border-sb-green/40 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 h-12 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href={session ? '/dashboard' : '/'} className="flex items-center gap-2 shrink-0">
            {/* Replace /logo.png with your actual logo file in the public folder */}
            <img src="/logo.png" alt="" width={28} height={28} className="rounded-sm object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <span className="text-sb-yellow font-black text-lg tracking-tight leading-none">
              INJ<span className="text-white">AFRICA</span>
            </span>
            <span className="hidden sm:block text-[10px] text-white/50 font-medium uppercase mt-0.5">WC2026</span>
          </Link>

          {/* Desktop nav */}
          {session && (
            <div className="hidden md:flex items-center">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 h-12 flex items-center text-sm font-semibold uppercase tracking-wide border-b-2 transition-colors ${
                    pathname === link.href
                      ? 'border-sb-yellow text-sb-yellow'
                      : 'border-transparent text-white/70 hover:text-white hover:border-white/30'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right */}
          <div className="flex items-center gap-2 shrink-0">
            {session ? (
              <>
                <div className="hidden sm:flex items-center gap-1.5 bg-sb-green/30 border border-sb-green px-3 py-1 rounded-sm">
                  <span className="text-sb-yellow font-black text-sm">{session.user?.points ?? 0}</span>
                  <span className="text-white/50 text-xs">PTS</span>
                </div>
                <Link href="/profile">
                  <Image
                    src={session.user?.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'}
                    alt={session.user?.username ?? 'User'}
                    width={28}
                    height={28}
                    className="rounded-full border-2 border-sb-yellow/60"
                  />
                </Link>
                <AuthButton />
                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="md:hidden text-white p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {mobileOpen
                      ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
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
          <div className="md:hidden bg-sb-green-dark border-t border-sb-green/40">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 text-sm font-semibold uppercase border-b border-sb-border ${
                  pathname === link.href ? 'text-sb-yellow bg-sb-green/20' : 'text-white/70'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Secondary strip — sport tabs look */}
      {session && (
        <div className="bg-sb-card border-b border-sb-border">
          <div className="max-w-7xl mx-auto px-3 flex items-center gap-1 h-9 overflow-x-auto no-scrollbar">
            {['Group Stage', 'Round of 16', 'Quarter-finals', 'Semi-finals', 'Final'].map((s) => (
              <Link
                key={s}
                href="/matches"
                className="shrink-0 px-3 py-1 text-xs font-semibold text-sb-muted hover:text-white hover:bg-sb-card-2 rounded-sm transition-colors whitespace-nowrap"
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
