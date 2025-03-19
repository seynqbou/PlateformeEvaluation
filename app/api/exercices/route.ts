// app/api/exercices/route.ts (CORRECTED)
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { role_type } from "@prisma/client";

export async function GET(request: Request) {
  // (Your existing GET handler - no changes needed)
    try {
      const session = await getServerSession(authOptions);
      if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const where: any = {};

      if (session.user.role === 'etudiant') {
        where.visible_aux_etudiants = true;
      } else if (session.user.role === 'professeur') {
        where.id_professeur = session.user.id;
      }

      const exercices = await prisma.exercices.findMany({
        include: {
          professeurs: true,
          cours: true,
          exercice_fichier: {
            include: { fichiers: true }
          }
        },
        where
      });

      return NextResponse.json(exercices);
    } catch (error) {
      return NextResponse.json(
        { error: "Erreur lors de la récupération des exercices" },
        { status: 500 }
      );
    }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session?.user ||
      !["professeur", "administrateur"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const data = await request.json();

    // Validation des données (MORE ROBUST VALIDATION)
    if (
      !data.titre ||
      !data.description ||
      !data.id_cours ||
      !data.format_reponse_attendu
    ) {
      return NextResponse.json(
        { error: "Champs requis manquants" },
        { status: 400 }
      );
    }

    // Vérification de l'existence du cours
    const coursExists = await prisma.cours.findUnique({
      where: { id_cours: data.id_cours },
    });

    if (!coursExists) {
      return NextResponse.json({ error: "Cours introuvable" }, { status: 404 });
    }

    // --- Check for temporary exercise ---
    if (data.titre === "Temp Exercise") {
      // Find and update the temporary exercise
      const tempExercice = await prisma.exercices.findFirst({
        where: {
          titre: "Temp Exercise",
          id_professeur: session.user.id,
        },
      });

      if (!tempExercice) {
        return NextResponse.json(
          { error: "Temporary exercise not found" },
          { status: 404 }
        );
      }

      const updatedExercice = await prisma.exercices.update({
        where: { id_exercice: tempExercice.id_exercice },
        data: {
          ...data, // Update with the actual data
          id_professeur: session.user.id, // Ensure correct professor ID
          date_echeance: data.date_echeance
            ? new Date(data.date_echeance)
            : null,
        },
      });
        return NextResponse.json(updatedExercice, { status: 200 }); // OK, updated
    } else {
        const nouvelExercice = await prisma.exercices.create({
          data: {
            ...data,
            id_professeur: session.user.id,
            date_echeance: data.date_echeance ? new Date(data.date_echeance) : null
          }
        });

        return NextResponse.json(nouvelExercice, { status: 201 });
      }
  } catch (error) {
    console.error("Error creating/updating exercise:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création/mise à jour de l'exercice" },
      { status: 500 }
    );
  }
}