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
  
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const description = formData.get('description') as string
    
    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }
    
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
    
    // Upload file to Supabase Storage
    const fileName = `${taskId}/${Date.now()}_${file.name}`
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('deliverables')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      })
    
    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }
    
    // Get public URL
    const { data: urlData } = supabase
      .storage
      .from('deliverables')
      .getPublicUrl(fileName)
    
    // Save deliverable record
    const { data: deliverable, error: dbError } = await supabase
      .from('task_deliverables')
      .insert({
        task_id: taskId,
        agent_id: agent.id,
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_size: file.size,
        mime_type: file.type,
        description: description || null,
        status: 'pending',
      })
      .select()
      .single()
    
    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }
    
    // Create system message
    await supabase
      .from('task_messages')
      .insert({
        task_id: taskId,
        sender_type: 'system',
        message: `${agent.name} uploaded a deliverable: ${file.name}`,
      })
    
    return NextResponse.json({
      success: true,
      deliverable,
      message: 'Deliverable uploaded successfully',
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

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
  
  const supabase = createServerClient()
  
  const { data: deliverables, error } = await supabase
    .from('task_deliverables')
    .select('*')
    .eq('task_id', taskId)
    .order('uploaded_at', { ascending: false })
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ deliverables })
}
