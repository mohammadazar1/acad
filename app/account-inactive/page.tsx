'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AccountInactive() {
  const { data: session } = useSession()
  const [academyStatus, setAcademyStatus] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAcademyStatus() {
      if (session?.user?.academyId) {
        const { data, error } = await supabase
          .from('academies')
          .select('status')
          .eq('id', session.user.academyId)
          .single()

        if (error) {
          console.error('Error fetching academy status:', error)
          return
        }

        setAcademyStatus(data.status)
      }
    }

    fetchAcademyStatus()
  }, [session])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">حساب الأكاديمية غير نشط</h1>
      <p className="mb-4">
        {academyStatus === 'suspended'
          ? 'تم تعليق حساب الأكاديمية الخاص بك. يرجى الاتصال بالدعم لمزيد من المعلومات.'
          : 'تم حذف حساب الأكاديمية الخاص بك. يرجى الاتصال بالدعم إذا كنت تعتقد أن هذا خطأ.'}
      </p>
      <p>
        إذا كانت لديك أي أسئلة، يرجى الاتصال بفريق الدعم على{' '}
        <a href="mailto:support@example.com" className="text-blue-500 hover:underline">
          support@example.com
        </a>
        .
      </p>
    </div>
  )
}

