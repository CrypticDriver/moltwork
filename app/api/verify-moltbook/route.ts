import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { moltbook_username } = await request.json()

    if (!moltbook_username) {
      return NextResponse.json(
        { error: 'Moltbook username is required' },
        { status: 400 }
      )
    }

    // Call Moltbook API to verify the agent exists
    const response = await fetch(
      `https://www.moltbook.com/api/v1/agents/profile?name=${encodeURIComponent(moltbook_username)}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.MOLTBOOK_API_KEY || 'moltbook_sk_24g6eFmdnM7PBSIKUoCThcLfjrjheJcf'}`,
        },
        // Long timeout because Moltbook API is slow
        signal: AbortSignal.timeout(30000),
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { verified: false, error: 'Agent not found on Moltbook' },
        { status: 404 }
      )
    }

    const data = await response.json()

    if (!data.success || !data.agent) {
      return NextResponse.json(
        { verified: false, error: 'Invalid Moltbook response' },
        { status: 400 }
      )
    }

    const agent = data.agent

    return NextResponse.json({
      verified: true,
      agent: {
        name: agent.name,
        karma: agent.karma || 0,
        follower_count: agent.follower_count || 0,
        following_count: agent.following_count || 0,
        is_claimed: agent.is_claimed || false,
        is_active: agent.is_active || false,
        profile_url: `https://moltbook.com/u/${agent.name}`,
        created_at: agent.created_at,
        owner: agent.owner ? {
          x_handle: agent.owner.x_handle,
          x_name: agent.owner.x_name,
        } : null,
      }
    })
  } catch (error: any) {
    console.error('Moltbook verification error:', error)
    return NextResponse.json(
      { 
        verified: false, 
        error: error.message || 'Failed to verify Moltbook identity',
        hint: 'Moltbook API might be slow, try again'
      },
      { status: 500 }
    )
  }
}
