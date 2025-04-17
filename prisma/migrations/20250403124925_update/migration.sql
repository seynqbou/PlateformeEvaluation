/*
  Warnings:

  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `administrateurs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `correction_reference_fichier` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `corrections` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `corrections_reference` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cours` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `etudiants` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `exercice_fichier` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `exercice_tag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `exercices` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `fichiers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `inscriptions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `journaux` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `modele_ia_sujet` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `modeles_ia` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notifications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `professeurs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `soumissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `statistiques` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tags_exercice` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `utilisateurs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropForeignKey
ALTER TABLE "administrateurs" DROP CONSTRAINT "administrateurs_id_utilisateur_fkey";

-- DropForeignKey
ALTER TABLE "correction_reference_fichier" DROP CONSTRAINT "correction_reference_fichier_id_correction_fkey";

-- DropForeignKey
ALTER TABLE "correction_reference_fichier" DROP CONSTRAINT "correction_reference_fichier_id_fichier_fkey";

-- DropForeignKey
ALTER TABLE "corrections" DROP CONSTRAINT "corrections_id_correction_reference_fkey";

-- DropForeignKey
ALTER TABLE "corrections" DROP CONSTRAINT "corrections_id_modele_ia_fkey";

-- DropForeignKey
ALTER TABLE "corrections" DROP CONSTRAINT "corrections_id_professeur_fkey";

-- DropForeignKey
ALTER TABLE "corrections" DROP CONSTRAINT "corrections_id_soumission_fkey";

-- DropForeignKey
ALTER TABLE "corrections_reference" DROP CONSTRAINT "corrections_reference_id_exercice_fkey";

-- DropForeignKey
ALTER TABLE "corrections_reference" DROP CONSTRAINT "corrections_reference_id_professeur_fkey";

-- DropForeignKey
ALTER TABLE "cours" DROP CONSTRAINT "cours_id_professeur_fkey";

-- DropForeignKey
ALTER TABLE "etudiants" DROP CONSTRAINT "etudiants_id_utilisateur_fkey";

-- DropForeignKey
ALTER TABLE "exercice_fichier" DROP CONSTRAINT "exercice_fichier_id_exercice_fkey";

-- DropForeignKey
ALTER TABLE "exercice_fichier" DROP CONSTRAINT "exercice_fichier_id_fichier_fkey";

-- DropForeignKey
ALTER TABLE "exercice_tag" DROP CONSTRAINT "exercice_tag_id_exercice_fkey";

-- DropForeignKey
ALTER TABLE "exercice_tag" DROP CONSTRAINT "exercice_tag_id_tag_fkey";

-- DropForeignKey
ALTER TABLE "exercices" DROP CONSTRAINT "exercices_id_cours_fkey";

-- DropForeignKey
ALTER TABLE "exercices" DROP CONSTRAINT "exercices_id_professeur_fkey";

-- DropForeignKey
ALTER TABLE "fichiers" DROP CONSTRAINT "fichiers_televersee_par_fkey";

-- DropForeignKey
ALTER TABLE "inscriptions" DROP CONSTRAINT "inscriptions_id_cours_fkey";

-- DropForeignKey
ALTER TABLE "inscriptions" DROP CONSTRAINT "inscriptions_id_etudiant_fkey";

-- DropForeignKey
ALTER TABLE "journaux" DROP CONSTRAINT "journaux_id_utilisateur_fkey";

-- DropForeignKey
ALTER TABLE "modele_ia_sujet" DROP CONSTRAINT "modele_ia_sujet_id_modele_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_id_utilisateur_fkey";

-- DropForeignKey
ALTER TABLE "professeurs" DROP CONSTRAINT "professeurs_id_utilisateur_fkey";

-- DropForeignKey
ALTER TABLE "soumissions" DROP CONSTRAINT "soumissions_id_etudiant_fkey";

-- DropForeignKey
ALTER TABLE "soumissions" DROP CONSTRAINT "soumissions_id_exercice_fkey";

-- DropForeignKey
ALTER TABLE "soumissions" DROP CONSTRAINT "soumissions_id_fichier_fkey";

-- DropTable
DROP TABLE "Account";

-- DropTable
DROP TABLE "Session";

-- DropTable
DROP TABLE "VerificationToken";

-- DropTable
DROP TABLE "administrateurs";

-- DropTable
DROP TABLE "correction_reference_fichier";

-- DropTable
DROP TABLE "corrections";

-- DropTable
DROP TABLE "corrections_reference";

-- DropTable
DROP TABLE "cours";

-- DropTable
DROP TABLE "etudiants";

-- DropTable
DROP TABLE "exercice_fichier";

-- DropTable
DROP TABLE "exercice_tag";

-- DropTable
DROP TABLE "exercices";

-- DropTable
DROP TABLE "fichiers";

-- DropTable
DROP TABLE "inscriptions";

-- DropTable
DROP TABLE "journaux";

-- DropTable
DROP TABLE "modele_ia_sujet";

-- DropTable
DROP TABLE "modeles_ia";

-- DropTable
DROP TABLE "notifications";

-- DropTable
DROP TABLE "professeurs";

-- DropTable
DROP TABLE "soumissions";

-- DropTable
DROP TABLE "statistiques";

-- DropTable
DROP TABLE "tags_exercice";

-- DropTable
DROP TABLE "utilisateurs";

-- DropEnum
DROP TYPE "difficulte_exercice";

-- DropEnum
DROP TYPE "role_type";

-- DropEnum
DROP TYPE "source_correction";

-- DropEnum
DROP TYPE "statut_inscription";

-- DropEnum
DROP TYPE "statut_modele";

-- DropEnum
DROP TYPE "statut_soumission";

-- DropEnum
DROP TYPE "type_entite";

-- DropEnum
DROP TYPE "type_notification";

-- DropEnum
DROP TYPE "type_soumission";

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
