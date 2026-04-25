-- ============================================================
-- Liburan Terus - Supabase Schema
-- Jalankan ini di Supabase SQL Editor
-- ============================================================

-- Packages
CREATE TABLE IF NOT EXISTS packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title JSONB,
  location JSONB,
  duration JSONB,
  description JSONB,
  itinerary JSONB,
  includes JSONB,
  excludes JSONB,
  slug JSONB,
  images JSONB DEFAULT '[]',
  image_alts JSONB DEFAULT '[]',
  image TEXT,
  type TEXT,
  price NUMERIC,
  original_price NUMERIC,
  max_participants INTEGER DEFAULT 15,
  departure_dates JSONB DEFAULT '[]',
  map_link TEXT,
  map_latitude NUMERIC,
  map_longitude NUMERIC,
  active BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id TEXT,
  package_title TEXT,
  package_name TEXT,
  package_type TEXT,
  package_image TEXT,
  price_per_person NUMERIC,
  total_price NUMERIC,
  name TEXT,
  email TEXT,
  phone TEXT,
  date TEXT,
  trip_date TEXT,
  participants INTEGER,
  notes TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  payment_proof_url TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id TEXT,
  booking_name TEXT,
  amount NUMERIC,
  method TEXT,
  status TEXT DEFAULT 'pending',
  proof_url TEXT,
  package_name TEXT,
  snap_token TEXT,
  order_id TEXT,
  midtrans_order_id TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Blog
CREATE TABLE IF NOT EXISTS blog (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title JSONB,
  slug TEXT,
  category TEXT,
  excerpt JSONB,
  content JSONB,
  cover_image TEXT,
  cover_alt TEXT,
  meta_title TEXT,
  meta_description TEXT,
  author TEXT DEFAULT 'Admin',
  published BOOLEAN DEFAULT FALSE,
  read_time INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Gallery
CREATE TABLE IF NOT EXISTS gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  caption TEXT,
  category TEXT,
  image_url TEXT,
  image_alt TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  package_id TEXT,
  package_name TEXT,
  rating INTEGER DEFAULT 5,
  comment TEXT,
  avatar TEXT,
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Settings (single row, id = 'general')
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY DEFAULT 'general',
  data JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contacts
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  subject TEXT,
  message TEXT,
  status TEXT DEFAULT 'unread',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Public read: packages, blog, gallery, testimonials, settings
-- IMPORTANT: hanya simpan field aman-publik di settings.data
CREATE POLICY "public_read_packages" ON packages FOR SELECT USING (true);
CREATE POLICY "public_read_blog" ON blog FOR SELECT USING (true);
CREATE POLICY "public_read_gallery" ON gallery FOR SELECT USING (true);
CREATE POLICY "public_read_testimonials" ON testimonials FOR SELECT USING (true);
CREATE POLICY "public_read_settings" ON settings FOR SELECT USING (true);

-- Public insert/read/update untuk flow booking + upload bukti pembayaran oleh user
CREATE POLICY "public_insert_bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "public_read_bookings" ON bookings FOR SELECT USING (true);
CREATE POLICY "public_update_bookings" ON bookings FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public_insert_payments" ON payments FOR INSERT WITH CHECK (true);
CREATE POLICY "public_read_payments" ON payments FOR SELECT USING (true);
CREATE POLICY "public_update_payments" ON payments FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public_insert_contacts" ON contacts FOR INSERT WITH CHECK (true);

-- Authenticated (admin) full access
CREATE POLICY "admin_all_packages" ON packages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_bookings" ON bookings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_payments" ON payments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_blog" ON blog FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_gallery" ON gallery FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_testimonials" ON testimonials FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_settings" ON settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_contacts" ON contacts FOR ALL USING (auth.role() = 'authenticated');
