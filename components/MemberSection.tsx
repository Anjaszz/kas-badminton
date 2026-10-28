'use client';

import React, { useState } from 'react';
import { Member, MemberSummary } from '../lib/types';
import { formatRupiah } from '../lib/dataService';
import { UserPlus, Search, CheckCircle, Clock, Trash2, PlusCircle, History } from 'lucide-react';

interface MemberSectionProps {
  summaries: MemberSummary[];
  onOpenAddMember: () => void;
  onPayForMember: (member: Member) => void;
  onDeleteMember: (id: string, name: string) => void;
  currentWeekLabel: string;
  isAdmin?: boolean;
}

export default function MemberSection({
  summaries,
  onOpenAddMember,
  onPayForMember,
  onDeleteMember,
  currentWeekLabel,
  isAdmin = false,
}: MemberSectionProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [selectedMemberDetail, setSelectedMemberDetail] = useState<MemberSummary | null>(null);

  const filteredMembers = summaries.filter((item) => {
    const matchesSearch = item.member.name.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'paid') return item.paid_current_week;
    if (filter === 'unpaid') return !item.paid_current_week;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Controls & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-[#121217] p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-[#22222d] shadow-sm transition-colors">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-400" />
          <input
            type="text"
            placeholder="Cari nama anggota..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#0a0a0e] border border-slate-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 self-stretch sm:self-auto bg-slate-100 dark:bg-[#0a0a0e] p-1 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-medium overflow-x-auto justify-between sm:justify-start">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              filter === 'all'
                ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Semua ({summaries.length})
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all whitespace-nowrap ${
              filter === 'paid'
                ? 'bg-emerald-50 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-600/40 shadow-sm'
                : 'text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400'
            }`}
          >
            <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            Lunas ({summaries.filter(s => s.paid_current_week).length})
          </button>
          <button
            onClick={() => setFilter('unpaid')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all whitespace-nowrap ${
              filter === 'unpaid'
                ? 'bg-red-50 dark:bg-red-950/70 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700/50 shadow-sm'
                : 'text-slate-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400'
            }`}
          >
            <Clock className="w-3 h-3 text-red-600 dark:text-red-400" />
            Belum ({summaries.filter(s => !s.paid_current_week).length})
          </button>
        </div>

        {/* Add Member Button (Hanya Admin) */}
        {isAdmin && (
          <button
            onClick={onOpenAddMember}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-red-600/20 dark:shadow-red-900/20 active:scale-95 w-full md:w-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Anggota Baru</span>
          </button>
        )}

      </div>

      {/* Grid of Members */}
      {summaries.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white/80 dark:bg-[#121217]/50 rounded-2xl border border-dashed border-slate-300 dark:border-zinc-800">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-500 mx-auto flex items-center justify-center mb-3">
            <UserPlus className="w-6 h-6" />
          </div>
          <p className="text-slate-900 dark:text-white font-bold text-base mb-1">Belum Ada Anggota Kas</p>
          <p className="text-slate-500 dark:text-zinc-400 text-xs max-w-sm mx-auto mb-4">
            Daftar anggota kas badminton masih kosong. Tambahkan anggota pertama untuk mulai mencatat iuran mingguan.
          </p>
          {isAdmin && (
            <button
              onClick={onOpenAddMember}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md shadow-red-600/20 dark:shadow-red-950/40 inline-flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Tambah Anggota Sekarang</span>
            </button>
          )}
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white/80 dark:bg-[#121217]/50 rounded-2xl border border-dashed border-slate-300 dark:border-zinc-800">
          <p className="text-slate-500 dark:text-zinc-400 text-sm">Tidak ada anggota yang cocok dengan filter pencarian.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((item) => {
            const { member, total_paid, payment_count, paid_current_week } = item;
            const initials = member.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .substring(0, 2)
              .toUpperCase();

            return (
              <div
                key={member.id}
                className="group relative flex flex-col justify-between bg-white dark:bg-[#121217] rounded-2xl border border-slate-200 dark:border-[#22222d] hover:border-slate-300 dark:hover:border-zinc-600 transition-all duration-200 p-5 shadow-sm hover:shadow-md dark:shadow-lg overflow-hidden"
              >
                {/* Status indicator bar on top */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    paid_current_week ? 'bg-emerald-500' : 'bg-red-500'
                  }`}
                />

                <div>
                  {/* Header info */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-base shadow-md"
                        style={{ backgroundColor: member.avatar_color || '#ef4444' }}
                      >
                        {initials}
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                          {member.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{item.total_weeks_paid} Minggu lunas</span>
                          <span>•</span>
                          <span>{payment_count}x bayar</span>
                        </div>
                      </div>
                    </div>

                    {/* Badge Status Minggu Ini */}
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                        paid_current_week
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                          : 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30'
                      }`}
                    >
                      {paid_current_week ? (
                        <>
                          <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          Lunas
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-red-600 dark:text-red-400" />
                          Belum
                        </>
                      )}
                    </span>
                  </div>

                  {/* Financial stat for this member */}
                  <div className="bg-slate-50 dark:bg-[#0a0a0f] p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800/80 mb-4 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-zinc-500 font-medium">
                        Kas Terbayar
                      </span>
                      <p className="text-lg font-bold text-emerald-600 dark:text-[#22c55e] text-glow-green">
                        {item.total_weeks_paid} Minggu{' '}
                        <span className="text-xs font-normal text-slate-500 dark:text-zinc-400">
                          ({formatRupiah(total_paid)})
                        </span>
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedMemberDetail(item)}
                      className="flex items-center gap-1 text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-zinc-800 transition-colors"
                      title="Lihat riwayat bayar orang ini"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>Riwayat</span>
                    </button>
                  </div>
                </div>

                {/* Card Action Buttons (Hanya Admin) */}
                {isAdmin && (
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800/60">
                    <div className="flex items-center gap-1.5">
                      {/* Delete member */}
                      <button
                        onClick={() => onDeleteMember(member.id, member.name)}
                        className="p-2 rounded-xl text-slate-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        title="Hapus anggota"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quick pay button for this member */}
                    <button
                      onClick={() => onPayForMember(member)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-semibold transition-all shadow shadow-red-600/20 dark:shadow-red-950/40 active:scale-95"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Catat Iuran</span>
                    </button>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Member Payment History Modal */}
      {selectedMemberDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-[#121217] border border-slate-200 dark:border-[#2a2a38] rounded-2xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800 mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow"
                  style={{ backgroundColor: selectedMemberDetail.member.avatar_color }}
                >
                  {selectedMemberDetail.member.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    {selectedMemberDetail.member.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Total: <span className="text-emerald-600 dark:text-[#22c55e] font-bold">{selectedMemberDetail.total_weeks_paid} Minggu</span> ({formatRupiah(selectedMemberDetail.total_paid)})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMemberDetail(null)}
                className="text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>

            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-3">
              Riwayat Pembayaran Kas
            </h4>

            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {selectedMemberDetail.recent_payments.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-zinc-500 text-center py-6">Belum ada catatan setoran kas.</p>
              ) : (
                selectedMemberDetail.recent_payments.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#0a0a0f] border border-slate-200 dark:border-zinc-800/80 text-sm"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900 dark:text-white">{tx.week_label || 'Kas Mingguan'}</p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                          {tx.weeks_count || Math.max(1, Math.round(tx.amount / 5000))} Minggu
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{tx.date} {tx.description ? `• ${tx.description}` : ''}</p>
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-[#22c55e]">
                      +{formatRupiah(tx.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200 dark:border-zinc-800 flex justify-end">
              <button
                onClick={() => setSelectedMemberDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-white text-xs font-semibold transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
