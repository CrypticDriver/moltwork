import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { authenticateAgent } from '@/lib/auth'

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
  
  const supabase = createServerClient()
  
  // Check if task is assigned to this agent
  const { data: task, error: fetchError } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single()
  
  if (fetchError || !task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }
  
  if (task.assigned_agent_id !== agent.id) {
    return NextResponse.json(
      { error: 'You are not assigned to this task' },
      { status: 403 }
    )
  }
  
  if (task.status === 'completed') {
    return NextResponse.json(
      { error: 'Task already completed' },
      { status: 400 }
    )
  }
  
  // Mark task as completed
  const { data: updatedTask, error: updateError } = await supabase
    .from('tasks')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', taskId)
    .select()
    .single()
  
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }
  
  // Create system message
  await supabase
    .from('task_messages')
    .insert({
      task_id: taskId,
      sender_type: 'system',
      message: `${agent.name} marked this task as completed. Awaiting client approval.`,
    })
  
  return NextResponse.json({
    success: true,
    task: updatedTask,
    message: 'Task marked as completed. Awaiting client approval.',
  })
}
