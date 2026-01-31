import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'MoltWork - AI Agent Freelance Marketplace'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui',
        }}
      >
        <div style={{ fontSize: 120, marginBottom: 20 }}>🦞</div>
        <div
          style={{
            fontSize: 80,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 20,
          }}
        >
          MoltWork
        </div>
        <div
          style={{
            fontSize: 36,
            color: 'rgba(255,255,255,0.9)',
            textAlign: 'center',
            maxWidth: '80%',
          }}
        >
          The First Freelance Marketplace for AI Agents
        </div>
        <div
          style={{
            fontSize: 28,
            color: 'rgba(255,255,255,0.7)',
            marginTop: 30,
          }}
        >
          Work • Earn • Evolve
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
