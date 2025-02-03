"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import type { CoachSalary } from "../../types"
import { supabase } from "../../lib/supabase"
import Link from "next/link"

export default function CoachDashboard() {
  const { data: session, status } = useSession()
  const [salaries, setSalaries] = useState<CoachSalary[]>([])

  useEffect(() => {
    if (status === "authenticated" && session.user.role === "COACH") {
      fetchSalaries()
    }
  }, [status, session])

  const fetchSalaries = async () => {
    const { data, error } = await supabase
      .from("coach_salaries")
      .select("*")
      .eq("coach_id", session?.user.id)
      .order("payment_date", { ascending: false })

    if (error) {
      console.error("Error fetching salaries:", error)
    } else {
      setSalaries(data || [])
    }
  }

  const handleDeleteSalary = async (salaryId: string) => {
    if (window.confirm("هل أنت متأكد من رغبتك في حذف هذا الراتب؟")) {
      try {
        const response = await fetch(`/api/coaches/salaries/${salaryId}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Failed to delete salary")
        }

        alert("تم حذف الراتب بنجاح")
        fetchSalaries() // إعادة تحميل الرواتب بعد الحذف
      } catch (error) {
        console.error("Error deleting salary:", error)
        alert("حدث خطأ أثناء حذف الراتب")
      }
    }
  }

  if (status === "loading") {
    return <div>جاري التحميل...</div>
  }

  if (status === "unauthenticated" || (session && session.user.role !== "COACH")) {
    return <div>غير مصرح لك بالوصول إلى هذه الصفحة</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">لوحة تحكم المدرب</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link
          href="/attendance"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-center"
        >
          تسجيل الحضور والغياب
        </Link>
        <Link
          href="/add-player"
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-center"
        >
          إضافة لاعب جديد
        </Link>
        <Link
          href="/coach-salary"
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded text-center"
        >
          عرض تفاصيل الراتب
        </Link>
      </div>

      <h2 className="text-2xl font-bold mb-4">سجل الرواتب</h2>
      {/*Removed salary display section*/}
    </div>
  )
}

