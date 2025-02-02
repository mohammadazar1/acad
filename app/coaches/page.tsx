"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { supabase } from "../../lib/supabaseClient"
import type { Coach, CoachSalary } from "../../types"
import bcrypt from "bcryptjs"

export default function CoachesPage() {
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [newCoach, setNewCoach] = useState<Omit<Coach, "id" | "academyId">>({
    name: "",
    specialization: "",
    phone_number: "",
    email: "",
    password: "",
    salary: 0,
  })
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null)
  const [salaries, setSalaries] = useState<CoachSalary[]>([])
  const [newSalary, setNewSalary] = useState<Omit<CoachSalary, "id">>({
    coach_id: "",
    amount: 0,
    payment_date: new Date().toISOString().split("T")[0],
    notes: "",
  })
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "authenticated") {
      fetchCoaches()
      fetchSalaries()
    }
  }, [status, session])

  const fetchCoaches = async () => {
    try {
      const { data, error } = await supabase.from("coaches").select("*").eq("academyId", session?.user.academyId)

      if (error) throw error
      setCoaches(data || [])
    } catch (error) {
      console.error("Error fetching coaches:", error)
      alert("فشل في جلب بيانات المدربين")
    }
  }

  const fetchSalaries = async () => {
    try {
      const { data, error } = await supabase
        .from("coach_salaries")
        .select(`
        id,
        coach_id,
        amount,
        payment_date,
        notes,
        coaches (
          id,
          name,
          academyId
        )
      `)
        .eq("coaches.academyId", session?.user.academyId)
        .order("payment_date", { ascending: false })

      if (error) throw error

      // Filter out any salaries where the coach's academyId doesn't match the current user's academyId
      const filteredData = data.filter((salary) => salary.coaches?.academyId === session?.user.academyId)
      setSalaries(filteredData || [])
    } catch (error) {
      console.error("Error fetching salaries:", error)
      alert("فشل في جلب بيانات الرواتب")
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (editingCoach) {
      setEditingCoach({ ...editingCoach, [name]: value })
    } else {
      setNewCoach((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSalaryInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewSalary((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      let hashedPassword
      if (editingCoach) {
        if (editingCoach.password !== coaches.find((c) => c.id === editingCoach.id)?.password) {
          hashedPassword = await bcrypt.hash(editingCoach.password, 10)
        }
        const { data, error } = await supabase
          .from("coaches")
          .update({
            ...editingCoach,
            password: hashedPassword || editingCoach.password,
          })
          .eq("id", editingCoach.id)
          .select()

        if (error) throw error
        setCoaches(coaches.map((coach) => (coach.id === editingCoach.id ? data[0] : coach)))
        setEditingCoach(null)
      } else {
        hashedPassword = await bcrypt.hash(newCoach.password, 10)
        const { data, error } = await supabase
          .from("coaches")
          .insert([{ ...newCoach, password: hashedPassword, academyId: session?.user.academyId }])
          .select()

        if (error) throw error
        setCoaches([...coaches, data[0]])
        setNewCoach({ name: "", specialization: "", phone_number: "", email: "", password: "", salary: 0 })
      }
      alert(editingCoach ? "تم تحديث بيانات المدرب بنجاح" : "تمت إضافة المدرب بنجاح")
    } catch (error) {
      console.error("Error adding/updating coach:", error)
      alert("حدث خطأ أثناء إضافة/تحديث المدرب")
    }
  }

  const handleDelete = async (coach_id: string) => {
    if (window.confirm("هل أنت متأكد من رغبتك في حذف هذا المدرب؟")) {
      try {
        const { error } = await supabase.from("coaches").delete().eq("id", coach_id)

        if (error) throw error

        setCoaches(coaches.filter((coach) => coach.id !== coach_id))
        alert("تم حذف المدرب بنجاح")
      } catch (error) {
        console.error("Error deleting coach:", error)
        alert("فشل في حذف المدرب")
      }
    }
  }

  const handleSalarySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase.from("coach_salaries").insert([newSalary]).select()

      if (error) throw error

      setSalaries([...salaries, data[0]])
      setNewSalary({
        coach_id: "",
        amount: 0,
        payment_date: new Date().toISOString().split("T")[0],
        notes: "",
      })
      alert("تم إضافة دفعة الراتب بنجاح")
    } catch (error) {
      console.error("Error adding salary payment:", error)
      alert("حدث خطأ أثناء إضافة دفعة الراتب")
    }
  }

  // تحديث وظيفة حذف الراتب
  const handleDeleteSalary = async (salaryId: string) => {
    if (window.confirm("هل أنت متأكد من رغبتك في حذف هذا الراتب؟")) {
      try {
        const { error } = await supabase.from("coach_salaries").delete().eq("id", salaryId)

        if (error) throw error

        setSalaries(salaries.filter((salary) => salary.id !== salaryId))
        alert("تم حذف الراتب بنجاح")
      } catch (error) {
        console.error("Error deleting salary:", error)
        alert("حدث خطأ أثناء حذف الراتب")
      }
    }
  }

  if (status === "loading") {
    return <p>جاري التحميل...</p>
  }

  if (status === "unauthenticated" || session?.user.role !== "ACADEMY") {
    return <p>غير مصرح لك بالوصول إلى هذه الصفحة</p>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">إدارة المدربين</h1>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
            اسم المدرب
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={editingCoach ? editingCoach.name : newCoach.name}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="specialization" className="block text-gray-700 text-sm font-bold mb-2">
            التخصص
          </label>
          <input
            type="text"
            id="specialization"
            name="specialization"
            value={editingCoach ? editingCoach.specialization : newCoach.specialization}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="phone_number" className="block text-gray-700 text-sm font-bold mb-2">
            رقم الهاتف
          </label>
          <input
            type="tel"
            id="phone_number"
            name="phone_number"
            value={editingCoach ? editingCoach.phone_number : newCoach.phone_number}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
            البريد الإلكتروني
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={editingCoach ? editingCoach.email : newCoach.email}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
            كلمة المرور
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={editingCoach ? editingCoach.password : newCoach.password}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="salary" className="block text-gray-700 text-sm font-bold mb-2">
            الراتب
          </label>
          <input
            type="number"
            id="salary"
            name="salary"
            value={editingCoach ? editingCoach.salary : newCoach.salary}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {editingCoach ? "تحديث المدرب" : "إضافة مدرب"}
        </button>
        {editingCoach && (
          <button
            type="button"
            onClick={() => setEditingCoach(null)}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
          >
            إلغاء التحرير
          </button>
        )}
      </form>

      <h2 className="text-2xl font-bold mb-4">قائمة المدربين</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-right">الاسم</th>
              <th className="py-3 px-6 text-right">التخصص</th>
              <th className="py-3 px-6 text-right">رقم الهاتف</th>
              <th className="py-3 px-6 text-right">البريد الإلكتروني</th>
              <th className="py-3 px-6 text-right">الراتب</th>
              <th className="py-3 px-6 text-right">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {coaches.map((coach) => (
              <tr key={coach.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6 text-right">{coach.name}</td>
                <td className="py-3 px-6 text-right">{coach.specialization}</td>
                <td className="py-3 px-6 text-right">{coach.phone_number}</td>
                <td className="py-3 px-6 text-right">{coach.email}</td>
                <td className="py-3 px-6 text-right">{coach.salary}</td>
                <td className="py-3 px-6 text-right">
                  <button
                    onClick={() => setEditingCoach(coach)}
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-xs mr-2"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(coach.id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold my-8">إضافة دفعة راتب</h2>
      <form onSubmit={handleSalarySubmit} className="mb-8">
        <div className="mb-4">
          <label htmlFor="coach_id" className="block text-gray-700 text-sm font-bold mb-2">
            المدرب
          </label>
          <select
            id="coach_id"
            name="coach_id"
            value={newSalary.coach_id}
            onChange={handleSalaryInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            <option value="">اختر المدرب</option>
            {coaches.map((coach) => (
              <option key={coach.id} value={coach.id}>
                {coach.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="amount" className="block text-gray-700 text-sm font-bold mb-2">
            المبلغ
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={newSalary.amount}
            onChange={handleSalaryInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="payment_date" className="block text-gray-700 text-sm font-bold mb-2">
            تاريخ الدفع
          </label>
          <input
            type="date"
            id="payment_date"
            name="payment_date"
            value={newSalary.payment_date}
            onChange={handleSalaryInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="notes" className="block text-gray-700 text-sm font-bold mb-2">
            ملاحظات
          </label>
          <input
            type="text"
            id="notes"
            name="notes"
            value={newSalary.notes}
            onChange={handleSalaryInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          إضافة دفعة الراتب
        </button>
      </form>

      <h2 className="text-2xl font-bold mb-4">سجل دفعات الرواتب</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-right">المدرب</th>
              <th className="py-3 px-6 text-right">المبلغ</th>
              <th className="py-3 px-6 text-right">تاريخ الدفع</th>
              <th className="py-3 px-6 text-right">ملاحظات</th>
              <th className="py-3 px-6 text-right">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {salaries.map((salary) => (
              <tr key={salary.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6 text-right">{salary.coaches?.name || "غير معروف"}</td>
                <td className="py-3 px-6 text-right">{salary.amount}</td>
                <td className="py-3 px-6 text-right">{new Date(salary.payment_date).toLocaleDateString("ar-EG")}</td>
                <td className="py-3 px-6 text-right">{salary.notes || "-"}</td>
                <td className="py-3 px-6 text-right">
                  <button
                    onClick={() => handleDeleteSalary(salary.id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
                  >
                    حذف الراتب
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

