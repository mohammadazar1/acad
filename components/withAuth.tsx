'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function withAuth<P>(WrappedComponent: React.ComponentType<P>) {
  return function WithAuth(props: P) {
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
      if (status === 'loading') return // انتظر حتى يتم تحميل حالة الجلسة
      if (!session) {
        router.replace('/login')
      }
    }, [session, status, router])

    if (status === 'loading') {
      return <div>جاري التحميل...</div>
    }

    if (!session) {
      return null
    }

    return <WrappedComponent {...props} />
  }
}

