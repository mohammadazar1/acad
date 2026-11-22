'use client'

import { useMemo, useState, type FormEvent } from 'react'
import type { Player } from '../types'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Button } from './ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'

type Feedback = {
  type: 'success' | 'error'
  message: string
} | null

export default function DivisionDiscountForm({ players }: { players: Player[] }) {
  const [division, setDivision] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<Feedback>(null)

  const divisions = useMemo(
    () =>
      Array.from(new Set(players.map((player) => player.division).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b, 'ar'),
      ),
    [players],
  )
  const divisionPlayerCount = players.filter((player) => player.division === division).length

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const discountAmount = Number(amount)
    if (!division || divisionPlayerCount === 0 || !Number.isFinite(discountAmount) || discountAmount <= 0) {
      setFeedback({ type: 'error', message: 'اختر شعبة وأدخل مبلغ خصم صحيحًا.' })
      return
    }

    const confirmed = window.confirm(
      `سيُسجَّل خصم بقيمة ${discountAmount} شيكل لكل لاعب من ${divisionPlayerCount} لاعب في شعبة ${division}. هل تريد المتابعة؟`,
    )
    if (!confirmed) return

    setIsSubmitting(true)
    setFeedback(null)

    try {
      const response = await fetch('/api/divisions/discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ division, amount: discountAmount, date }),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'تعذّر تطبيق الخصم.')
      }

      setFeedback({
        type: 'success',
        message: `تم تطبيق الخصم على ${result.affectedCount} لاعب في شعبة ${division}.`,
      })
      setAmount('')
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'تعذّر تطبيق الخصم.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="mb-8" dir="rtl">
      <CardHeader>
        <CardTitle className="text-xl">خصم جماعي للشعبة</CardTitle>
        <CardDescription>
          يُسجَّل الخصم كحركة مالية منفصلة على كل لاعب في الشعبة المحددة.
        </CardDescription>
      </CardHeader>
      <form id="division-discount-form" onSubmit={handleSubmit}>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="discount-division">الشعبة</Label>
              <select
                id="discount-division"
                value={division}
                onChange={(event) => {
                  setDivision(event.target.value)
                  setFeedback(null)
                }}
                required
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">اختر الشعبة</option>
                {divisions.map((divisionName) => (
                  <option key={divisionName} value={divisionName}>
                    {divisionName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="discount-amount">مبلغ الخصم لكل لاعب (شيكل)</Label>
              <Input
                id="discount-amount"
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="discount-date">تاريخ الخصم</Label>
              <Input
                id="discount-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
      </form>
      <CardFooter className="flex flex-col items-stretch justify-between gap-3 pt-0 sm:flex-row sm:items-center">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {division
            ? `سيُطبَّق الخصم على ${divisionPlayerCount} لاعب في ${division}.`
            : 'اختر الشعبة لمعرفة عدد اللاعبين المستهدفين.'}
        </p>
        <Button
          type="submit"
          form="division-discount-form"
          disabled={isSubmitting || divisionPlayerCount === 0}
        >
          {isSubmitting ? 'جارٍ تطبيق الخصم...' : 'تطبيق الخصم على الشعبة'}
        </Button>
      </CardFooter>
      {feedback && (
        <CardContent className="pt-0">
          <Alert
            variant={feedback.type === 'error' ? 'destructive' : 'default'}
            role={feedback.type === 'error' ? 'alert' : 'status'}
            aria-live="polite"
          >
            <AlertTitle>{feedback.type === 'error' ? 'لم يتم تطبيق الخصم' : 'تم تسجيل الخصم'}</AlertTitle>
            <AlertDescription>{feedback.message}</AlertDescription>
          </Alert>
        </CardContent>
      )}
    </Card>
  )
}
