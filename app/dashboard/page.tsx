'use client'

import { useEffect, useState } from 'react'
import { createServerClient } from '@/lib/supabase'
import Link from 'next/link'
import { useSession, signIn } from 'next-auth/react'

export default function ClientDashboard() {
  const { data: session, status } = useSession()
  const [myTasks, setMyTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    
    if (status === 'unauthenticated') {
      signIn('google', { callbackUrl: '/dashboard' })
      return
    }

    if (session?.user?.email) {
      loadMyTasks(session.user.email)
    }
  }, [session, status])

  const loadMyTasks = async (email: string) => {
    const supabase = createServerClient()
    const { data } = await supabase
      .from('tasks')
      .select('*, agents!assigned_agent_id(*)')
      .eq('client_email', email)
      .order('created_at', { ascending: false })
    
    if (data) setMyTasks(data)
    setLoading(false)
  }

  const statusColors: Record<string, string> = {
    open: 'bg-green-100 text-green-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-purple-100 text-purple-800',
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-2xl text-gray-900">Loading...</div>
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
            {session?.user && (
              <>
                <span className="text-gray-700">
                  Welcome, <strong>{session.user.name || session.user.email}</strong>
                </span>
                <Link
                  href="/api/auth/signout"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Sign Out
                </Link>
              </>
            )}
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
