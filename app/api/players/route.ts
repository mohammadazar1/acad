import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'
import { checkAcademyStatus } from '../../../lib/checkAcademyStatus'

export async function GET(request: Request) {
  const statusCheck = await checkAcademyStatus(request)
  if (statusCheck) return statusCheck

  const session = await getServerSession(authOptions)
  if (!session || !session.user.academyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data, error } = await supabase
      .from('players')
      .select(`
        *,
        payments (
          id,
          amount,
          date
        )
      `)
      .eq('academyId', session.user.academyId)

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching players:', error)
    return NextResponse.json({ error: 'Failed to fetch players' }, { status: 400 })
  }
}

export async function POST(request: Request) {
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
    console.error('Error creating player:', error)
    return NextResponse.json({ error: 'Failed to create player' }, { status: 400 })
  }
}

// يمكنك إضافة طرق PATCH و DELETE بنفس الطريقة

