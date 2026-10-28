'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Navbar from '../components/Navbar';
import StatCards from '../components/StatCards';
import MemberSection from '../components/MemberSection';
import TransactionSection from '../components/TransactionSection';
import AddIncomeModal from '../components/AddIncomeModal';
import AddExpenseModal from '../components/AddExpenseModal';
import AddMemberModal from '../components/AddMemberModal';
import WeeklyReportModal from '../components/WeeklyReportModal';
import ConfirmModal from '../components/ConfirmModal';
import LoginModal from '../components/LoginModal';
import PWAInstallBanner from '../components/PWAInstallBanner';
import EditTransactionModal from '../components/EditTransactionModal';
import { StatCardsSkeleton, MemberSectionSkeleton, TransactionSectionSkeleton } from '../components/DashboardSkeleton';

import { Member, Transaction, MemberSummary } from '../lib/types';
import {
  fetchMembers,
  createMember,
  deleteMember,
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  formatRupiah,
} from '../lib/dataService';
import { getSupabaseCredentials } from '../lib/supabase';
import { Users, ReceiptText, Calendar, CheckCircle, Coins, Edit3 } from 'lucide-react';

export default function Home() {
  const [members, setMembers] = useState<Member[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<'members' | 'transactions'>('members');

  // Theme State (Default: 'light')
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Weekly Fee Setting (Default: 5.000 / minggu)
  const [weeklyFee, setWeeklyFee] = useState<number>(5000);
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [tempFeeInput, setTempFeeInput] = useState('5000');

  // Modals
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Auth State (Public vs Admin)
  const [isAdmin, setIsAdmin] = useState(false);

  // Custom Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Hapus',
    onConfirm: () => {},
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit Transaction State
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Preselected member for fast payment
  const [preselectedMember, setPreselectedMember] = useState<Member | null>(null);

  // Dynamic Current Week calculation
  const [currentWeekLabel, setCurrentWeekLabel] = useState<string>('Minggu Ini');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();
    const day = now.getDate();
    const weekNum = Math.min(4, Math.ceil(day / 7));
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];
    setCurrentWeekLabel(`Minggu ${weekNum} - ${monthNames[now.getMonth()]}`);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Load fee, admin status, and theme from localStorage (Default theme is 'light')
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFee = localStorage.getItem('kb_weekly_fee');
      if (savedFee) {
        const parsed = parseInt(savedFee);
        if (!isNaN(parsed) && parsed > 0) {
          setWeeklyFee(parsed);
          setTempFeeInput(parsed.toString());
        }
      }

      const savedAdmin = localStorage.getItem('kb_is_admin');
      if (savedAdmin === 'true') {
        setIsAdmin(true);
      }

      const savedTheme = localStorage.getItem('kb_theme');
      if (savedTheme === 'dark') {
        setTheme('dark');
        document.documentElement.classList.add('dark');
      } else {
        setTheme('light');
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('kb_theme', nextTheme);
      document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kb_is_admin');
    }
    setIsAdmin(false);
    showToast('Anda telah keluar dari Mode Admin.');
  };

  // Save weekly fee handler
  const handleSaveFee = (newFee: number) => {
    if (newFee <= 0) {
      alert('Tarif iuran harus lebih besar dari 0.');
      return;
    }
    setWeeklyFee(newFee);
    if (typeof window !== 'undefined') {
      localStorage.setItem('kb_weekly_fee', newFee.toString());
    }
    setIsFeeModalOpen(false);
    showToast(`Tarif iuran mingguan diubah menjadi ${formatRupiah(newFee)} / minggu! 💵`);
  };

  // Load data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const creds = getSupabaseCredentials();
      const [membersRes, txsRes] = await Promise.all([
        fetchMembers(),
        fetchTransactions(),
      ]);

      setMembers(membersRes.data);
      setTransactions(txsRes.data);
      setIsSupabaseConnected(creds.isConfigured && membersRes.source === 'supabase');
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Aggregate Totals
  const totalIncome = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  }, [transactions]);

  const totalExpense = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  }, [transactions]);

  const totalBalance = totalIncome - totalExpense;

  // Member Summaries & Payments calculation
  const memberSummaries: MemberSummary[] = useMemo(() => {
    return members.map((member) => {
      const memberPayments = transactions.filter(
        (t) =>
          t.type === 'income' &&
          (t.member_id === member.id || (t.member_name && t.member_name.toLowerCase() === member.name.toLowerCase()))
      );

      const total_paid = memberPayments.reduce((sum, t) => sum + Number(t.amount || 0), 0);
      const payment_count = memberPayments.length;
      const total_weeks_paid = memberPayments.reduce(
        (sum, t) => sum + (t.weeks_count || Math.max(1, Math.round(t.amount / (weeklyFee || 5000)))),
        0
      );

      const paid_current_week = memberPayments.some(
        (t) => t.week_label && t.week_label.toLowerCase() === currentWeekLabel.toLowerCase()
      );

      return {
        member,
        total_paid,
        payment_count,
        total_weeks_paid,
        paid_current_week,
        recent_payments: memberPayments,
      };
    });
  }, [members, transactions, currentWeekLabel, weeklyFee]);

  const paidThisWeekCount = useMemo(() => {
    return memberSummaries.filter((s) => s.paid_current_week).length;
  }, [memberSummaries]);

  // Handlers
  const handleSaveMember = async (newMember: Omit<Member, 'id' | 'created_at'>) => {
    const res = await createMember(newMember);
    if (res.success && res.data) {
      setMembers((prev) => [res.data!, ...prev]);
      showToast(`Anggota "${newMember.name}" berhasil ditambahkan! 🏸`);
    }
  };

  const handleDeleteMember = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Anggota Badminton',
      message: `Apakah Anda yakin ingin menghapus "${name}" dari daftar anggota kas badminton?`,
      confirmText: 'Ya, Hapus Anggota',
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          const res = await deleteMember(id);
          if (res.success) {
            setMembers((prev) => prev.filter((m) => m.id !== id));
            showToast(`Anggota "${name}" telah dihapus.`);
            setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          }
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  const handleSaveIncome = async (txData: Omit<Transaction, 'id' | 'created_at'>) => {
    const res = await createTransaction(txData);
    if (res.success && res.data) {
      setTransactions((prev) => [res.data!, ...prev]);
      showToast(`Uang kas ${txData.member_name} sebesar Rp ${txData.amount.toLocaleString('id-ID')} berhasil dicatat! ✅`);
    }
  };

  const handleSaveExpense = async (txData: Omit<Transaction, 'id' | 'created_at'>) => {
    if (txData.amount > totalBalance) {
      showToast(`⚠️ Saldo kas (${formatRupiah(totalBalance)}) tidak cukup untuk pengeluaran ${formatRupiah(txData.amount)}!`);
      return;
    }
    const res = await createTransaction(txData);
    if (res.success && res.data) {
      setTransactions((prev) => [res.data!, ...prev]);
      showToast(`Pengeluaran ${txData.category} ${formatRupiah(txData.amount)} dicatat! 📉`);
    }
  };

  const handleDeleteTransaction = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Catatan Transaksi',
      message: 'Apakah Anda yakin ingin menghapus catatan transaksi ini dari riwayat kas?',
      confirmText: 'Ya, Hapus Catatan',
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          const res = await deleteTransaction(id);
          if (res.success) {
            setTransactions((prev) => prev.filter((t) => t.id !== id));
            showToast('Catatan transaksi berhasil dihapus.');
            setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          }
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  const handleSaveEditedTransaction = async (updatedTx: Transaction) => {
    const res = await updateTransaction(updatedTx);
    if (res.success && res.data) {
      setTransactions((prev) => prev.map((t) => (t.id === updatedTx.id ? res.data! : t)));
      showToast('Catatan transaksi berhasil diperbarui! ✏️');
    }
  };

  const handleQuickPayMember = (member: Member) => {
    setPreselectedMember(member);
    setIsIncomeModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0d] text-slate-900 dark:text-white flex flex-col court-lines selection:bg-red-600 selection:text-white transition-colors duration-200">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-white dark:bg-zinc-900 border border-emerald-500/50 text-slate-900 dark:text-white shadow-xl dark:shadow-2xl animate-in slide-in-from-bottom duration-200">
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        onOpenIncome={() => {
          setPreselectedMember(null);
          setIsIncomeModalOpen(true);
        }}
        isAdmin={isAdmin}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Alert Informasi Install PWA di bawah Navbar */}
      <PWAInstallBanner />

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 md:space-y-8 flex-1">
        
        {/* Week Selector & Tarif Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#121217] p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-[#22222d] shadow-sm transition-colors">
          
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-4">
            {/* Periode Sesi Minggu */}
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-red-600/10 text-red-600 dark:text-red-500 border border-red-500/20 flex-shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-semibold block">
                  Sesi Periode Kas Aktif
                </span>
                {isAdmin ? (
                  <input
                    type="text"
                    value={currentWeekLabel}
                    onChange={(e) => setCurrentWeekLabel(e.target.value)}
                    className="bg-slate-50 dark:bg-[#0a0a0f] border border-slate-300 dark:border-zinc-700 font-bold text-xs sm:text-sm text-slate-900 dark:text-white rounded-lg px-2.5 py-1 focus:outline-none focus:border-red-500 w-full sm:w-auto"
                    title="Klik untuk ubah nama sesi minggu"
                  />
                ) : (
                  <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white block mt-0.5">
                    {currentWeekLabel}
                  </span>
                )}
              </div>
            </div>

            {/* Tarif Iuran per Minggu */}
            <div className="flex items-center justify-between sm:justify-start gap-2.5 bg-slate-50 dark:bg-[#0a0a0f] px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700/80">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <Coins className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-semibold block">
                    Tarif Kas
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-[#22c55e]">
                      {formatRupiah(weeklyFee)}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-slate-400 dark:text-zinc-500">/mgg</span>
                  </div>
                </div>
              </div>

              {isAdmin && (
                <button
                  onClick={() => {
                    setTempFeeInput(weeklyFee.toString());
                    setIsFeeModalOpen(true);
                  }}
                  className="px-2 py-1 rounded-lg bg-white hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white text-[11px] font-semibold border border-slate-200 dark:border-zinc-700 flex items-center gap-1 transition-colors flex-shrink-0 shadow-xs"
                >
                  <Edit3 className="w-3 h-3 text-red-500 dark:text-red-400" />
                  <span>Ubah</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-600/40 text-xs font-semibold transition-colors"
            >
              <span>📋 Rekap WhatsApp</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        {isLoading ? (
          <StatCardsSkeleton />
        ) : (
          <StatCards
            totalBalance={totalBalance}
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            memberCount={members.length}
            paidThisWeekCount={paidThisWeekCount}
            currentWeekLabel={currentWeekLabel}
            onOpenExpense={() => setIsExpenseModalOpen(true)}
            isAdmin={isAdmin}
          />
        )}

        {/* Navigation Tabs (Anggota vs Riwayat Kas) */}
        <div className="border-b border-slate-200 dark:border-zinc-800 flex items-center gap-3 sm:gap-6 pt-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('members')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${
              activeTab === 'members'
                ? 'border-red-600 dark:border-red-500 text-slate-900 dark:text-white'
                : 'border-transparent text-slate-500 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-zinc-300'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Anggota ({members.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${
              activeTab === 'transactions'
                ? 'border-red-600 dark:border-red-500 text-slate-900 dark:text-white'
                : 'border-transparent text-slate-500 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-zinc-300'
            }`}
          >
            <ReceiptText className="w-4 h-4" />
            <span>Riwayat Kas ({transactions.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        {isLoading ? (
          activeTab === 'members' ? (
            <MemberSectionSkeleton />
          ) : (
            <TransactionSectionSkeleton />
          )
        ) : activeTab === 'members' ? (
          <MemberSection
            summaries={memberSummaries}
            onOpenAddMember={() => setIsAddMemberModalOpen(true)}
            onPayForMember={handleQuickPayMember}
            onDeleteMember={handleDeleteMember}
            currentWeekLabel={currentWeekLabel}
            isAdmin={isAdmin}
          />
        ) : (
          <TransactionSection
            transactions={transactions}
            onDeleteTransaction={handleDeleteTransaction}
            onEditTransaction={(tx) => setEditingTransaction(tx)}
            onOpenIncome={() => {
              setPreselectedMember(null);
              setIsIncomeModalOpen(true);
            }}
            onOpenExpense={() => setIsExpenseModalOpen(true)}
            isAdmin={isAdmin}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-[#1a1a24] bg-white dark:bg-[#0c0c10] py-6 text-center text-xs text-slate-500 dark:text-zinc-500 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Kas Badminton Club • Dikelola oleh Tim Badminton</p>
          <div className="flex items-center gap-4 text-slate-500 dark:text-zinc-400">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="hover:text-slate-900 dark:hover:text-white transition-colors font-medium"
            >
              Laporan Kas WhatsApp
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AddIncomeModal
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        members={members}
        onSave={handleSaveIncome}
        preselectedMember={preselectedMember}
        currentWeekLabel={currentWeekLabel}
        weeklyFee={weeklyFee}
      />

      <AddExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSave={handleSaveExpense}
        currentBalance={totalBalance}
      />

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        onSave={handleSaveMember}
      />

      <WeeklyReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        summaries={memberSummaries}
        transactions={transactions}
        totalBalance={totalBalance}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        currentWeekLabel={currentWeekLabel}
        weeklyFee={weeklyFee}
      />

      {/* Modal Konfirmasi Hapus Kustom */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        isLoading={isDeleting}
      />

      {/* Modal Edit Transaksi */}
      <EditTransactionModal
        isOpen={Boolean(editingTransaction)}
        onClose={() => setEditingTransaction(null)}
        transaction={editingTransaction}
        members={members}
        onSave={handleSaveEditedTransaction}
        currentBalance={totalBalance}
        weeklyFee={weeklyFee}
      />

      {/* Modal Login Admin */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={() => {
          setIsAdmin(true);
          showToast('Login berhasil! Mode Admin aktif. 🏸');
        }}
      />

      {/* Modal Edit Tarif Kas Mingguan */}
      {isFeeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#121217] border border-slate-200 dark:border-[#2a2a38] rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#16161f]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-[#22c55e]">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Atur Tarif Kas Mingguan</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Harga acuan iuran per orang setiap minggu</p>
                </div>
              </div>
              <button
                onClick={() => setIsFeeModalOpen(false)}
                className="text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
                  Pilihan Tarif Umum
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[3000, 5000, 10000, 15000, 20000, 25000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTempFeeInput(preset.toString())}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all ${
                        tempFeeInput === preset.toString()
                          ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-700 dark:text-emerald-400 shadow-[0_0_10px_rgba(34,197,94,0.2)]'
                          : 'bg-slate-50 dark:bg-[#0a0a0f] border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      {formatRupiah(preset)}
                      {preset === 5000 && <span className="block text-[9px] text-slate-400 dark:text-zinc-400 font-normal">Default</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">
                  Nominal Tarif Custom (Rp / minggu)
                </label>
                <input
                  type="number"
                  min="500"
                  step="500"
                  value={tempFeeInput}
                  onChange={(e) => setTempFeeInput(e.target.value)}
                  placeholder="Contoh: 5000"
                  className="w-full bg-slate-50 dark:bg-[#0a0a0f] border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-base font-bold text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                💡 <span className="text-slate-800 dark:text-zinc-300 font-medium">Contoh:</span> Jika tarif diset <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{formatRupiah(parseInt(tempFeeInput) || 5000)}</span>, maka saat anggota bayar 2 minggu, kas otomatis tercatat <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{formatRupiah((parseInt(tempFeeInput) || 5000) * 2)}</span>.
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFeeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveFee(parseInt(tempFeeInput) || 5000)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow"
                >
                  Simpan Tarif
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
