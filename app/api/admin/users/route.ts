// app/api/admin/users/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const users = await prisma.utilisateurs.findMany({
      select: {
        id_utilisateur: true,
        prenom: true,
        nom: true,
        email: true,
        role: true,
        actif: true,
        etudiants: { select: { numero_etudiant: true } },
        professeurs: { select: { specialisation: true } },
        administrateurs: { select: { niveau_admin: true } }
      },
      orderBy: { date_creation: 'desc' }
    })

    return NextResponse.json({ users })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur de récupération des utilisateurs' },
      { status: 500 }
    )
  }
}