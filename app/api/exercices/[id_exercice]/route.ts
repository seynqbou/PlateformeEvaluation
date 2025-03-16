// app/api/exercices/[id_exercice]/route.ts
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: Request, { params }: { params: { id_exercice: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const exercice = await prisma.exercices.findUnique({
      where: { id_exercice: params.id_exercice },
      include: {
        professeurs: true,
        cours: true,
        exercice_fichier: {
          include: { fichiers: true }
        },
        corrections_reference: true
      }
    });

    if (!exercice) {
      return NextResponse.json({ error: "Exercice introuvable" }, { status: 404 });
    }

    return NextResponse.json(exercice);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'exercice" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: { id_exercice: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['professeur', 'administrateur'].includes(session.user.role)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const data = await request.json();
    const exercice = await prisma.exercices.findUnique({
      where: { id_exercice: params.id_exercice }
    });

    if (!exercice) {
      return NextResponse.json({ error: "Exercice introuvable" }, { status: 404 });
    }

    if (session.user.role === 'professeur' && exercice.id_professeur !== session.user.id) {
      return NextResponse.json({ error: "Action non autorisée" }, { status: 403 });
    }

    const updatedExercice = await prisma.exercices.update({
      where: { id_exercice: params.id_exercice },
      data: {
        ...data,
        date_echeance: data.date_echeance ? new Date(data.date_echeance) : null
      }
    });

    return NextResponse.json(updatedExercice);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'exercice" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id_exercice: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['professeur', 'administrateur'].includes(session.user.role)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const exercice = await prisma.exercices.findUnique({
      where: { id_exercice: params.id_exercice }
    });

    if (!exercice) {
      return NextResponse.json({ error: "Exercice introuvable" }, { status: 404 });
    }

    if (session.user.role === 'professeur' && exercice.id_professeur !== session.user.id) {
      return NextResponse.json({ error: "Action non autorisée" }, { status: 403 });
    }

    await prisma.exercices.delete({
      where: { id_exercice: params.id_exercice }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'exercice" },
      { status: 500 }
    );
  }
}