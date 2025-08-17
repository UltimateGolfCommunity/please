import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { course, date, time, maxPlayers, handicap, description } = await request.json()
    
    if (!course || !date || !time || !maxPlayers) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get the current user from the request
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Extract user ID from auth header (you might need to adjust this based on your auth setup)
    const user_id = authHeader.replace('Bearer ', '')

    // Insert tee time into database
    const { data, error } = await supabase
      .from('tee_times')
      .insert({
        course_name: course,
        tee_time_date: date,
        tee_time_time: time,
        max_players: maxPlayers,
        current_players: 1, // Creator is the first player
        available_spots: maxPlayers - 1,
        handicap_requirement: handicap || 'Any level',
        description: description || '',
        creator_id: user_id,
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create tee time' },
        { status: 500 }
      )
    }

    // Add creator as first member
    await supabase
      .from('tee_time_applications')
      .insert({
        tee_time_id: data.id,
        applicant_id: user_id,
        status: 'approved'
      })

    return NextResponse.json({ 
      success: true, 
      tee_time: data 
    })

  } catch (error) {
    console.error('Error creating tee time:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const course = searchParams.get('course')
    const date = searchParams.get('date')
    const status = searchParams.get('status') || 'active'

    let query = supabase
      .from('tee_times')
      .select(`
        *,
        creator:user_profiles!creator_id(*)
      `)
      .eq('status', status)

    if (course) {
      query = query.ilike('course_name', `%${course}%`)
    }

    if (date) {
      query = query.gte('tee_time_date', date)
    }

    const { data, error } = await query
      .order('tee_time_date', { ascending: true })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch tee times' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      tee_times: data || [] 
    })

  } catch (error) {
    console.error('Error fetching tee times:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
