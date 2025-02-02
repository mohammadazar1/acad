import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabase } from '../../../lib/supabase'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user.academyId) {
    console.log('Unauthorized access attempt')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('Fetching revenue items for academy:', session.user.academyId)
    const { data, error } = await supabase
      .from('revenue_items')
      .select('*')
      .eq('academyId', session.user.academyId)
      .order('date', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    console.log('Fetched revenue items:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching revenue items:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch revenue items' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user.academyId) {
    console.log('Unauthorized access attempt')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    console.log('Received body:', body)
    const { name, costPrice, sellingPrice, date } = body

    if (!name || !costPrice || !sellingPrice || !date) {
      console.log('Missing required fields')
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const profit = Number(sellingPrice) - Number(costPrice)

    console.log('Inserting new revenue item')
    const { data, error } = await supabase
      .from('revenue_items')
      .insert([
        {
          name,
          costPrice,
          sellingPrice,
          profit,
          date,
          academyId: session.user.academyId,
        }
      ])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    if (!data || data.length === 0) {
      console.log('No data returned from the database')
      throw new Error('No data returned from the database')
    }

    console.log('Inserted revenue item:', data[0])
    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('Error creating revenue item:', error)
    return NextResponse.json({ error: error.message || 'Failed to create revenue item' }, { status: 500 })
  }
}

