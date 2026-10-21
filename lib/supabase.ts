import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Member, Transaction } from './types';

// Default initial data for demo/offline fallback
export const INITIAL_MEMBERS: Member[] = [
  { id: 'm-1', name: 'Anjas (Admin)', avatar_color: '#ef4444', status: 'active', created_at: new Date().toISOString() },
  { id: 'm-2', name: 'Budi Santoso', avatar_color: '#3b82f6', status: 'active', created_at: new Date().toISOString() },
  { id: 'm-3', name: 'Rian Ardianto', avatar_color: '#10b981', status: 'active', created_at: new Date().toISOString() },
  { id: 'm-4', name: 'Fajar Alfian', avatar_color: '#f59e0b', status: 'active', created_at: new Date().toISOString() },
  { id: 'm-5', name: 'Kevin Sanjaya', avatar_color: '#ec4899', status: 'active', created_at: new Date().toISOString() },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 't-1', type: 'income', amount: 20000, category: 'Iuran Mingguan', description: 'Uang kas minggu ini', member_id: 'm-1', member_name: 'Anjas (Admin)', week_label: 'Minggu 3 - Oktober', date: '2026-10-18', created_at: new Date().toISOString() },
  { id: 't-2', type: 'income', amount: 20000, category: 'Iuran Mingguan', description: 'Uang kas minggu ini', member_id: 'm-2', member_name: 'Budi Santoso', week_label: 'Minggu 3 - Oktober', date: '2026-10-18', created_at: new Date().toISOString() },
  { id: 't-3', type: 'income', amount: 20000, category: 'Iuran Mingguan', description: 'Uang kas minggu ini', member_id: 'm-3', member_name: 'Rian Ardianto', week_label: 'Minggu 3 - Oktober', date: '2026-10-18', created_at: new Date().toISOString() },
  { id: 't-4', type: 'expense', amount: 45000, category: 'Sewa Lapangan', description: 'Sewa GOR Badminton (2 Jam)', date: '2026-10-18', created_at: new Date().toISOString() },
  { id: 't-5', type: 'expense', amount: 95000, category: 'Beli Shuttlecock', description: '1 Slop Kok Samurai Hijau', date: '2026-10-19', created_at: new Date().toISOString() },
  { id: 't-6', type: 'income', amount: 20000, category: 'Iuran Mingguan', description: 'Bayar kas sesi minggu depan', member_id: 'm-4', member_name: 'Fajar Alfian', week_label: 'Minggu 4 - Oktober', date: '2026-10-20', created_at: new Date().toISOString() },
];

export function getSupabaseCredentials(): { url: string; key: string; isConfigured: boolean } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  const isConfigured = Boolean(
    url &&
    key &&
    url.startsWith('https://') &&
    url.includes('supabase.co') &&
    key.length > 20 &&
    !url.includes('your-project-id')
  );

  return { url, key, isConfigured };
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key, isConfigured } = getSupabaseCredentials();
  if (!isConfigured) return null;

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, key);
    } catch (e) {
      console.error('Gagal inisialisasi Supabase client:', e);
      return null;
    }
  }
  return supabaseInstance;
}

export function resetSupabaseInstance() {
  supabaseInstance = null;
}

// LocalStorage helpers
const STORAGE_MEMBERS = 'kb_members_data';
const STORAGE_TRANSACTIONS = 'kb_transactions_data';

export function getLocalMembers(): Member[] {
  if (typeof window === 'undefined') return INITIAL_MEMBERS;
  const data = localStorage.getItem(STORAGE_MEMBERS);
  if (!data) {
    localStorage.setItem(STORAGE_MEMBERS, JSON.stringify(INITIAL_MEMBERS));
    return INITIAL_MEMBERS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_MEMBERS;
  }
}

export function saveLocalMembers(members: Member[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_MEMBERS, JSON.stringify(members));
  }
}

export function getLocalTransactions(): Transaction[] {
  if (typeof window === 'undefined') return INITIAL_TRANSACTIONS;
  const data = localStorage.getItem(STORAGE_TRANSACTIONS);
  if (!data) {
    localStorage.setItem(STORAGE_TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
    return INITIAL_TRANSACTIONS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_TRANSACTIONS;
  }
}

export function saveLocalTransactions(txs: Transaction[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_TRANSACTIONS, JSON.stringify(txs));
  }
}
