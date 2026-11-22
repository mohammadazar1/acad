import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'
import { supabase } from '../../../../lib/supabase'

function isDateOnly(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false

  const parsedDate = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === value
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user.academyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const payload = body && typeof body === 'object' ? body as Record<string, unknown> : {}
    const division = typeof payload.division === 'string' ? payload.division.trim() : ''
    const { amount, date } = payload

    if (!division || typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0 || !isDateOnly(date)) {
      return NextResponse.json({ error: 'أدخل الشعبة ومبلغًا وتاريخًا صحيحًا.' }, { status: 400 })
    }

    const { data: players, error: playerError } = await supabase
      .from('players')
      .select('id')
      .eq('academyId', session.user.academyId)
      .eq('division', division)

    if (playerError) throw playerError
    if (!players?.length) {
      return NextResponse.json({ error: 'لا يوجد لاعبون في الشعبة المحددة.' }, { status: 404 })
    }

    const paymentRecords = players.map((player) => ({
      player_id: player.id,
      amount: -amount,
      date,
    }))
    const { error: paymentError } = await supabase.from('payments').insert(paymentRecords)

    if (paymentError) throw paymentError

    return NextResponse.json({
      message: 'تم تطبيق الخصم بنجاح.',
      affectedCount: players.length,
    }, { status: 201 })
  } catch (error) {
    console.error('Error applying division discount:', error)
    return NextResponse.json({ error: 'تعذّر تطبيق الخصم على الشعبة.' }, { status: 500 })
  }
}
