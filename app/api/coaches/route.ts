import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'
import { supabase } from '../../../lib/supabaseClient'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user.academyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data, error } = await supabase
      .from('coaches')
      .select('*')
      .eq('academyId', session.user.academyId)

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching coaches:', error)
    return NextResponse.json({ error: 'Failed to fetch coaches' }, { status: 400 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user.academyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { data, error } = await supabase
      .from('coaches')
      .insert([
        { 
          ...body,
          academyId: session.user.academyId,
        }
      ])
      .select()

    if (error) throw error

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('Error creating coach:', error)
    return NextResponse.json({ error: 'Failed to create coach' }, { status: 400 })
  }
}

