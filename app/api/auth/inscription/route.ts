import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password, prenom, nom, role } = await req.json();

    // Validation des données
    if (!email || !password || !prenom || !nom || !role) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    // Vérification du rôle
    const validRoles = ["etudiant", "professeur", "administrateur"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Rôle utilisateur invalide" },
        { status: 400 }
      );
    }

    // Normalisation de l'email
    const normalizedEmail = email.toLowerCase();

    // Vérification du format de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Format d'email invalide" },
        { status: 400 }
      );
    }

    // Vérification de la force du mot de passe
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caractères" },
        { status: 400 }
      );
    }

    // Vérification de l'existence de l'utilisateur
    console.log("📌 Prisma est chargé ?", prisma);
console.log("📌 Modèles Prisma :", Object.keys(prisma));


    const existingUser = await prisma.utilisateurs.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 409 }
      );
    }

    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Transaction Prisma correctement typée
    const user = await prisma.$transaction(async (tx) => {
      // Création de l'utilisateur principal
      const newUser = await tx.utilisateurs.create({
        data: {
          email: normalizedEmail,
          hash_mot_de_passe: hashedPassword,
          prenom,
          nom,
          role,
          actif: true,
        },
      });

      // Création du profil spécifique au rôle
      switch (role) {
        case "etudiant":
          await tx.etudiant.create({
            data: {
              id_utilisateur: newUser.id_utilisateur,
              numero_etudiant: `ETU-${crypto.randomUUID()}`,
              departement: "À définir",
            },
          });
          break;

        case "professeur":
          await tx.professeur.create({
            data: {
              id_utilisateur: newUser.id_utilisateur,
              specialisation: "À définir",
              departement: "À définir",
            },
          });
          break;

        case "administrateur":
          await tx.administrateur.create({
            data: {
              id_utilisateur: newUser.id_utilisateur,
              niveau_admin: 1,
            },
          });
          break;
      }

      return newUser;
    });

    // Réponse formatée
    return NextResponse.json(
      {
        id: user.id_utilisateur,
        email: user.email,
        prenom: user.prenom,
        nom: user.nom,
        role: user.role,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[ERREUR_INSCRIPTION]", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Une erreur est survenue lors de l'inscription";

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
