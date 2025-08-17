import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Only create client if environment variables are available
const createSupabaseClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Supabase environment variables not configured')
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    
    const { tee_time_id, user_id } = await request.json()
    
    if (!tee_time_id || !user_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if application already exists
    const { data: existingApplication } = await supabase
      .from('tee_time_applications')
      .select('*')
      .eq('tee_time_id', tee_time_id)
      .eq('applicant_id', user_id)
      .single()

    if (existingApplication) {
      return NextResponse.json(
        { error: 'Application already exists' },
        { status: 400 }
      )
    }

    // Create application
    const { data: application, error } = await supabase
      .from('tee_time_applications')
      .insert({
        tee_time_id,
        applicant_id: user_id,
        status: 'pending',
        message: 'Interested in joining this tee time!'
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create application' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      application,
      message: 'Application submitted successfully' 
    })

  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
