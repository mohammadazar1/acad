'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import Image from 'next/image'

export default function AcademySettings() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [academyName, setAcademyName] = useState('')
  const [attendanceSubscriptionEnabled, setAttendanceSubscriptionEnabled] = useState(false)
  const [attendanceSubscriptionDays, setAttendanceSubscriptionDays] = useState(5)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [logo, setLogo] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [currentLogo, setCurrentLogo] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session.user.role !== 'ACADEMY') {
      router.push('/')
    } else if (status === 'authenticated' && session.user.role === 'ACADEMY') {
      fetchAcademyDetails()
    }
  }, [status, session, router])

  const fetchAcademyDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('academies')
        .select('name, logo_url, attendance_subscription_enabled, attendance_subscription_days')
        .eq('id', session?.user.academyId)
        .single()

      if (error) throw error
      setAcademyName(data.name)
      setCurrentLogo(data.logo_url)
      setAttendanceSubscriptionEnabled(Boolean(data.attendance_subscription_enabled))
      setAttendanceSubscriptionDays(data.attendance_subscription_days ?? 5)
    } catch (error) {
      console.error('Error fetching academy details:', error)
      setError('فشل في جلب تفاصيل الأكاديمية')
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setLogo(file)
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword && newPassword !== confirmPassword) {
      setError('كلمات المرور غير متطابقة')
      return
    }

    try {
      const updates: {
        name?: string
        password?: string
        logo_url?: string
        attendance_subscription_enabled: boolean
        attendance_subscription_days: number
      } = {
        attendance_subscription_enabled: attendanceSubscriptionEnabled,
        attendance_subscription_days: attendanceSubscriptionDays,
      }
      if (academyName) updates.name = academyName
      if (newPassword) updates.password = newPassword

      if (logo) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('academy-logos')
          .upload(`${session?.user.academyId}/${logo.name}`, logo)

        if (uploadError) throw uploadError

        const { data: publicUrlData } = supabase.storage
          .from('academy-logos')
          .getPublicUrl(`${session?.user.academyId}/${logo.name}`)

        updates.logo_url = publicUrlData.publicUrl
      }

      const response = await fetch('/api/academy/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'حدث خطأ أثناء تحديث البيانات')
      }

      setSuccess('تم تحديث بيانات الأكاديمية بنجاح')
      setNewPassword('')
      setConfirmPassword('')
      fetchAcademyDetails() // Refresh academy details
    } catch (error) {
      console.error('Error updating academy details:', error)
      setError(error instanceof Error ? error.message : 'فشل في تحديث بيانات الأكاديمية')
    }
  }

  const logoSource = logoPreview ?? currentLogo

  if (status === 'loading') {
    return <div className="container mx-auto px-4 py-8">جاري التحميل...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">إعدادات الأكاديمية</h1>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        {error && <p className="text-red-500 mb-4" role="alert">{error}</p>}
        {success && <p className="text-green-500 mb-4" role="status">{success}</p>}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="academyName">
            اسم الأكاديمية
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="academyName"
            type="text"
            value={academyName}
            onChange={(e) => setAcademyName(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="logo">
            شعار الأكاديمية
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="logo"
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
          />
        </div>
        {logoSource && (
          <div className="mb-4">
            <Image
              src={logoSource}
              alt="شعار الأكاديمية"
              width={100}
              height={100}
              className="rounded-full"
            />
          </div>
        )}
        <section className="mb-6 border-t border-gray-200 pt-5" aria-labelledby="attendance-subscription-title">
          <h2 id="attendance-subscription-title" className="text-lg font-bold text-gray-800">
            احتساب الاشتراك حسب الحضور
          </h2>
          <p id="attendance-subscription-help" className="mt-1 text-sm text-gray-600">
            تُحسب كل مرة يسجل فيها المدرب حضور الشعبة، حتى إذا كان اللاعب غائبًا.
          </p>
          <label htmlFor="attendanceSubscriptionEnabled" className="mt-4 flex items-center gap-3 text-sm font-medium text-gray-700">
            <input
              id="attendanceSubscriptionEnabled"
              type="checkbox"
              checked={attendanceSubscriptionEnabled}
              onChange={(event) => setAttendanceSubscriptionEnabled(event.target.checked)}
              aria-describedby="attendance-subscription-help"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            تفعيل الاشتراك بعدد مرات تسجيل الحضور
          </label>
          <div className="mt-4">
            <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="attendanceSubscriptionDays">
              عدد مرات تسجيل الحضور لكل اشتراك
            </label>
            <input
              id="attendanceSubscriptionDays"
              type="number"
              min={1}
              max={365}
              step={1}
              value={attendanceSubscriptionDays}
              onChange={(event) => {
                const value = Number(event.target.value)
                if (Number.isInteger(value) && value >= 1 && value <= 365) {
                  setAttendanceSubscriptionDays(value)
                }
              }}
              disabled={!attendanceSubscriptionEnabled}
              required={attendanceSubscriptionEnabled}
              className="w-full rounded border border-gray-300 px-3 py-2 text-gray-700 disabled:cursor-not-allowed disabled:bg-gray-100"
            />
            <p className="mt-1 text-xs text-gray-500">اختر عددًا بين 1 و365.</p>
          </div>
        </section>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newPassword">
            كلمة المرور الجديدة (اتركها فارغة إذا لم ترغب في تغييرها)
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
            تأكيد كلمة المرور الجديدة
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            حفظ التغييرات
          </button>
        </div>
      </form>
    </div>
  )
}

