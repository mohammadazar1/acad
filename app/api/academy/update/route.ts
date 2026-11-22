import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabase } from '../../../../lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ACADEMY') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, password, logo_url } = body
    const updates: {
      name?: string
      logo_url?: string
      attendance_subscription_enabled?: boolean
      attendance_subscription_days?: number
    } = {}

    if (name) updates.name = name
    if (logo_url) updates.logo_url = logo_url

    if ('attendance_subscription_enabled' in body || 'attendance_subscription_days' in body) {
      const enabled = body.attendance_subscription_enabled
      const days = body.attendance_subscription_days

      if (typeof enabled !== 'boolean' || !Number.isInteger(days) || days < 1 || days > 365) {
        return NextResponse.json({ error: 'Invalid attendance subscription settings' }, { status: 400 })
      }

      updates.attendance_subscription_enabled = enabled
      updates.attendance_subscription_days = days
    }

    // Update academy details
    const { error: academyError } = await supabase
      .from('academies')
      .update(updates)
      .eq('id', session.user.academyId)

    if (academyError) throw academyError

    // Update password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10)
      const { error: userError } = await supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('academyId', session.user.academyId)
        .eq('role', 'ACADEMY')

      if (userError) throw userError
    }

    return NextResponse.json({ message: 'Academy details updated successfully' })
  } catch (error) {
    console.error('Error updating academy details:', error)
    return NextResponse.json({ error: 'Failed to update academy details' }, { status: 500 })
  }
}

