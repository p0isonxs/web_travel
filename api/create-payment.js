// Vercel Serverless Function - Midtrans Snap Token Generator
import { getSupabaseAdmin } from './_supabaseAdmin'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    return res.status(500).json({ error: 'Midtrans server key not configured' });
  }

  try {
    const { bookingId, customerName, customerEmail, customerPhone, itemName } = req.body;

    if (!bookingId) {
      return res.status(400).json({ error: 'bookingId is required' });
    }

    const supabase = getSupabaseAdmin();
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, total_price, name, email, phone, package_name, package_title')
      .eq('id', bookingId)
      .maybeSingle();

    if (bookingError) {
      throw bookingError;
    }

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const grossAmount = Math.round(Number(booking.total_price) || 0);
    if (grossAmount <= 0) {
      return res.status(400).json({ error: 'Booking total amount is invalid' });
    }

    const isProduction = process.env.MIDTRANS_ENV === 'production';
    const baseUrl = isProduction
      ? 'https://app.midtrans.com/snap/v1/transactions'
      : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

    const auth = Buffer.from(`${serverKey}:`).toString('base64');

    const payload = {
      transaction_details: {
        order_id: `${bookingId}-${Date.now()}`,
        gross_amount: grossAmount,
      },
      customer_details: {
        first_name: customerName || booking.name || 'Pelanggan',
        email: customerEmail || booking.email || 'customer@email.com',
        phone: customerPhone || booking.phone || '',
      },
      item_details: [
        {
          id: bookingId,
          price: grossAmount,
          quantity: 1,
          name: itemName || booking.package_name || booking.package_title || 'Paket Wisata',
        },
      ],
    };

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Midtrans error:', error);
      return res.status(response.status).json({ error: 'Failed to create payment token' });
    }

    const data = await response.json();
    return res.status(200).json({ token: data.token, redirect_url: data.redirect_url });
  } catch (error) {
    console.error('Payment error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
