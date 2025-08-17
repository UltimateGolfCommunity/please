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

    const { data: rounds, error } = await supabase
      .from('golf_rounds')
      .select(`
        *,
        details:golf_round_details(*)
      `)
      .eq('user_id', user_id)
      .order('date_played', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch golf rounds' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      rounds: rounds || [] 
    })

  } catch (error) {
    console.error('Error fetching golf rounds:', error)
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
    
    const { 
      user_id, 
      course_id, 
      course_name, 
      date_played, 
      total_score, 
      par, 
      holes_played, 
      weather_conditions, 
      notes,
      hole_details 
    } = await request.json()
    
    if (!user_id || !course_name || !date_played) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Insert golf round
    const { data: round, error: roundError } = await supabase
      .from('golf_rounds')
      .insert({
        user_id,
        course_id,
        course_name,
        date_played,
        total_score,
        par,
        holes_played,
        weather_conditions,
        notes
      })
      .select()
      .single()

    if (roundError) {
      console.error('Database error creating round:', roundError)
      return NextResponse.json(
        { error: 'Failed to create golf round' },
        { status: 500 }
      )
    }

    // Insert hole details if provided
    if (hole_details && Array.isArray(hole_details)) {
      const holeData = hole_details.map(hole => ({
        round_id: round.id,
        hole_number: hole.hole_number,
        par: hole.par,
        score: hole.score,
        putts: hole.putts,
        fairway_hit: hole.fairway_hit,
        green_in_regulation: hole.green_in_regulation,
        sand_saves: hole.sand_saves || 0
      }))

      const { error: detailsError } = await supabase
        .from('golf_round_details')
        .insert(holeData)

      if (detailsError) {
        console.error('Database error creating hole details:', detailsError)
        // Don't fail the request if hole details fail
      }
    }

    // Update achievements
    try {
      // Count total rounds played
      const { count: totalRounds } = await supabase
        .from('golf_rounds')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user_id)

      // Update rounds played achievement
      await supabase.rpc('update_achievement', {
        user_id_param: user_id,
        achievement_type_param: 'rounds_played',
        value_param: totalRounds || 1
      })

      // Check for special achievements based on round data
      if (hole_details && Array.isArray(hole_details)) {
        let holeInOnes = 0
        let eagles = 0
        let birdies = 0

        hole_details.forEach(hole => {
          if (hole.score === 1) holeInOnes++
          else if (hole.score === hole.par - 2) eagles++
          else if (hole.score === hole.par - 1) birdies++
        })

        // Update scoring achievements
        if (holeInOnes > 0) {
          await supabase.rpc('update_achievement', {
            user_id_param: user_id,
            achievement_type_param: 'hole_in_one',
            value_param: holeInOnes
          })
        }

        if (eagles > 0) {
          await supabase.rpc('update_achievement', {
            user_id_param: user_id,
            achievement_type_param: 'eagles',
            value_param: eagles
          })
        }

        if (birdies > 0) {
          await supabase.rpc('update_achievement', {
            user_id_param: user_id,
            achievement_type_param: 'birdies',
            value_param: birdies
          })
        }
      }
    } catch (achievementError) {
      console.error('Error updating achievements:', achievementError)
      // Don't fail the request if achievements fail
    }

    return NextResponse.json({ 
      success: true, 
      round,
      message: 'Golf round recorded successfully' 
    })

  } catch (error) {
    console.error('Error creating golf round:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
