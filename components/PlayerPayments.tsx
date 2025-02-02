import React from 'react'
import { Player, Payment } from '../types'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface PlayerPaymentsProps {
  player: Player
  onUpdate: () => void
}

const PlayerPayments: React.FC<PlayerPaymentsProps> = ({ player, onUpdate }) => {
  const handleDeletePayment = async (paymentId: number) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذه الدفعة؟')) {
      try {
        const response = await fetch(`/api/players/${player.id}/payments/${paymentId}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error('Failed to delete payment')
        }

        alert('تم حذف الدفعة بنجاح')
        onUpdate()
      } catch (error) {
        console.error('Error deleting payment:', error)
        alert('حدث خطأ أثناء حذف الدفعة')
      }
    }
  }

  const sortedPayments = [...player.payments].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <h3 className="text-lg font-bold mb-2">المدفوعات</h3>
      {sortedPayments.length > 0 ? (
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-right">المبلغ</th>
              <th className="py-3 px-6 text-right">التاريخ</th>
              <th className="py-3 px-6 text-right">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {sortedPayments.map((payment: Payment) => (
              <tr key={payment.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6 text-right">{payment.amount} شيكل</td>
                <td className="py-3 px-6 text-right">
                  {format(new Date(payment.date), 'dd/MM/yyyy', { locale: ar })}
                </td>
                <td className="py-3 px-6 text-right">
                  <button
                    onClick={() => handleDeletePayment(payment.id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
                  >
                    حذف الدفعة
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>لا توجد مدفوعات لهذا اللاعب</p>
      )}
    </div>
  )
}

export default PlayerPayments

