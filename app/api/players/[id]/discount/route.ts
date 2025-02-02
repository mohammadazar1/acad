import { NextResponse } from 'next/server'
import { supabase } from '../../../../../lib/supabase'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]/route'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user.academyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { amount, date } = await request.json()

    if (typeof amount !== 'number' || amount <= 0 || !date) {
      return NextResponse.json({ error: 'Invalid discount amount or date' }, { status: 400 })
    }

    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('*')
      .eq('id', params.id)
      .eq('academyId', session.user.academyId)
      .single()

    if (playerError) {
      throw playerError
    }

    const newPayment = {
      player_id: params.id,
      amount: -amount, // Negative amount for discount
      date: date,
    }

    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .insert(newPayment)
      .select()

    if (paymentError) {
      throw paymentError
    }

    return NextResponse.json({ message: 'Discount applied successfully', payment: paymentData[0] })
  } catch (error) {
    console.error('Error applying discount:', error)
    return NextResponse.json({ error: 'Failed to apply discount' }, { status: 500 })
  }
}

