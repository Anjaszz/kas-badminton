-- =================================================================
-- SKRIP DATABASE SUPABASE UNTUK KAS BADMINTON
-- Jalankan skrip ini di SQL Editor dashboard Supabase Anda.
-- =================================================================

-- 1. Buat Tabel Anggota (members)
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  avatar_color TEXT DEFAULT '#ef4444',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Buat Tabel Transaksi Kas (transactions)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  description TEXT,
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  member_name TEXT,
  week_label TEXT,
  weeks_count INTEGER DEFAULT 1,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexing untuk pencarian cepat & agregasi
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_member_id ON transactions(member_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);

-- Aktifkan Row Level Security (RLS)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses Terbuka untuk Anon/Publik (Cocok untuk Kas Komunitas/Club)
-- Jika ingin membatasi login, sesuaikan policy dengan auth.uid()
CREATE POLICY "Akses baca members untuk anonim" 
  ON members FOR SELECT 
  USING (true);

CREATE POLICY "Akses insert members untuk anonim" 
  ON members FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Akses update members untuk anonim" 
  ON members FOR UPDATE 
  USING (true);

CREATE POLICY "Akses delete members untuk anonim" 
  ON members FOR DELETE 
  USING (true);

CREATE POLICY "Akses baca transactions untuk anonim" 
  ON transactions FOR SELECT 
  USING (true);

CREATE POLICY "Akses insert transactions untuk anonim" 
  ON transactions FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Akses update transactions untuk anonim" 
  ON transactions FOR UPDATE 
  USING (true);

CREATE POLICY "Akses delete transactions untuk anonim" 
  ON transactions FOR DELETE 
  USING (true);

-- 3. Data Awal / Sampel (Opsional)
INSERT INTO members (name, phone, avatar_color) VALUES
  ('Anjas (Admin)', '081234567890', '#ef4444'),
  ('Budi Santoso', '081298765432', '#3b82f6'),
  ('Rian Ardianto', '081345678912', '#10b981'),
  ('Fajar Alfian', '081389012345', '#f59e0b'),
  ('Kevin Sanjaya', '081211223344', '#ec4899')
ON CONFLICT DO NOTHING;

-- Sampel Transaksi Kas Awal
INSERT INTO transactions (type, amount, category, description, member_name, week_label, date) VALUES
  ('income', 20000, 'Iuran Mingguan', 'Uang kas sesi 1', 'Anjas (Admin)', 'Minggu 1 - Oktober', CURRENT_DATE - INTERVAL '14 days'),
  ('income', 20000, 'Iuran Mingguan', 'Uang kas sesi 1', 'Budi Santoso', 'Minggu 1 - Oktober', CURRENT_DATE - INTERVAL '14 days'),
  ('income', 20000, 'Iuran Mingguan', 'Uang kas sesi 1', 'Rian Ardianto', 'Minggu 1 - Oktober', CURRENT_DATE - INTERVAL '14 days'),
  ('expense', 45000, 'Sewa Lapangan', 'Sewa GOR Badminton 2 Jam', NULL, NULL, CURRENT_DATE - INTERVAL '14 days'),
  ('income', 20000, 'Iuran Mingguan', 'Uang kas sesi 2', 'Anjas (Admin)', 'Minggu 2 - Oktober', CURRENT_DATE - INTERVAL '7 days'),
  ('income', 20000, 'Iuran Mingguan', 'Uang kas sesi 2', 'Budi Santoso', 'Minggu 2 - Oktober', CURRENT_DATE - INTERVAL '7 days'),
  ('expense', 110000, 'Beli Shuttlecock', '1 Slop Kok Samurai Hijau', NULL, NULL, CURRENT_DATE - INTERVAL '7 days');
