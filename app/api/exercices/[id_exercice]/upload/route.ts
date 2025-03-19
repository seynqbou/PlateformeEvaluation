// app/api/exercices/[id_exercice]/upload/route.ts (TRULY, TRULY, TRULY FINAL)
import { writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import fs from 'fs';
import { Session } from "next-auth";

export async function POST(request: Request, { params }: { params: { id_exercice: string } }) {
    try {
        const session = await getServerSession(authOptions);
        
        // Type assertion to help TypeScript understand the session structure
        if (!session?.user || !('role' in session.user)) {
            return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
        }

        // Now TypeScript knows session.user exists and has a role property
        const user = session.user as { id: string; role: string };

        if (!['professeur', 'administrateur'].includes(user.role)) {
            return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
        }

        // 2. Await request.formData() *before* accessing params.
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;
        const isReferenceCorrection = data.get('isReference') === 'true';

        // 3. Define a function to handle the upload logic.
        async function handleUpload(): Promise<NextResponse> {
            // NOW it's safe to access params
            let exerciceId = params.id_exercice;

            if (!file) {
                return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
            }

            // --- Handle "temp" uploads (for new exercises) ---
            if (exerciceId === "temp") {
              // Find an existing and active course.  This is MUCH better than hardcoding.
              const firstActiveCourse = await prisma.cours.findFirst({
                where: {
                    actif: true,
                    // Add other conditions if needed, e.g., belonging to the professor
                    // id_professeur: session.user.id,
                },
              });

              if (!firstActiveCourse) {
                return NextResponse.json({ error: "Aucun cours actif trouvé." }, { status: 400 });
              }

                // Create a *temporary* exercise.
                const tempExercice = await prisma.exercices.create({
                data: {
                    titre: "Temp Exercise",
                    description: "Temp Description",
                    id_professeur: user.id,
                    id_cours: firstActiveCourse.id_cours, // Use a VALID course ID
                    format_reponse_attendu: "texte",
                    visible_aux_etudiants: false,
                },
                });
                exerciceId = tempExercice.id_exercice; // Use the temporary ID.

            } else {
                 // --- Check if exercise exists (for existing exercises)---
                const existingExercise = await prisma.exercices.findUnique({
                    where: { id_exercice: exerciceId },
                });
                if (!existingExercise) {
                    return NextResponse.json({ error: "Exercice introuvable" }, { status: 404 });
                }
            }

            // --- File Handling ---
            const uniqueName = `${uuidv4()}-${file.name}`;
            const uploadDir = join(process.cwd(), 'uploads');
            const filePath = join(uploadDir, uniqueName);
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
                chemin: filePath,
                televersee_par: user.id,
            },
            });

            await prisma.exercice_fichier.create({
                data: {
                    id_exercice: exerciceId,
                    id_fichier: fichier.id_fichier,
                }
            });

             if (isReferenceCorrection) {
                // Find existing correction reference
                const existingCorrectionRef = await prisma.corrections_reference.findFirst({
                where: { id_exercice: exerciceId },
                });

                let correctionRef;

                if (existingCorrectionRef) {
                // Update existing correction
                correctionRef = await prisma.corrections_reference.update({
                    where: { id_correction: existingCorrectionRef.id_correction },
                    data: {
                    id_professeur: user.id,
                    contenu: "Updated Correction", // Update with actual content
                    },
                });
                } else {
                // Create new correction reference
                correctionRef = await prisma.corrections_reference.create({
                    data: {
                    id_exercice: exerciceId,
                    id_professeur: user.id,
                    contenu: "Correction de référence",
                    },
                });
                }
                // Link file to correction
                await prisma.correction_reference_fichier.create({
                data: {
                    id_correction: correctionRef.id_correction,
                    id_fichier: fichier.id_fichier,
                },
                });
            }

            return NextResponse.json(
              { success: true, fileId: fichier.id_fichier, exerciceId: exerciceId, filePath },
              { status: 201 }
            );
        }

        // 4. Call the function and return its result.
        return await handleUpload(); // VERY IMPORTANT: await the call

    } catch (error) {
        console.error("Upload error:", error);
        if (error instanceof Error) {
            console.error("Error Message:", error.message);
        }
        return NextResponse.json(
            { error: "Erreur lors du téléversement du fichier" },
            { status: 500 }
        );
    }
}