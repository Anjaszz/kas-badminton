'use client';

import React from 'react';
import Image from 'next/image';
import { Plus, LogIn, LogOut, ShieldCheck, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  onOpenIncome: () => void;
  isAdmin: boolean;
  onOpenLogin: () => void;
  onLogout: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export default function Navbar({
  onOpenIncome,
  isAdmin,
  onOpenLogin,
  onLogout,
  theme = 'light',
  onToggleTheme,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-[#22222d] bg-white/95 dark:bg-[#0c0c10]/95 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <div className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-[#15151e] border border-slate-200/80 dark:border-transparent p-1 shadow-md dark:shadow-lg dark:shadow-red-950/20 flex-shrink-0 group overflow-hidden">
            <Image
              src="/logo-ax.png"
              alt="Logo Badminton AX"
              width={48}
              height={48}
              priority
              className="w-full h-full object-contain rounded-lg transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-base sm:text-xl md:text-2xl font-black tracking-tight text-slate-950 dark:text-white flex items-center gap-1.5 truncate">
                KAS <span className="text-red-600 dark:text-red-500">BADMINTON</span>
              </h1>
              {isAdmin && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40">
                  <ShieldCheck className="w-3 h-3" />
                  Admin
                </span>
              )}
            </div>
            <p className="text-[10px] sm:text-xs text-slate-700 dark:text-zinc-400 font-medium truncate hidden xs:block">
              Pencatatan kas & iuran mingguan club
            </p>
          </div>
        </div>

        {/* Action Buttons + Theme Switcher */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Ubah ke Mode Terang (Light)' : 'Ubah ke Mode Gelap (Dark)'}
              aria-label="Toggle Theme"
              className="flex items-center justify-center p-2 sm:p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-300 border border-slate-300 dark:border-zinc-700 transition-all active:scale-95"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-800" />
              )}
            </button>
          )}

          {!isAdmin ? (
            /* Mode Publik: Tombol Login Admin */
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-red-600/20 dark:shadow-lg dark:shadow-red-700/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              <LogIn className="w-4 h-4 stroke-[2.5]" />
              <span>Login Admin</span>
            </button>
          ) : (
            /* Mode Admin: Tambah Kas + Logout */
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenIncome}
                className="flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-red-600/20 dark:shadow-lg dark:shadow-red-700/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Tambah Kas</span>
              </button>

              <button
                onClick={onLogout}
                title="Keluar dari mode admin"
                className="flex items-center gap-1.5 px-3 py-2 sm:px-3 sm:py-2.5 rounded-xl bg-slate-100 hover:bg-red-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 hover:text-red-600 dark:text-zinc-300 dark:hover:text-red-400 text-xs sm:text-sm font-semibold transition-colors border border-slate-300 dark:border-zinc-700"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
