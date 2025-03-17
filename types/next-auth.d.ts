import "next-auth";
import { role_type } from "@prisma/client";
import { DefaultSession, DefaultUser } from "next-auth";

// Étendre le module "next-auth" pour personnaliser les types
declare module "next-auth" {
  /**
   * Interface Session : Définit la structure de l'objet session disponible via useSession() ou getSession()
   */
  interface Session {
    user: {
      id: string;        // Identifiant unique de l'utilisateur
      role: role_type;   // Rôle de l'utilisateur, typé avec l'enum Prisma role_type
    } & DefaultSession["user"]; // Hérite des propriétés par défaut (name, email, image)
  }

  /**
   * Interface User : Représente l'utilisateur renvoyé par les providers ou la base de données
   */
  interface User extends DefaultUser {
    id: string;         // Identifiant unique de l'utilisateur
    role: role_type;    // Rôle de l'utilisateur, typé avec l'enum Prisma role_type
  }

  /**
   * Interface JWT : Définit la structure du token JWT utilisé pour la gestion de la session
   */
  interface JWT {
    id?: string;        // Identifiant (optionnel dans le token)
    role?: role_type;   // Rôle (optionnel dans le token)
  }
}