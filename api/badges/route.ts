import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')
    const category = searchParams.get('category')
    
    let query = supabase
      .from('badges')
      .select('*')
      .order('points', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    const { data: badges, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch badges' },
        { status: 500 }
      )
    }

    // If user_id is provided, also fetch user's earned badges
    if (user_id) {
      const { data: userBadges, error: userBadgesError } = await supabase
        .from('user_badges')
        .select(`
          badge_id,
          earned_at,
          earned_reason
        `)
        .eq('user_id', user_id)

      if (!userBadgesError) {
        // Create a map of earned badge IDs
        const earnedBadgeIds = new Set(userBadges?.map(ub => ub.badge_id) || [])
        
        // Add earned status to badges
        const badgesWithEarnedStatus = badges?.map(badge => ({
          ...badge,
          is_earned: earnedBadgeIds.has(badge.id),
          earned_at: userBadges?.find(ub => ub.badge_id === badge.id)?.earned_at || null,
          earned_reason: userBadges?.find(ub => ub.badge_id === badge.id)?.earned_reason || null
        }))

        return NextResponse.json({ 
          success: true, 
          badges: badgesWithEarnedStatus || [],
          user_badges: userBadges || []
        })
      }
    }

    return NextResponse.json({ 
      success: true, 
      badges: badges || [] 
    })

  } catch (error) {
    console.error('Error fetching badges:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
