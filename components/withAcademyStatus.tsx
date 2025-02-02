import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export function withAcademyStatus<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithAcademyStatus(props: P) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [academyStatus, setAcademyStatus] = useState<string | null>(null)

    useEffect(() => {
      async function checkAcademyStatus() {
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

          if (data.status === 'suspended' || data.status === 'deleted') {
            router.push('/account-inactive')
          }
        }
      }

      if (status === 'authenticated') {
        checkAcademyStatus()
      }
    }, [session, status, router])

    if (status === 'loading' || !academyStatus) {
      return <div>جاري التحميل...</div>
    }

    if (academyStatus === 'suspended' || academyStatus === 'deleted') {
      return null // أو يمكنك عرض رسالة خطأ هنا
    }

    return <WrappedComponent {...props} />
  }
}

