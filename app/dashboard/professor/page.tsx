import { useEffect, useState } from 'react'
import UserProfile from '@/components/UserProfile'

interface ProfessorData {
  id_utilisateur: string
  prenom: string
  nom: string
  email: string
  role: 'professeur'
  specialisation?: string
}

export default function ProfessorDashboard() {
  const [userData, setUserData] = useState<ProfessorData | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Simuler un ID utilisateur connecté
  const userId = 'd4a8f7c3-1a6b-4a2d-8c9f-3b5e2d7c8a9f' // Remplacer par un ID valide

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/user/professor?id_utilisateur=${userId}`)
        if (!response.ok) {
          throw new Error('Erreur de récupération des données')
        }
        const data = await response.json()
        setUserData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
      }
    }

    fetchData()
  }, [userId])

  if (error) {
    return <div className="p-8 text-destructive">{error}</div>
  }

  if (!userData) {
    return <div className="p-8 text-muted-foreground">Chargement...</div>
  }

  return (
    <div className="p-8 space-y-8">
      <UserProfile user={userData} />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-card p-6 rounded-lg border border-border">
          <h2 className="text-xl font-semibold mb-4">Vos Cours</h2>
          <ul className="space-y-2">
            {['Mathématiques Avancées', 'Algorithmique'].map((cours, index) => (
              <li key={index} className="text-muted-foreground hover:text-foreground transition-colors">
                {cours}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <h2 className="text-xl font-semibold mb-4">Exercices en Attente</h2>
          <div className="text-3xl font-bold text-primary">3</div>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <h2 className="text-xl font-semibold mb-4">Notifications</h2>
          <p className="text-muted-foreground">Aucune nouvelle notification</p>
        </div>
      </div>
    </div>
  )
}