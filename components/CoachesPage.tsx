'use client'

import { useState, useEffect } from 'react'

interface Coach {
  id: number
  name: string
  specialization: string
  phoneNumber: string
}

export default function CoachesPage() {
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [newCoach, setNewCoach] = useState({ name: '', specialization: '', phoneNumber: '' })

  useEffect(() => {
    // In a real application, you would fetch coaches from an API
    const mockCoaches: Coach[] = [
      { id: 1, name: 'أحمد علي', specialization: 'كرة القدم', phoneNumber: '0123456789' },
      { id: 2, name: 'سارة محمد', specialization: 'السباحة', phoneNumber: '0987654321' },
    ]
    setCoaches(mockCoaches)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewCoach(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const coach: Coach = {
      id: Date.now(),
      ...newCoach
    }
    setCoaches([...coaches, coach])
    setNewCoach({ name: '', specialization: '', phoneNumber: '' })
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">اسم المدرب</label>
          <input
            type="text"
            id="name"
            name="name"
            value={newCoach.name}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="specialization" className="block text-gray-700 text-sm font-bold mb-2">التخصص</label>
          <input
            type="text"
            id="specialization"
            name="specialization"
            value={newCoach.specialization}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="phoneNumber" className="block text-gray-700 text-sm font-bold mb-2">رقم الهاتف</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={newCoach.phoneNumber}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          إضافة مدرب
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-right">الاسم</th>
              <th className="py-3 px-6 text-right">التخصص</th>
              <th className="py-3 px-6 text-right">رقم الهاتف</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {coaches.map((coach) => (
              <tr key={coach.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6 text-right">{coach.name}</td>
                <td className="py-3 px-6 text-right">{coach.specialization}</td>
                <td className="py-3 px-6 text-right">{coach.phoneNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

