import { getSupabaseAdmin } from './_supabaseAdmin'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const packageId = req.query.packageId
  if (!packageId) {
    return res.status(400).json({ error: 'packageId is required' })
  }

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('bookings')
      .select('date, trip_date, participants, status')
      .eq('package_id', packageId)

    if (error) {
      throw error
    }

    const slotUsage = (data || []).reduce((acc, booking) => {
      const bookingDate = booking.date || booking.trip_date
      if (!bookingDate || booking.status === 'cancelled') return acc
      acc[bookingDate] = (acc[bookingDate] || 0) + (Number(booking.participants) || 1)
      return acc
    }, {})

    return res.status(200).json({ slotUsage })
  } catch (error) {
    console.error('Open trip slots error:', error)
    return res.status(500).json({ error: 'Failed to load slot usage' })
  }
}

