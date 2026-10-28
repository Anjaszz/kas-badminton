'use client';

import React, { useState } from 'react';
import { Transaction } from '../lib/types';
import { formatRupiah, formatDateIndo } from '../lib/dataService';
import { Search, ArrowDownRight, ArrowUpRight, Trash2, ReceiptText, Pencil } from 'lucide-react';

interface TransactionSectionProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onEditTransaction: (tx: Transaction) => void;
  onOpenIncome: () => void;
  onOpenExpense: () => void;
  isAdmin?: boolean;
}

export default function TransactionSection({
  transactions,
  onDeleteTransaction,
  onEditTransaction,
  onOpenIncome,
  onOpenExpense,
  isAdmin = false,
}: TransactionSectionProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Unique categories
  const categories = Array.from(new Set(transactions.map((t) => t.category).filter(Boolean)));

  const filteredTransactions = transactions.filter((t) => {
    if (typeFilter !== 'all' && t.type !== typeFilter) return false;
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchMember = t.member_name?.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchCategory = t.category?.toLowerCase().includes(q);
      const matchWeek = t.week_label?.toLowerCase().includes(q);
      return matchMember || matchDesc || matchCategory || matchWeek;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Controls Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white dark:bg-[#121217] p-4 rounded-2xl border border-slate-200 dark:border-[#22222d] shadow-sm transition-colors">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-400" />
          <input
            type="text"
            placeholder="Cari transaksi, nama pembayar, atau keterangan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#0a0a0e] border border-slate-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Type filter */}
          <div className="flex items-center bg-slate-100 dark:bg-[#0a0a0e] p-1 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-medium">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                typeFilter === 'all'
                  ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
                typeFilter === 'income'
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-600/40 shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Kas Masuk
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
                typeFilter === 'expense'
                  ? 'bg-red-50 dark:bg-red-950/70 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700/50 shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
              Pengeluaran
            </button>
          </div>

          {/* Category Dropdown */}
          {categories.length > 0 && (
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-50 dark:bg-[#0a0a0e] border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-red-500 cursor-pointer"
              >
                <option value="all">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

      </div>

      {/* Transaction List / Table */}
      {transactions.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white/80 dark:bg-[#121217]/50 rounded-2xl border border-dashed border-slate-300 dark:border-zinc-800">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-[#22c55e] mx-auto flex items-center justify-center mb-3">
            <ReceiptText className="w-6 h-6" />
          </div>
          <p className="text-slate-900 dark:text-white font-bold text-base mb-1">Belum Ada Riwayat Transaksi</p>
          <p className="text-slate-500 dark:text-zinc-400 text-xs max-w-sm mx-auto mb-4">
            Riwayat uang kas masuk dan pengeluaran club akan tercatat rapi di sini.
          </p>
          {isAdmin && (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={onOpenIncome}
                className="px-3.5 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-500 shadow-md shadow-red-600/20 dark:shadow-red-950/40"
              >
                + Catat Kas Masuk
              </button>
              <button
                onClick={onOpenExpense}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700"
              >
                - Catat Pengeluaran
              </button>
            </div>
          )}
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white/80 dark:bg-[#121217]/50 rounded-2xl border border-dashed border-slate-300 dark:border-zinc-800">
          <p className="text-slate-500 dark:text-zinc-400 text-sm">Belum ada catatan riwayat transaksi yang cocok.</p>
          {isAdmin && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={onOpenIncome}
                className="px-3.5 py-1.5 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-500"
              >
                + Catat Kas Masuk
              </button>
              <button
                onClick={onOpenExpense}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-zinc-700"
              >
                - Catat Pengeluaran
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#121217] rounded-2xl border border-slate-200 dark:border-[#22222d] shadow-sm dark:shadow-xl overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-zinc-800/70">
            {filteredTransactions.map((tx) => {
              const isIncome = tx.type === 'income';

              return (
                <div
                  key={tx.id}
                  className="p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 hover:bg-slate-50/80 dark:hover:bg-zinc-800/30 transition-colors"
                >
                  {/* Left: Icon & Info */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`p-2 sm:p-2.5 rounded-xl border flex-shrink-0 mt-0.5 sm:mt-0 ${
                        isIncome
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base truncate">
                          {isIncome
                            ? tx.member_name || 'Kas Masuk'
                            : tx.category || 'Pengeluaran'}
                        </span>
                        
                        <span
                          className={`text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider border ${
                            isIncome
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40'
                              : 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/40'
                          }`}
                        >
                          {tx.category}
                        </span>

                        {tx.week_label && (
                          <span className="text-[9px] sm:text-[10px] text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800/80 px-1.5 sm:px-2 py-0.5 rounded-md border border-slate-200 dark:border-zinc-700/50">
                            {tx.week_label}
                          </span>
                        )}

                        {isIncome && tx.weeks_count && (
                          <span className="text-[9px] sm:text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-1.5 sm:px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/50">
                            {tx.weeks_count} Minggu
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 mt-1">
                        <span>{formatDateIndo(tx.date)}</span>
                        {tx.description && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[160px] sm:max-w-md text-slate-600 dark:text-zinc-300">
                              {tx.description}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-zinc-800/60">
                    <div className="text-left sm:text-right">
                      <p
                        className={`text-sm sm:text-base md:text-lg font-bold tracking-tight ${
                          isIncome
                            ? 'text-emerald-600 dark:text-[#22c55e] text-glow-green'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {isIncome ? '+' : '-'}{formatRupiah(tx.amount)}
                      </p>
                      <span className="text-[10px] sm:text-[11px] text-slate-400 dark:text-zinc-500">
                        {isIncome ? (tx.weeks_count ? `${tx.weeks_count} Minggu lunas` : 'Iuran Masuk') : 'Uang Keluar'}
                      </span>
                    </div>

                    {isAdmin && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEditTransaction(tx)}
                          className="p-1.5 sm:p-2 rounded-xl text-slate-400 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                          title="Edit catatan transaksi ini"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-1.5 sm:p-2 rounded-xl text-slate-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          title="Hapus transaksi ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
