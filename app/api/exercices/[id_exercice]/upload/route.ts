// app/api/exercices/[id_exercice]/upload/route.ts
import { writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request, { params }: { params: { id_exercice: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['professeur', 'administrateur'].includes(session.user.role)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const isReferenceCorrection = data.get('isReference') === 'true';

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    // Vérifier l'existence de l'exercice
    const exercice = await prisma.exercices.findUnique({
      where: { id_exercice: params.id_exercice }
    });

    if (!exercice) {
      return NextResponse.json({ error: "Exercice introuvable" }, { status: 404 });
    }

    // Générer un nom de fichier unique
    const uniqueName = `${uuidv4()}-${file.name}`;
    const uploadDir = join(process.cwd(), 'uploads');
    const filePath = join(uploadDir, uniqueName);

    // Écrire le fichier
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Créer l'entrée dans la table fichiers
    const fichier = await prisma.fichiers.create({
      data: {
        nom: file.name,
        type_mime: file.type,
        taille: file.size,
        chemin: filePath,
        televersee_par: session.user.id
      }
    });

    // Associer au fichier à l'exercice
    await prisma.exercice_fichier.create({
      data: {
        id_exercice: params.id_exercice,
        id_fichier: fichier.id_fichier
      }
    });

    // Gestion des corrections de référence
    if (isReferenceCorrection) {
      const correctionRef = await prisma.corrections_reference.create({
        data: {
          id_exercice: params.id_exercice,
          id_professeur: session.user.id,
          contenu: "Correction de référence"
        }
      });

      await prisma.correction_reference_fichier.create({
        data: {
          id_correction: correctionRef.id_correction,
          id_fichier: fichier.id_fichier
        }
      });
    }

    return NextResponse.json(fichier, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors du téléversement du fichier" },
      { status: 500 }
    );
  }
}