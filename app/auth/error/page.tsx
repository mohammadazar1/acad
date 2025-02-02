'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthError() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/login')
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            خطأ في المصادقة
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            حدث خطأ أثناء محاولة تسجيل الدخول. سيتم إعادة توجيهك إلى صفحة تسجيل الدخول خلال 3 ثوانٍ.
          </p>
        </div>
      </div>
    </div>
  )
}

