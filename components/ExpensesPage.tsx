'use client'

import { useState, useEffect } from 'react'

interface Expense {
  id: number
  description: string
  amount: number
  date: string
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', date: '' })

  useEffect(() => {
    // In a real application, you would fetch expenses from an API
    const mockExpenses: Expense[] = [
      { id: 1, description: 'إيجار الصالة', amount: 1000, date: '2023-05-01' },
      { id: 2, description: 'معدات رياضية', amount: 500, date: '2023-05-15' },
    ]
    setExpenses(mockExpenses)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewExpense(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const expense: Expense = {
      id: Date.now(),
      description: newExpense.description,
      amount: parseFloat(newExpense.amount),
      date: newExpense.date,
    }
    setExpenses([...expenses, expense])
    setNewExpense({ description: '', amount: '', date: '' })
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">وصف المصروف</label>
          <input
            type="text"
            id="description"
            name="description"
            value={newExpense.description}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="amount" className="block text-gray-700 text-sm font-bold mb-2">المبلغ</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={newExpense.amount}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="date" className="block text-gray-700 text-sm font-bold mb-2">التاريخ</label>
          <input
            type="date"
            id="date"
            name="date"
            value={newExpense.date}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          إضافة مصروف
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-right">الوصف</th>
              <th className="py-3 px-6 text-right">المبلغ</th>
              <th className="py-3 px-6 text-right">التاريخ</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {expenses.map((expense) => (
              <tr key={expense.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6 text-right">{expense.description}</td>
                <td className="py-3 px-6 text-right">{expense.amount} شيكل</td>
                <td className="py-3 px-6 text-right">{expense.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

