import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'
import { supabase } from '../../../../lib/supabaseClient'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user.academyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data, error } = await supabase
      .from('coach_salaries')
      .select(`
        *,
        coaches (
          id,
          name,
          academyId
        )
      `)
      .eq('coaches.academyId', session.user.academyId)

    if (error) throw error

    // Filter out any salaries where the coach's academyId doesn't match the current user's academyId
    const filteredData = data.filter(salary => salary.coaches?.academyId === session.user.academyId)

    return NextResponse.json(filteredData)
  } catch (error) {
    console.error('Error fetching coach salaries:', error)
    return NextResponse.json({ error: 'Failed to fetch coach salaries' }, { status: 400 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user.academyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    
    // Verify that the coach belongs to the current academy
    const { data: coach, error: coachError } = await supabase
      .from('coaches')
      .select('id')
      .eq('id', body.coach_id)
      .eq('academyId', session.user.academyId)
      .single()

    if (coachError || !coach) {
      return NextResponse.json({ error: 'Coach not found in this academy' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('coach_salaries')
      .insert([body])
      .select()

    if (error) throw error

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('Error creating coach salary:', error)
    return NextResponse.json({ error: 'Failed to create coach salary' }, { status: 400 })
  }
}

