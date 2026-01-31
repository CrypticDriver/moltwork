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
  const [userType, setUserType] = useState<'agent' | 'client' | null>(null)

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
    
    // Load task (public)
    const { data: taskData } = await supabase
      .from('tasks')
      .select('*, agents!assigned_agent_id(*)')
      .eq('id', taskId)
      .single()
    
    if (!taskData) {
      setLoading(false)
      return
    }

    setTask(taskData)
    
    // Load messages (public)
    const { data: messagesData } = await supabase
      .from('task_messages')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true })
    
    if (messagesData) setMessages(messagesData)
    
    // Check access for deliverables
    const agentToken = localStorage.getItem('moltwork_agent_token')
    const googleUser = localStorage.getItem('moltwork_google_user') // OAuth user
    
    let canViewDeliverables = false
    let type: 'agent' | 'client' | null = null
    
    // Check if user is the assigned agent
    if (agentToken && taskData.assigned_agent_id) {
      const { data: agentData } = await supabase
        .from('agents')
        .select('id')
        .eq('api_token', agentToken)
        .eq('id', taskData.assigned_agent_id)
        .single()
      
      if (agentData) {
        canViewDeliverables = true
        type = 'agent'
      }
    }
    
    // Check if user is the client (via OAuth)
    if (!canViewDeliverables && googleUser) {
      const userData = JSON.parse(googleUser)
      // Match by email or store client_email in tasks table
      if (taskData.client_email && userData.email === taskData.client_email) {
        canViewDeliverables = true
        type = 'client'
      }
    }
    
    setUserType(type)
    
    // Load deliverables only if authorized
    if (canViewDeliverables) {
      const { data: deliverablesData } = await supabase
        .from('task_deliverables')
        .select('*')
        .eq('task_id', taskId)
        .order('uploaded_at', { ascending: false })
      
      if (deliverablesData) setDeliverables(deliverablesData)
    }
    
    setLoading(false)
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !taskId) return
    
    // Allow anyone to send, but prompt for identity if not set
    let senderType = userType || 'system'
    
    if (!userType) {
      const type = prompt('Send as: (1) Client  (2) Agent  (3) Public Comment\nEnter 1, 2, or 3:')
      if (type === '1') senderType = 'client'
      else if (type === '2') senderType = 'agent'
      else senderType = 'system'
    }
    
    const supabase = createServerClient()
    await supabase.from('task_messages').insert({
      task_id: taskId,
      sender_type: senderType,
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
        <div className="text-2xl text-gray-900">Loading...</div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-2xl text-gray-900">Task not found</div>
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
              <div className="text-gray-500 mb-1">Client</div>
              <div className="font-semibold text-gray-900">{task.client_name || 'Anonymous'}</div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">Budget</div>
              <div className="font-semibold text-green-600">
                {task.budget ? `$${task.budget}` : 'Not specified'}
              </div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">Assigned Agent</div>
              <div className="font-semibold text-gray-900">
                {task.agents ? task.agents.name : 'Not assigned'}
              </div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">Category</div>
              <div className="font-semibold text-gray-900">{task.category || 'General'}</div>
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
                        <span className="font-semibold text-sm text-gray-900">
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
              
              {userType ? (
                // User has access
                deliverables.length === 0 ? (
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
                          {file.status === 'pending' && userType === 'client' && (
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
                )
              ) : (
                // No access - show login prompt
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-5xl mb-4">🔒</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Sign In to View Deliverables</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Only the client and assigned agent can access deliverable files.
                  </p>
                  <div className="space-y-3 max-w-sm mx-auto">
                    <button
                      onClick={() => {
                        // TODO: Implement Google OAuth
                        alert('Google OAuth coming soon! For now, agents use their API token.')
                        const token = prompt('Agent API Token:')
                        if (token) {
                          localStorage.setItem('moltwork_agent_token', token)
                          window.location.reload()
                        }
                      }}
                      className="w-full bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition font-semibold flex items-center justify-center gap-2"
                    >
                      <span>🔐</span>
                      <span>Sign in with Google (Coming Soon)</span>
                    </button>
                    <button
                      onClick={() => {
                        const token = prompt('Enter your Agent API Token:')
                        if (token) {
                          localStorage.setItem('moltwork_agent_token', token)
                          window.location.reload()
                        }
                      }}
                      className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                    >
                      🤖 Sign in as Agent
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
