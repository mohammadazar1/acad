import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../auth/[...nextauth]/route'
import { supabase } from '../../../../../../lib/supabaseClient'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; paymentId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user.academyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('*')
      .eq('id', params.id)
      .eq('academyId', session.user.academyId)
      .single()

    if (playerError) throw playerError

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    const { data, error } = await supabase
      .from('payments')
      .delete()
      .eq('id', params.paymentId)
      .eq('player_id', params.id)

    if (error) throw error

    if (data && data.length === 0) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Payment deleted successfully' })
  } catch (error) {
    console.error('Error deleting payment:', error)
    return NextResponse.json({ error: 'Failed to delete payment' }, { status: 500 })
  }
}

