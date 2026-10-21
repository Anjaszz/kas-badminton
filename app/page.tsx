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

import { Member, Transaction, MemberSummary } from '../lib/types';
import {
  fetchMembers,
  createMember,
  deleteMember,
  fetchTransactions,
  createTransaction,
  deleteTransaction,
  formatRupiah,
} from '../lib/dataService';
import { getSupabaseCredentials, INITIAL_MEMBERS, INITIAL_TRANSACTIONS } from '../lib/supabase';
import { Users, ReceiptText, Calendar, Plus, Sparkles, CheckCircle, AlertTriangle, Coins, Settings, Edit3 } from 'lucide-react';

export default function Home() {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<'members' | 'transactions'>('members');

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

  // Preselected member for fast payment
  const [preselectedMember, setPreselectedMember] = useState<Member | null>(null);

  // Dynamic Current Week calculation (e.g., Minggu 3 - Oktober)
  const defaultWeekLabel = useMemo(() => {
    const now = new Date();
    const day = now.getDate();
    const weekNum = Math.min(4, Math.ceil(day / 7));
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];
    return `Minggu ${weekNum} - ${monthNames[now.getMonth()]}`;
  }, []);

  const [currentWeekLabel, setCurrentWeekLabel] = useState<string>(defaultWeekLabel);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Load fee and admin status from localStorage
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
    }
  }, []);

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
      // Find all income transactions for this member
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

      // Check if paid current week
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

  const handleQuickPayMember = (member: Member) => {
    setPreselectedMember(member);
    setIsIncomeModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0d] text-white flex flex-col court-lines selection:bg-red-600 selection:text-white">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-zinc-900 border border-emerald-500/50 text-white shadow-2xl animate-in slide-in-from-bottom duration-200">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      {/* Top Navbar: Tombol Tambah Kas (Admin) / Login (Publik) */}
      <Navbar
        onOpenIncome={() => {
          setPreselectedMember(null);
          setIsIncomeModalOpen(true);
        }}
        isAdmin={isAdmin}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 md:space-y-8 flex-1">
        
        {/* Week Selector & Tarif Bar (Responsive Mobile) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#121217] p-3.5 sm:p-4 rounded-2xl border border-[#22222d]">
          
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-4">
            {/* Periode Sesi Minggu */}
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-red-600/10 text-red-500 border border-red-500/20 flex-shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-zinc-400 font-semibold block">
                  Sesi Periode Kas Aktif
                </span>
                {isAdmin ? (
                  <input
                    type="text"
                    value={currentWeekLabel}
                    onChange={(e) => setCurrentWeekLabel(e.target.value)}
                    className="bg-[#0a0a0f] border border-zinc-700 font-bold text-xs sm:text-sm text-white rounded-lg px-2.5 py-1 focus:outline-none focus:border-red-500 w-full sm:w-auto"
                    title="Klik untuk ubah nama sesi minggu"
                  />
                ) : (
                  <span className="font-bold text-xs sm:text-sm text-white block mt-0.5">
                    {currentWeekLabel}
                  </span>
                )}
              </div>
            </div>

            {/* Tarif Iuran per Minggu */}
            <div className="flex items-center justify-between sm:justify-start gap-2.5 bg-[#0a0a0f] px-3 py-2 rounded-xl border border-zinc-700/80">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-emerald-500/15 text-emerald-400">
                  <Coins className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold block">
                    Tarif Kas
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-bold text-[#22c55e]">
                      {formatRupiah(weeklyFee)}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-zinc-500">/mgg</span>
                  </div>
                </div>
              </div>

              {isAdmin && (
                <button
                  onClick={() => {
                    setTempFeeInput(weeklyFee.toString());
                    setIsFeeModalOpen(true);
                  }}
                  className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[11px] font-semibold border border-zinc-700 flex items-center gap-1 transition-colors flex-shrink-0"
                >
                  <Edit3 className="w-3 h-3 text-red-400" />
                  <span>Ubah</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-600/40 text-xs font-semibold transition-colors"
            >
              <span>📋 Rekap WhatsApp</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Cards: Saldo Total, Kas Masuk, Pengeluaran (+Tombol Catat Pengeluaran jika Admin), Status Mingguan */}
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

        {/* Navigation Tabs (Anggota vs Riwayat Kas) */}
        <div className="border-b border-zinc-800 flex items-center gap-3 sm:gap-6 pt-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('members')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${
              activeTab === 'members'
                ? 'border-red-500 text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Anggota ({members.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${
              activeTab === 'transactions'
                ? 'border-red-500 text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <ReceiptText className="w-4 h-4" />
            <span>Riwayat Kas ({transactions.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'members' ? (
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
      <footer className="border-t border-[#1a1a24] bg-[#0c0c10] py-6 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Kas Badminton Club • Dikelola oleh Tim Badminton</p>
          <div className="flex items-center gap-4 text-zinc-400">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="hover:text-white transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#121217] border border-[#2a2a38] rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-[#16161f]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#22c55e]">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Atur Tarif Kas Mingguan</h3>
                  <p className="text-xs text-zinc-400">Harga acuan iuran per orang setiap minggu</p>
                </div>
              </div>
              <button
                onClick={() => setIsFeeModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
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
                          ? 'bg-emerald-950 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(34,197,94,0.3)]'
                          : 'bg-[#0a0a0f] border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      {formatRupiah(preset)}
                      {preset === 5000 && <span className="block text-[9px] text-zinc-400 font-normal">Default</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Nominal Tarif Custom (Rp / minggu)
                </label>
                <input
                  type="number"
                  min="500"
                  step="500"
                  value={tempFeeInput}
                  onChange={(e) => setTempFeeInput(e.target.value)}
                  placeholder="Contoh: 5000"
                  className="w-full bg-[#0a0a0f] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-base font-bold text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 text-xs text-zinc-400 leading-relaxed">
                💡 <span className="text-zinc-300">Contoh:</span> Jika tarif diset <span className="text-emerald-400 font-semibold">{formatRupiah(parseInt(tempFeeInput) || 5000)}</span>, maka saat anggota bayar 2 minggu, kas otomatis tercatat <span className="text-emerald-400 font-semibold">{formatRupiah((parseInt(tempFeeInput) || 5000) * 2)}</span>.
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFeeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
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
