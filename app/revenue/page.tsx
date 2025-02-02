"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { supabase } from "../../lib/supabase"

interface RevenueItem {
  id: string
  name: string
  costPrice: number
  sellingPrice: number
  profit: number
  date: string
}

export default function RevenuePage() {
  const { data: session, status } = useSession()
  const [revenueItems, setRevenueItems] = useState<RevenueItem[]>([])
  const [newItem, setNewItem] = useState({
    name: "",
    costPrice: 0,
    sellingPrice: 0,
    date: new Date().toISOString().split("T")[0],
  })
  const [totalProfit, setTotalProfit] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "authenticated") {
      fetchRevenueItems()
    }
  }, [status])

  const fetchRevenueItems = async () => {
    setIsLoading(true)
    setError(null)
    try {
      console.log("Fetching revenue items...")
      const response = await fetch("/api/revenue")
      console.log("Response status:", response.status)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch revenue items")
      }
      const data = await response.json()
      console.log("Fetched data:", data)
      setRevenueItems(data || [])
      calculateTotalProfit(data)
    } catch (error) {
      console.error("Error fetching revenue items:", error)
      setError("فشل في جلب بيانات الإيرادات: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateTotalProfit = (items: RevenueItem[]) => {
    const total = items.reduce((sum, item) => sum + item.profit, 0)
    setTotalProfit(total)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewItem((prev) => ({ ...prev, [name]: name === "name" ? value : Number(value) }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    try {
      console.log("Submitting new item:", newItem)
      const response = await fetch("/api/revenue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newItem),
      })
      console.log("Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add revenue item")
      }

      const data = await response.json()
      console.log("Added item:", data)

      setRevenueItems((prev) => [data, ...prev])
      calculateTotalProfit([...revenueItems, data])
      setNewItem({
        name: "",
        costPrice: 0,
        sellingPrice: 0,
        date: new Date().toISOString().split("T")[0],
      })
    } catch (error) {
      console.error("Error adding revenue item:", error)
      setError(`فشل في إضافة عنصر الإيرادات: ${error.message}`)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("هل أنت متأكد من رغبتك في حذف هذا العنصر؟")) {
      setError(null)
      try {
        console.log("Deleting revenue item:", id)
        const response = await fetch(`/api/revenue/${id}`, {
          method: "DELETE",
        })
        console.log("Delete response status:", response.status)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to delete revenue item")
        }

        console.log("Item deleted successfully")
        setRevenueItems((prev) => prev.filter((item) => item.id !== id))
        calculateTotalProfit(revenueItems.filter((item) => item.id !== id))
      } catch (error) {
        console.error("Error deleting revenue item:", error)
        setError(`فشل في حذف عنصر الإيرادات: ${error.message}`)
      }
    }
  }

  if (status === "loading" || isLoading) {
    return <div className="container mx-auto px-4 py-8">جاري التحميل...</div>
  }

  if (status === "unauthenticated") {
    return <div className="container mx-auto px-4 py-8">يرجى تسجيل الدخول لعرض صفحة الإيرادات</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">إدارة الإيرادات</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">خطأ! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              اسم العنصر
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={newItem.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="costPrice" className="block text-sm font-medium text-gray-700 mb-1">
              سعر التكلفة
            </label>
            <input
              type="number"
              id="costPrice"
              name="costPrice"
              value={newItem.costPrice}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="sellingPrice" className="block text-sm font-medium text-gray-700 mb-1">
              سعر البيع
            </label>
            <input
              type="number"
              id="sellingPrice"
              name="sellingPrice"
              value={newItem.sellingPrice}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              التاريخ
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={newItem.date}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          إضافة إيراد
        </button>
      </form>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold mb-4">إجمالي الأرباح: {totalProfit.toFixed(2)} شيكل</h2>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">قائمة الإيرادات</h2>
        {revenueItems.length === 0 ? (
          <p>لا توجد عناصر إيرادات لعرضها.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2 text-right">اسم العنصر</th>
                  <th className="px-4 py-2 text-right">سعر التكلفة</th>
                  <th className="px-4 py-2 text-right">سعر البيع</th>
                  <th className="px-4 py-2 text-right">الربح</th>
                  <th className="px-4 py-2 text-right">التاريخ</th>
                  <th className="px-4 py-2 text-right">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {revenueItems.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="px-4 py-2">{item.name}</td>
                    <td className="px-4 py-2">{item.costPrice.toFixed(2)} شيكل</td>
                    <td className="px-4 py-2">{item.sellingPrice.toFixed(2)} شيكل</td>
                    <td className="px-4 py-2">{item.profit.toFixed(2)} شيكل</td>
                    <td className="px-4 py-2">{new Date(item.date).toLocaleDateString("ar-EG")}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded text-xs"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

