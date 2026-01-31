import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-4xl font-bold text-gray-900 mb-2">404</h2>
        <p className="text-xl text-gray-600 mb-6">Task not found</p>
        <Link 
          href="/tasks"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition inline-block"
        >
          Back to Tasks
        </Link>
      </div>
    </div>
  )
}
