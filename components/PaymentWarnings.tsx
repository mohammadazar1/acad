import { Player } from '../types'
import { calculatePlayerFinances } from '../utils/subscriptionCalculator'

interface PaymentWarningsProps {
  players: Player[]
}

export default function PaymentWarnings({ players }: PaymentWarningsProps) {
  const warningPlayers = players.filter(player => {
    const { remainingDue } = calculatePlayerFinances(player);
    return remainingDue > 0;
  });

  if (warningPlayers.length === 0) return null;

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-8" role="alert">
      <p className="font-bold mb-2">تنبيه: اللاعبون التاليون لديهم مبالغ مستحقة غير مدفوعة</p>
      <ul className="list-disc list-inside">
        {warningPlayers.map(player => {
          const { monthsDue, paidMonths, totalDue, totalPaid, remainingDue } = calculatePlayerFinances(player);
          const unpaidMonths = monthsDue - paidMonths;
          return (
            <li key={player.id} className="mb-2">
              <span className="font-semibold">{player.name}</span>
              <ul className="list-disc list-inside ml-4">
                <li>عدد الأشهر غير المدفوعة: {unpaidMonths}</li>
                <li>المبلغ المدفوع: {totalPaid.toFixed(2)} شيكل</li>
                <li>المبلغ المتبقي: {remainingDue.toFixed(2)} شيكل</li>
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

