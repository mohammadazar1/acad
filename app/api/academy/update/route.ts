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
    const { name, password, logo_url } = await request.json()
    const updates: { name?: string; logo_url?: string } = {}
    
    if (name) updates.name = name
    if (logo_url) updates.logo_url = logo_url

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

