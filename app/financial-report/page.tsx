'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Player, Expense, CoachSalary, Coach, RevenueItem } from '../../types'
import { supabase } from '../../lib/supabase'
import ExpenseForm from '../../components/ExpenseForm'
import PaymentWarnings from '../../components/PaymentWarnings'
import EditPlayerModal from '../../components/EditPlayerModal'
import SearchInput from '../../components/SearchInput'
import { format } from 'date-fns'
import { exportToPDF } from '../../utils/pdfExport'
import { exportToExcel } from '../../utils/excelExport';

export default function FinancialReport() {
  const [players, setPlayers] = useState<Player[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const { data: session, status } = useSession()
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [coachSalaries, setCoachSalaries] = useState<CoachSalary[]>([])
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [revenueItems, setRevenueItems] = useState<RevenueItem[]>([])

  const handleDeletePlayer = async (playerId: string) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا اللاعب؟')) {
      try {
        const response = await fetch(`/api/players/${playerId}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error('Failed to delete player')
        }

        setPlayers(players.filter(player => player.id !== playerId))
        alert('تم حذف اللاعب بنجاح')
      } catch (error) {
        console.error('Error deleting player:', error)
        alert('حدث خطأ أثناء حذف اللاعب')
      }
    }
  }

  useEffect(() => {
    if (status === "authenticated" && session.user.academyId) {
      fetchPlayers()
      fetchExpenses()
      fetchCoachSalaries()
      fetchRevenueItems()
    }
  }, [status, session, selectedYear])

  const fetchPlayers = async () => {
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
      .eq('academyId', session?.user.academyId)

    if (error) {
      console.error('Error fetching players:', error)
      alert('حدث خطأ أثناء جلب بيانات اللاعبين')
    } else {
      setPlayers(data || [])
    }
  }

  const fetchExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('academyId', session?.user.academyId)
        .gte('date', `${selectedYear}-01-01`)
        .lte('date', `${selectedYear}-12-31`)

      if (error) {
        throw error
      }

      setExpenses(data || [])
    } catch (error) {
      console.error('Error fetching expenses:', error)
      setExpenses([])
    }
  }

  const fetchCoachSalaries = async () => {
    try {
      const response = await fetch('/api/coaches/salaries')
      if (!response.ok) {
        throw new Error('Failed to fetch coach salaries')
      }
      const data = await response.json()
      setCoachSalaries(data || [])

      const { data: coachesData, error: coachesError } = await supabase
        .from('coaches')
        .select('id, name')
        .eq('academyId', session?.user.academyId)

      if (coachesError) {
        throw coachesError
      }

      setCoaches(coachesData || [])
    } catch (error) {
      console.error('Error fetching coach salaries and coaches:', error)
      setCoachSalaries([])
      setCoaches([])
    }
  }

  const fetchRevenueItems = async () => {
    try {
      const { data, error } = await supabase
        .from('revenue_items')
        .select('*')
        .eq('academyId', session?.user.academyId)
        .order('date', { ascending: false })

      if (error) throw error
      setRevenueItems(data || [])
    } catch (error) {
      console.error('Error fetching revenue items:', error)
      setRevenueItems([])
    }
  }

  const calculateMonthsDue = (player: Player) => {
    const startDate = new Date(player.created_at)
    const today = new Date()
    const monthsDiff = (today.getFullYear() - startDate.getFullYear()) * 12 + today.getMonth() - startDate.getMonth()
    return Math.max(0, monthsDiff + 1) // +1 to include the current month
  }

  const calculatePlayerFinances = (player: Player) => {
    const monthsDue = calculateMonthsDue(player)
    const totalDue = player.subscription === 'monthly' 
      ? player.subscriptionPrice * monthsDue 
      : (player.subscriptionPrice / 12) * monthsDue
    
    let remainingDue = totalDue
    let paidMonths = 0
    
    // Sort payments by date
    const sortedPayments = [...player.payments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    for (const payment of sortedPayments) {
      if (remainingDue > 0) {
        remainingDue -= payment.amount
        paidMonths = Math.floor((totalDue - remainingDue) / player.subscriptionPrice)
      }
    }
    
    return {
      monthsDue,
      paidMonths,
      totalDue,
      totalPaid: totalDue - remainingDue,
      remainingDue: Math.max(0, remainingDue),
    }
  }

  const calculateTotalExpenses = () => {
    const regularExpenses = expenses.reduce((total, expense) => total + expense.amount, 0)
    const coachSalariesTotal = coachSalaries.reduce((total, salary) => total + salary.amount, 0)
    return regularExpenses + coachSalariesTotal
  }

  const addExpense = async (newExpense: Omit<Expense, 'id' | 'academyId'>) => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert([{ ...newExpense, academyId: session?.user.academyId }])
        .select()

      if (error) {
        throw error
      }

      if (data) {
        setExpenses([...expenses, data[0]])
      }
    } catch (error) {
      console.error('Error adding expense:', error)
      alert('حدث خطأ أثناء إضافة النفقة')
    }
  }

  const handleDeleteExpense = async (expenseId: number) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذه النفقة؟')) {
      try {
        const { error } = await supabase
          .from('expenses')
          .delete()
          .eq('id', expenseId)

        if (error) throw error

        setExpenses(expenses.filter(expense => expense.id !== expenseId))
        alert('تم حذف النفقة بنجاح')
      } catch (error) {
        console.error('Error deleting expense:', error)
        alert('حدث خطأ أثناء حذف النفقة')
      }
    }
  }


  const handleExportPDF = () => {
    if (typeof window !== 'undefined') {
      import('../../utils/pdfExport').then(module => {
        module.exportToPDF(players, expenses, coachSalaries, selectedYear);
      });
    }
  };

  const handleExportToExcel = () => {
    exportToExcel(players, expenses, coachSalaries, selectedYear);
  };

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player)
  }

  const handleUpdatePlayer = (updatedPlayer: Player) => {
    setPlayers(players.map(p => p.id === updatedPlayer.id ? updatedPlayer : p))
    setEditingPlayer(null)
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy')
  }

  if (status === "loading") {
    return <div>جاري التحميل...</div>
  }

  if (status === "unauthenticated") {
    return <div>يرجى تسجيل الدخول لعرض التقرير المالي</div>
  }

  const totalIncome = players.reduce((total, player) => {
    const { totalPaid } = calculatePlayerFinances(player)
    return total + totalPaid
  }, 0) + revenueItems.reduce((total, item) => total + item.profit, 0)
  const totalExpenses = calculateTotalExpenses()
  const netIncome = totalIncome - totalExpenses

  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.sport.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.division.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredExpenses = expenses.filter(expense =>
    expense.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">التقرير المالي</h1>

      <div className="mb-4">
        <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">اختر السنة:</label>
        <select
          id="year"
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          {[...Array(10)].map((_, i) => (
            <option key={i} value={new Date().getFullYear() - i}>
              {new Date().getFullYear() - i}
            </option>
          ))}
        </select>
      </div>

      <SearchInput
        placeholder="ابحث عن لاعب أو نفقة..."
        value={searchTerm}
        onChange={setSearchTerm}
      />

      <div className="bg-gray-100 p-6 rounded-lg shadow-inner mb-8">
        <h2 className="text-xl font-bold mb-4">ملخص مالي لعام {selectedYear}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-lg font-semibold">إجمالي الدخل</p>
            <p className="text-2xl font-bold text-green-600">{totalIncome.toFixed(2)} شيكل</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-lg font-semibold">إجمالي النفقات</p>
            <p className="text-2xl font-bold text-red-600">{totalExpenses.toFixed(2)} شيكل</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-lg font-semibold">صافي الدخل</p>
            <p className="text-2xl font-bold text-blue-600">{netIncome.toFixed(2)} شيكل</p>
          </div>
        </div>
        <button
          onClick={handleExportPDF}
          className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          تصدير التقرير (PDF)
        </button>
        <button
          onClick={handleExportToExcel}
          className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
        >
          تصدير التقرير (Excel)
        </button>
      </div>

      <PaymentWarnings players={players} />

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">تفاصيل الدخل</h2>
        {filteredPlayers.length === 0 ? (
          <p className="text-center text-gray-600">لا يوجد لاعبين مطابقين لعملية البحث</p>
        ) : (
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-right">اسم اللاعب</th>
                <th className="py-3 px-6 text-right">تاريخ التسجيل</th>
                <th className="py-3 px-6 text-right">الأشهر المستحقة</th>
                <th className="py-3 px-6 text-right">الأشهر المدفوعة</th>
                <th className="py-3 px-6 text-right">المبلغ المستحق</th>
                <th className="py-3 px-6 text-right">إجمالي المدفوعات</th>
                <th className="py-3 px-6 text-right">المبلغ المتبقي</th>
                <th className="py-3 px-6 text-right">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {filteredPlayers.map((player) => {
                const { monthsDue, paidMonths, totalDue, totalPaid, remainingDue } = calculatePlayerFinances(player)

                return (
                  <tr key={player.id} className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-6 text-right">{player.name}</td>
                    <td className="py-3 px-6 text-right">{formatDate(player.created_at)}</td>
                    <td className="py-3 px-6 text-right">{monthsDue}</td>
                    <td className="py-3 px-6 text-right">{paidMonths}</td>
                    <td className="py-3 px-6 text-right">{totalDue.toFixed(2)} شيكل</td>
                    <td className="py-3 px-6 text-right">{totalPaid.toFixed(2)} شيكل</td>
                    <td className="py-3 px-6 text-right">{remainingDue.toFixed(2)} شيكل</td>
                    <td className="py-3 px-6 text-right">
                      <button
                        onClick={() => handleDeletePlayer(player.id)}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs mr-2"
                      >
                        حذف اللاعب
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">إدارة النفقات</h2>
        <ExpenseForm onAddExpense={addExpense} />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">تفاصيل النفقات</h2>
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-right">الوصف</th>
              <th className="py-3 px-6 text-right">المبلغ</th>
              <th className="py-3 px-6 text-right">التاريخ</th>
              <th className="py-3 px-6 text-right">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {filteredExpenses.length > 0 ? (
              filteredExpenses.map((expense) => (
                <tr key={expense.id} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-3 px-6 text-right">{expense.description}</td>
                  <td className="py-3 px-6 text-right">{expense.amount} شيكل</td>
                  <td className="py-3 px-6 text-right">{formatDate(expense.date)}</td>
                  <td className="py-3 px-6 text-right">
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-3 px-6 text-center">لا توجد نفقات مطابقة لعملية البحث</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">رواتب المدربين</h2>
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-right">المدرب</th>
              <th className="py-3 px-6 text-right">المبلغ</th>
              <th className="py-3 px-6 text-right">تاريخ الدفع</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {coachSalaries.map((salary) => {
              const coach = coaches.find(c => c.id === salary.coach_id)
              return (
                <tr key={salary.id} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-3 px-6 text-right">{coach ? coach.name : 'غير معروف'}</td>
                  <td className="py-3 px-6 text-right">{salary.amount} شيكل</td>
                  <td className="py-3 px-6 text-right">{formatDate(salary.payment_date)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">الإيرادات</h2>
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-right">اسم العنصر</th>
              <th className="py-3 px-6 text-right">سعر التكلفة</th>
              <th className="py-3 px-6 text-right">سعر البيع</th>
              <th className="py-3 px-6 text-right">الربح</th>
              <th className="py-3 px-6 text-right">التاريخ</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {revenueItems.map((item) => (
              <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6 text-right">{item.name}</td>
                <td className="py-3 px-6 text-right">{item.costPrice.toFixed(2)} شيكل</td>
                <td className="py-3 px-6 text-right">{item.sellingPrice.toFixed(2)} شيكل</td>
                <td className="py-3 px-6 text-right">{item.profit.toFixed(2)} شيكل</td>
                <td className="py-3 px-6 text-right">{new Date(item.date).toLocaleDateString('ar-EG')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editingPlayer && (
        <EditPlayerModal
          player={editingPlayer}
          onClose={() => setEditingPlayer(null)}
          onUpdate={handleUpdatePlayer}
        />
      )}
    </div>
  )
}

