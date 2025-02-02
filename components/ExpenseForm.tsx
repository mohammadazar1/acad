'use client'

import { useState } from 'react'
import { Expense } from '../types'

interface ExpenseFormProps {
  onAddExpense: (expense: Omit<Expense, 'id' | 'academyId'>) => void
}

export default function ExpenseForm({ onAddExpense }: ExpenseFormProps) {
  const [expense, setExpense] = useState<Omit<Expense, 'id' | 'academyId'>>({
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onAddExpense(expense)
    setExpense({
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setExpense((prev) => ({ ...prev, [name]: name === 'amount' ? Number(value) : value }))
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">إضافة نفقة جديدة</h3>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
          الوصف
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="description"
          type="text"
          name="description"
          value={expense.description}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amount">
          المبلغ
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="amount"
          type="number"
          name="amount"
          value={expense.amount}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
          التاريخ
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="date"
          type="date"
          name="date"
          value={expense.date}
          onChange={handleChange}
          required
        />
      </div>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        type="submit"
      >
        إضافة النفقة
      </button>
    </form>
  )
}

