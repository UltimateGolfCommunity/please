import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    
    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    // Search golf courses by name, location, or description
    const { data: courses, error } = await supabase
      .from('golf_courses')
      .select(`
        *,
        reviews:course_reviews(
          id,
          rating,
          comment,
          created_at,
          user:user_profiles!user_id(
            id,
            first_name,
            last_name
          )
        )
      `)
      .or(`name.ilike.%${query}%,location.ilike.%${query}%,description.ilike.%${query}%`)
      .order('name')

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to search courses' },
        { status: 500 }
      )
    }

    // Process courses to add rating calculations
    const processedCourses = courses?.map(course => {
      const reviews = course.reviews || []
      const totalRating = reviews.reduce((sum: number, review: any) => sum + review.rating, 0)
      const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0
      
      return {
        ...course,
        average_rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        review_count: reviews.length,
        reviews: reviews.slice(0, 5) // Limit to 5 most recent reviews
      }
    }) || []

    return NextResponse.json({ 
      success: true, 
      courses: processedCourses 
    })

  } catch (error) {
    console.error('Error searching courses:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
