import Image from 'next/image'
import { signOut } from 'next-auth/react'

interface UserProfileProps {
  user: {
    id_utilisateur: string
    prenom: string
    nom: string
    email: string
    role: 'etudiant' | 'professeur' | 'administrateur'
    photo_profil?: string | null
    numero_etudiant?: string
    specialisation?: string
  }
}

export default function UserProfile({ user }: UserProfileProps) {
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      signOut({ callbackUrl: '/auth/connexion' })
    } catch (error) {
      console.error('Échec de la déconnexion :', error)
    }
  }

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-full bg-muted overflow-hidden">
            {user.photo_profil ? (
              <Image
                src={user.photo_profil}
                alt={`Photo de profil de ${user.prenom} ${user.nom}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 80px, 80px"
              />
            ) : (
              <div className="w-full h-full bg-accent flex items-center justify-center">
                <span className="text-2xl text-accent-foreground">
                  {user.prenom[0]}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-foreground">
              {user.prenom} {user.nom}
            </h1>
            <p className="text-muted-foreground">{user.email}</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-muted text-muted-foreground text-sm rounded-md">
                {user.role}
              </span>
              {user.numero_etudiant && (
                <span className="px-2 py-1 bg-muted text-muted-foreground text-sm rounded-md">
                  #{user.numero_etudiant}
                </span>
              )}
              {user.specialisation && (
                <span className="px-2 py-1 bg-muted text-muted-foreground text-sm rounded-md">
                  {user.specialisation}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="self-start px-4 py-2 bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors rounded-md text-sm font-medium"
        >
          Déconnexion
        </button>
      </div>
    </div>
  )
}