import { formatDistanceToNow, parseISO } from 'date-fns'
import { ar } from 'date-fns/locale'

interface Player {
  id: number
  name: string
  age: number
  sport: string
  subscription: string
  subscriptionPrice: number
  startDate: string
  payments: Payment[]
  isActive: boolean
}

interface Payment {
  id: number
  amount: number
  date: string
}

interface PlayerDetailsProps {
  player: Player
  onDelete: (id: number) => void
  onToggleActive: (id: number) => void
}

export default function PlayerDetails({ player, onDelete, onToggleActive }: PlayerDetailsProps) {
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
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{player.name}</h2>
        <div>
          <button
            onClick={() => onToggleActive(player.id)}
            className={`mr-2 px-4 py-2 rounded ${
              player.isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
            } text-white`}
          >
            {player.isActive ? 'إيقاف' : 'تفعيل'}
          </button>
          <button
            onClick={() => onDelete(player.id)}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
          >
            حذف
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p><strong>العمر:</strong> {player.age}</p>
          <p><strong>الرياضة:</strong> {player.sport}</p>
          <p><strong>نوع الاشتراك:</strong> {player.subscription}</p>
          <p><strong>الحالة:</strong> {player.isActive ? 'نشط' : 'موقوف'}</p>
        </div>
        <div>
          <p><strong>سعر الاشتراك:</strong> {player.subscriptionPrice}</p>
          <p><strong>تاريخ البدء:</strong> {player.startDate}</p>
          <p><strong>المتبقي (الوقت):</strong> {calculateRemainingTime(player.startDate, player.subscription)}</p>
        </div>
      </div>
      <div className="mt-6">
        <h3 className="text-xl font-bold mb-2">ملخص الدفعات</h3>
        <p><strong>إجمالي سعر الاشتراك:</strong> {player.subscriptionPrice}</p>
        <p><strong>إجمالي المدفوع:</strong> {calculateTotalPaid(player.payments)}</p>
        <p><strong>المبلغ المتبقي:</strong> {calculateRemainingAmount(player.subscriptionPrice, player.payments)}</p>
      </div>
      <div className="mt-6">
        <h3 className="text-xl font-bold mb-2">قائمة الدفعات</h3>
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-right">التاريخ</th>
              <th className="py-3 px-6 text-right">المبلغ</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {player.payments.map((payment) => (
              <tr key={payment.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6 text-right">{payment.date}</td>
                <td className="py-3 px-6 text-right">{payment.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

