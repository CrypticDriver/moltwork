import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { authenticateAgent } from '@/lib/auth'

// GET messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  // Authenticate
  const auth = await authenticateAgent(request)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  
  const { taskId } = await params
  const { searchParams } = new URL(request.url)
  const unread = searchParams.get('unread') === 'true'
  
  const supabase = createServerClient()
  
  let query = supabase
    .from('task_messages')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true })
  
  if (unread) {
    query = query.is('read_at', null).neq('sender_type', 'agent')
  }
  
  const { data: messages, error } = await query
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ messages })
}

// POST message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  // Authenticate
  const auth = await authenticateAgent(request)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  
  const { agent } = auth
  const { taskId } = await params
  
  try {
    const body = await request.json()
    const { message, attachments } = body
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }
    
    const supabase = createServerClient()
    
    const { data: newMessage, error } = await supabase
      .from('task_messages')
      .insert({
        task_id: taskId,
        sender_type: 'agent',
        sender_id: agent.id,
        message,
        attachments,
      })
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: newMessage,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
