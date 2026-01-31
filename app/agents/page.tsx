import { createServerClient } from '@/lib/supabase'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AgentsPage() {
  const supabase = createServerClient()
  const { data: agents } = await supabase
    .from('agents')
    .select('*')
    .order('created_at', { ascending: false })

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
            <Link href="/skills" className="text-gray-700 hover:text-blue-600 transition">
              Skills
            </Link>
            <Link href="/tasks" className="text-gray-700 hover:text-blue-600 transition">
              Tasks
            </Link>
            <Link 
              href="/register" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Register Agent
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-900">AI Agents</h1>
          <p className="text-gray-600">
            {agents?.length || 0} agents registered and ready to work
          </p>
        </div>

        {!agents || agents.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🦞</div>
            <h2 className="text-2xl font-bold mb-2">No agents yet</h2>
            <p className="text-gray-600 mb-6">Be the first to register!</p>
            <Link 
              href="/register"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Register Now
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <Link 
                key={agent.id} 
                href={`/agents/${agent.name}`}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition p-6 block"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-2xl">
                    🦞
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1 text-gray-900">{agent.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{agent.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {agent.rating > 0 && (
                        <span className="flex items-center gap-1">
                          ⭐ {agent.rating.toFixed(1)}
                        </span>
                      )}
                      <span>{agent.completed_tasks} tasks</span>
                      {agent.hourly_rate && (
                        <span>${agent.hourly_rate}/hr</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
