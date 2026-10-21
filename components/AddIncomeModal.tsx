'use client';

import React, { useState, useEffect } from 'react';
import { Member, Transaction } from '../lib/types';
import { formatRupiah } from '../lib/dataService';
import { X, Check, ArrowDownRight, User, CalendarRange, Plus, Minus, Calculator } from 'lucide-react';
import DatePicker from './DatePicker';

interface AddIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onSave: (tx: Omit<Transaction, 'id' | 'created_at'>) => Promise<void>;
  preselectedMember?: Member | null;
  currentWeekLabel: string;
  weeklyFee: number;
}

export default function AddIncomeModal({
  isOpen,
  onClose,
  members,
  onSave,
  preselectedMember,
  currentWeekLabel,
  weeklyFee,
}: AddIncomeModalProps) {
  const [memberId, setMemberId] = useState('');
  const [weeksCount, setWeeksCount] = useState<number>(1);
  const [weekLabel, setWeekLabel] = useState(currentWeekLabel);
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (preselectedMember) {
      setMemberId(preselectedMember.id);
    } else if (members.length > 0 && !memberId) {
      setMemberId(members[0].id);
    }
  }, [preselectedMember, members, memberId]);

  useEffect(() => {
    setWeekLabel(currentWeekLabel);
  }, [currentWeekLabel]);

  useEffect(() => {
    if (isOpen) {
      setWeeksCount(1);
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Total amount calculated automatically: weeksCount * weeklyFee
  const totalAmount = Math.max(1, weeksCount) * weeklyFee;

  const quickWeekOptions = [
    { label: '1 Minggu', weeks: 1 },
    { label: '2 Minggu', weeks: 2 },
    { label: '3 Minggu', weeks: 3 },
    { label: '4 Minggu (1 Bln)', weeks: 4 },
    { label: '8 Minggu (2 Bln)', weeks: 8 },
    { label: '12 Minggu (3 Bln)', weeks: 12 },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (weeksCount <= 0) {
      alert('Pilih minimal 1 minggu pembayaran.');
      return;
    }

    const selected = members.find((m) => m.id === memberId);
    if (!selected) {
      alert('Pilih anggota pembayar.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        type: 'income',
        amount: totalAmount,
        category: 'Iuran Mingguan',
        weeks_count: weeksCount,
        description: description || `Bayar Kas ${weeksCount} Minggu (${formatRupiah(totalAmount)})`,
        member_id: selected.id,
        member_name: selected.name,
        week_label: weekLabel,
        date,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#121217] border border-[#2a2a38] rounded-2xl shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-[#16161f] rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#22c55e]">
              <ArrowDownRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Catat Bayar Kas Mingguan</h3>
              <p className="text-xs text-zinc-400">
                Tarif: <span className="text-emerald-400 font-semibold">{formatRupiah(weeklyFee)}</span> / minggu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Pilih Anggota */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Nama Anggota
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <select
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                required
                className="w-full bg-[#0a0a0f] border border-zinc-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
              >
                <option value="" disabled>Pilih nama orang...</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sesi / Minggu Kas Dimulai */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Mulai Sesi Minggu / Tanggal
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={weekLabel}
                onChange={(e) => setWeekLabel(e.target.value)}
                placeholder="Contoh: Minggu 3 - Oktober"
                required
                className="w-full bg-[#0a0a0f] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
              />
              <DatePicker
                value={date}
                onChange={setDate}
                placeholder="Pilih tanggal..."
              />
            </div>
          </div>

          {/* PILIH BERAPA MINGGU (Core requirement) */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <CalendarRange className="w-3.5 h-3.5 text-emerald-400" />
                <span>Bayar Untuk Berapa Minggu?</span>
              </label>
              <span className="text-xs text-zinc-500 font-mono">
                {weeksCount} Minggu
              </span>
            </div>

            {/* Stepper (+ / -) */}
            <div className="flex items-center gap-3 bg-[#0a0a0f] p-2 rounded-xl border border-zinc-700/80">
              <button
                type="button"
                onClick={() => setWeeksCount((prev) => Math.max(1, prev - 1))}
                className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center font-bold transition-colors active:scale-95"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="flex-1 text-center">
                <input
                  type="number"
                  min="1"
                  max="52"
                  value={weeksCount}
                  onChange={(e) => setWeeksCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 bg-transparent text-center font-extrabold text-2xl text-white focus:outline-none"
                />
                <span className="text-xs text-zinc-400 block -mt-1">Minggu</span>
              </div>

              <button
                type="button"
                onClick={() => setWeeksCount((prev) => prev + 1)}
                className="w-10 h-10 rounded-lg bg-red-600 hover:bg-red-500 text-white flex items-center justify-center font-bold transition-colors active:scale-95"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Tombol Cepat Pilihan Minggu */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {quickWeekOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.weeks}
                  onClick={() => setWeeksCount(opt.weeks)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all truncate ${
                    weeksCount === opt.weeks
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-[0_0_10px_rgba(34,197,94,0.25)]'
                      : 'bg-[#0a0a0f] border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* HASIL PERHITUNGAN OTOMATIS NOMINAL (Glow Green) */}
          <div className="bg-gradient-to-r from-emerald-950/40 to-zinc-900 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-[#22c55e]">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-zinc-400 block font-semibold">
                  Total Iuran Kas ({weeksCount} Minggu × {formatRupiah(weeklyFee)})
                </span>
                <p className="text-2xl font-black text-[#22c55e] text-glow-green">
                  {formatRupiah(totalAmount)}
                </p>
              </div>
            </div>
          </div>

          {/* Keterangan Tambahan */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Keterangan (Opsional)
            </label>
            <input
              type="text"
              placeholder={`Contoh: Bayar Kas ${weeksCount} Minggu via Transfer BCA`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#0a0a0f] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 placeholder-zinc-500"
            />
          </div>

          {/* Submit Buttons */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs sm:text-sm font-semibold transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-emerald-900/40 active:scale-95 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : `Catat ${weeksCount} Minggu (${formatRupiah(totalAmount)})`}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
