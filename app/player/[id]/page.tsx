'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Player, Payment } from '../../../types'
import { exportPlayerReport, exportPlayerReportToExcel } from '../../../utils/pdfExport'
import { calculateSubscriptionPeriods, calculatePlayerFinances } from '../../../utils/subscriptionCalculator'
import { supabase } from '../../../lib/supabase'
import EditPlayerModal from '../../../components/EditPlayerModal'
import Navbar from '../../../components/Navbar'
import { UserIcon, CalendarIcon, CreditCardIcon, ClipboardListIcon } from 'lucide-react'

export default function PlayerDetails() {
  const params = useParams()
  const [player, setPlayer] = useState<Player | null>(null)
  const [newPayment, setNewPayment] = useState({ amount: '', date: new Date().toISOString().split('T')[0] })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [discountAmount, setDiscountAmount] = useState<number>(0)
  const [discountDate, setDiscountDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const fetchPlayer = async () => {
    if (params.id) {
      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from('players')
          .select(`
            *,
            payments (
              id,
              amount,
              date
            )
          `)
          .eq('id', params.id)
          .single()

        if (error) throw error

        setPlayer(data)
      } catch (error) {
        setError('Error fetching player data. Please try again.')
        console.error('Error:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchPlayer()
  }, [params.id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewPayment(prev => ({ ...prev, [name]: value }))
  }

  const handleAddPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (player) {
      try {
        const { data, error } = await supabase
          .from('payments')
          .insert({
            player_id: player.id,
            amount: parseFloat(newPayment.amount),
            date: newPayment.date,
          })
          .select()

        if (error) throw error

        await fetchPlayer()
        setNewPayment({ amount: '', date: new Date().toISOString().split('T')[0] })
        alert('تمت إضافة الدفعة بنجاح')
      } catch (error) {
        console.error('Error adding payment:', error)
        alert(`فشل في إضافة الدفعة: ${error instanceof Error ? error.message : 'حدث خطأ غير معروف'}`)
      }
    }
  }

  const handleApplyDiscount = async () => {
    if (player) {
      try {
        const response = await fetch(`/api/players/${player.id}/discount`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount: discountAmount, date: discountDate }),
        });

        if (!response.ok) {
          throw new Error('Failed to apply discount');
        }

        const result = await response.json();
        console.log('Discount applied:', result);

        await fetchPlayer();
        alert('تم تطبيق الخصم بنجاح');
        setDiscountAmount(0);
        setDiscountDate(new Date().toISOString().split('T')[0]);
      } catch (error) {
        console.error('Error applying discount:', error);
        alert('فشل في تطبيق الخصم');
      }
    }
  };

  const handleToggleActive = async () => {
    if (player) {
      try {
        const { data, error } = await supabase
          .from('players')
          .update({ isActive: !player.isActive })
          .eq('id', player.id)
          .select()

        if (error) throw error

        setPlayer(data[0])
      } catch (error) {
        console.error('Error updating player status:', error)
        alert('Failed to update player status. Please try again.')
      }
    }
  }

  const handleExportReport = () => {
    if (player && typeof window !== 'undefined') {
      import('../../../utils/pdfExport').then(module => {
        module.exportPlayerReport(player);
      });
    }
  };

  const handleUpdatePlayer = (updatedPlayer: Player) => {
    setPlayer(updatedPlayer);
    setIsEditModalOpen(false);
  };

  const handleDeletePayment = async (paymentId: number) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذه الدفعة؟')) {
      try {
        const response = await fetch(`/api/players/${player.id}/payments/${paymentId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete payment');
        }

        const updatedPlayer = { ...player };
        updatedPlayer.payments = updatedPlayer.payments.filter(payment => payment.id !== paymentId);
        setPlayer(updatedPlayer);
        alert('تم حذف الدفعة بنجاح');
      } catch (error) {
        console.error('Error deleting payment:', error);
        alert('حدث خطأ أثناء حذف الدفعة');
      }
    }
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">جاري تحميل بيانات اللاعب...</div>
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-red-500">{error}</div>
  }

  if (!player) {
    return <div className="container mx-auto px-4 py-8">لم يتم العثور على بيانات اللاعب</div>
  }

  const { monthsDue, paidMonths, totalDue, totalPaid, remainingDue } = calculatePlayerFinances(player);
  const subscriptionPeriods = calculateSubscriptionPeriods(player.created_at, player.subscriptionPrice, player.subscription);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
            <h1 className="text-3xl font-bold">تفاصيل اللاعب</h1>
            <div>
              <button
                onClick={handleToggleActive}
                className={`mr-2 px-4 py-2 rounded ${
                  player.isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                } text-white transition duration-300`}
              >
                {player.isActive ? 'إيقاف' : 'تفعيل'}
              </button>
              <button
                onClick={() => exportPlayerReportToExcel(player)}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition duration-300 mr-2"
              >
                تصدير التقرير (Excel)
              </button>
              <button
                onClick={handleExportReport}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded transition duration-300 mr-2"
              >
                تصدير التقرير (PDF)
              </button>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded transition duration-300"
              >
                تعديل البيانات
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <UserIcon className="mr-2" /> معلومات اللاعب
                </h2>
                <p><strong>الاسم:</strong> {player.name}</p>
                <p><strong>رقم الهاتف:</strong> {player.phoneNumber}</p>
                <p><strong>العمر:</strong> {player.age}</p>
                <p><strong>الرياضة:</strong> {player.sport}</p>
                <p><strong>الشعبة:</strong> {player.division}</p>
                <p><strong>نوع الاشتراك:</strong> {player.subscription === 'monthly' ? 'شهري' : 'سنوي'}</p>
                <p><strong>سعر الاشتراك:</strong> {player.subscriptionPrice} شيكل {player.subscription === 'monthly' ? 'شهرياً' : 'سنوياً'}</p>
                <p><strong>الحالة:</strong> <span className={player.isActive ? 'text-green-600' : 'text-red-600'}>{player.isActive ? 'نشط' : 'موقوف'}</span></p>
                <p><strong>تجديد تلقائي:</strong> {player.autoRenew ? 'نعم' : 'لا'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <CalendarIcon className="mr-2" /> معلومات الاشتراك
                </h2>
                <p><strong>تاريخ التسجيل:</strong> {new Date(player.created_at).toLocaleDateString('ar-EG')}</p>
                <p><strong>الأشهر المستحقة:</strong> {monthsDue}</p>
                <p><strong>الأشهر المدفوعة:</strong> {paidMonths}</p>
                <p><strong>إجمالي المبلغ المستحق:</strong> {totalDue.toFixed(2)} شيكل</p>
                <p><strong>إجمالي المدفوعات:</strong> {totalPaid.toFixed(2)} شيكل</p>
                <p><strong>المبلغ المتبقي:</strong> {remainingDue.toFixed(2)} شيكل</p>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <CreditCardIcon className="mr-2" /> إضافة دفعة جديدة
              </h2>
              <form onSubmit={handleAddPayment} className="bg-white p-4 rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">المبلغ</label>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      value={newPayment.amount}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={newPayment.date}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
                >
                  إضافة الدفعة
                </button>
              </form>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <CreditCardIcon className="mr-2" /> إضافة خصم
              </h2>
              <form onSubmit={(e) => { e.preventDefault(); handleApplyDiscount(); }} className="bg-white p-4 rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="discountAmount" className="block text-sm font-medium text-gray-700 mb-1">مبلغ الخصم</label>
                    <input
                      type="number"
                      id="discountAmount"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(Number(e.target.value))}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="discountDate" className="block text-sm font-medium text-gray-700 mb-1">تاريخ الخصم</label>
                    <input
                      type="date"
                      id="discountDate"
                      value={discountDate}
                      onChange={(e) => setDiscountDate(e.target.value)}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-4 w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded transition duration-300"
                >
                  تطبيق الخصم
                </button>
              </form>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <ClipboardListIcon className="mr-2" /> سجل الدفعات والخصومات
              </h2>
              <div className="bg-white overflow-hidden shadow-md rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المبلغ</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">النوع</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {player.payments && player.payments.length > 0 ? (
                      player.payments.map((payment) => (
                        <tr key={payment.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">{payment.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                            {payment.amount < 0 ? (
                              <span className="text-red-500">{Math.abs(payment.amount)} شيكل</span>
                            ) : (
                              <span>{payment.amount} شيكل</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                            {payment.amount < 0 ? 'خصم' : 'دفعة'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleDeletePayment(payment.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              حذف
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                          لا توجد مدفوعات أو خصومات
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isEditModalOpen && (
        <EditPlayerModal
          player={player}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleUpdatePlayer}
        />
      )}
    </div>
  )
}

