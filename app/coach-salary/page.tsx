"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { supabase } from "../../lib/supabaseClient"
import type { Coach, CoachSalary } from "../../types"

export default function CoachSalaryPage() {
  const { data: session, status } = useSession()
  const [coach, setCoach] = useState<Coach | null>(null)
  const [salaries, setSalaries] = useState<CoachSalary[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "authenticated" && session.user.role === "COACH") {
      fetchCoachData()
      fetchSalaries()
    }
  }, [status, session])

  const fetchCoachData = async () => {
    try {
      const { data, error } = await supabase.from("coaches").select("*").eq("id", session?.user.id).single()

      if (error) throw error
      setCoach(data)
    } catch (error) {
      console.error("Error fetching coach data:", error)
      alert("فشل في جلب بيانات المدرب")
    }
  }

  const fetchSalaries = async () => {
    try {
      const { data, error } = await supabase
        .from("coach_salaries")
        .select("*")
        .eq("coach_id", session?.user.id)
        .order("payment_date", { ascending: false })

      if (error) throw error
      setSalaries(data || [])
    } catch (error) {
      console.error("Error fetching salaries:", error)
      alert("فشل في جلب بيانات الرواتب")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">جاري التحميل...</div>
  }

  if (status === "unauthenticated" || session?.user.role !== "COACH") {
    return <div className="container mx-auto px-4 py-8">غير مصرح لك بالوصول إلى هذه الصفحة</div>
  }

  const totalSalary = salaries.reduce((sum, salary) => sum + salary.amount, 0)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">تفاصيل الراتب</h1>

      {coach && (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-2xl font-bold mb-4">{coach.name}</h2>
          <p className="mb-2">التخصص: {coach.specialization}</p>
          <p className="mb-4">الراتب الأساسي: {coach.salary} شيكل</p>

          <h3 className="text-xl font-bold mb-2">إجمالي الرواتب المستلمة</h3>
          <p className="mb-4 text-lg">{totalSalary} شيكل</p>

          <h3 className="text-xl font-bold mb-2">سجل دفعات الرواتب</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-right">المبلغ</th>
                  <th className="py-3 px-6 text-right">تاريخ الدفع</th>
                  <th className="py-3 px-6 text-right">ملاحظات</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm font-light">
                {salaries.map((salary) => (
                  <tr key={salary.id} className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-6 text-right">{salary.amount} شيكل</td>
                    <td className="py-3 px-6 text-right">
                      {new Date(salary.payment_date).toLocaleDateString("ar-EG")}
                    </td>
                    <td className="py-3 px-6 text-right">{salary.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

