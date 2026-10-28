'use client';

import React, { useState, useMemo } from 'react';
import { Transaction } from '../lib/types';
import { formatRupiah, formatDateIndo } from '../lib/dataService';
import {
  CalendarDays,
  Search,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Receipt,
} from 'lucide-react';

interface MonthlySummarySectionProps {
  transactions: Transaction[];
}

interface MonthlyData {
  monthKey: string; // e.g. '2026-10'
  monthLabel: string; // e.g. 'Oktober 2026'
  year: number;
  monthIndex: number;
  totalIncome: number;
  totalExpense: number;
  incomeCount: number;
  expenseCount: number;
  transactions: Transaction[];
}

const MONTH_NAMES_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export default function MonthlySummarySection({ transactions }: MonthlySummarySectionProps) {
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

  // Group transactions by Year-Month
  const monthlyDataList: MonthlyData[] = useMemo(() => {
    const map = new Map<string, MonthlyData>();

    transactions.forEach((tx) => {
      let year = 2026;
      let monthIndex = 9; // Oktober default

      if (tx.date && tx.date.includes('-')) {
        const parts = tx.date.split('-');
        const parsedY = parseInt(parts[0], 10);
        const parsedM = parseInt(parts[1], 10) - 1;
        if (!isNaN(parsedY) && !isNaN(parsedM) && parsedM >= 0 && parsedM < 12) {
          year = parsedY;
          monthIndex = parsedM;
        }
      } else if (tx.date) {
        const d = new Date(tx.date);
        if (!isNaN(d.getTime())) {
          year = d.getFullYear();
          monthIndex = d.getMonth();
        }
      }

      const monthKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
      const monthLabel = `${MONTH_NAMES_ID[monthIndex]} ${year}`;

      if (!map.has(monthKey)) {
        map.set(monthKey, {
          monthKey,
          monthLabel,
          year,
          monthIndex,
          totalIncome: 0,
          totalExpense: 0,
          incomeCount: 0,
          expenseCount: 0,
          transactions: [],
        });
      }

      const item = map.get(monthKey)!;
      item.transactions.push(tx);

      const amt = Number(tx.amount || 0);
      if (tx.type === 'income') {
        item.totalIncome += amt;
        item.incomeCount += 1;
      } else if (tx.type === 'expense') {
        item.totalExpense += amt;
        item.expenseCount += 1;
      }
    });

    // Convert map to array and sort descending by monthKey (e.g. 2026-10 before 2026-09)
    return Array.from(map.values()).sort((a, b) => b.monthKey.localeCompare(a.monthKey));
  }, [transactions]);

  // Available unique years for filtering
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    monthlyDataList.forEach((m) => years.add(m.year.toString()));
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [monthlyDataList]);

  // Filtered monthly data based on selected year and search query
  const filteredMonthlyData = useMemo(() => {
    return monthlyDataList.filter((m) => {
      if (selectedYear !== 'all' && m.year.toString() !== selectedYear) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return m.monthLabel.toLowerCase().includes(q) || m.monthKey.includes(q);
      }
      return true;
    });
  }, [monthlyDataList, selectedYear, searchQuery]);

  // Overall totals for the filtered data
  const summaryTotals = useMemo(() => {
    return filteredMonthlyData.reduce(
      (acc, m) => {
        acc.totalIncome += m.totalIncome;
        acc.totalExpense += m.totalExpense;
        acc.incomeCount += m.incomeCount;
        acc.expenseCount += m.expenseCount;
        return acc;
      },
      { totalIncome: 0, totalExpense: 0, incomeCount: 0, expenseCount: 0 }
    );
  }, [filteredMonthlyData]);

  const toggleExpand = (monthKey: string) => {
    setExpandedMonth((prev) => (prev === monthKey ? null : monthKey));
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-[#121217] p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-[#22222d] shadow-sm transition-colors">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 dark:text-zinc-400" />
          <input
            type="text"
            placeholder="Cari bulan (contoh: Oktober, 2026)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#0a0a0e] border border-slate-300 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-950 dark:text-white placeholder-slate-600 dark:placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        {/* Year Filter Pill */}
        <div className="flex items-center gap-2 self-stretch md:self-auto">
          <div className="relative flex-1 md:flex-initial">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full md:w-auto bg-slate-50 dark:bg-[#0a0a0e] border border-slate-300 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-zinc-200 focus:outline-none focus:border-red-500 cursor-pointer"
            >
              <option value="all">Semua Tahun</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  Tahun {yr}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-[#0a0a0e] border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-zinc-300">
            <CalendarDays className="w-4 h-4 text-red-500" />
            <span>{filteredMonthlyData.length} Periode Bulan</span>
          </div>
        </div>

      </div>

      {/* 2. Main Summary Table */}
      {filteredMonthlyData.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white/80 dark:bg-[#121217]/50 rounded-2xl border border-dashed border-slate-300 dark:border-zinc-800">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-[#22c55e] mx-auto flex items-center justify-center mb-3">
            <BarChart3 className="w-6 h-6" />
          </div>
          <p className="text-slate-950 dark:text-white font-bold text-base mb-1">
            Belum Ada Data Rekap Bulanan
          </p>
          <p className="text-slate-700 dark:text-zinc-400 text-xs max-w-sm mx-auto font-medium">
            Catat transaksi iuran kas masuk dan pengeluaran terlebih dahulu agar ringkasan per bulan muncul di sini.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#121217] rounded-2xl border border-slate-200 dark:border-[#22222d] shadow-sm dark:shadow-xl overflow-hidden">
          
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-950 dark:text-white text-base sm:text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-red-600 dark:text-red-500" />
                <span>Tabel Rekapitulasi Kas per Bulan</span>
              </h3>
              <p className="text-xs text-slate-700 dark:text-zinc-400 font-medium mt-0.5">
                Rincian akumulasi uang kas masuk dan pengeluaran setiap bulannya
              </p>
            </div>
          </div>

          {/* Desktop & Tablet Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/90 dark:bg-[#16161f] border-b border-slate-200 dark:border-zinc-800/80 text-[11px] font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-400">
                  <th className="py-3.5 px-4 sm:px-6">Bulan</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Total Kas Masuk</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Total Pengeluaran</th>
                  <th className="py-3.5 px-4 sm:px-6 text-center">Rincian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-xs sm:text-sm">
                {filteredMonthlyData.map((row) => {
                  const isExpanded = expandedMonth === row.monthKey;

                  return (
                    <React.Fragment key={row.monthKey}>
                      <tr className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/30 transition-colors">
                        
                        {/* Col 1: Bulan */}
                        <td className="py-4 px-4 sm:px-6 align-middle">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-300 flex-shrink-0">
                              <CalendarDays className="w-4 h-4 text-red-600 dark:text-red-500" />
                            </div>
                            <div>
                              <span className="font-bold text-slate-950 dark:text-white block text-sm sm:text-base">
                                {row.monthLabel}
                              </span>
                              <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-medium">
                                {row.transactions.length} transaksi tercatat
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Col 2: Total Kas Masuk di Bulan Tsb */}
                        <td className="py-4 px-4 sm:px-6 text-right align-middle">
                          <span className="font-bold text-emerald-600 dark:text-[#22c55e] block text-sm sm:text-base">
                            +{formatRupiah(row.totalIncome)}
                          </span>
                          <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-medium">
                            {row.incomeCount} setoran
                          </span>
                        </td>

                        {/* Col 3: Pengeluaran di Bulan Tsb */}
                        <td className="py-4 px-4 sm:px-6 text-right align-middle">
                          <span className="font-bold text-red-600 dark:text-red-400 block text-sm sm:text-base">
                            -{formatRupiah(row.totalExpense)}
                          </span>
                          <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-medium">
                            {row.expenseCount} pengeluaran
                          </span>
                        </td>

                        {/* Col 4: Expand / Detail Button */}
                        <td className="py-4 px-4 sm:px-6 text-center align-middle">
                          <button
                            onClick={() => toggleExpand(row.monthKey)}
                            title={isExpanded ? 'Tutup rincian' : 'Lihat rincian transaksi bulan ini'}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-300 text-xs font-semibold border border-slate-200 dark:border-zinc-700 transition-colors"
                          >
                            <span>{isExpanded ? 'Tutup' : 'Rincian'}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>

                      </tr>

                      {/* Expandable Breakdown Drawer */}
                      {isExpanded && (
                        <tr className="bg-slate-50/60 dark:bg-[#0a0a0f]/60">
                          <td colSpan={4} className="p-4 sm:p-6">
                            <div className="bg-white dark:bg-[#14141c] rounded-xl border border-slate-200 dark:border-zinc-800 p-4 space-y-4">
                              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800">
                                <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-1.5">
                                  <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                  <span>Rincian Transaksi — {row.monthLabel}</span>
                                </h4>
                                <span className="text-[11px] font-semibold text-slate-700 dark:text-zinc-400">
                                  Total: {row.transactions.length} Transaksi
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                
                                {/* List Kas Masuk Bulan Ini */}
                                <div className="space-y-2">
                                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                                    Kas Masuk ({row.incomeCount})
                                  </span>
                                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                                    {row.transactions
                                      .filter((t) => t.type === 'income')
                                      .map((t) => (
                                        <div
                                          key={t.id}
                                          className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0c0c10] border border-slate-200 dark:border-zinc-800/80 flex items-center justify-between text-xs"
                                        >
                                          <div>
                                            <p className="font-bold text-slate-900 dark:text-white truncate max-w-[170px] sm:max-w-[220px]">
                                              {t.member_name || 'Kas Masuk'}
                                            </p>
                                            <p className="text-[10px] text-slate-600 dark:text-zinc-400 font-medium">
                                              {formatDateIndo(t.date)} {t.weeks_count ? `• ${t.weeks_count} Mgg` : ''}
                                            </p>
                                          </div>
                                          <span className="font-bold text-emerald-600 dark:text-[#22c55e]">
                                            +{formatRupiah(t.amount)}
                                          </span>
                                        </div>
                                      ))}
                                    {row.incomeCount === 0 && (
                                      <p className="text-xs text-slate-500 dark:text-zinc-500 italic py-2">
                                        Tidak ada kas masuk di bulan ini.
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* List Pengeluaran Bulan Ini */}
                                <div className="space-y-2">
                                  <span className="text-[11px] font-bold uppercase tracking-wider text-red-700 dark:text-red-400 block">
                                    Pengeluaran ({row.expenseCount})
                                  </span>
                                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                                    {row.transactions
                                      .filter((t) => t.type === 'expense')
                                      .map((t) => (
                                        <div
                                          key={t.id}
                                          className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0c0c10] border border-slate-200 dark:border-zinc-800/80 flex items-center justify-between text-xs"
                                        >
                                          <div>
                                            <p className="font-bold text-slate-900 dark:text-white truncate max-w-[170px] sm:max-w-[220px]">
                                              {t.category || 'Pengeluaran'}
                                            </p>
                                            <p className="text-[10px] text-slate-600 dark:text-zinc-400 font-medium">
                                              {formatDateIndo(t.date)} {t.description ? `• ${t.description}` : ''}
                                            </p>
                                          </div>
                                          <span className="font-bold text-red-600 dark:text-red-400">
                                            -{formatRupiah(t.amount)}
                                          </span>
                                        </div>
                                      ))}
                                    {row.expenseCount === 0 && (
                                      <p className="text-xs text-slate-500 dark:text-zinc-500 italic py-2">
                                        Tidak ada pengeluaran di bulan ini.
                                      </p>
                                    )}
                                  </div>
                                </div>

                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>

              {/* Table Footer: Total Keseluruhan */}
              <tfoot>
                <tr className="bg-slate-100/90 dark:bg-[#161622] border-t-2 border-slate-300 dark:border-zinc-700 font-bold text-xs sm:text-sm text-slate-950 dark:text-white">
                  <td className="py-4 px-4 sm:px-6 align-middle">
                    <span className="uppercase tracking-wider font-extrabold">
                      Total ({filteredMonthlyData.length} Bulan)
                    </span>
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-right text-emerald-600 dark:text-[#22c55e] font-extrabold text-sm sm:text-base align-middle">
                    +{formatRupiah(summaryTotals.totalIncome)}
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-right text-red-600 dark:text-red-400 font-extrabold text-sm sm:text-base align-middle">
                    -{formatRupiah(summaryTotals.totalExpense)}
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-center text-[11px] text-slate-700 dark:text-zinc-400 font-medium">
                    Rekap Total
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

        </div>
      )}

    </div>
  );
}

