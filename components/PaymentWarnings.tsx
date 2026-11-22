import { Player } from '../types'
import { calculatePlayerFinances } from '../utils/subscriptionCalculator'

interface PaymentWarningsProps {
  players: Player[]
}

export default function PaymentWarnings({ players }: PaymentWarningsProps) {
  const warningPlayers = players.filter((player) => {
    if (player.attendanceSubscriptionEnabled) {
      return (player.attendanceSessionsUsed ?? 0) >= (player.attendanceSubscriptionDays ?? 5)
    }

    const { remainingDue } = calculatePlayerFinances(player)
    return remainingDue > 0
  })

  if (warningPlayers.length === 0) return null;

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-8" role="alert">
      <p className="font-bold mb-2">تنبيه: اشتراكات تحتاج إلى تجديد أو لديها مبالغ مستحقة</p>
      <ul className="list-disc list-inside">
        {warningPlayers.map((player) => {
          const { monthsDue, paidMonths, totalPaid, remainingDue } = calculatePlayerFinances(player)
          const unpaidPeriods = monthsDue - paidMonths

          return (
            <li key={player.id} className="mb-2">
              <span className="font-semibold">{player.name}</span>
              <ul className="list-disc list-inside ml-4">
                {player.attendanceSubscriptionEnabled ? (
                  <>
                    <li>
                      مرات تسجيل الحضور: {player.attendanceSessionsUsed ?? 0} من {player.attendanceSubscriptionDays ?? 5}
                    </li>
                    <li>حان موعد تجديد الاشتراك بعد اكتمال العدد المحدد.</li>
                    {remainingDue > 0 && <li>المبلغ المستحق: {remainingDue.toFixed(2)} شيكل</li>}
                  </>
                ) : (
                  <>
                    <li>عدد الفترات غير المدفوعة: {unpaidPeriods}</li>
                    <li>المبلغ المدفوع: {totalPaid.toFixed(2)} شيكل</li>
                    <li>المبلغ المتبقي: {remainingDue.toFixed(2)} شيكل</li>
                  </>
                )}
              </ul>
            </li>
          )
        })}
      </ul>
    </div>
  );
}

