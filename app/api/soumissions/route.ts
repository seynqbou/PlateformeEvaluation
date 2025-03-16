// app/api/soumissions/route.ts
import { writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { statut_soumission, type_soumission } from "@prisma/client";  // Corrected import
import * as z from 'zod'; // Import Zod

// Validation schema using Zod
const submissionSchema = z.object({
    id_exercice: z.string().uuid(),
    contenu: z.string().optional(),
});

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== "etudiant") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const data = await request.formData();

        // Extract and validate plain text fields using Zod
        const plainData = {
          id_exercice: data.get('id_exercice') as string | null,
          contenu: data.get('contenu') as string | null,
        }

        const validatedPlainData = submissionSchema.safeParse(plainData);
        let submissionType: type_soumission = type_soumission.fichier; // Default to fichier

        if (!validatedPlainData.success) {
          return NextResponse.json({ error: "Invalid form data", details: validatedPlainData.error }, { status: 400 });
        }


        const file: File | null = data.get("file") as unknown as File;

        // Validate that id_exercice is provided
        if (!validatedPlainData.data.id_exercice) {
          return NextResponse.json({ error: "id_exercice is required" }, { status: 400 });
        }


        // Check if the exercise exists and is visible to students
        const exercice = await prisma.exercices.findUnique({
            where: {
                id_exercice: validatedPlainData.data.id_exercice,
                visible_aux_etudiants: true,
            },
        });

        if (!exercice) {
            return NextResponse.json({ error: "Exercice introuvable ou non visible" }, { status: 404 });
        }

        let id_fichier: string | undefined;

        if (file) {
           // File validation (type and size) - adjust maxSize as needed
           const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.type !== "application/pdf") {
                return NextResponse.json({ error: "Invalid file type. Only PDFs are allowed." }, { status: 400 });
            }
            if (file.size > maxSize) {
                return NextResponse.json({ error: "File size exceeds the limit (10MB)." }, { status: 400 });
            }

            const uniqueName = `${uuidv4()}-${file.name}`;
            const uploadDir = join(process.cwd(), "uploads");
            const filePath = join(uploadDir, uniqueName);
            const buffer = Buffer.from(await file.arrayBuffer());
            await writeFile(filePath, buffer);


          const fichier = await prisma.fichiers.create({
              data: {
                  nom: file.name,
                  type_mime: file.type,
                  taille: file.size,
                  chemin: filePath, // Store relative path
                  televersee_par: session.user.id,
              },
          });
          id_fichier = fichier.id_fichier;
          submissionType = type_soumission.fichier

        }
      else if (validatedPlainData.data.contenu){
        submissionType = type_soumission.texte;

      }
      else {
        return NextResponse.json({ error: "File or text content required" }, { status: 400 });
      }



        const soumission = await prisma.soumissions.create({
            data: {
                id_exercice: validatedPlainData.data.id_exercice,
                id_etudiant: session.user.id,
                contenu: validatedPlainData.data.contenu,
                id_fichier: id_fichier, // Link the file if it exists
                statut: statut_soumission.en_attente,
                type: submissionType,
                // adresse_ip: request.headers.get('x-forwarded-for') ?? '127.0.0.1',  // Example - use a library for reliable IP detection
                // infos_navigateur: request.headers.get('user-agent') ?? 'Unknown',    // Example
            },
        });


        // Trigger the correction API *after* successful submission
        try {
            const correctionResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/corrections/evaluer`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id_soumission: soumission.id_soumission }),
            });
            if (!correctionResponse.ok) {
                // Log the error, but don't block the submission
                console.error("Correction API error:", await correctionResponse.text());
                // Optionally update submission status
                await prisma.soumissions.update({
                    where: { id_soumission: soumission.id_soumission },
                    data: { statut: statut_soumission.erreur_correction }, //Corrected enum
                });
            }
          } catch (correctionError) {
            console.error("Error calling correction API:", correctionError);
            await prisma.soumissions.update({
                where: { id_soumission: soumission.id_soumission },
                data: { statut: statut_soumission.erreur_correction },//Corrected enum
            });
          }

        return NextResponse.json({ id_soumission: soumission.id_soumission }, { status: 201 });
    } catch (error) {
        console.error("Submission error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}