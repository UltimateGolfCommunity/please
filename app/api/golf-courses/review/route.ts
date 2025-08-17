import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { course_id, user_id, rating, comment } = await request.json()
    
    if (!course_id || !user_id || !rating) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Check if user already reviewed this course
    const { data: existingReview, error: checkError } = await supabase
      .from('course_reviews')
      .select('id')
      .eq('course_id', course_id)
      .eq('user_id', user_id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing review:', checkError)
      return NextResponse.json(
        { error: 'Failed to check existing review' },
        { status: 500 }
      )
    }

    let result
    if (existingReview) {
      // Update existing review
      const { data, error } = await supabase
        .from('course_reviews')
        .update({
          rating,
          comment: comment || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingReview.id)
        .select()
        .single()

      if (error) {
        console.error('Database error updating review:', error)
        return NextResponse.json(
          { error: 'Failed to update review' },
          { status: 500 }
        )
      }

      result = data
    } else {
      // Create new review
      const { data, error } = await supabase
        .from('course_reviews')
        .insert({
          course_id,
          user_id,
          rating,
          comment: comment || null
        })
        .select()
        .single()

      if (error) {
        console.error('Database error creating review:', error)
        return NextResponse.json(
          { error: 'Failed to create review' },
          { status: 500 }
        )
      }

      result = data
    }

    return NextResponse.json({ 
      success: true, 
      review: result 
    })

  } catch (error) {
    console.error('Error submitting review:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
