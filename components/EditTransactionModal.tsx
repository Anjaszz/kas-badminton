'use client';

import React, { useState, useEffect } from 'react';
import { Transaction, Member } from '../lib/types';
import { X, Check, Tag, DollarSign, User, AlertTriangle, Wallet, Edit } from 'lucide-react';
import { formatRupiah } from '../lib/dataService';
import DatePicker from './DatePicker';

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  members: Member[];
  onSave: (tx: Transaction) => Promise<void>;
  currentBalance: number;
  weeklyFee: number;
}

const formatNumberWithDots = (val: string | number): string => {
  const cleanDigits = val.toString().replace(/\D/g, '');
  if (!cleanDigits) return '';
  return new Intl.NumberFormat('id-ID').format(parseInt(cleanDigits, 10));
};

const parseRawNumber = (val: string): number => {
  const cleanDigits = val.replace(/\D/g, '');
  return cleanDigits ? parseInt(cleanDigits, 10) : 0;
};

export default function EditTransactionModal({
  isOpen,
  onClose,
  transaction,
  members,
  onSave,
  currentBalance,
  weeklyFee,
}: EditTransactionModalProps) {
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [memberId, setMemberId] = useState('');
  const [memberName, setMemberName] = useState('');
  const [weekLabel, setWeekLabel] = useState('');
  const [weeksCount, setWeeksCount] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (transaction && isOpen) {
      setCategory(transaction.category || (transaction.type === 'income' ? 'Iuran Mingguan' : 'Sewa Lapangan'));
      setAmount(formatNumberWithDots(transaction.amount));
      setDate(transaction.date || '');
      setDescription(transaction.description || '');
      setMemberId(transaction.member_id || '');
      setMemberName(transaction.member_name || '');
      setWeekLabel(transaction.week_label || '');
      setWeeksCount(transaction.weeks_count || 1);
      setErrorMessage(null);
    }
  }, [transaction, isOpen]);

  if (!isOpen || !transaction) return null;

  const isIncome = transaction.type === 'income';

  const expenseCategories = [
    'Sewa Lapangan',
    'Beli Shuttlecock',
    'Konsumsi / Minum',
    'Grip & Senar',
    'P3K / Medis',
    'Lainnya',
  ];

  const maxAllowedExpense = !isIncome ? currentBalance + transaction.amount : Infinity;
  const parsedAmount = parseRawNumber(amount);
  const isExceedingExpense = !isIncome && parsedAmount > maxAllowedExpense;

  const handleMemberChange = (id: string) => {
    setMemberId(id);
    const found = members.find((m) => m.id === id);
    if (found) {
      setMemberName(found.name);
    }
  };

  const handleWeeksCountChange = (count: number) => {
    setWeeksCount(count);
    const calculated = count * weeklyFee;
    setAmount(formatNumberWithDots(calculated));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const finalAmount = parseRawNumber(amount);
    if (!finalAmount || finalAmount <= 0) {
      setErrorMessage('Nominal harus lebih dari 0.');
      return;
    }

    if (!isIncome && finalAmount > maxAllowedExpense) {
      setErrorMessage(
        `Nominal pengeluaran (${formatRupiah(finalAmount)}) melebihi saldo kas yang tersedia (${formatRupiah(maxAllowedExpense)}). Saldo tidak boleh minus.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        ...transaction,
        amount: finalAmount,
        category,
        date: date || new Date().toISOString().split('T')[0],
        description: description || category,
        member_id: isIncome ? memberId || null : null,
        member_name: isIncome ? memberName || null : null,
        week_label: isIncome ? weekLabel || null : null,
        weeks_count: isIncome ? weeksCount || undefined : undefined,
      });
      onClose();
    } catch {
      setErrorMessage('Gagal memperbarui transaksi. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-[#121217] border border-slate-200 dark:border-[#2a2a38] rounded-2xl shadow-2xl relative">
        
        {/* Header */}
        <div
          className={`flex items-center justify-between p-5 border-b border-slate-200 dark:border-zinc-800 rounded-t-2xl ${
            isIncome ? 'bg-emerald-50/50 dark:bg-[#111914]' : 'bg-red-50/50 dark:bg-[#191316]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border ${
                isIncome
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-[#22c55e]'
                  : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-500'
              }`}
            >
              <Edit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Edit Catatan {isIncome ? 'Kas Masuk' : 'Pengeluaran'}</span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                    isIncome
                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-600/40'
                      : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-200 dark:border-red-600/40'
                  }`}
                >
                  {isIncome ? 'Iuran' : 'Pengeluaran'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Perbaiki kesalahan nominal, tanggal, anggota, atau keterangan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-200/70 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Box untuk Expense: Sisa Saldo Tersedia */}
        {!isIncome && (
          <div className="px-6 py-2.5 bg-slate-50 dark:bg-[#0e0e14] border-b border-slate-200 dark:border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Batas Maksimal Pengeluaran:
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatRupiah(maxAllowedExpense)}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 rounded-xl text-xs text-red-700 dark:text-red-200 flex items-start gap-2.5 leading-relaxed">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form Fields: Kas Masuk */}
          {isIncome ? (
            <>
              {/* Nama Anggota */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Nama Anggota</span>
                </label>
                <div className="relative">
                  <select
                    value={memberId}
                    onChange={(e) => handleMemberChange(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-[#0a0a0f] border border-slate-300 dark:border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="" disabled>Pilih nama anggota...</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tanggal & Sesi Minggu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DatePicker
                  label="Tanggal Transaksi"
                  value={date}
                  onChange={setDate}
                  direction="auto"
                />
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">
                    Sesi / Label Minggu
                  </label>
                  <input
                    type="text"
                    value={weekLabel}
                    onChange={(e) => setWeekLabel(e.target.value)}
                    placeholder="Contoh: Minggu 3 - Oktober"
                    className="w-full bg-slate-50 dark:bg-[#0a0a0f] border border-slate-300 dark:border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Pilihan Berapa Minggu Lunas */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">
                  Jumlah Minggu Dibayar
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 mb-2">
                  {[1, 2, 3, 4, 5, 8].map((w) => (
                    <button
                      type="button"
                      key={w}
                      onClick={() => handleWeeksCountChange(w)}
                      className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        weeksCount === w
                          ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-700 dark:text-emerald-400'
                          : 'bg-slate-50 dark:bg-[#0a0a0f] border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {w} Mgg
                    </button>
                  ))}
                </div>
              </div>

              {/* Nominal Kas Masuk */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Nominal Kas Masuk (Rp)</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400 dark:text-zinc-400 pointer-events-none">
                    Rp
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={amount}
                    onChange={(e) => {
                      setAmount(formatNumberWithDots(e.target.value));
                      setErrorMessage(null);
                    }}
                    required
                    className="w-full bg-slate-50 dark:bg-[#0a0a0f] border border-slate-300 dark:border-zinc-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </>
          ) : (
            /* Form Fields: Pengeluaran */
            <>
              {/* Kategori Pengeluaran */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                  <span>Kategori Pengeluaran</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {expenseCategories.map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-medium border text-left truncate transition-all ${
                        category === cat
                          ? 'bg-red-50 dark:bg-red-950/70 border-red-500 text-red-700 dark:text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.15)]'
                          : 'bg-slate-50 dark:bg-[#0a0a0f] border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tanggal Pengeluaran */}
              <DatePicker
                label="Tanggal Pengeluaran"
                value={date}
                onChange={setDate}
                direction="auto"
              />

              {/* Nominal Pengeluaran */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                    <span>Nominal Pengeluaran</span>
                  </label>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Maks: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{formatRupiah(maxAllowedExpense)}</span>
                  </span>
                </div>

                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400 dark:text-zinc-400 pointer-events-none">
                    Rp
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={amount}
                    onChange={(e) => {
                      setAmount(formatNumberWithDots(e.target.value));
                      setErrorMessage(null);
                    }}
                    required
                    className={`w-full bg-slate-50 dark:bg-[#0a0a0f] border rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-semibold focus:outline-none ${
                      isExceedingExpense
                        ? 'border-red-500 focus:border-red-400'
                        : 'border-slate-300 dark:border-zinc-700/80 focus:border-red-500'
                    }`}
                  />
                </div>

                {isExceedingExpense && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    Nominal melebihi saldo kas tersedia ({formatRupiah(maxAllowedExpense)})!
                  </p>
                )}
              </div>
            </>
          )}

          {/* Keterangan Rinci */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">
              Keterangan Rinci
            </label>
            <textarea
              rows={2}
              placeholder="Tambahkan keterangan rincian jika ada..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0a0a0f] border border-slate-300 dark:border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-red-500 placeholder-slate-400 dark:placeholder-zinc-500 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs sm:text-sm font-semibold transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isExceedingExpense || !parsedAmount}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-semibold transition-all shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                isIncome
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20 dark:shadow-emerald-950/40'
                  : 'bg-red-600 hover:bg-red-500 shadow-red-600/20 dark:shadow-red-900/40'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
