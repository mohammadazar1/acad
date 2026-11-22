'use client'

import { useState } from 'react'
import type { Player } from '../types'
import { Alert, AlertDescription } from './ui/alert'
import { Button } from './ui/button'

type Props = {
  date: string
  division: string
  players: Player[]
  onMarked: (attendance: Record<string, boolean>) => void
}

export default function MarkAllPresentButton({ date, division, players, onMarked }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  async function markAllPresent() {
    if (!date || !division || players.length === 0 || isSubmitting) return

    const allPresent = Object.fromEntries(players.map((player) => [String(player.id), true]))
    setIsSubmitting(true)
    setFeedback(null)

    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, division, attendance: allPresent }),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'تعذّر تسجيل الحضور.')
      }

      onMarked(allPresent)
      setFeedback({
        type: 'success',
        message: `تم تسجيل حضور ${players.length} لاعب في ${division}.`,
      })
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'تعذّر تسجيل الحضور.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={markAllPresent}
        disabled={!date || !division || players.length === 0 || isSubmitting}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? 'جارٍ تسجيل الحضور...' : `تسجيل حضور الشعبة كاملة (${players.length})`}
      </Button>
      {feedback && (
        <Alert
          className="max-w-md"
          variant={feedback.type === 'error' ? 'destructive' : 'default'}
          role={feedback.type === 'error' ? 'alert' : 'status'}
          aria-live="polite"
        >
          <AlertDescription>{feedback.message}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
