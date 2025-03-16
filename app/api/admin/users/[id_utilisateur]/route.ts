// app/api/admin/users/[id_utilisateur]/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: { id_utilisateur: string } }
) {
  try {
    const user = await prisma.utilisateurs.delete({
      where: { id_utilisateur: params.id_utilisateur }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Échec de la suppression' },
      { status: 500 }
    )
  }
}