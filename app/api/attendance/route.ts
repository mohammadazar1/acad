import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'
import { supabase } from '../../../lib/supabaseClient'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user.academyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { date, division, attendance } = await request.json()

    if (!date || !division || !attendance) {
      return NextResponse.json({ error: 'Invalid data: missing date, division, or attendance' }, { status: 400 })
    }

    // جلب اللاعبين النشطين فقط
    const { data: activePlayers, error: playerError } = await supabase
      .from('players')
      .select('id')
      .eq('academyId', session.user.academyId)
      .eq('division', division)
      .eq('isActive', true)

    if (playerError) throw playerError

    const activePlayerIds = activePlayers.map(player => player.id)

    const attendanceRecords = Object.entries(attendance)
      .filter(([playerId, _]) => activePlayerIds.includes(playerId))
      .map(([playerId, isPresent]) => ({
        academyId: session.user.academyId,
        date,
        division,
        player_id: playerId,
        is_present: isPresent,
      }))

    const { data, error } = await supabase
      .from('attendance')
      .upsert(attendanceRecords, { 
        onConflict: 'academyId,date,division,player_id',
        update: ['is_present']
      })

    if (error) {
      console.error('Supabase error:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    return NextResponse.json({ message: 'Attendance recorded successfully', data }, { status: 201 })
  } catch (error) {
    console.error('Error recording attendance:', error)
    return NextResponse.json({ error: `Failed to record attendance: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 })
  }
}

