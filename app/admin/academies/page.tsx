'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

interface Academy {
  id: string
  name: string
  trial_end_date: string | null
  status: 'active' | 'suspended' | 'deleted'
  users: {
    id: string
    name: string
    email: string
    role: string
  }[]
}

export default function AdminAcademies() {
  const { data: session, status } = useSession({ required: true })
  const router = useRouter()
  const [academies, setAcademies] = useState<Academy[]>([])
  const [newAcademy, setNewAcademy] = useState({ name: '', email: '', password: '', trialPeriodDays: 30 })
  const [editingAcademy, setEditingAcademy] = useState<Academy | null>(null)
  const [showPassword, setShowPassword] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState<string>('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session.user.role !== 'ADMIN') {
      router.push('/')
    }
  }, [status, session, router])

  useEffect(() => {
    if (status === 'authenticated' && session.user.role === 'ADMIN') {
      fetchAcademies()
    }
  }, [status, session])

  const fetchAcademies = async () => {
    try {
      const response = await fetch('/api/admin/academies')
      if (response.ok) {
        const data = await response.json()
        setAcademies(data)
      } else {
        console.error('Failed to fetch academies')
      }
    } catch (error) {
      console.error('Error fetching academies:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewAcademy({ ...newAcademy, [e.target.name]: e.target.value })
  }

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingAcademy) {
      const value = e.target.name === 'trial_end_date' && e.target.value === '' ? null : e.target.value;
      setEditingAcademy({ 
        ...editingAcademy, 
        [e.target.name]: value,
        users: [
          { 
            ...editingAcademy.users[0], 
            [e.target.name]: value 
          }
        ]
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/admin/academies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAcademy)
      })
      if (response.ok) {
        setNewAcademy({ name: '', email: '', password: '', trialPeriodDays: 30 })
        fetchAcademies()
      } else {
        console.error('Failed to create academy')
      }
    } catch (error) {
      console.error('Error creating academy:', error)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAcademy) return

    try {
      const updatedAcademy = {
        ...editingAcademy,
        email: editingAcademy.users[0].email,
        password: newPassword // Include the new password if it's set
      }

      const response = await fetch('/api/admin/academies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedAcademy)
      })
      if (response.ok) {
        setEditingAcademy(null)
        setNewPassword('')
        fetchAcademies()
      } else {
        console.error('Failed to update academy')
      }
    } catch (error) {
      console.error('Error updating academy:', error)
    }
  }

  const handleStatusChange = async (id: string, newStatus: 'active' | 'suspended' | 'deleted') => {
    try {
      const response = await fetch('/api/admin/academies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      })
      if (response.ok) {
        fetchAcademies()
      } else {
        console.error('Failed to update academy status')
      }
    } catch (error) {
      console.error('Error updating academy status:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this academy?')) {
      try {
        const response = await fetch('/api/admin/academies', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        })
        if (response.ok) {
          fetchAcademies()
        } else {
          console.error('Failed to delete academy')
        }
      } catch (error) {
        console.error('Error deleting academy:', error)
      }
    }
  }

  const togglePasswordVisibility = (academyId: string) => {
    setShowPassword(showPassword === academyId ? null : academyId)
  }

  if (status === 'loading') {
    return <div className="container mx-auto px-4 py-8">جاري التحميل...</div>
  }

  if (status === 'unauthenticated') {
    return <div className="container mx-auto px-4 py-8">يرجى تسجيل الدخول للوصول إلى هذه الصفحة</div>
  }

  if (session?.user.role !== 'ADMIN') {
    return <div className="container mx-auto px-4 py-8">غير مصرح لك بالوصول إلى هذه الصفحة</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">إدارة الأكاديميات</h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <h2 className="text-2xl font-bold mb-4">إضافة أكاديمية جديدة</h2>
        <div className="mb-4">
          <label htmlFor="name" className="block mb-2">اسم الأكاديمية</label>
          <input
            type="text"
            id="name"
            name="name"
            value={newAcademy.name}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block mb-2">البريد الإلكتروني</label>
          <input
            type="email"
            id="email"
            name="email"
            value={newAcademy.email}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block mb-2">كلمة المرور</label>
          <input
            type="password"
            id="password"
            name="password"
            value={newAcademy.password}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="trialPeriodDays" className="block mb-2">فترة التجربة (بالأيام)</label>
          <input
            type="number"
            id="trialPeriodDays"
            name="trialPeriodDays"
            value={newAcademy.trialPeriodDays}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">إضافة الأكاديمية</button>
      </form>

      <h2 className="text-2xl font-bold mb-4">قائمة الأكاديميات</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">الاسم</th>
              <th className="border p-2">البريد الإلكتروني</th>
              <th className="border p-2">نهاية فترة التجربة</th>
              <th className="border p-2">الحالة</th>
              <th className="border p-2">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {academies.map((academy) => (
              <tr key={academy.id}>
                <td className="border p-2">{academy.name}</td>
                <td className="border p-2">{academy.users[0]?.email}</td>
                <td className="border p-2">
                  {academy.trial_end_date 
                    ? new Date(academy.trial_end_date).toLocaleDateString('ar-EG')
                    : 'غير محدد'}
                </td>
                <td className="border p-2">{academy.status}</td>
                <td className="border p-2">
                  <select
                    value={academy.status}
                    onChange={(e) => handleStatusChange(academy.id, e.target.value as 'active' | 'suspended' | 'deleted')}
                    className="mr-2"
                  >
                    <option value="active">نشط</option>
                    <option value="suspended">موقوف</option>
                    <option value="deleted">محذوف</option>
                  </select>
                  <button
                    onClick={() => setEditingAcademy(academy)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(academy.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingAcademy && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">تعديل الأكاديمية</h3>
            <form onSubmit={handleEdit}>
              <div className="mb-4">
                <label htmlFor="edit-name" className="block mb-2">اسم الأكاديمية</label>
                <input
                  type="text"
                  id="edit-name"
                  name="name"
                  value={editingAcademy.name}
                  onChange={handleEditInputChange}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="edit-email" className="block mb-2">البريد الإلكتروني</label>
                <input
                  type="email"
                  id="edit-email"
                  name="email"
                  value={editingAcademy.users[0]?.email}
                  onChange={handleEditInputChange}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="edit-password" className="block mb-2">كلمة المرور الجديدة (اتركها فارغة إذا لم ترغب في تغييرها)</label>
                <input
                  type="password"
                  id="edit-password"
                  name="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="edit-trial-end-date" className="block mb-2">تاريخ انتهاء فترة التجربة</label>
                <input
                  type="date"
                  id="edit-trial-end-date"
                  name="trial_end_date"
                  value={editingAcademy.trial_end_date ? editingAcademy.trial_end_date.split('T')[0] : ''}
                  onChange={handleEditInputChange}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="flex justify-end">
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded mr-2">حفظ التغييرات</button>
                <button type="button" onClick={() => setEditingAcademy(null)} className="bg-gray-300 text-black px-4 py-2 rounded">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

