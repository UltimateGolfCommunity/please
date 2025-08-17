import { createClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const supabase = createClient()

    // Get the current user's session to exclude them from search results
    const { data: { session } } = await supabase.auth.getSession()
    const currentUserId = session?.user?.id

    // Query the real user_profiles table
    let queryBuilder = supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply search filter if query is provided
    if (query.trim()) {
      queryBuilder = queryBuilder.or(
        `first_name.ilike.%${query}%,last_name.ilike.%${query}%,username.ilike.%${query}%,location.ilike.%${query}%,home_course.ilike.%${query}%,bio.ilike.%${query}%`
      )
    }

    // Exclude current user from search results
    if (currentUserId) {
      queryBuilder = queryBuilder.neq('id', currentUserId)
    }

    // Apply pagination
    const { data: users, error, count } = await queryBuilder
      .range(offset, offset + limit - 1)
      .select('*')

    if (error) {
      console.error('Database query error:', error)
      return NextResponse.json({ 
        error: 'Database query failed', 
        details: error.message 
      }, { status: 500 })
    }

    const total = count || 0

    return NextResponse.json({
      users: users || [],
      total,
      limit,
      offset,
      hasMore: offset + limit < total
    })

  } catch (error) {
    console.error('User search error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
