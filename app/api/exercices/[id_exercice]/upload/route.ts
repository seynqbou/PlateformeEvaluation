import { writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import fs from 'fs'; // Import the 'fs' module

export async function POST(request: Request, { params }: { params: { id_exercice: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['professeur', 'administrateur'].includes(session.user.role)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const isReferenceCorrection = data.get('isReference') === 'true'; // Correctly get isReference

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }
      console.log("is ref ? ",isReferenceCorrection)
    // --- Check if exercise exists ---
    let exerciceId = params.id_exercice;
    if (exerciceId === "") {
        // If id_exercice is empty (new exercise), create a temporary one
          const tempExercice = await prisma.exercices.create({
            data: {
              titre: "Temp Exercise", // Provide a default title
              description: "Temp Description", //Provide a default description
              id_professeur: session.user.id,
              id_cours: "a39a8554-8853-4e62-a94e-4c55f6950526", // Replace with a valid course ID,
              format_reponse_attendu: "texte",
              visible_aux_etudiants: false,
            },
          });
          exerciceId = tempExercice.id_exercice;
          console.log("created temp exercise with id: ",exerciceId)
    } else {
        // Verify existing exercise
        const existingExercise = await prisma.exercices.findUnique({
            where: { id_exercice: exerciceId },
        });
        if (!existingExercise) {
            return NextResponse.json({ error: "Exercice introuvable" }, { status: 404 });
        }
    }
    console.log("id_exercice after creation/check:", exerciceId);

    // --- File Handling ---
    const uniqueName = `${uuidv4()}-${file.name}`;
    const uploadDir = join(process.cwd(), 'uploads');
    const filePath = join(uploadDir, uniqueName);

      // Vérifier si le dossier existe, sinon le créer
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // --- Database Operations ---
    const fichier = await prisma.fichiers.create({
      data: {
        nom: file.name,
        type_mime: file.type,
        taille: file.size,
        chemin: filePath, // Store the full path
        televersee_par: session.user.id,
      },
    });

      // Always create the link in exercice_fichier, even for corrections
        await prisma.exercice_fichier.create({
            data: {
                id_exercice: exerciceId,
                id_fichier: fichier.id_fichier,
            }
        });

    if (isReferenceCorrection) {
        // If it's a correction reference, create the correction entry
        const correctionRef = await prisma.corrections_reference.create({
          data: {
            id_exercice: exerciceId,  // Use the (possibly temporary) exercise ID
            id_professeur: session.user.id,
            contenu: "Correction de référence", // Or some other default content
          },
        });

        // And link the file to the correction
        await prisma.correction_reference_fichier.create({
            data:{
                id_correction: correctionRef.id_correction,
                id_fichier: fichier.id_fichier,
            }
        });
      }
      return NextResponse.json({ success: true, fileId: fichier.id_fichier, filePath }, { status: 201 });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Erreur lors du téléversement du fichier" },
      { status: 500 }
    );
  }
}