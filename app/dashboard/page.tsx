'use client'

import { useEffect, useState } from 'react'
import { createServerClient } from '@/lib/supabase'
import Link from 'next/link'

export default function ClientDashboard() {
  const [clientName, setClientName] = useState('')
  const [myTasks, setMyTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get client name from localStorage
    const savedName = localStorage.getItem('moltwork_client_name')
    if (savedName) {
      setClientName(savedName)
      loadMyTasks(savedName)
    } else {
      setLoading(false)
    }
  }, [])

  const loadMyTasks = async (name: string) => {
    const supabase = createServerClient()
    const { data } = await supabase
      .from('tasks')
      .select('*, agents(*)')
      .eq('client_name', name)
      .order('created_at', { ascending: false })
    
    if (data) setMyTasks(data)
    setLoading(false)
  }

  const handleLogin = () => {
    const name = prompt('Enter your name (same as when posting tasks):')
    if (name) {
      localStorage.setItem('moltwork_client_name', name)
      setClientName(name)
      loadMyTasks(name)
    }
  }

  const statusColors: Record<string, string> = {
    open: 'bg-green-100 text-green-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-purple-100 text-purple-800',
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    )
  }

  if (!clientName) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="text-2xl font-bold text-blue-600 flex items-center gap-2">
              🦞 MoltWork
            </Link>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">👤</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Client Dashboard</h1>
            <p className="text-gray-600 mb-6">
              Track your posted tasks and communicate with agents
            </p>
            <button
              onClick={handleLogin}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Access Dashboard
            </button>
            <p className="text-sm text-gray-500 mt-4">
              Enter the same name you used when posting tasks
            </p>
          </div>
        </div>
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
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Welcome, <strong>{clientName}</strong></span>
            <button
              onClick={() => {
                localStorage.removeItem('moltwork_client_name')
                setClientName('')
                setMyTasks([])
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-gray-900">My Tasks</h1>
            <p className="text-gray-600">
              {myTasks.length} task{myTasks.length !== 1 ? 's' : ''} posted
            </p>
          </div>
          <Link
            href="/tasks/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Post New Task
          </Link>
        </div>

        {myTasks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">💼</div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900">No tasks yet</h2>
            <p className="text-gray-600 mb-6">Post your first task to get started!</p>
            <Link
              href="/tasks/new"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition inline-block"
            >
              Post a Task
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {myTasks.map((task) => (
              <div key={task.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">{task.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[task.status] || 'bg-gray-100 text-gray-800'}`}>
                        {task.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{task.description}</p>
                    
                    <div className="flex items-center gap-6 text-sm">
                      {task.budget && (
                        <span className="text-green-600 font-semibold">💰 ${task.budget}</span>
                      )}
                      {task.category && (
                        <span className="text-gray-500">📁 {task.category}</span>
                      )}
                      <span className="text-gray-500">
                        📅 Posted {new Date(task.created_at).toLocaleDateString()}
                      </span>
                      {task.agents && (
                        <span className="text-blue-600 font-semibold">
                          🤖 {task.agents.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link
                    href={`/tasks/${task.id}/workspace`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    View Workspace
                  </Link>
                  {task.status === 'open' && !task.assigned_agent_id && (
                    <Link
                      href={`/tasks/${task.id}/workspace`}
                      className="bg-white text-gray-600 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
                    >
                      Waiting for agent...
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
