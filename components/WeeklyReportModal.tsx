'use client';

import React, { useState } from 'react';
import { MemberSummary, Transaction } from '../lib/types';
import { formatRupiah } from '../lib/dataService';
import { X, Copy, Check, MessageSquare, Share2 } from 'lucide-react';

interface WeeklyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  summaries: MemberSummary[];
  transactions: Transaction[];
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  currentWeekLabel: string;
  weeklyFee: number;
}

export default function WeeklyReportModal({
  isOpen,
  onClose,
  summaries,
  transactions,
  totalBalance,
  totalIncome,
  totalExpense,
  currentWeekLabel,
  weeklyFee,
}: WeeklyReportModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const paidMembers = summaries.filter((s) => s.paid_current_week);
  const unpaidMembers = summaries.filter((s) => !s.paid_current_week);

  // Recent 5 expenses
  const recentExpenses = transactions.filter((t) => t.type === 'expense').slice(0, 5);

  const reportText = `🏸 *LAPORAN KAS BADMINTON CLUB* 🏸
📅 Periode: *${currentWeekLabel}*
💵 Tarif Iuran: *${formatRupiah(weeklyFee)} / minggu*

💰 *RINGKASAN KEUANGAN*
• Total Saldo Kas Tersedia: *${formatRupiah(totalBalance)}*
• Total Uang Masuk: *${formatRupiah(totalIncome)}*
• Total Pengeluaran: *${formatRupiah(totalExpense)}*

✅ *STATUS IURAN MINGGU INI (${paidMembers.length}/${summaries.length} Orang Lunas)*
${
  paidMembers.length > 0
    ? paidMembers.map((m, idx) => `${idx + 1}. ${m.member.name} (${m.total_weeks_paid} Minggu terbayar)`).join('\n')
    : '- Belum ada pembayaran minggu ini -'
}

⏳ *BELUM BAYAR (${unpaidMembers.length} Orang)*:
${
  unpaidMembers.length > 0
    ? unpaidMembers.map((m, idx) => `${idx + 1}. ${m.member.name}`).join('\n')
    : '- Semua anggota sudah lunas! 👏 -'
}

📉 *PENGELUARAN TERBARU:*
${
  recentExpenses.length > 0
    ? recentExpenses.map((e) => `• ${e.date}: ${e.category} (${formatRupiah(e.amount)}) - ${e.description || ''}`).join('\n')
    : '- Belum ada pengeluaran -'
}

Terima kasih atas partisipasinya! Salam Badminton! 🏸✨`;

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWa = () => {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(reportText)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#121217] border border-[#2a2a38] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-[#16161f]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#22c55e]">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Laporan Kas WhatsApp</h3>
              <p className="text-xs text-zinc-400">Siap disalin atau dibagikan langsung ke grup WA</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Text Preview */}
        <div className="p-5 flex-1 overflow-y-auto">
          <pre className="bg-[#0a0a0f] p-4 rounded-xl border border-zinc-800/80 text-xs font-mono text-zinc-200 whitespace-pre-wrap leading-relaxed select-all">
            {reportText}
          </pre>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-zinc-800 bg-[#16161f] flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
          >
            Tutup
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-all border border-zinc-700"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Teks</span>
                </>
              )}
            </button>

            <button
              onClick={handleShareWa}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-md shadow-emerald-950"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share ke WA</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
