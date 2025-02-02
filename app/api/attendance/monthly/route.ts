import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'
import { supabase } from '../../../../lib/supabase'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user.academyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const month = url.searchParams.get('month')
  const year = url.searchParams.get('year')
  const division = url.searchParams.get('division')

  if (!month || !year || !division) {
    return NextResponse.json({ error: 'Month, year, and division are required' }, { status: 400 })
  }

  try {
    const startDate = `${year}-${month.padStart(2, '0')}-01`
    const endDate = `${year}-${month.padStart(2, '0')}-31`

    const { data: attendanceData, error: attendanceError } = await supabase
      .from('attendance')
      .select('player_id, date, is_present')
      .eq('academyId', session.user.academyId)
      .eq('division', division)
      .gte('date', startDate)
      .lte('date', endDate)

    if (attendanceError) throw attendanceError

    const { data: playersData, error: playersError } = await supabase
      .from('players')
      .select('id')
      .eq('academyId', session.user.academyId)
      .eq('division', division)

    if (playersError) throw playersError

    const monthlyAttendance: Record<string, { present: number, total: number }> = {}

    playersData.forEach((player) => {
      monthlyAttendance[player.id] = { present: 0, total: 0 }
    })

    attendanceData.forEach((record) => {
      if (monthlyAttendance[record.player_id]) {
        monthlyAttendance[record.player_id].total++
        if (record.is_present) {
          monthlyAttendance[record.player_id].present++
        }
      }
    })

    return NextResponse.json(monthlyAttendance)
  } catch (error) {
    console.error('Error fetching monthly attendance:', error)
    return NextResponse.json({ error: 'Failed to fetch monthly attendance' }, { status: 500 })
  }
}

