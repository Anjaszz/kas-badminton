import { getSupabaseClient, getLocalMembers, saveLocalMembers, getLocalTransactions, saveLocalTransactions } from './supabase';
import { Member, Transaction } from './types';

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateIndo(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

// Fetch all members
export async function fetchMembers(): Promise<{ data: Member[]; source: 'supabase' | 'local'; error?: string }> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('name', { ascending: true });

      if (!error && data) {
        return { data: data as Member[], source: 'supabase' };
      }
      console.warn('Supabase fetch members error, falling back to local:', error?.message);
    } catch (err: unknown) {
      console.warn('Supabase exception, falling back to local:', err);
    }
  }
  return { data: getLocalMembers(), source: 'local' };
}

// Add member
export async function createMember(member: Omit<Member, 'id' | 'created_at'>): Promise<{ success: boolean; data?: Member; error?: string }> {
  const supabase = getSupabaseClient();
  const newMember: Member = {
    ...member,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `m-${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('members')
        .insert([{
          name: member.name,
          phone: member.phone || null,
          avatar_color: member.avatar_color,
          status: member.status,
        }])
        .select()
        .single();

      if (!error && data) {
        return { success: true, data: data as Member };
      }
      console.warn('Supabase insert error, saving locally:', error?.message);
    } catch (err: unknown) {
      console.warn('Supabase insert exception, saving locally:', err);
    }
  }

  // Fallback / local
  const current = getLocalMembers();
  const updated = [newMember, ...current];
  saveLocalMembers(updated);
  return { success: true, data: newMember };
}

// Delete member
export async function deleteMember(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('members').delete().eq('id', id);
      if (!error) return { success: true };
    } catch (err: unknown) {
      console.warn('Supabase delete member failed:', err);
    }
  }

  const current = getLocalMembers();
  const updated = current.filter((m) => m.id !== id);
  saveLocalMembers(updated);
  return { success: true };
}

// Fetch all transactions
export async function fetchTransactions(): Promise<{ data: Transaction[]; source: 'supabase' | 'local'; error?: string }> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (!error && data) {
        return { data: data as Transaction[], source: 'supabase' };
      }
      console.warn('Supabase fetch transactions error, falling back to local:', error?.message);
    } catch (err: unknown) {
      console.warn('Supabase fetch tx exception, falling back to local:', err);
    }
  }
  return { data: getLocalTransactions(), source: 'local' };
}

// Add transaction (income / expense)
export async function createTransaction(tx: Omit<Transaction, 'id' | 'created_at'>): Promise<{ success: boolean; data?: Transaction; error?: string }> {
  const supabase = getSupabaseClient();
  const newTx: Transaction = {
    ...tx,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `tx-${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          type: tx.type,
          amount: tx.amount,
          category: tx.category,
          description: tx.description || null,
          member_id: tx.member_id || null,
          member_name: tx.member_name || null,
          week_label: tx.week_label || null,
          weeks_count: tx.weeks_count || null,
          date: tx.date,
        }])
        .select()
        .single();

      if (!error && data) {
        return { success: true, data: data as Transaction };
      }
      console.warn('Supabase insert transaction error, saving locally:', error?.message);
    } catch (err: unknown) {
      console.warn('Supabase insert transaction exception, saving locally:', err);
    }
  }

  // Fallback / local
  const current = getLocalTransactions();
  const updated = [newTx, ...current];
  saveLocalTransactions(updated);
  return { success: true, data: newTx };
}

// Delete transaction
export async function deleteTransaction(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (!error) return { success: true };
    } catch (err: unknown) {
      console.warn('Supabase delete transaction failed:', err);
    }
  }

  const current = getLocalTransactions();
  const updated = current.filter((t) => t.id !== id);
  saveLocalTransactions(updated);
  return { success: true };
}

// Migrate local data into Supabase
export async function syncLocalDataToSupabase(): Promise<{ success: boolean; message: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, message: 'Supabase client belum terkonfigurasi dengan benar.' };
  }

  try {
    const localMembers = getLocalMembers();
    const localTxs = getLocalTransactions();

    if (localMembers.length > 0) {
      const membersToInsert = localMembers.map((m) => ({
        name: m.name,
        phone: m.phone || null,
        avatar_color: m.avatar_color,
        status: m.status,
      }));
      await supabase.from('members').insert(membersToInsert);
    }

    if (localTxs.length > 0) {
      const txsToInsert = localTxs.map((t) => ({
        type: t.type,
        amount: t.amount,
        category: t.category,
        description: t.description || null,
        member_name: t.member_name || null,
        week_label: t.week_label || null,
        weeks_count: t.weeks_count || null,
        date: t.date,
      }));
      await supabase.from('transactions').insert(txsToInsert);
    }

    return { success: true, message: `Berhasil migrasi ${localMembers.length} anggota dan ${localTxs.length} transaksi ke Supabase!` };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { success: false, message: 'Gagal migrasi data: ' + errorMsg };
  }
}
