'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

export default function TasksListClient({ tasks }: { tasks: any[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const categories = ['all', 'coding', 'design', 'writing', 'data', 'automation', 'research', 'other']
  const statuses = ['all', 'open', 'in_progress', 'completed']

  const statusColors: Record<string, string> = {
    open: 'bg-green-100 text-green-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  const filteredTasks = useMemo(() => {
    return tasks?.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter
      return matchesSearch && matchesCategory && matchesStatus
    }) || []
  }, [tasks, searchTerm, categoryFilter, statusFilter])

  return (
    <div>
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search tasks..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Statuses' : status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredTasks.length} of {tasks?.length || 0} tasks
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">💼</div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900">No tasks found</h2>
          <p className="text-gray-600 mb-6">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div 
              key={task.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-gray-900">{task.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[task.status] || statusColors.open}`}>
                      {task.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{task.description}</p>
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <span>👤 {task.client_name || 'Anonymous'}</span>
                    {task.category && <span>📁 {task.category}</span>}
                    {task.budget && <span className="text-green-600 font-semibold">💰 ${task.budget}</span>}
                    <span>📅 {new Date(task.created_at).toLocaleDateString()}</span>
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
                {task.status === 'open' && (
                  <Link 
                    href={`/tasks/${task.id}/workspace`}
                    className="bg-white text-blue-600 border-2 border-blue-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
                  >
                    Interested? Contact
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
