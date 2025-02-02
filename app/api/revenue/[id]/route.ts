import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabase } from '../../../../lib/supabase'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user.academyId) {
    console.log('Unauthorized access attempt')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = params
    console.log('Deleting revenue item:', id)

    const { error, data } = await supabase
      .from('revenue_items')
      .delete()
      .eq('id', id)
      .eq('academyId', session.user.academyId)
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Item not found or already deleted' }, { status: 404 })
    }

    console.log('Revenue item deleted successfully')
    return NextResponse.json({ message: 'Revenue item deleted successfully', data })
  } catch (error) {
    console.error('Error deleting revenue item:', error)
    return NextResponse.json({ error: 'Failed to delete revenue item' }, { status: 500 })
  }
}

