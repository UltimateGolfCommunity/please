import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')
    
    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const { data: achievements, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', user_id)
      .order('last_updated', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch achievements' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      achievements: achievements || [] 
    })

  } catch (error) {
    console.error('Error fetching achievements:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    const { user_id, achievement_type, value } = await request.json()
    
    if (!user_id || !achievement_type || value === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Use the update_achievement function to update achievements and potentially award badges
    const { data, error } = await supabase
      .rpc('update_achievement', {
        user_id_param: user_id,
        achievement_type_param: achievement_type,
        value_param: value
      })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update achievement' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Achievement updated successfully' 
    })

  } catch (error) {
    console.error('Error updating achievement:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
