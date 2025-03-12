-- CreateEnum
CREATE TYPE "role_type" AS ENUM ('etudiant', 'professeur', 'administrateur');

-- CreateEnum
CREATE TYPE "statut_inscription" AS ENUM ('en_cours', 'complete', 'abandonne', 'en_attente');

-- CreateEnum
CREATE TYPE "difficulte_exercice" AS ENUM ('facile', 'moyen', 'difficile', 'expert');

-- CreateEnum
CREATE TYPE "statut_soumission" AS ENUM ('en_attente', 'corrige', 'en_revision', 'rejete');

-- CreateEnum
CREATE TYPE "type_entite" AS ENUM ('cours', 'etudiant', 'exercice', 'professeur');

-- CreateEnum
CREATE TYPE "type_notification" AS ENUM ('info', 'avertissement', 'erreur', 'succes');

-- CreateEnum
CREATE TYPE "source_correction" AS ENUM ('ia', 'professeur', 'mixte');

-- CreateEnum
CREATE TYPE "statut_modele" AS ENUM ('actif', 'en_maintenance', 'obsolete', 'en_test');

-- CreateTable
CREATE TABLE "utilisateurs" (
    "id_utilisateur" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "hash_mot_de_passe" VARCHAR(255) NOT NULL,
    "prenom" VARCHAR(100) NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "date_creation" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_mise_a_jour" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dernier_login" TIMESTAMP(6),
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "photo_profil" VARCHAR(255),
    "role" "role_type" NOT NULL,

    CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("id_utilisateur")
);

-- CreateTable
CREATE TABLE "etudiants" (
    "id_utilisateur" UUID NOT NULL,
    "id_promotion" UUID,
    "numero_etudiant" VARCHAR(50) NOT NULL,
    "departement" VARCHAR(100),

    CONSTRAINT "etudiants_pkey" PRIMARY KEY ("id_utilisateur")
);

-- CreateTable
CREATE TABLE "professeurs" (
    "id_utilisateur" UUID NOT NULL,
    "specialisation" VARCHAR(100),
    "departement" VARCHAR(100),
    "titre" VARCHAR(50),

    CONSTRAINT "professeurs_pkey" PRIMARY KEY ("id_utilisateur")
);

-- CreateTable
CREATE TABLE "administrateurs" (
    "id_utilisateur" UUID NOT NULL,
    "niveau_admin" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "administrateurs_pkey" PRIMARY KEY ("id_utilisateur")
);

-- CreateTable
CREATE TABLE "cours" (
    "id_cours" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nom" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "id_professeur" UUID NOT NULL,
    "date_creation" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_mise_a_jour" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_debut" TIMESTAMP(6) NOT NULL,
    "date_fin" TIMESTAMP(6) NOT NULL,
    "cle_inscription" VARCHAR(100),
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "cours_pkey" PRIMARY KEY ("id_cours")
);

-- CreateTable
CREATE TABLE "inscriptions" (
    "id_inscription" UUID NOT NULL DEFAULT gen_random_uuid(),
    "id_cours" UUID NOT NULL,
    "id_etudiant" UUID NOT NULL,
    "date_inscription" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" "statut_inscription" NOT NULL DEFAULT 'en_cours',
    "taux_achievement" DOUBLE PRECISION DEFAULT 0,
    "note_moyenne" DOUBLE PRECISION,

    CONSTRAINT "inscriptions_pkey" PRIMARY KEY ("id_inscription")
);

-- CreateTable
CREATE TABLE "exercices" (
    "id_exercice" UUID NOT NULL DEFAULT gen_random_uuid(),
    "titre" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "id_professeur" UUID NOT NULL,
    "id_cours" UUID NOT NULL,
    "date_creation" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_mise_a_jour" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_echeance" TIMESTAMP(6),
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "difficulte" "difficulte_exercice" NOT NULL DEFAULT 'moyen',
    "format_reponse_attendu" VARCHAR(50) NOT NULL,
    "visible_aux_etudiants" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "exercices_pkey" PRIMARY KEY ("id_exercice")
);

-- CreateTable
CREATE TABLE "tags_exercice" (
    "id_tag" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nom" VARCHAR(100) NOT NULL,

    CONSTRAINT "tags_exercice_pkey" PRIMARY KEY ("id_tag")
);

-- CreateTable
CREATE TABLE "exercice_tag" (
    "id_exercice" UUID NOT NULL,
    "id_tag" UUID NOT NULL,

    CONSTRAINT "exercice_tag_pkey" PRIMARY KEY ("id_exercice","id_tag")
);

-- CreateTable
CREATE TABLE "fichiers" (
    "id_fichier" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nom" VARCHAR(255) NOT NULL,
    "type_mime" VARCHAR(100) NOT NULL,
    "taille" BIGINT NOT NULL,
    "chemin" VARCHAR(255) NOT NULL,
    "televersee_par" UUID NOT NULL,
    "date_telechargement" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "somme_de_controle" VARCHAR(255),
    "est_public" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "fichiers_pkey" PRIMARY KEY ("id_fichier")
);

-- CreateTable
CREATE TABLE "corrections_reference" (
    "id_correction" UUID NOT NULL DEFAULT gen_random_uuid(),
    "id_exercice" UUID NOT NULL,
    "id_professeur" UUID NOT NULL,
    "contenu" TEXT NOT NULL,
    "date_creation" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_mise_a_jour" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "corrections_reference_pkey" PRIMARY KEY ("id_correction")
);

-- CreateTable
CREATE TABLE "correction_reference_fichier" (
    "id_correction" UUID NOT NULL,
    "id_fichier" UUID NOT NULL,

    CONSTRAINT "correction_reference_fichier_pkey" PRIMARY KEY ("id_correction","id_fichier")
);

-- CreateTable
CREATE TABLE "exercice_fichier" (
    "id_exercice" UUID NOT NULL,
    "id_fichier" UUID NOT NULL,

    CONSTRAINT "exercice_fichier_pkey" PRIMARY KEY ("id_exercice","id_fichier")
);

-- CreateTable
CREATE TABLE "soumissions" (
    "id_soumission" UUID NOT NULL DEFAULT gen_random_uuid(),
    "id_exercice" UUID NOT NULL,
    "id_etudiant" UUID NOT NULL,
    "date_soumission" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contenu" TEXT,
    "id_fichier" UUID,
    "statut" "statut_soumission" NOT NULL DEFAULT 'en_attente',
    "adresse_ip" VARCHAR(45),
    "infos_navigateur" TEXT,
    "tentative_soumission" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "soumissions_pkey" PRIMARY KEY ("id_soumission")
);

-- CreateTable
CREATE TABLE "modeles_ia" (
    "id_modele" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nom" VARCHAR(100) NOT NULL,
    "version" VARCHAR(50) NOT NULL,
    "configuration" JSONB NOT NULL,
    "derniere_mise_a_jour" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" "statut_modele" NOT NULL DEFAULT 'actif',
    "donnees_entrainement" JSONB,

    CONSTRAINT "modeles_ia_pkey" PRIMARY KEY ("id_modele")
);

-- CreateTable
CREATE TABLE "modele_ia_sujet" (
    "id_modele" UUID NOT NULL,
    "sujet" VARCHAR(100) NOT NULL,

    CONSTRAINT "modele_ia_sujet_pkey" PRIMARY KEY ("id_modele","sujet")
);

-- CreateTable
CREATE TABLE "corrections" (
    "id_correction" UUID NOT NULL DEFAULT gen_random_uuid(),
    "id_soumission" UUID NOT NULL,
    "generee_par" "source_correction" NOT NULL DEFAULT 'ia',
    "note" DOUBLE PRECISION NOT NULL,
    "commentaire" TEXT NOT NULL,
    "date_creation" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_mise_a_jour" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ajuste_par_professeur" BOOLEAN NOT NULL DEFAULT false,
    "id_professeur" UUID,
    "details_comparaison" JSONB,
    "id_correction_reference" UUID,
    "id_modele_ia" UUID,

    CONSTRAINT "corrections_pkey" PRIMARY KEY ("id_correction")
);

-- CreateTable
CREATE TABLE "statistiques" (
    "id_stat" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type_entite" "type_entite" NOT NULL,
    "id_entite" UUID NOT NULL,
    "date_calcul" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metriques" JSONB NOT NULL,
    "periode_temps" VARCHAR(50) NOT NULL,

    CONSTRAINT "statistiques_pkey" PRIMARY KEY ("id_stat")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id_notification" UUID NOT NULL DEFAULT gen_random_uuid(),
    "id_utilisateur" UUID NOT NULL,
    "titre" VARCHAR(255) NOT NULL,
    "contenu" TEXT NOT NULL,
    "date_creation" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_lecture" TIMESTAMP(6),
    "type" "type_notification" NOT NULL,
    "type_entite_associee" VARCHAR(50),
    "id_entite_associee" UUID,
    "priorite" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id_notification")
);

-- CreateTable
CREATE TABLE "journaux" (
    "id_journal" UUID NOT NULL DEFAULT gen_random_uuid(),
    "horodatage" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_utilisateur" UUID,
    "action" VARCHAR(255) NOT NULL,
    "type_entite" VARCHAR(50),
    "id_entite" UUID,
    "details" JSONB,
    "adresse_ip" VARCHAR(45),
    "agent_utilisateur" TEXT,

    CONSTRAINT "journaux_pkey" PRIMARY KEY ("id_journal")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_email_key" ON "utilisateurs"("email");

-- CreateIndex
CREATE UNIQUE INDEX "etudiants_numero_etudiant_key" ON "etudiants"("numero_etudiant");

-- CreateIndex
CREATE UNIQUE INDEX "inscriptions_id_cours_id_etudiant_key" ON "inscriptions"("id_cours", "id_etudiant");

-- CreateIndex
CREATE UNIQUE INDEX "tags_exercice_nom_key" ON "tags_exercice"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "modeles_ia_nom_version_key" ON "modeles_ia"("nom", "version");

-- AddForeignKey
ALTER TABLE "etudiants" ADD CONSTRAINT "etudiants_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professeurs" ADD CONSTRAINT "professeurs_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "administrateurs" ADD CONSTRAINT "administrateurs_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cours" ADD CONSTRAINT "cours_id_professeur_fkey" FOREIGN KEY ("id_professeur") REFERENCES "professeurs"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscriptions" ADD CONSTRAINT "inscriptions_id_cours_fkey" FOREIGN KEY ("id_cours") REFERENCES "cours"("id_cours") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscriptions" ADD CONSTRAINT "inscriptions_id_etudiant_fkey" FOREIGN KEY ("id_etudiant") REFERENCES "etudiants"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercices" ADD CONSTRAINT "exercices_id_professeur_fkey" FOREIGN KEY ("id_professeur") REFERENCES "professeurs"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercices" ADD CONSTRAINT "exercices_id_cours_fkey" FOREIGN KEY ("id_cours") REFERENCES "cours"("id_cours") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercice_tag" ADD CONSTRAINT "exercice_tag_id_exercice_fkey" FOREIGN KEY ("id_exercice") REFERENCES "exercices"("id_exercice") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercice_tag" ADD CONSTRAINT "exercice_tag_id_tag_fkey" FOREIGN KEY ("id_tag") REFERENCES "tags_exercice"("id_tag") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fichiers" ADD CONSTRAINT "fichiers_televersee_par_fkey" FOREIGN KEY ("televersee_par") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corrections_reference" ADD CONSTRAINT "corrections_reference_id_exercice_fkey" FOREIGN KEY ("id_exercice") REFERENCES "exercices"("id_exercice") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corrections_reference" ADD CONSTRAINT "corrections_reference_id_professeur_fkey" FOREIGN KEY ("id_professeur") REFERENCES "professeurs"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "correction_reference_fichier" ADD CONSTRAINT "correction_reference_fichier_id_correction_fkey" FOREIGN KEY ("id_correction") REFERENCES "corrections_reference"("id_correction") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "correction_reference_fichier" ADD CONSTRAINT "correction_reference_fichier_id_fichier_fkey" FOREIGN KEY ("id_fichier") REFERENCES "fichiers"("id_fichier") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercice_fichier" ADD CONSTRAINT "exercice_fichier_id_exercice_fkey" FOREIGN KEY ("id_exercice") REFERENCES "exercices"("id_exercice") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercice_fichier" ADD CONSTRAINT "exercice_fichier_id_fichier_fkey" FOREIGN KEY ("id_fichier") REFERENCES "fichiers"("id_fichier") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soumissions" ADD CONSTRAINT "soumissions_id_exercice_fkey" FOREIGN KEY ("id_exercice") REFERENCES "exercices"("id_exercice") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soumissions" ADD CONSTRAINT "soumissions_id_etudiant_fkey" FOREIGN KEY ("id_etudiant") REFERENCES "etudiants"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soumissions" ADD CONSTRAINT "soumissions_id_fichier_fkey" FOREIGN KEY ("id_fichier") REFERENCES "fichiers"("id_fichier") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modele_ia_sujet" ADD CONSTRAINT "modele_ia_sujet_id_modele_fkey" FOREIGN KEY ("id_modele") REFERENCES "modeles_ia"("id_modele") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corrections" ADD CONSTRAINT "corrections_id_soumission_fkey" FOREIGN KEY ("id_soumission") REFERENCES "soumissions"("id_soumission") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corrections" ADD CONSTRAINT "corrections_id_professeur_fkey" FOREIGN KEY ("id_professeur") REFERENCES "professeurs"("id_utilisateur") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corrections" ADD CONSTRAINT "corrections_id_correction_reference_fkey" FOREIGN KEY ("id_correction_reference") REFERENCES "corrections_reference"("id_correction") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corrections" ADD CONSTRAINT "corrections_id_modele_ia_fkey" FOREIGN KEY ("id_modele_ia") REFERENCES "modeles_ia"("id_modele") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journaux" ADD CONSTRAINT "journaux_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE SET NULL ON UPDATE CASCADE;
