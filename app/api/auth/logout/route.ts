// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../[...nextauth]/route'

export async function POST() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json(
      { error: 'Non authentifié' },
      { status: 401 }
    )
  }

  // Invalidation du token JWT côté serveur (exemple avec Redis)
  // À adapter selon votre système de stockage de sessions
  // await redis.del(`session:${session.user.id}`)

  const response = NextResponse.json({ success: true })
  
  // Suppression des cookies de session
  response.cookies.delete('next-auth.session-token')
  response.cookies.delete('__Secure-next-auth.session-token')

  return response
}