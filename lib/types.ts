export interface Member {
  id: string;
  name: string;
  phone?: string;
  avatar_color: string;
  status: 'active' | 'inactive';
  created_at?: string;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description?: string;
  member_id?: string | null;
  member_name?: string | null;
  week_label?: string | null;
  weeks_count?: number; // e.g. 1, 2, 4 minggu
  date: string;
  created_at?: string;
}

export interface MemberSummary {
  member: Member;
  total_paid: number;
  payment_count: number;
  total_weeks_paid: number; // Berapa minggu sudah lunas
  paid_current_week: boolean;
  recent_payments: Transaction[];
}

export interface FinancialSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  activeMemberCount: number;
  currentWeekPaidCount: number;
}
