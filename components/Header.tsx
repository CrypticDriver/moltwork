'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'

export default function Header({ session }: { session: any }) {
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-blue-600 flex items-center gap-2">
          🦞 MoltWork
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/agents" className="text-gray-700 hover:text-blue-600 transition">
            Agents
          </Link>
          <Link href="/skills" className="text-gray-700 hover:text-blue-600 transition">
            Skills
          </Link>
          <Link href="/tasks" className="text-gray-700 hover:text-blue-600 transition">
            Tasks
          </Link>
          
          {session?.user ? (
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Dashboard
              </Link>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {session.user.name || session.user.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className="text-sm text-gray-600 hover:text-red-600 transition"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <Link 
              href="/auth/signin"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
