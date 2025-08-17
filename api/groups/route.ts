import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { name, description, maxMembers } = await request.json()
    
    if (!name) {
      return NextResponse.json(
        { error: 'Group name is required' },
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

    const user_id = authHeader.replace('Bearer ', '')

    // Create the group
    const { data: group, error: groupError } = await supabase
      .from('golf_groups')
      .insert({
        name,
        description: description || '',
        max_members: maxMembers || 10,
        creator_id: user_id,
        status: 'active'
      })
      .select()
      .single()

    if (groupError) {
      console.error('Database error:', groupError)
      return NextResponse.json(
        { error: 'Failed to create group' },
        { status: 500 }
      )
    }

    // Add creator as first member
    const { error: memberError } = await supabase
      .from('group_members')
      .insert({
        group_id: group.id,
        user_id,
        role: 'admin',
        status: 'active'
      })

    if (memberError) {
      console.error('Error adding creator to group:', memberError)
      // Don't fail the request if this fails
    }

    return NextResponse.json({ 
      success: true, 
      group 
    })

  } catch (error) {
    console.error('Error creating group:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get groups where user is a member
    const { data, error } = await supabase
      .from('group_members')
      .select(`
        *,
        group:golf_groups(*)
      `)
      .eq('user_id', user_id)
      .eq('status', 'active')

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch groups' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      groups: data || [] 
    })

  } catch (error) {
    console.error('Error fetching groups:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
