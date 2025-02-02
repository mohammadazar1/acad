'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Player } from '../types'

export default function AddPlayerForm() {
  const router = useRouter()
  const { data: session } = useSession()
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    age: 0,
    sport: '',
    division: '',
    subscription: 'monthly',
    subscriptionPrice: 0,
    created_at: new Date().toISOString().split('T')[0],
    autoRenew: false,
  })

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        const data = await res.json()
        console.log('Player added successfully:', data)
        router.push('/player-list')
      } else {
        const errorData = await res.json()
        console.error('Error adding player:', errorData)
        alert(`فشل في إضافة اللاعب: ${errorData.error || 'حدث خطأ غير معروف'}`)
      }
    } catch (error) {
      console.error('Error adding player:', error)
      alert('حدث خطأ أثناء إضافة اللاعب')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            اسم اللاعب
          </label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
            رقم الهاتف
          </label>
          <input
            id="phoneNumber"
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
            العمر
          </label>
          <input
            id="age"
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            required
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label htmlFor="sport" className="block text-sm font-medium text-gray-700 mb-1">
            الرياضة
          </label>
          <input
            id="sport"
            type="text"
            name="sport"
            value={formData.sport}
            onChange={handleChange}
            required
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label htmlFor="division" className="block text-sm font-medium text-gray-700 mb-1">
            القسم
          </label>
          <input
            id="division"
            type="text"
            name="division"
            value={formData.division}
            onChange={handleChange}
            required
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label htmlFor="subscription" className="block text-sm font-medium text-gray-700 mb-1">
            نوع الاشتراك
          </label>
          <select
            id="subscription"
            name="subscription"
            value={formData.subscription}
            onChange={handleChange}
            required
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
          >
            <option value="monthly">شهري</option>
            <option value="yearly">سنوي</option>
          </select>
        </div>
        <div>
          <label htmlFor="subscriptionPrice" className="block text-sm font-medium text-gray-700 mb-1">
            سعر الاشتراك
          </label>
          <input
            id="subscriptionPrice"
            type="number"
            name="subscriptionPrice"
            value={formData.subscriptionPrice}
            onChange={handleChange}
            required
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label htmlFor="created_at" className="block text-sm font-medium text-gray-700 mb-1">
            تاريخ التسجيل
          </label>
          <input
            id="created_at"
            type="date"
            name="created_at"
            value={formData.created_at}
            onChange={handleChange}
            required
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>
      <div className="flex items-center">
        <input
          id="autoRenew"
          type="checkbox"
          name="autoRenew"
          checked={formData.autoRenew}
          onChange={(e) => setFormData({ ...formData, autoRenew: e.target.checked })}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="autoRenew" className="mr-2 block text-sm text-gray-900">
          التجديد التلقائي
        </label>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          إضافة اللاعب
        </button>
      </div>
    </form>
  )
}

