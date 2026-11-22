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
    const parsedDate = typeof date === 'string' ? new Date(`${date}T00:00:00.000Z`) : null

    if (
      !parsedDate ||
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== date ||
      typeof division !== 'string' ||
      !division.trim() ||
      !attendance ||
      typeof attendance !== 'object' ||
      Array.isArray(attendance)
    ) {
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

    const activePlayerIds = new Map((activePlayers ?? []).map((player) => [String(player.id), player.id]))
    const submittedPresence = new Map(
      Object.entries(attendance as Record<string, unknown>)
        .filter(([playerId, isPresent]) => activePlayerIds.has(playerId) && typeof isPresent === 'boolean')
        .map(([playerId, isPresent]) => [playerId, isPresent as boolean]),
    )

    const attendanceRecords = (activePlayers ?? []).map((player) => ({
      academyId: session.user.academyId,
      date,
      division,
      player_id: player.id,
      is_present: submittedPresence.get(String(player.id)) ?? false,
    }))

    if (attendanceRecords.length === 0) {
      return NextResponse.json({ error: 'No active players were found for attendance.' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('attendance')
      .upsert(attendanceRecords, {
        onConflict: 'academyId,date,division,player_id',
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

