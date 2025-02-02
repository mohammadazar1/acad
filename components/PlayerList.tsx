'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { ar } from 'date-fns/locale'
import Link from 'next/link'

interface Player {
  id: number
  name: string
  age: number
  sport: string
  subscription: string
  subscriptionPrice: number
  startDate: string
  payments: Payment[]
}

interface Payment {
  id: number
  amount: number
  date: string
}

export default function PlayerList() {
  const [players, setPlayers] = useState<Player[]>([])

  useEffect(() => {
    // هنا يمكنك استبدال هذا بطلب API حقيقي لجلب البيانات من الخادم
    const mockPlayers: Player[] = [
      {
        id: 1,
        name: 'أحمد محمد',
        age: 18,
        sport: 'كرة القدم',
        subscription: 'شهري',
        subscriptionPrice: 100,
        startDate: '2023-05-01',
        payments: [
          { id: 1, amount: 50, date: '2023-05-01' },
          { id: 2, amount: 30, date: '2023-06-01' },
        ],
      },
      {
        id: 2,
        name: 'سارة أحمد',
        age: 20,
        sport: 'السباحة',
        subscription: 'سنوي',
        subscriptionPrice: 1000,
        startDate: '2023-01-01',
        payments: [
          { id: 3, amount: 500, date: '2023-01-01' },
        ],
      },
    ]
    setPlayers(mockPlayers)
  }, [])

  const calculateRemainingTime = (startDate: string, subscription: string) => {
    const start = parseISO(startDate)
    let end
    switch (subscription) {
      case 'monthly':
        end = new Date(start.getFullYear(), start.getMonth() + 1, start.getDate())
        break
      case 'quarterly':
        end = new Date(start.getFullYear(), start.getMonth() + 3, start.getDate())
        break
      case 'yearly':
        end = new Date(start.getFullYear() + 1, start.getMonth(), start.getDate())
        break
      default:
        end = start
    }
    return formatDistanceToNow(end, { addSuffix: true, locale: ar })
  }

  const calculateTotalPaid = (payments: Payment[]) => {
    return payments.reduce((total, payment) => total + payment.amount, 0)
  }

  const calculateRemainingAmount = (subscriptionPrice: number, payments: Payment[]) => {
    const totalPaid = calculateTotalPaid(payments)
    return Math.max(subscriptionPrice - totalPaid, 0)
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
            <th className="py-3 px-6 text-right">السعر</th>
            <th className="py-3 px-6 text-right">المدفوع</th>
            <th className="py-3 px-6 text-right">المتبقي (المبلغ)</th>
            <th className="py-3 px-6 text-right">المتبقي (الوقت)</th>
            <th className="py-3 px-6 text-right">الإجراءات</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm font-light">
          {players.map((player) => (
            <tr key={player.id} className="border-b border-gray-200 hover:bg-gray-100">
              <td className="py-3 px-6 text-right whitespace-nowrap">{player.name}</td>
              <td className="py-3 px-6 text-right">{player.age}</td>
              <td className="py-3 px-6 text-right">{player.sport}</td>
              <td className="py-3 px-6 text-right">{player.subscription}</td>
              <td className="py-3 px-6 text-right">{player.subscriptionPrice}</td>
              <td className="py-3 px-6 text-right">{calculateTotalPaid(player.payments)}</td>
              <td className="py-3 px-6 text-right">{calculateRemainingAmount(player.subscriptionPrice, player.payments)}</td>
              <td className="py-3 px-6 text-right">{calculateRemainingTime(player.startDate, player.subscription)}</td>
              <td className="py-3 px-6 text-right">
                <Link href={`/player/${player.id}`} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  إضافة دفعة
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

