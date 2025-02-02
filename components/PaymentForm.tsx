'use client'

import { useState } from 'react'

interface Payment {
  amount: number
  date: string
}

interface PaymentFormProps {
  onAddPayment: (payment: Payment) => void
  subscriptionPrice: number
  totalPaid: number
}

export default function PaymentForm({ onAddPayment, subscriptionPrice, totalPaid }: PaymentFormProps) {
  const remainingAmount = Math.max(subscriptionPrice - totalPaid, 0)
  const [payment, setPayment] = useState<Payment>({
    amount: remainingAmount,
    date: new Date().toISOString().split('T')[0],
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onAddPayment(payment)
    setPayment({ amount: remainingAmount, date: new Date().toISOString().split('T')[0] })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPayment((prev) => ({ ...prev, [name]: name === 'amount' ? Number(value) : value }))
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h3 className="text-xl font-bold mb-4">إضافة دفعة جديدة</h3>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amount">
          المبلغ (المتبقي: {remainingAmount})
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="amount"
          type="number"
          name="amount"
          value={payment.amount}
          onChange={handleChange}
          max={remainingAmount}
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
          value={payment.date}
          onChange={handleChange}
          required
        />
      </div>
      <div className="flex items-center justify-between">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="submit"
        >
          إضافة الدفعة
        </button>
      </div>
    </form>
  )
}

