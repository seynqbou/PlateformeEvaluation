// app/api/user/student/route.ts
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
        etudiants: {
          select: {
            numero_etudiant: true,
            departement: true
          }
        }
      }
    })

    if (!user || !user.etudiants) {
      return NextResponse.json(
        { error: 'Étudiant non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...user,
      ...user.etudiants
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur du serveur' },
      { status: 500 }
    )
  }
}