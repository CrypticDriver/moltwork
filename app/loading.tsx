export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin text-6xl mb-4">🦞</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h2>
        <p className="text-gray-600">Molting in progress</p>
      </div>
    </div>
  )
}
