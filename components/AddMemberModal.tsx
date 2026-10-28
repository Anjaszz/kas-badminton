'use client';

import React, { useState } from 'react';
import { Member } from '../lib/types';
import { X, Check, UserPlus, Palette } from 'lucide-react';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: Omit<Member, 'id' | 'created_at'>) => Promise<void>;
}

export default function AddMemberModal({
  isOpen,
  onClose,
  onSave,
}: AddMemberModalProps) {
  const [name, setName] = useState('');
  const [avatarColor, setAvatarColor] = useState('#ef4444');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const colorOptions = [
    '#ef4444', // Badminton Red
    '#10b981', // Emerald Green
    '#3b82f6', // Electric Blue
    '#f59e0b', // Amber / Gold
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#14b8a6', // Teal
    '#6366f1', // Indigo
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Nama anggota tidak boleh kosong.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        avatar_color: avatarColor,
        status: 'active',
      });
      setName('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#121217] border border-slate-200 dark:border-[#2a2a38] rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#16161f]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-500">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-950 dark:text-white">Tambah Anggota Badminton</h3>
              <p className="text-xs text-slate-700 dark:text-zinc-400 font-medium">Daftarkan orang baru untuk pencatatan uang kas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-600 dark:text-zinc-400 hover:text-slate-950 dark:hover:text-white rounded-lg hover:bg-slate-200/70 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Nama Anggota */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-400 mb-1.5">
              Nama Lengkap / Panggilan
            </label>
            <input
              type="text"
              placeholder="Contoh: Hendra Setiawan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-slate-50 dark:bg-[#0a0a0f] border border-slate-300 dark:border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-950 dark:text-white focus:outline-none focus:border-red-500 placeholder-slate-500 dark:placeholder-zinc-500"
            />
          </div>

          {/* Warna Avatar */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-400 mb-2 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-slate-700 dark:text-zinc-400" />
              <span>Warna Profil Avatar</span>
            </label>
            <div className="flex items-center gap-2.5">
              {colorOptions.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setAvatarColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    avatarColor === c
                      ? 'ring-2 ring-slate-900 dark:ring-white scale-110 shadow-lg'
                      : 'opacity-70 hover:opacity-100 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-300 text-xs sm:text-sm font-semibold transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-red-600/20 dark:shadow-lg dark:shadow-red-900/40 active:scale-95 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Tambah Anggota'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
