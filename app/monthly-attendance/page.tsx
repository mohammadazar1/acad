'use client'

import { useState, useEffect} from 'react'
import { useSession } from 'next-auth/react'
import { Player } from '../../types'

export default function MonthlyAttendancePage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [monthlyAttendance, setMonthlyAttendance] = useState<Record<string, { totalDays: number, presentDays: number }>>({})
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "authenticated") {
      fetchPlayers()
      fetchMonthlyAttendance()
    }
  }, [status, selectedMonth, selectedYear])

  const fetchPlayers = async () => {
    try {
      const response = await fetch('/api/players')
      if (!response.ok) {
        throw new Error('Failed to fetch players')
      }
      const data = await response.json()
      setPlayers(data)
    } catch (error) {
      console.error('Error fetching players:', error)
      alert('فشل في جلب بيانات اللاعبين')
    }
  }

  const fetchMonthlyAttendance = async () => {
    try {
      const response = await fetch(`/api/attendance/monthly?month=${selectedMonth}&year=${selectedYear}`)
      if (!response.ok) {
        throw new Error('Failed to fetch monthly attendance')
      }
      const data = await response.json()
      setMonthlyAttendance(data)
    } catch (error) {
      console.error('Error fetching monthly attendance:', error)
      alert('فشل في جلب سجلات الحضور الشهرية')
    }
  }

  if (status === "loading") {
    return <p>جاري التحميل...</p>
  }

  if (status === "unauthenticated") {
    return <p>يجب تسجيل الدخول لعرض صفحة الحضور الشهري</p>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">سجل الحضور الشهري</h1>
      <div className="mb-4 flex justify-center">
        <select
          className="mr-2 p-2 border rounded"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
            <option key={month} value={month}>
              {new Date(2000, month - 1, 1).toLocaleString('ar-SA', { month: 'long' })}
            </option>
          ))}
        </select>
        <select
          className="p-2 border rounded"
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
        >
          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
            <th className="py-3 px-6 text-right">اسم اللاعب</th>
            <th className="py-3 px-6 text-right">عدد أيام الحضور</th>
            <th className="py-3 px-6 text-right">إجمالي الأيام</th>
            <th className="py-3 px-6 text-right">نسبة الحضور</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm font-light">
          {players.map((player) => {
            const attendance = monthlyAttendance[player.id] || { totalDays: 0, presentDays: 0 }
            const attendancePercentage = attendance.totalDays > 0
              ? ((attendance.presentDays / attendance.totalDays) * 100).toFixed(2)
              : '0.00'
            return (
              <tr key={player.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6 text-right">{player.name}</td>
                <td className="py-3 px-6 text-right">{attendance.presentDays}</td>
                <td className="py-3 px-6 text-right">{attendance.totalDays}</td>
                <td className="py-3 px-6 text-right">{attendancePercentage}%</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

