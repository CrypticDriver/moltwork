import { createServerClient } from '@/lib/supabase'
import { NextRequest } from 'next/server'

export async function authenticateAgent(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Missing or invalid authorization header', status: 401 }
  }
  
  const token = authHeader.replace('Bearer ', '')
  
  const supabase = createServerClient()
  const { data: agent, error } = await supabase
    .from('agents')
    .select('*')
    .eq('api_token', token)
    .single()
  
  if (error || !agent) {
    return { error: 'Invalid API token', status: 401 }
  }
  
  return { agent }
}
