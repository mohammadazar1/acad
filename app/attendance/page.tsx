'use client'

import { useState, useEffect } from 'react'
import { Player } from '../../types'
import { useSession } from 'next-auth/react'
import { supabase } from '../../lib/supabaseClient'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { ar } from 'date-fns/locale'

export default function AttendancePage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedDivision, setSelectedDivision] = useState('')
  const [attendance, setAttendance] = useState<{[key: string]: boolean}>({})
  const [divisions, setDivisions] = useState<string[]>([])
  const [monthlyAttendance, setMonthlyAttendance] = useState<any[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "authenticated" && (session.user.role === 'COACH' || session.user.role === 'ACADEMY')) {
      fetchPlayers()
      fetchDivisions()
    }
  }, [status, session])

  useEffect(() => {
    if (selectedDate && selectedDivision) {
      fetchAttendance()
    }
  }, [selectedDate, selectedDivision])

  useEffect(() => {
    if (selectedMonth && selectedDivision) {
      fetchMonthlyAttendance()
    }
  }, [selectedMonth, selectedDivision])

  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('academyId', session?.user.academyId)
        .eq('isActive', true)

      if (error) throw error
      setPlayers(data || [])
    } catch (error) {
      console.error('Error fetching players:', error)
      alert('فشل في جلب بيانات اللاعبين')
    }
  }

  const fetchDivisions = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('division')
        .eq('academyId', session?.user.academyId)
        .eq('isActive', true)

      if (error) throw error
      const uniqueDivisions = [...new Set(data.map(player => player.division))]
      setDivisions(uniqueDivisions)
    } catch (error) {
      console.error('Error fetching divisions:', error)
      alert('فشل في جلب الشعب')
    }
  }

  const fetchAttendance = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('academyId', session?.user.academyId)
        .eq('date', selectedDate)
        .eq('division', selectedDivision)

      if (error) throw error
      const attendanceMap: {[key: string]: boolean} = {}
      data.forEach(record => {
        attendanceMap[record.player_id] = record.is_present
      })
      setAttendance(attendanceMap)
    } catch (error) {
      console.error('Error fetching attendance:', error)
      alert('فشل في جلب بيانات الحضور')
    }
  }

  const fetchMonthlyAttendance = async () => {
    try {
      const startDate = startOfMonth(new Date(selectedMonth))
      const endDate = endOfMonth(new Date(selectedMonth))

      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('academyId', session?.user.academyId)
        .eq('division', selectedDivision)
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString())

      if (error) throw error

      const monthlyData = players
        .filter(player => player.division === selectedDivision)
        .map(player => {
          const playerAttendance = data.filter(record => record.player_id === player.id && record.is_present)
          const attendanceDates = playerAttendance.map(record => record.date)
          const attendanceCount = playerAttendance.length
          const totalDays = data.filter(record => record.player_id === player.id).length
          const attendancePercentage = totalDays > 0 ? (attendanceCount / totalDays) * 100 : 0

          return {
            id: player.id,
            name: player.name,
            attendanceCount,
            attendanceDates,
            attendancePercentage
          }
        })

      setMonthlyAttendance(monthlyData)
    } catch (error) {
      console.error('Error fetching monthly attendance:', error)
      alert('فشل في جلب سجل الحضور الشهري')
    }
  }

  const handleAttendanceChange = (playerId: string) => {
    setAttendance(prev => ({
      ...prev,
      [playerId]: !prev[playerId]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const attendanceRecords = Object.entries(attendance).map(([playerId, isPresent]) => ({
        academyId: session?.user.academyId,
        date: selectedDate,
        division: selectedDivision,
        player_id: playerId,
        is_present: isPresent,
      }))

      const { data, error } = await supabase
        .from('attendance')
        .upsert(attendanceRecords, { 
          onConflict: 'academyId,date,division,player_id',
          update: ['is_present']
        })

      if (error) throw error
      alert('تم تسجيل الحضور بنجاح')
      fetchMonthlyAttendance()
    } catch (error) {
      console.error('Error submitting attendance:', error)
      alert(`فشل في تسجيل الحضور: ${error instanceof Error ? error.message : 'حدث خطأ غير معروف'}`)
    }
  }

  if (status === "loading") {
    return <p>جاري التحميل...</p>
  }

  if (status === "unauthenticated" || (session && session.user.role !== 'COACH' && session.user.role !== 'ACADEMY')) {
    return <p>غير مصرح لك بالوصول إلى هذه الصفحة</p>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">تسجيل الحضور والغياب</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
            التاريخ
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="division">
            الشعبة
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="division"
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            required
          >
            <option value="">اختر الشعبة</option>
            {divisions.map(division => (
              <option key={division} value={division}>{division}</option>
            ))}
          </select>
        </div>
        {selectedDate && selectedDivision && (
          <>
            {players.filter(player => player.division === selectedDivision).length === 0 && (
              <p className="text-center text-gray-600 my-4">لا يوجد لاعبون نشطون في هذه الشعبة</p>
            )}
            {players.filter(player => player.division === selectedDivision).length > 0 && (
              <table className="min-w-full bg-white mb-4">
                <thead>
                  <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                    <th className="py-3 px-6 text-right">الاسم</th>
                    <th className="py-3 px-6 text-right">الحضور</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                  {players.filter(player => player.division === selectedDivision).map((player) => (
                    <tr key={player.id} className="border-b border-gray-200 hover:bg-gray-100">
                      <td className="py-3 px-6 text-right">{player.name}</td>
                      <td className="py-3 px-6 text-right">
                        <input
                          type="checkbox"
                          checked={attendance[player.id] || false}
                          onChange={() => handleAttendanceChange(player.id)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
        <div className="mt-4">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            تسجيل الحضور
          </button>
        </div>
      </form>

      <h2 className="text-2xl font-bold mt-12 mb-4">سجل الحضور الشهري</h2>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="month">
          الشهر
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="month"
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          required
        />
      </div>
      {monthlyAttendance.length > 0 && (
        <table className="min-w-full bg-white mb-4">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-right">الاسم</th>
              <th className="py-3 px-6 text-right">عدد مرات الحضور</th>
              <th className="py-3 px-6 text-right">تواريخ الحضور</th>
              <th className="py-3 px-6 text-right">نسبة الحضور</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {monthlyAttendance.map((record) => (
              <tr key={record.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6 text-right">{record.name}</td>
                <td className="py-3 px-6 text-right">{record.attendanceCount}</td>
                <td className="py-3 px-6 text-right">
                  {record.attendanceDates.map(date => format(new Date(date), 'dd/MM/yyyy')).join(', ')}
                </td>
                <td className="py-3 px-6 text-right">{record.attendancePercentage.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

