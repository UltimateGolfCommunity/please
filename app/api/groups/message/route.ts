import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { group_id, user_id, message } = await request.json()
    
    if (!group_id || !user_id || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify user is a member of the group
    const { data: membership, error: membershipError } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', group_id)
      .eq('user_id', user_id)
      .single()

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: 'User is not a member of this group' },
        { status: 403 }
      )
    }

    // Insert message into group_messages table
    const { data, error } = await supabase
      .from('group_messages')
      .insert({
        group_id,
        sender_id: user_id,
        message_content: message
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      )
    }

    // Create notifications for other group members
    const { data: members, error: membersError } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', group_id)
      .neq('user_id', user_id)

    if (!membersError && members) {
      for (const member of members) {
        await supabase.rpc('create_notification', {
          user_id_param: member.user_id,
          type_param: 'group_message',
          title_param: 'New Group Message',
          message_param: `New message in your group: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`,
          related_id_param: group_id
        })
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: data 
    })

  } catch (error) {
    console.error('Error sending group message:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
