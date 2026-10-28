'use client';

import React, { useState } from 'react';
import { Member, MemberSummary } from '../lib/types';
import { formatRupiah, formatDateIndo } from '../lib/dataService';
import { UserPlus, Search, Trash2, PlusCircle, History, CalendarCheck } from 'lucide-react';

interface MemberSectionProps {
  summaries: MemberSummary[];
  onOpenAddMember: () => void;
  onPayForMember: (member: Member) => void;
  onDeleteMember: (id: string, name: string) => void;
  isAdmin?: boolean;
}

export default function MemberSection({
  summaries,
  onOpenAddMember,
  onPayForMember,
  onDeleteMember,
  isAdmin = false,
}: MemberSectionProps) {
  const [search, setSearch] = useState('');
  const [selectedMemberDetail, setSelectedMemberDetail] = useState<MemberSummary | null>(null);

  const filteredMembers = summaries.filter((item) =>
    item.member.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Controls & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-[#121217] p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-[#22222d] shadow-sm transition-colors">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 dark:text-zinc-400" />
          <input
            type="text"
            placeholder="Cari nama anggota..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#0a0a0e] border border-slate-300 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-950 dark:text-white placeholder-slate-600 dark:placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
          />
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
          <p className="text-slate-950 dark:text-white font-bold text-base mb-1">Belum Ada Anggota Kas</p>
          <p className="text-slate-700 dark:text-zinc-400 text-xs max-w-sm mx-auto mb-4">
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
          <p className="text-slate-700 dark:text-zinc-400 text-sm font-medium">Tidak ada anggota yang cocok dengan pencarian.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((item) => {
            const { member, total_paid, payment_count } = item;
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
                {/* Top accent bar matching member avatar color */}
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: member.avatar_color || '#ef4444' }}
                />

                <div>
                  {/* Header info */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-base shadow-md flex-shrink-0"
                        style={{ backgroundColor: member.avatar_color || '#ef4444' }}
                      >
                        {initials}
                      </div>

                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-950 dark:text-white text-base group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors truncate">
                          {member.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-zinc-400 font-medium mt-0.5">
                          <span>{payment_count}x transaksi bayar</span>
                        </div>
                      </div>
                    </div>

                    {/* Badge Total Minggu Dibayar */}
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 flex-shrink-0">
                      <CalendarCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      {item.total_weeks_paid} Minggu
                    </span>
                  </div>

                  {/* Financial stat for this member */}
                  <div className="bg-slate-50 dark:bg-[#0a0a0f] p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800/80 mb-4 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-slate-800 dark:text-zinc-500 font-bold">
                        Sudah Bayar Kas
                      </span>
                      <p className="text-lg font-bold text-emerald-600 dark:text-[#22c55e] text-glow-green">
                        {item.total_weeks_paid} Minggu{' '}
                        <span className="text-xs font-semibold text-slate-700 dark:text-zinc-400">
                          ({formatRupiah(total_paid)})
                        </span>
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedMemberDetail(item)}
                      className="flex items-center gap-1 text-xs font-semibold text-slate-800 dark:text-zinc-400 hover:text-black dark:hover:text-white px-2.5 py-1.5 rounded-lg bg-white dark:bg-transparent border border-slate-200 dark:border-transparent hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
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
                        className="p-2 rounded-xl text-slate-600 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
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
                  <h3 className="font-bold text-lg text-slate-950 dark:text-white">
                    {selectedMemberDetail.member.name}
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-zinc-400 font-medium">
                    Total Terbayar: <span className="text-emerald-600 dark:text-[#22c55e] font-bold">{selectedMemberDetail.total_weeks_paid} Minggu</span> ({formatRupiah(selectedMemberDetail.total_paid)})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMemberDetail(null)}
                className="text-slate-600 dark:text-zinc-400 hover:text-slate-950 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>

            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-400 mb-3">
              Riwayat Pembayaran Kas
            </h4>

            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {selectedMemberDetail.recent_payments.length === 0 ? (
                <p className="text-xs text-slate-700 dark:text-zinc-500 text-center py-6 font-medium">Belum ada catatan setoran kas.</p>
              ) : (
                selectedMemberDetail.recent_payments.map((tx) => {
                  const weeksPaid = tx.weeks_count || Math.max(1, Math.round(tx.amount / 5000));
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#0a0a0f] border border-slate-200 dark:border-zinc-800/80 text-sm"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-950 dark:text-white">
                            Bayar {weeksPaid} Minggu
                          </p>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                            {weeksPaid} Minggu
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-zinc-400 mt-0.5 font-medium">
                          {formatDateIndo(tx.date)} {tx.description ? `• ${tx.description}` : ''}
                        </p>
                      </div>
                      <span className="font-bold text-emerald-600 dark:text-[#22c55e]">
                        +{formatRupiah(tx.amount)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200 dark:border-zinc-800 flex justify-end">
              <button
                onClick={() => setSelectedMemberDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-white text-xs font-semibold transition-colors"
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
