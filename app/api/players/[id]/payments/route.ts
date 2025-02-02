import { NextResponse } from 'next/server'
import { supabase } from '../../../../../lib/supabase'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]/route'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user.academyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { amount, date } = await request.json()

    if (!amount || !date) {
      return NextResponse.json({ error: 'Amount and date are required' }, { status: 400 })
    }

    // Fetch the current player data
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('*')
      .eq('id', params.id)
      .eq('academyId', session.user.academyId)
      .single()

    if (playerError) {
      console.error('Error fetching player:', playerError)
      return NextResponse.json({ error: 'Failed to fetch player data' }, { status: 500 })
    }

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    const newPayment = {
      id: Date.now(),
      amount: parseFloat(amount),
      date
    }

    const currentPayments = Array.isArray(player.payments) ? player.payments : []
    const updatedPayments = [...currentPayments, newPayment]

    // Update the player with the new payment
    const { data, error } = await supabase
      .from('players')
      .update({ 
        payments: updatedPayments,
        lastPaymentDate: date
      })
      .eq('id', params.id)
      .eq('academyId', session.user.academyId)
      .select()

    if (error) {
      console.error('Error updating player:', error)
      return NextResponse.json({ error: 'Failed to update player data' }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Failed to update player' }, { status: 500 })
    }

    // Fetch the updated player data
    const { data: updatedPlayer, error: updatedPlayerError } = await supabase
      .from('players')
      .select('*')
      .eq('id', params.id)
      .eq('academyId', session.user.academyId)
      .single()

    if (updatedPlayerError) {
      console.error('Error fetching updated player:', updatedPlayerError)
      return NextResponse.json({ error: 'Failed to fetch updated player data' }, { status: 500 })
    }

    return NextResponse.json(updatedPlayer)
  } catch (error) {
    console.error('Error adding payment:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

