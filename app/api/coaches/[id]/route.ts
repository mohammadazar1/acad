import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'
import { supabase } from '../../../../lib/supabaseClient'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user.academyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { error } = await supabase
      .from('coaches')
      .delete()
      .eq('id', params.id)
      .eq('academyId', session.user.academyId)

    if (error) throw error

    return NextResponse.json({ message: 'Coach deleted successfully' })
  } catch (error) {
    console.error('Error deleting coach:', error)
    return NextResponse.json({ error: 'Failed to delete coach' }, { status: 400 })
  }
}

