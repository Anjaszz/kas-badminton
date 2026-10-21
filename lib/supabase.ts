import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Member, Transaction } from './types';

// Default initial data: empty (no dummy data)
export const INITIAL_MEMBERS: Member[] = [];
export const INITIAL_TRANSACTIONS: Transaction[] = [];

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
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_MEMBERS);
  if (!data) return [];
  try {
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      // Clean up old dummy members if they exist
      const hasOldDummy = parsed.some((m: Member) => m.id === 'm-1' || m.id === 'm-2' || m.name?.includes('(Admin)'));
      if (hasOldDummy) {
        localStorage.removeItem(STORAGE_MEMBERS);
        return [];
      }
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

export function saveLocalMembers(members: Member[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_MEMBERS, JSON.stringify(members));
  }
}

export function getLocalTransactions(): Transaction[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_TRANSACTIONS);
  if (!data) return [];
  try {
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      // Clean up old dummy transactions if they exist
      const hasOldDummy = parsed.some((t: Transaction) => t.id === 't-1' || t.id === 't-2' || t.member_id === 'm-1');
      if (hasOldDummy) {
        localStorage.removeItem(STORAGE_TRANSACTIONS);
        return [];
      }
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

export function saveLocalTransactions(txs: Transaction[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_TRANSACTIONS, JSON.stringify(txs));
  }
}
