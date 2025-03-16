// types/user.d.ts
export interface User {
    id_utilisateur: string
    prenom: string
    nom: string
    email: string
    role: 'etudiant' | 'professeur' | 'administrateur'
    actif: boolean
    etudiants?: { numero_etudiant: string } | null
    professeurs?: { specialisation: string } | null
    administrateurs?: { niveau_admin: number } | null
  }
  
  export interface ApiResponse<T = any> {
    data?: T
    error?: string
  }