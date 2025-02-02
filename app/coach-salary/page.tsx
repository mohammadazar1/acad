"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import type { CoachSalary } from "../../types"

export default function CoachSalaryPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [salaries, setSalaries] = useState<CoachSalary[]>([])
  const [error, setError] = useState<string | null>(null)
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "authenticated") {
      fetchSalaries()
    }
  }, [status])

  const fetchSalaries = async () => {
    try {
      const response = await fetch("/api/coaches/salaries")
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch salaries")
      }
      const data = await response.json()
      setSalaries(data || [])
    } catch (error) {
      console.error("Error fetching salaries:", error)
      setError("Failed to fetch salary data: " + (error instanceof Error ? error.message : String(error)))
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading" || isLoading) {
    return <div className="container mx-auto px-4 py-8">جاري التحميل...</div>
  }

  if (status === "unauthenticated") {
    return <div className="container mx-auto px-4 py-8">يرجى تسجيل الدخول لعرض بيانات الرواتب</div>
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-red-500">{error}</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">رواتب المدربين</h1>
      {salaries.length === 0 ? (
        <p>لا توجد بيانات رواتب متاحة.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-400 p-2">اسم المدرب</th>
              <th className="border border-gray-400 p-2">مبلغ الراتب</th>
              <th className="border border-gray-400 p-2">تاريخ الدفع</th>
            </tr>
          </thead>
          <tbody>
            {salaries.map((salary) => (
              <tr key={salary.id}>
                <td className="border border-gray-400 p-2">{salary.coach_name || "غير متوفر"}</td>
                <td className="border border-gray-400 p-2">{salary.amount}</td>
                <td className="border border-gray-400 p-2">
                  {new Date(salary.payment_date).toLocaleDateString("ar-EG")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

