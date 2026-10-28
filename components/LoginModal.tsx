'use client';

import React, { useState } from 'react';
import { X, Lock, Mail, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const ADMIN_EMAIL = 'kasbadminton@abangexpress.com';
export const ADMIN_PASSWORD = 'Admin123';

export default function LoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
}: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password.trim();

      if (cleanEmail === ADMIN_EMAIL.toLowerCase() && cleanPassword === ADMIN_PASSWORD) {
        setIsLoading(false);
        if (typeof window !== 'undefined') {
          localStorage.setItem('kb_is_admin', 'true');
        }
        onLoginSuccess();
        onClose();
      } else {
        setIsLoading(false);
        setErrorMessage('Email atau kata sandi admin salah. Silakan coba lagi.');
      }
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-[#121217] border border-slate-200 dark:border-[#2a2a38] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#16161f]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-500 shadow-sm dark:shadow-md dark:shadow-red-950/30">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-950 dark:text-white flex items-center gap-1.5">
                <span>Login Admin Kas</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-600/40 text-red-600 dark:text-red-400">
                  AX
                </span>
              </h3>
              <p className="text-xs text-slate-700 dark:text-zinc-400 font-medium">Masuk untuk mengelola data kas & anggota</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-600 dark:text-zinc-400 hover:text-slate-950 dark:hover:text-white rounded-lg hover:bg-slate-200/70 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleLogin} className="p-6 space-y-4">
          
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 rounded-xl text-xs text-red-700 dark:text-red-200 flex items-start gap-2.5 leading-relaxed">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Email Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-400 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
              <span>Email Admin</span>
            </label>
            <input
              type="email"
              required
              autoFocus
              placeholder="admin@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMessage(null);
              }}
              className="w-full bg-slate-50 dark:bg-[#0a0a0f] border border-slate-300 dark:border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-950 dark:text-white focus:outline-none focus:border-red-500 placeholder-slate-500 dark:placeholder-zinc-500"
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-400 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
              <span>Kata Sandi (Password)</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Masukkan kata sandi..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMessage(null);
                }}
                className="w-full bg-slate-50 dark:bg-[#0a0a0f] border border-slate-300 dark:border-zinc-700/80 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-slate-950 dark:text-white focus:outline-none focus:border-red-500 placeholder-slate-500 dark:placeholder-zinc-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-zinc-400 hover:text-slate-950 dark:hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-200 dark:border-zinc-800/80">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-300 text-xs sm:text-sm font-semibold transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-red-600/20 dark:shadow-lg dark:shadow-red-900/30 active:scale-95 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isLoading ? 'Memeriksa...' : 'Masuk Admin'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
