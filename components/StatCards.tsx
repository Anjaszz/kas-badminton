'use client';

import React from 'react';
import { Wallet, ArrowDownRight, ArrowUpRight, Users, CheckCircle2, Minus } from 'lucide-react';
import { formatRupiah } from '../lib/dataService';

interface StatCardsProps {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  memberCount: number;
  paidThisWeekCount: number;
  currentWeekLabel: string;
  onOpenExpense: () => void;
  isAdmin?: boolean;
}

export default function StatCards({
  totalBalance,
  totalIncome,
  totalExpense,
  memberCount,
  paidThisWeekCount,
  currentWeekLabel,
  onOpenExpense,
  isAdmin = false,
}: StatCardsProps) {
  const percentagePaid = memberCount > 0 ? Math.round((paidThisWeekCount / memberCount) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
      
      {/* 1. Total Saldo Kas (Highlight utama dengan glowing green) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#121218] to-[#181824] border border-[#272736] p-4 sm:p-5 shadow-xl flex flex-col justify-between">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div>
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Total Saldo Kas
            </span>
            <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#22c55e] text-glow-green">
              {formatRupiah(totalBalance)}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-zinc-400">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Kas Tersedia Saat Ini</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Total Pengeluaran (Uang Keluar) + Tombol Catat Pengeluaran */}
      <div className="relative overflow-hidden rounded-2xl bg-[#121217] border border-[#22222d] p-4 sm:p-5 shadow-lg hover:border-red-500/30 transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Total Pengeluaran
            </span>
            <div className="p-2 sm:p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-red-400">
              {formatRupiah(totalExpense)}
            </p>
            <p className="text-[11px] sm:text-xs text-zinc-400">
              Sewa lapangan, kok, dan operasional
            </p>
          </div>
        </div>

        {/* Tombol Catat Pengeluaran di Card Pengeluaran (Hanya Admin) */}
        {isAdmin && (
          <div className="pt-3 mt-3 border-t border-zinc-800/80">
            <button
              onClick={onOpenExpense}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-950/70 hover:bg-red-900/90 text-red-300 hover:text-white border border-red-700/50 hover:border-red-500 text-xs font-semibold transition-all shadow-sm active:scale-98"
            >
              <Minus className="w-3.5 h-3.5 text-red-400" />
              <span>+ Catat Pengeluaran</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Kas Minggu Ini & Anggota */}
      <div className="relative overflow-hidden rounded-2xl bg-[#121217] border border-[#22222d] p-4 sm:p-5 shadow-lg hover:border-zinc-700 transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-400 truncate">
              {currentWeekLabel || 'Iuran Minggu Ini'}
            </span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-zinc-800 text-zinc-300">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-1">
              <span className="text-xl sm:text-2xl font-bold text-white">
                {paidThisWeekCount} <span className="text-xs sm:text-sm font-normal text-zinc-400">/ {memberCount} orang</span>
              </span>
              <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                {percentagePaid}% Lunas
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-zinc-800/80 rounded-full h-2 overflow-hidden border border-zinc-700/50">
              <div
                className="bg-gradient-to-r from-red-500 to-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(100, percentagePaid)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-zinc-400 pt-0.5">
              <span>{memberCount - paidThisWeekCount} belum bayar</span>
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3 h-3" /> Siap main
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Total Uang Masuk (Iuran Kas) - Terakhir */}
      <div className="relative overflow-hidden rounded-2xl bg-[#121217] border border-[#22222d] p-4 sm:p-5 shadow-lg hover:border-emerald-500/30 transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Total Kas Masuk
            </span>
            <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#22c55e]">
              <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-[#22c55e]">
              {formatRupiah(totalIncome)}
            </p>
            <p className="text-[11px] sm:text-xs text-zinc-400">
              Akumulasi dari iuran semua anggota
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
