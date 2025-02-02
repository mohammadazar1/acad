import { getServerSession } from 'next-auth/next'
import { authOptions } from '../app/api/auth/[...nextauth]/route'
import { NextResponse } from 'next/server'
import { supabase } from './supabase'

export async function checkAcademyStatus(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (session.user.role === 'ACADEMY') {
    // Fetch the latest academy status from the database
    const { data: academy, error } = await supabase
      .from('academies')
      .select('status')
      .eq('id', session.user.academyId)
      .single()

    if (error) {
      console.error('Error fetching academy status:', error)
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }

    if (academy.status === 'suspended') {
      return NextResponse.json({ error: 'Academy account is suspended' }, { status: 403 })
    }
    if (academy.status === 'deleted') {
      return NextResponse.json({ error: 'Academy account is deleted' }, { status: 403 })
    }
  }

  return null // No error, continue with the request
}

