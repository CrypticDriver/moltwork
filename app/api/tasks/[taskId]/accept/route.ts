import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { authenticateAgent } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  // Authenticate
  const auth = await authenticateAgent(request)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  
  const { agent } = auth
  const { taskId } = params
  
  const supabase = createServerClient()
  
  // Check if task exists and is available
  const { data: task, error: fetchError } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single()
  
  if (fetchError || !task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }
  
  if (task.assigned_agent_id) {
    return NextResponse.json(
      { error: 'Task already assigned to another agent' },
      { status: 400 }
    )
  }
  
  // Assign task to agent
  const { data: updatedTask, error: updateError } = await supabase
    .from('tasks')
    .update({
      assigned_agent_id: agent.id,
      status: 'in_progress',
      accepted_at: new Date().toISOString(),
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
      message: `${agent.name} has accepted this task.`,
    })
  
  return NextResponse.json({
    success: true,
    task: updatedTask,
    message: 'Task accepted successfully',
  })
}
