import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'
import { supabase } from '../../../../lib/supabase'
import crypto from 'crypto'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { name, email, password, trialPeriodDays } = await request.json()

    const hashedPassword = await bcrypt.hash(password, 10)

    const academyId = crypto.randomUUID()

    const trialEndDate = new Date()
    trialEndDate.setDate(trialEndDate.getDate() + (trialPeriodDays || 30))

    const { data: academy, error: academyError } = await supabase
      .from('academies')
      .insert({ 
        id: academyId, 
        name, 
        trial_end_date: trialEndDate.toISOString(),
        status: 'active'
      })
      .select()
      .single()

    if (academyError) throw academyError

    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        name,
        email,
        password: hashedPassword,
        role: 'ACADEMY',
        academyId: academyId
      })
      .select()
      .single()

    if (userError) throw userError

    return NextResponse.json({ academy, user }, { status: 201 })
  } catch (error) {
    console.error('Error creating academy:', error)
    return NextResponse.json({ error: 'Failed to create academy' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data: academies, error } = await supabase
      .from('academies')
      .select(`
        *,
        users (
          id,
          name,
          email,
          role
        )
      `)

    if (error) throw error

    return NextResponse.json(academies)
  } catch (error) {
    console.error('Error fetching academies:', error)
    return NextResponse.json({ error: 'Failed to fetch academies' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { id, name, email, password, status, trial_end_date } = await request.json()

    const updates: any = {}
    if (name) updates.name = name
    if (status) updates.status = status
    if (trial_end_date) updates.trial_end_date = trial_end_date

    const { data: academy, error: academyError } = await supabase
      .from('academies')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (academyError) throw academyError

    const userUpdates: any = {}
    if (email) userUpdates.email = email
    if (password) userUpdates.password = await bcrypt.hash(password, 10)

    if (Object.keys(userUpdates).length > 0) {
      const { error: userError } = await supabase
        .from('users')
        .update(userUpdates)
        .eq('academyId', id)
        .eq('role', 'ACADEMY')

      if (userError) throw userError
    }

    return NextResponse.json(academy)
  } catch (error) {
    console.error('Error updating academy:', error)
    return NextResponse.json({ error: 'Failed to update academy' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { id } = await request.json()

    const { error } = await supabase
      .from('academies')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ message: 'Academy deleted successfully' })
  } catch (error) {
    console.error('Error deleting academy:', error)
    return NextResponse.json({ error: 'Failed to delete academy' }, { status: 500 })
  }
}

