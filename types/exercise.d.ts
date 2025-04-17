// types/exercise.d.ts
import { difficulte_exercice } from "@prisma/client";

export interface Exercise {
  id_exercice: string;
  titre: string;
  description: string;
  date_creation: string;
  date_echeance: string | null;
  actif: boolean;
  difficulte: difficulte_exercice;
  format_reponse_attendu: string;
  visible_aux_etudiants: boolean;
  correction_reference?: string;
  submissionStatus: string;
  submissionId: string | null;
} 