// app/api/user/professor/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('id_utilisateur')

  if (!userId) {
    return NextResponse.json(
      { error: 'ID utilisateur manquant' },
      { status: 400 }
    )
  }

  try {
    const user = await prisma.utilisateurs.findUnique({
      where: { id_utilisateur: userId },
      select: {
        id_utilisateur: true,
        prenom: true,
        nom: true,
        email: true,
        role: true,
        photo_profil: true,
        professeurs: {
          select: {
            specialisation: true,
            departement: true,
            titre: true
          }
        }
      }
    })

    if (!user || !user.professeurs) {
      return NextResponse.json(
        { error: 'Professeur non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...user,
      ...user.professeurs
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur du serveur' },
      { status: 500 }
    )
  }
}