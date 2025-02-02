'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Player } from '../types'

export default function PlayerListComponent() {
  const [players, setPlayers] = useState<Player[]>([])
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "authenticated") {
      fetch('/api/players')
        .then(res => {
          if (!res.ok) {
            throw new Error('Failed to fetch players')
          }
          return res.json()
        })
        .then(data => {
          if (Array.isArray(data)) {
            setPlayers(data)
          } else {
            console.error('Received non-array data:', data)
            setPlayers([])
          }
        })
        .catch(error => {
          console.error('Error fetching players:', error)
          setPlayers([])
        })
    }
  }, [status])

  if (status === "loading") {
    return <p>جاري التحميل...</p>
  }

  if (status === "unauthenticated") {
    return <p>يجب تسجيل الدخول لعرض قائمة اللاعبين</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
            <th className="py-3 px-6 text-right">الاسم</th>
            <th className="py-3 px-6 text-right">العمر</th>
            <th className="py-3 px-6 text-right">الرياضة</th>
            <th className="py-3 px-6 text-right">الاشتراك</th>
            <th className="py-3 px-6 text-right">الحالة</th>
            <th className="py-3 px-6 text-right">الإجراءات</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm font-light">
          {players && players.length > 0 ? (
            players.map((player) => (
              <tr key={player.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6 text-right">{player.name}</td>
                <td className="py-3 px-6 text-right">{player.age}</td>
                <td className="py-3 px-6 text-right">{player.sport}</td>
                <td className="py-3 px-6 text-right">{player.subscription}</td>
                <td className="py-3 px-6 text-right">{player.isActive ? 'نشط' : 'غير نشط'}</td>
                <td className="py-3 px-6 text-right">
                  <Link href={`/player/${player.id}`} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    التفاصيل
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <p>لا يوجد لاعبين لعرضهم.</p>
          )}
        </tbody>
      </table>
    </div>
  )
}

