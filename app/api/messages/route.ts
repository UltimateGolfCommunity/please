import { createClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json({ 
        error: 'Unauthorized', 
        details: 'You must be logged in to send messages' 
      }, { status: 401 })
    }

    const { recipientId, message } = await request.json()
    
    if (!recipientId || !message?.trim()) {
      return NextResponse.json({ 
        error: 'Bad Request', 
        details: 'Recipient ID and message are required' 
      }, { status: 400 })
    }

    // Check if users are connected (optional - you can remove this for open messaging)
    const { data: connection } = await supabase
      .from('user_connections')
      .select('*')
      .or(`requester_id.eq.${session.user.id},recipient_id.eq.${session.user.id}`)
      .or(`requester_id.eq.${recipientId},recipient_id.eq.${recipientId}`)
      .eq('status', 'accepted')
      .single()

    // Uncomment this if you want to require connections for messaging
    // if (!connection) {
    //   return NextResponse.json({ 
    //     error: 'Not connected', 
    //     details: 'You must be connected to send messages' 
    //   }, { status: 403 })
    // }

    // Send the message
    const { data: sentMessage, error: messageError } = await supabase
      .from('direct_messages')
      .insert([
        {
          sender_id: session.user.id,
          recipient_id: recipientId,
          message: message.trim()
        }
      ])
      .select()
      .single()

    if (messageError) {
      console.error('Message creation error:', messageError)
      return NextResponse.json({ 
        error: 'Database error', 
        details: messageError.message 
      }, { status: 500 })
    }

    // Create notification for recipient
    await supabase.rpc('create_notification', {
      user_uuid: recipientId,
      notification_type_val: 'group_message',
      title_val: 'New Message',
      message_val: `You have a new message from ${session.user.email}`
    })

    return NextResponse.json({
      message: 'Message sent successfully',
      sentMessage
    })

  } catch (error) {
    console.error('Message API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = createClient()
    
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json({ 
        error: 'Unauthorized', 
        details: 'You must be logged in to view messages' 
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const otherUserId = searchParams.get('user')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!otherUserId) {
      return NextResponse.json({ 
        error: 'Bad Request', 
        details: 'User ID parameter is required' 
      }, { status: 400 })
    }

    // Get messages between current user and other user
    const { data: messages, error } = await supabase
      .from('direct_messages')
      .select(`
        *,
        sender:user_profiles!direct_messages_sender_id_fkey(id, first_name, last_name, username, avatar_url),
        recipient:user_profiles!direct_messages_recipient_id_fkey(id, first_name, last_name, username, avatar_url)
      `)
      .or(`and(sender_id.eq.${session.user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${session.user.id})`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Messages fetch error:', error)
      return NextResponse.json({ 
        error: 'Database error', 
        details: error.message 
      }, { status: 500 })
    }

    // Mark messages as read
    await supabase
      .from('direct_messages')
      .update({ is_read: true })
      .eq('recipient_id', session.user.id)
      .eq('sender_id', otherUserId)
      .eq('is_read', false)

    return NextResponse.json({
      messages: messages || []
    })

  } catch (error) {
    console.error('Messages API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
