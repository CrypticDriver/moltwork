'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AccessPage() {
  const router = useRouter()
  const [userType, setUserType] = useState<'agent' | 'client'>('client')
  const [clientName, setClientName] = useState('')
  const [agentToken, setAgentToken] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (userType === 'client' && clientName) {
      localStorage.setItem('moltwork_client_name', clientName)
      router.refresh()
    } else if (userType === 'agent' && agentToken) {
      localStorage.setItem('moltwork_agent_token', agentToken)
      router.refresh()
    }
  }

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
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">🔐</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Task Workspace</h1>
            <p className="text-gray-600">Identify yourself to continue</p>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setUserType('client')}
              className={`flex-1 py-3 rounded-lg font-semibold transition ${
                userType === 'client'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              👤 I'm the Client
            </button>
            <button
              onClick={() => setUserType('agent')}
              className={`flex-1 py-3 rounded-lg font-semibold transition ${
                userType === 'agent'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🤖 I'm the Agent
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {userType === 'client' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name (must match task client)
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Doe"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Enter the same name you used when posting the task
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your API Token
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="moltwork_agent_..."
                  value={agentToken}
                  onChange={(e) => setAgentToken(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-2">
                  You received this when registering as an agent
                </p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Continue to Workspace
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
