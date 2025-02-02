'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Player } from '../types'

export default function AddPlayerForm() {
  const router = useRouter()
  const { data: session } = useSession()
  const [formData, setFormData] = useState<Omit<Player, 'id' | 'payments' | 'isActive'>>({
    name: '',
    phoneNumber: '',
    age: 0,
    sport: '',
    subscriptionPrice: 0,
    subscription: 'monthly', 
    created_at: new Date().toISOString().split('T')[0],
    autoRenew: false,
    division: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               type === 'number' ? Number(value) : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!session) {
      alert('يجب تسجيل الدخول لإضافة لاعب')
      router.push('/login')
      return
    }
    try {
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          created_at: new Date(formData.created_at).toISOString(),
        }),
      })
      if (response.ok) {
        alert('تمت إضافة اللاعب بنجاح!')
        router.push('/player-list')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'فشل في إضافة اللاعب')
      }
    } catch (error) {
      console.error('Error:', error)
      alert(`حدث خطأ أثناء إضافة اللاعب: ${error.message}`)
    }
  }

  if (!session) {
    return <p>يجب تسجيل الدخول لإضافة لاعب</p>
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
          الاسم
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="name"
          type="text"
          placeholder="أدخل اسم اللاعب"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phoneNumber">
          رقم الهاتف
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="phoneNumber"
          type="tel"
          placeholder="أدخل رقم هاتف اللاعب"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="age">
          العمر
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="age"
          type="number"
          placeholder="أدخل عمر اللاعب"
          name="age"
          value={formData.age}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="sport">
          الرياضة
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="sport"
          type="text"
          placeholder="أدخل الرياضة"
          name="sport"
          value={formData.sport}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="division">
          الشعبة
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="division"
          type="text"
          placeholder="أدخل اسم الشعبة"
          name="division"
          value={formData.division}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="subscription">
          نوع الاشتراك
        </label>
        <select
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="subscription"
          name="subscription"
          value={formData.subscription}
          onChange={handleChange}
          required
        >
          <option value="monthly">شهري</option>
          <option value="yearly">سنوي</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="created_at">
          تاريخ التسجيل
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="created_at"
          type="date"
          name="created_at"
          value={formData.created_at}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="subscriptionPrice">
          سعر الاشتراك
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="subscriptionPrice"
          type="number"
          placeholder="أدخل سعر الاشتراك"
          name="subscriptionPrice"
          value={formData.subscriptionPrice}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            name="autoRenew"
            checked={formData.autoRenew}
            onChange={handleChange}
            className="mr-2"
          />
          <span className="text-gray-700 text-sm font-bold">تجديد تلقائي</span>
        </label>
      </div>
      <div className="flex items-center justify-between">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="submit"
        >
          إضافة اللاعب
        </button>
      </div>
    </form>
  )
}

