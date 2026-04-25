-- Remove legacy secrets accidentally stored in public settings
UPDATE settings
SET data = COALESCE(data, '{}'::jsonb) - 'midtransServerKey'
WHERE id = 'general';

-- Restore public policies used by the original payment flow
DROP POLICY IF EXISTS "public_read_bookings" ON bookings;
DROP POLICY IF EXISTS "public_update_bookings" ON bookings;
DROP POLICY IF EXISTS "public_read_payments" ON payments;
DROP POLICY IF EXISTS "public_insert_payments" ON payments;
DROP POLICY IF EXISTS "public_update_payments" ON payments;

CREATE POLICY "public_read_bookings" ON bookings FOR SELECT USING (true);
CREATE POLICY "public_update_bookings" ON bookings FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public_insert_payments" ON payments FOR INSERT WITH CHECK (true);
CREATE POLICY "public_read_payments" ON payments FOR SELECT USING (true);
CREATE POLICY "public_update_payments" ON payments FOR UPDATE USING (true) WITH CHECK (true);

-- Keep public-safe settings readable, but never store secrets in settings.data
DROP POLICY IF EXISTS "public_read_settings" ON settings;
CREATE POLICY "public_read_settings" ON settings FOR SELECT USING (true);
