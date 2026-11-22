import { supabase } from './supabase'

type PlayerForAttendance = {
  id: string | number
  division: string | null
  created_at?: string | null
  lastPaymentDate?: string | null
  payments?: Array<{ amount: number; date: string }> | null
}

export type AttendanceSubscriptionUsage = {
  attendanceSubscriptionEnabled: boolean
  attendanceSubscriptionDays: number
  attendanceSessionsUsed: number
  attendanceSessionsRemaining: number
}

function dateOnly(value?: string | null) {
  return value?.match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? null
}

function getPlayerAnchor(player: PlayerForAttendance) {
  const paymentDates = [
    dateOnly(player.lastPaymentDate),
    ...(player.payments ?? [])
      .filter((payment) => Number(payment.amount) > 0)
      .map((payment) => dateOnly(payment.date)),
  ].filter((date): date is string => Boolean(date))
  const createdAt = dateOnly(player.created_at)
  const candidates = [createdAt, ...paymentDates].filter((date): date is string => Boolean(date))
  const sortedCandidates = candidates.sort()

  return {
    date: sortedCandidates[sortedCandidates.length - 1] ?? new Date().toISOString().slice(0, 10),
    includeDate: paymentDates.length === 0,
  }
}

export async function attachAttendanceSubscriptionUsage<T extends PlayerForAttendance>(
  players: T[],
  academyId: string,
): Promise<Array<T & AttendanceSubscriptionUsage>> {
  const { data: academy, error: academyError } = await supabase
    .from('academies')
    .select('attendance_subscription_enabled, attendance_subscription_days')
    .eq('id', academyId)
    .single()

  if (academyError) throw academyError

  const enabled = Boolean(academy.attendance_subscription_enabled)
  const days = Number(academy.attendance_subscription_days) || 5
  const emptyUsage = players.map((player) => ({
    ...player,
    attendanceSubscriptionEnabled: enabled,
    attendanceSubscriptionDays: days,
    attendanceSessionsUsed: 0,
    attendanceSessionsRemaining: days,
  }))

  if (!enabled || players.length === 0) return emptyUsage

  const anchors = players.map(getPlayerAnchor)
  const earliestAnchor = [...anchors].map((anchor) => anchor.date).sort()[0]
  const divisions = [...new Set(players.map((player) => player.division).filter((division): division is string => Boolean(division)))]

  if (!divisions.length) return emptyUsage

  const sessionDatesByDivision = new Map<string, Set<string>>()
  const pageSize = 1000

  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase
      .from('attendance')
      .select('date, division')
      .eq('academyId', academyId)
      .in('division', divisions)
      .gte('date', earliestAnchor)
      .lte('date', new Date().toISOString().slice(0, 10))
      .order('date', { ascending: true })
      .range(offset, offset + pageSize - 1)

    if (error) throw error

    const rows = data ?? []
    for (const row of rows) {
      if (!row.division || !row.date) continue
      const dates = sessionDatesByDivision.get(row.division) ?? new Set<string>()
      dates.add(String(row.date).slice(0, 10))
      sessionDatesByDivision.set(row.division, dates)
    }

    if (rows.length < pageSize) break
  }

  return players.map((player, index) => {
    const anchor = anchors[index]
    const recordedDates = sessionDatesByDivision.get(player.division ?? '') ?? new Set<string>()
    const used = [...recordedDates].filter(
      (date) => date > anchor.date || (anchor.includeDate && date === anchor.date),
    ).length

    return {
      ...player,
      attendanceSubscriptionEnabled: enabled,
      attendanceSubscriptionDays: days,
      attendanceSessionsUsed: used,
      attendanceSessionsRemaining: Math.max(0, days - used),
    }
  })
}
