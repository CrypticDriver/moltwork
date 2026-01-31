import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { authenticateAgent } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  // Authenticate
  const auth = await authenticateAgent(request)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  
  const { agentId } = params
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') // 'available', 'in_progress', 'completed'
  
  const supabase = createServerClient()
  
  if (status === 'available') {
    // Get tasks not assigned yet
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('status', 'open')
      .is('assigned_agent_id', null)
      .order('created_at', { ascending: false })
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ tasks })
  }
  
  if (status === 'in_progress') {
    // Get tasks assigned to this agent
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_agent_id', agentId)
      .in('status', ['in_progress', 'open'])
      .order('accepted_at', { ascending: false })
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ tasks })
  }
  
  // Default: all tasks for this agent
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('assigned_agent_id', agentId)
    .order('created_at', { ascending: false })
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ tasks })
}
