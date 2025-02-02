import { NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user.academyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data, error } = await supabase.rpc('delete_player_with_attendance', {
      player_id: params.id,
      academy_id: session.user.academyId
    })

    if (error) throw error

    return NextResponse.json({ message: 'Player deleted successfully' })
  } catch (error) {
    console.error('Error deleting player:', error)
    return NextResponse.json({ error: 'Failed to delete player' }, { status: 400 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const statusCheck = await checkAcademyStatus(request)
  if (statusCheck) return statusCheck

  const session = await getServerSession(authOptions)
  if (!session || !session.user.academyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { data, error } = await supabase
      .from('players')
      .update({
        name: body.name,
        phoneNumber: body.phoneNumber,
        age: body.age,
        sport: body.sport,
        subscriptionPrice: body.subscriptionPrice,
        subscription: body.subscription,
        created_at: body.created_at,
        autoRenew: body.autoRenew,
        division: body.division,
        isActive: body.isActive,
      })
      .eq('id', params.id)
      .eq('academyId', session.user.academyId)
      .select()

    if (error) throw error

    if (data.length === 0) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('Error updating player:', error)
    return NextResponse.json({ error: 'Failed to update player' }, { status: 500 })
  }
}

// Assuming checkAcademyStatus function exists elsewhere.  This needs to be implemented.
async function checkAcademyStatus(request: Request): Promise<NextResponse | null> {
  return null; // Replace with actual implementation
}

