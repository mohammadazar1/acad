"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import type { CoachSalary } from "../../types"
import { Loader2 } from "lucide-react"

export default function CoachSalaryPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [salaries, setSalaries] = useState<CoachSalary[]>([])
  const [error, setError] = useState<string | null>(null)
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "authenticated") {
      console.log("Session data:", session)
      console.log("Coach ID:", session.user.coach_id)
      fetchSalaries()
    }
  }, [status, session])

  const fetchSalaries = async () => {
    try {
      const response = await fetch("/api/coaches/salaries")
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch salaries")
      }
      const data = await response.json()
      console.log("Fetched salaries data:", data)
      if (Array.isArray(data) && data.length > 0) {
        setSalaries(data)
      } else {
        setError("لا توجد رواتب مسجلة")
      }
    } catch (error) {
      console.error("Error fetching salaries:", error)
      setError("Failed to fetch salary data: " + (error instanceof Error ? error.message : String(error)))
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500">يرجى تسجيل الدخول لعرض بيانات الرواتب</div>
    )
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-500">{error}</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">تفاصيل الراتب</h1>
      {error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : salaries.length === 0 ? (
        <p className="text-center text-gray-600">لا توجد رواتب مسجلة.</p>
      ) : (
        <>
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
            <table className="w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2 text-right">مبلغ الراتب</th>
                  <th className="px-4 py-2 text-right">تاريخ الدفع</th>
                  <th className="px-4 py-2 text-right">ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {salaries.map((salary) => (
                  <tr key={salary.id} className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="px-4 py-2">{salary.amount.toFixed(2)} شيكل</td>
                    <td className="px-4 py-2">{new Date(salary.payment_date).toLocaleDateString("ar-EG")}</td>
                    <td className="px-4 py-2">{salary.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-lg">
            <p className="font-bold">
              إجمالي الرواتب المدفوعة: {salaries.reduce((total, salary) => total + salary.amount, 0).toFixed(2)} شيكل
            </p>
          </div>
        </>
      )}
    </div>
  )
}

