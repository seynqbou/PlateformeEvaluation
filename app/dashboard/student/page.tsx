import { useEffect, useState } from 'react'
import UserProfile from '@/components/UserProfile'

interface StudentData {
  id_utilisateur: string
  prenom: string
  nom: string
  email: string
  role: 'etudiant'
  numero_etudiant?: string
}

export default function StudentDashboard() {
  const [userData, setUserData] = useState<StudentData | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Simuler un ID utilisateur connecté
  const userId = 'b3e9f1a2-5c7d-4a8b-9f3c-1d6e5f8a9b0d' // Remplacer par un ID valide

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/user/student?id_utilisateur=${userId}`)
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
          <h2 className="text-xl font-semibold mb-4">Cours Inscrits</h2>
          <ul className="space-y-2">
            {['Introduction à lIA', 'Base de données'].map((cours, index) => (
              <li key={index} className="text-muted-foreground hover:text-foreground transition-colors">
                {cours}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <h2 className="text-xl font-semibold mb-4">Prochains Exercices</h2>
          <ul className="space-y-3">
            {[
              { titre: 'Algorithme de tri', date: '15/03/2024' },
              { titre: 'Réseaux de neurones', date: '20/03/2024' }
            ].map((exercice, index) => (
              <li key={index} className="flex justify-between items-center">
                <span>{exercice.titre}</span>
                <span className="text-muted-foreground text-sm">{exercice.date}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <h2 className="text-xl font-semibold mb-4">Notifications</h2>
          <p className="text-muted-foreground">Aucune nouvelle notification</p>
        </div>
      </div>
    </div>
  )
}