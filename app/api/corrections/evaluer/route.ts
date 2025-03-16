// app/api/corrections/evaluer/route.ts
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { readFile } from "fs/promises";
import { join } from "path";

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY!;

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Récupération des données
    const { id_soumission } = await request.json();
    if (!id_soumission) {
      return NextResponse.json({ error: "ID soumission manquant" }, { status: 400 });
    }

    // Récupération de la soumission
    const soumission = await prisma.soumissions.findUnique({
      where: { id_soumission },
      include: {
        exercices: {
          include: {
            corrections_reference: {
              include: { correction_reference_fichier: { include: { fichiers: true } } }
            }
          }
        },
        fichiers: true
      }
    });

    if (!soumission) return NextResponse.json({ error: "Soumission introuvable" }, { status: 404 });
    if (!soumission.exercices) return NextResponse.json({ error: "Exercice introuvable" }, { status: 404 });

    // Récupération du contenu
    let reponseEtudiant = soumission.contenu;
    if (!reponseEtudiant && soumission.fichiers?.chemin) {
      reponseEtudiant = await readFile(join(process.cwd(), soumission.fichiers.chemin), 'utf-8');
    }

    let correctionRef = soumission.exercices.corrections_reference[0]?.contenu;
    if (!correctionRef && soumission.exercices.corrections_reference[0]?.correction_reference_fichier[0]?.fichiers?.chemin) {
      correctionRef = await readFile(
        join(process.cwd(), soumission.exercices.corrections_reference[0].correction_reference_fichier[0].fichiers.chemin),
        'utf-8'
      );
    }

    if (!reponseEtudiant || !correctionRef) {
      return NextResponse.json({ error: "Données manquantes pour l'évaluation" }, { status: 400 });
    }

    // Construction du prompt
    const prompt = `En tant qu'expert en évaluation pédagogique, analysez cette réponse d'étudiant comparée à la correction de référence.

**Réponse étudiante**:
${reponseEtudiant}

**Correction de référence**:
${correctionRef}

Générez un feedback JSON avec :
- "note" (sur 20, avec demi-points possibles)
- "commentaire" (en français, 3-5 lignes max)
- "points_forts" (liste)
- "points_amelioration" (liste)

Exemple de format :
{
  "note": 15.5,
  "commentaire": "...",
  "points_forts": ["...", "..."],
  "points_amelioration": ["...", "..."]
}`;

    // Configuration de l'AbortController pour le timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    // Appel à l'API DeepSeek
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 500
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) throw new Error(`Erreur DeepSeek: ${response.statusText}`);

    const data = await response.json();
    const content = data.choices[0].message.content;
    const evaluation = JSON.parse(content);

    // Validation de la réponse
    if (!evaluation.note || !evaluation.commentaire) {
      throw new Error("Format de réponse invalide");
    }

    // Sauvegarde en base
    const correction = await prisma.corrections.create({
      data: {
        id_soumission,
        generee_par: 'ia',
        note: evaluation.note,
        commentaire: evaluation.commentaire,
        details_comparaison: {
          prompt,
          reponseBrute: data,
          evaluationContent: content
        },
        id_modele_ia: 'deepseek-chat'
      }
    });

    return NextResponse.json({ 
      success: true, 
      correction: {
        id_correction: correction.id_correction,
        note: correction.note,
        commentaire: correction.commentaire,
        date_creation: correction.date_creation
      }
    });

  } catch (error) {
    console.error("[ERREUR_CORRECTION]", error);
    
    let errorMessage = "Erreur serveur";
    if (error instanceof Error) {
      errorMessage = error.message;
      if (error.name === 'AbortError') {
        errorMessage = "Timeout de la requête API";
      }
    }

    return NextResponse.json(
      { error: `Échec de l'évaluation IA: ${errorMessage}` },
      { status: 500 }
    );
  }
}