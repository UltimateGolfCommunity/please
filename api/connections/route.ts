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
        details: 'You must be logged in to send connection requests' 
      }, { status: 401 })
    }

    const { recipientId } = await request.json()
    
    if (!recipientId) {
      return NextResponse.json({ 
        error: 'Bad Request', 
        details: 'Recipient ID is required' 
      }, { status: 400 })
    }

    // Check if connection already exists
    const { data: existingConnection } = await supabase
      .from('user_connections')
      .select('*')
      .or(`requester_id.eq.${session.user.id},recipient_id.eq.${session.user.id}`)
      .or(`requester_id.eq.${recipientId},recipient_id.eq.${recipientId}`)
      .single()

    if (existingConnection) {
      return NextResponse.json({ 
        error: 'Connection exists', 
        details: 'A connection already exists between these users' 
      }, { status: 409 })
    }

    // Create the connection request
    const { data: connection, error: connectionError } = await supabase
      .from('user_connections')
      .insert([
        {
          requester_id: session.user.id,
          recipient_id: recipientId,
          status: 'pending'
        }
      ])
      .select()
      .single()

    if (connectionError) {
      console.error('Connection creation error:', connectionError)
      return NextResponse.json({ 
        error: 'Database error', 
        details: connectionError.message 
      }, { status: 500 })
    }

    // Create notification for recipient
    await supabase.rpc('create_notification', {
      user_uuid: recipientId,
      notification_type_val: 'connection_request',
      title_val: 'New Connection Request',
      message_val: `${session.user.email} wants to connect with you!`
    })

    return NextResponse.json({
      message: 'Connection request sent successfully',
      connection
    })

  } catch (error) {
    console.error('Connection API error:', error)
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
        details: 'You must be logged in to view connections' 
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'

    let queryBuilder = supabase
      .from('user_connections')
      .select(`
        *,
        requester:user_profiles!user_connections_requester_id_fkey(*),
        recipient:user_profiles!user_connections_recipient_id_fkey(*)
      `)
      .or(`requester_id.eq.${session.user.id},recipient_id.eq.${session.user.id}`)

    // Filter by status if specified
    if (status !== 'all') {
      queryBuilder = queryBuilder.eq('status', status)
    }

    const { data: connections, error } = await queryBuilder.order('created_at', { ascending: false })

    if (error) {
      console.error('Connections fetch error:', error)
      return NextResponse.json({ 
        error: 'Database error', 
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      connections: connections || []
    })

  } catch (error) {
    console.error('Connections API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
