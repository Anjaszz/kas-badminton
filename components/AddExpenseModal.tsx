'use client';

import React, { useState, useEffect } from 'react';
import { Transaction } from '../lib/types';
import { X, Check, ArrowUpRight, Tag, DollarSign, AlertTriangle, Wallet } from 'lucide-react';
import { formatRupiah } from '../lib/dataService';
import DatePicker from './DatePicker';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id' | 'created_at'>) => Promise<void>;
  currentBalance?: number;
}

// Format number with Indonesian dot separators (e.g. 10000 -> 10.000)
const formatNumberWithDots = (val: string | number): string => {
  const cleanDigits = val.toString().replace(/\D/g, '');
  if (!cleanDigits) return '';
  return new Intl.NumberFormat('id-ID').format(parseInt(cleanDigits, 10));
};

const parseRawNumber = (val: string): number => {
  const cleanDigits = val.replace(/\D/g, '');
  return cleanDigits ? parseInt(cleanDigits, 10) : 0;
};

export default function AddExpenseModal({
  isOpen,
  onClose,
  onSave,
  currentBalance = 0,
}: AddExpenseModalProps) {
  const [category, setCategory] = useState('Sewa Lapangan');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setDescription('');
      setErrorMessage(null);
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const expenseCategories = [
    'Sewa Lapangan',
    'Beli Shuttlecock',
    'Konsumsi / Minum',
    'Grip & Senar',
    'P3K / Medis',
    'Lainnya',
  ];

  const quickAmounts = [20000, 40000, 50000, 75000, 100000, 150000];

  const parsedAmount = parseRawNumber(amount);
  const isZeroBalance = currentBalance <= 0;
  const isExceedingBalance = parsedAmount > currentBalance;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const finalAmount = parseRawNumber(amount);
    if (!finalAmount || finalAmount <= 0) {
      setErrorMessage('Masukkan nominal pengeluaran yang valid.');
      return;
    }

    // Validasi saldo kas tidak boleh 0 atau minus
    if (isZeroBalance) {
      setErrorMessage('Saldo kas saat ini Rp 0 (kosong). Tidak dapat mencatat pengeluaran sebelum ada uang kas yang masuk.');
      return;
    }

    if (finalAmount > currentBalance) {
      setErrorMessage(
        `Nominal pengeluaran (${formatRupiah(finalAmount)}) melebihi sisa saldo kas yang tersedia (${formatRupiah(currentBalance)}). Saldo kas tidak boleh minus.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        type: 'expense',
        amount: finalAmount,
        category,
        description: description || category,
        date,
      });
      onClose();
    } catch {
      setErrorMessage('Terjadi kesalahan saat menyimpan pengeluaran. Coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#121217] border border-[#2a2a38] rounded-2xl shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-[#191316] rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Catat Pengeluaran Kas</h3>
              <p className="text-xs text-zinc-400">Biaya sewa lapangan, shuttlecock, minum, dll.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Saldo Kas Saat Ini */}
        <div className={`px-6 py-3 border-b flex items-center justify-between transition-colors ${
          isZeroBalance
            ? 'bg-red-950/40 border-red-900/50 text-red-400'
            : 'bg-[#0e0e14] border-zinc-800/80 text-zinc-300'
        }`}>
          <div className="flex items-center gap-2 text-xs">
            <Wallet className={`w-4 h-4 ${isZeroBalance ? 'text-red-400' : 'text-emerald-400'}`} />
            <span className="text-zinc-400">Sisa Saldo Kas Tersedia:</span>
          </div>
          <span className={`text-sm font-bold ${isZeroBalance ? 'text-red-400' : 'text-[#22c55e]'}`}>
            {formatRupiah(currentBalance)}
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Warning Banner jika saldo 0 */}
          {isZeroBalance && (
            <div className="p-3 bg-red-950/40 border border-red-800/70 rounded-xl text-xs text-red-300 flex items-start gap-2.5 leading-relaxed">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-200">Saldo Kas Kosong (Rp 0)</p>
                <p className="text-red-300/80 mt-0.5">
                  Anda tidak bisa mencatat pengeluaran karena belum ada saldo kas. Silakan catat uang iuran kas masuk terlebih dahulu.
                </p>
              </div>
            </div>
          )}

          {/* Error Message jika validasi gagal */}
          {errorMessage && !isZeroBalance && (
            <div className="p-3 bg-red-950/50 border border-red-700/80 rounded-xl text-xs text-red-200 flex items-start gap-2.5 leading-relaxed">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
          
          {/* Kategori Pengeluaran */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-red-400" />
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
                      ? 'bg-red-950/70 border-red-500 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                      : 'bg-[#0a0a0f] border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Tanggal Pengeluaran (Ditempatkan di atas agar kalender leluasa dan tidak terpotong) */}
          <DatePicker
            label="Tanggal Pengeluaran"
            value={date}
            onChange={setDate}
            direction="auto"
          />

          {/* Nominal Pengeluaran */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-red-400" />
                <span>Nominal Pengeluaran</span>
              </label>
              {currentBalance > 0 && (
                <span className="text-[11px] text-zinc-400">
                  Maks: <span className="text-emerald-400 font-semibold">{formatRupiah(currentBalance)}</span>
                </span>
              )}
            </div>

            {/* Quick amount pills */}
            <div className="grid grid-cols-3 gap-2 mb-2">
              {quickAmounts.map((q) => {
                const disabled = isZeroBalance || q > currentBalance;
                const formattedPill = formatNumberWithDots(q);
                return (
                  <button
                    type="button"
                    key={q}
                    disabled={disabled}
                    onClick={() => {
                      setAmount(formattedPill);
                      setErrorMessage(null);
                    }}
                    className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all ${
                      disabled
                        ? 'opacity-30 bg-[#0a0a0f] border-zinc-900 text-zinc-600 cursor-not-allowed'
                        : amount === formattedPill
                        ? 'bg-red-950 border-red-500 text-red-300 shadow-sm'
                        : 'bg-[#0a0a0f] border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    Rp {formattedPill}
                  </button>
                );
              })}
            </div>

            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-zinc-400 pointer-events-none">
                Rp
              </div>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Contoh: 50.000"
                value={amount}
                disabled={isZeroBalance}
                onChange={(e) => {
                  const formatted = formatNumberWithDots(e.target.value);
                  setAmount(formatted);
                  setErrorMessage(null);
                }}
                required
                className={`w-full bg-[#0a0a0f] border rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white font-semibold focus:outline-none placeholder-zinc-500 ${
                  isExceedingBalance && !isZeroBalance
                    ? 'border-red-500 focus:border-red-400'
                    : 'border-zinc-700/80 focus:border-red-500'
                } ${isZeroBalance ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            </div>

            {/* Warning if typed amount exceeds current balance */}
            {isExceedingBalance && !isZeroBalance && (
              <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                Nominal melebihi saldo kas ({formatRupiah(currentBalance)}). Saldo tidak boleh minus!
              </p>
            )}
          </div>

          {/* Rincian / Deskripsi */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Keterangan Rinci
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Lapangan 2 GOR Badminton (Pk 19.00 - 21.00)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#0a0a0f] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 placeholder-zinc-500 resize-none"
            />
          </div>

          {/* Submit */}
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
              disabled={isSubmitting || isZeroBalance || isExceedingBalance || !parsedAmount}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-red-900/40 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Pengeluaran'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
