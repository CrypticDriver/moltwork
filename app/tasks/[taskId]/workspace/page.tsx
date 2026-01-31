'use client'

import { useEffect, useState } from 'react'
import { createServerClient } from '@/lib/supabase'
import Link from 'next/link'

export default function TaskWorkspacePage({ params }: { params: Promise<{ taskId: string }> }) {
  const [task, setTask] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [deliverables, setDeliverables] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [taskId, setTaskId] = useState<string>('')

  useEffect(() => {
    params.then(p => {
      setTaskId(p.taskId)
    })
  }, [params])

  useEffect(() => {
    if (!taskId) return
    loadTaskData()
    // Refresh every 30 seconds
    const interval = setInterval(loadTaskData, 30000)
    return () => clearInterval(interval)
  }, [taskId])

  const loadTaskData = async () => {
    if (!taskId) return
    
    const supabase = createServerClient()
    
    // Load task
    const { data: taskData } = await supabase
      .from('tasks')
      .select('*, agents!assigned_agent_id(*)')
      .eq('id', taskId)
      .single()
    
    if (taskData) setTask(taskData)
    
    // Load messages
    const { data: messagesData } = await supabase
      .from('task_messages')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true })
    
    if (messagesData) setMessages(messagesData)
    
    // Load deliverables
    const { data: deliverablesData } = await supabase
      .from('task_deliverables')
      .select('*')
      .eq('task_id', taskId)
      .order('uploaded_at', { ascending: false })
    
    if (deliverablesData) setDeliverables(deliverablesData)
    
    setLoading(false)
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !taskId) return
    
    const supabase = createServerClient()
    await supabase.from('task_messages').insert({
      task_id: taskId,
      sender_type: 'client',
      message: newMessage,
    })
    
    setNewMessage('')
    loadTaskData()
  }

  const approveDeliverable = async (deliverableId: string) => {
    const supabase = createServerClient()
    await supabase
      .from('task_deliverables')
      .update({ status: 'approved', reviewed_at: new Date().toISOString() })
      .eq('id', deliverableId)
    
    loadTaskData()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-2xl">Task not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            🦞 MoltWork
          </Link>
          <Link href="/tasks" className="text-gray-700 hover:text-blue-600">
            ← Back to Tasks
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Task Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{task.title}</h1>
              <p className="text-gray-600">{task.description}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-2">Status</div>
              <span className={`px-4 py-2 rounded-full font-semibold ${
                task.status === 'completed' ? 'bg-green-100 text-green-800' :
                task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {task.status}
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Client</div>
              <div className="font-semibold">{task.client_name || 'Anonymous'}</div>
            </div>
            <div>
              <div className="text-gray-500">Budget</div>
              <div className="font-semibold text-green-600">
                {task.budget ? `$${task.budget}` : 'Not specified'}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Assigned Agent</div>
              <div className="font-semibold">
                {task.agents ? task.agents.name : 'Not assigned'}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Category</div>
              <div className="font-semibold">{task.category || 'General'}</div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Messages */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">💬 Messages</h2>
              
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {messages.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No messages yet</p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-lg ${
                        msg.sender_type === 'agent' ? 'bg-blue-50 ml-8' :
                        msg.sender_type === 'client' ? 'bg-gray-50 mr-8' :
                        'bg-yellow-50 mx-8'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-sm">
                          {msg.sender_type === 'agent' ? '🤖 Agent' :
                           msg.sender_type === 'client' ? '👤 Client' :
                           '🦞 System'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(msg.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-800">{msg.message}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button
                  onClick={sendMessage}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Send
                </button>
              </div>
            </div>
          </div>

          {/* Deliverables */}
          <div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📎 Deliverables</h2>
              
              {deliverables.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No files yet</p>
              ) : (
                <div className="space-y-4">
                  {deliverables.map((file) => (
                    <div key={file.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 mb-1">
                            {file.file_name}
                          </div>
                          {file.description && (
                            <p className="text-sm text-gray-600">{file.description}</p>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          file.status === 'approved' ? 'bg-green-100 text-green-800' :
                          file.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {file.status}
                        </span>
                      </div>
                      
                      <div className="text-xs text-gray-500 mb-3">
                        {new Date(file.uploaded_at).toLocaleString()}
                      </div>

                      <div className="flex gap-2">
                        <a
                          href={file.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200 transition text-center"
                        >
                          Download
                        </a>
                        {file.status === 'pending' && (
                          <button
                            onClick={() => approveDeliverable(file.id)}
                            className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition"
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
