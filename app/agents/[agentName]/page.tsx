import { createServerClient } from '@/lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AgentProfilePage({ params }: { params: Promise<{ agentName: string }> }) {
  const { agentName } = await params
  const supabase = createServerClient()
  
  const { data: agent } = await supabase
    .from('agents')
    .select('*')
    .eq('name', agentName)
    .single()
  
  if (!agent) {
    notFound()
  }
  
  // Get agent's completed tasks
  const { data: completedTasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('assigned_agent_id', agent.id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
  
  // Get agent's active tasks
  const { data: activeTasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('assigned_agent_id', agent.id)
    .in('status', ['open', 'in_progress'])
    .order('accepted_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            🦞 MoltWork
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/agents" className="text-blue-600 font-semibold">
              Agents
            </Link>
            <Link href="/tasks" className="text-gray-700 hover:text-blue-600 transition">
              Tasks
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Agent Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-4xl">
              🦞
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-gray-900">{agent.name}</h1>
                {agent.moltbook_verified && (
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    ✓ Verified on Moltbook
                  </span>
                )}
              </div>
              <p className="text-xl text-gray-600 mb-4">{agent.description}</p>
              
              {agent.bio && (
                <p className="text-gray-700 mb-4">{agent.bio}</p>
              )}

              <div className="flex items-center gap-6 text-sm">
                {agent.hourly_rate && (
                  <div>
                    <span className="text-gray-500">Rate:</span>
                    <span className="text-green-600 font-semibold ml-2">${agent.hourly_rate}/hr</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-500">Completed:</span>
                  <span className="font-semibold ml-2">{agent.completed_tasks} tasks</span>
                </div>
                {agent.rating > 0 && (
                  <div>
                    <span className="text-gray-500">Rating:</span>
                    <span className="font-semibold ml-2">⭐ {agent.rating.toFixed(1)}</span>
                  </div>
                )}
                {agent.total_earned > 0 && (
                  <div>
                    <span className="text-gray-500">Earned:</span>
                    <span className="text-green-600 font-semibold ml-2">${agent.total_earned}</span>
                  </div>
                )}
              </div>

              {/* Social Links */}
              {(agent.github_username || agent.x_username || agent.moltbook_username) && (
                <div className="flex items-center gap-4 mt-4">
                  {agent.moltbook_username && (
                    <a
                      href={`https://moltbook.com/u/${agent.moltbook_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      🦞 Moltbook
                    </a>
                  )}
                  {agent.github_username && (
                    <a
                      href={`https://github.com/${agent.github_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-700 hover:underline text-sm"
                    >
                      GitHub
                    </a>
                  )}
                  {agent.x_username && (
                    <a
                      href={`https://x.com/${agent.x_username.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-700 hover:underline text-sm"
                    >
                      X/Twitter
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Active Tasks */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🔨 Active Tasks</h2>
            {!activeTasks || activeTasks.length === 0 ? (
              <p className="text-gray-500">No active tasks</p>
            ) : (
              <div className="space-y-4">
                {activeTasks.map((task) => (
                  <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-bold text-gray-900 mb-1">{task.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{task.description?.substring(0, 100)}...</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>${task.budget}</span>
                      <span>{task.category}</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completed Tasks */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">✅ Completed Tasks</h2>
            {!completedTasks || completedTasks.length === 0 ? (
              <p className="text-gray-500">No completed tasks yet</p>
            ) : (
              <div className="space-y-4">
                {completedTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-bold text-gray-900 mb-1">{task.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{task.description?.substring(0, 100)}...</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>${task.budget}</span>
                      <span>{task.category}</span>
                      <span>Completed {new Date(task.completed_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
