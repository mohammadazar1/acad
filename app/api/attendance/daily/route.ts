import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'
import { supabase } from '../../../../lib/supabaseClient'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user.academyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const date = url.searchParams.get('date')
  const division = url.searchParams.get('division')

  if (!date || !division) {
    return NextResponse.json({ error: 'Date and division are required' }, { status: 400 })
  }

  try {
    // جلب اللاعبين النشطين أولاً
    const { data: activePlayers, error: playerError } = await supabase
      .from('players')
      .select('id')
      .eq('academyId', session.user.academyId)
      .eq('division', division)
      .eq('isActive', true)

    if (playerError) throw playerError

    const activePlayerIds = activePlayers.map(player => player.id)

    // جلب سجلات الحضور للاعبين النشطين فقط
    const { data, error } = await supabase
      .from('attendance')
      .select('player_id, is_present')
      .eq('academyId', session.user.academyId)
      .eq('date', date)
      .eq('division', division)
      .in('player_id', activePlayerIds)

    if (error) throw error

    const attendanceMap: {[key: string]: boolean} = {}
    data.forEach(record => {
      attendanceMap[record.player_id] = record.is_present
    })

    return NextResponse.json(attendanceMap)
  } catch (error) {
    console.error('Error fetching daily attendance:', error)
    return NextResponse.json({ error: 'Failed to fetch daily attendance' }, { status: 500 })
  }
}

