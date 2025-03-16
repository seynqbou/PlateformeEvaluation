// app/admin/users/page.tsx
'use client'

import { useEffect, useState } from 'react'
import UserProfile from '@/components/UserProfile'

interface User {
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

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Simulation admin
  const adminId = 'd4a8f7c3-1a6b-4a2d-8c9f-3b5e2d7c8a9f'

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (!response.ok) throw new Error('Erreur de chargement')
      const data = await response.json()
      setUsers(data.users)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleDelete = async (userId: string) => {
    if (!confirm('Confirmer la suppression ?')) return
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Échec de la suppression')
      
      setUsers(users.filter(user => user.id_utilisateur !== userId))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur inconnue')
    }
  }

  if (loading) return <div className="p-8 text-muted-foreground">Chargement...</div>
  if (error) return <div className="p-8 text-destructive">{error}</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Gestion des utilisateurs</h1>
      
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              {['ID', 'Prénom', 'Nom', 'Email', 'Rôle', 'Actif', 'Actions'].map((header) => (
                <th key={header} className="px-4 py-3 text-left text-sm font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody>
            {users.map((user) => (
              <tr key={user.id_utilisateur} className="border-t hover:bg-muted/50">
                <td className="px-4 py-3 text-sm">{user.id_utilisateur}</td>
                <td className="px-4 py-3">{user.prenom}</td>
                <td className="px-4 py-3">{user.nom}</td>
                <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                <td className="px-4 py-3 capitalize">{user.role}</td>
                <td className="px-4 py-3">{user.actif ? 'Oui' : 'Non'}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(user.id_utilisateur)}
                    className="text-destructive hover:text-destructive/70"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}