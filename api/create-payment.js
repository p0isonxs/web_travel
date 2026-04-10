// Vercel Serverless Function - Midtrans Snap Token Generator
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    return res.status(500).json({ error: 'Midtrans server key not configured' });
  }

  try {
    const { bookingId, amount, customerName, customerEmail, customerPhone, itemName } = req.body;

    if (!bookingId || !amount) {
      return res.status(400).json({ error: 'bookingId and amount are required' });
    }

    const isProduction = process.env.MIDTRANS_ENV === 'production';
    const baseUrl = isProduction
      ? 'https://app.midtrans.com/snap/v1/transactions'
      : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

    const auth = Buffer.from(`${serverKey}:`).toString('base64');

    const payload = {
      transaction_details: {
        order_id: `${bookingId}-${Date.now()}`,
        gross_amount: Math.round(amount),
      },
      customer_details: {
        first_name: customerName || 'Pelanggan',
        email: customerEmail || 'customer@email.com',
        phone: customerPhone || '',
      },
      item_details: [
        {
          id: bookingId,
          price: Math.round(amount),
          quantity: 1,
          name: itemName || 'Paket Wisata',
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
