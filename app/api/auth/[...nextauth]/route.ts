import NextAuth, { type AuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { role_type } from "@prisma/client";
import type { Adapter } from "next-auth/adapters";

// Types personnalisés pour NextAuth
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: role_type;
      email: string;
      name?: string | null;
    } & import("next-auth").DefaultSession["user"];
  }

  interface User {
    id: string;
    role: role_type;
    email: string;
    name?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: role_type;
    email?: string;
    name?: string | null;
  }
}

// Configuration des options d'authentification
export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter, // Adaptateur Prisma pour gérer les utilisateurs dans la base de données
  providers: [
    // Fournisseur d'identifiants (email/mot de passe)
    CredentialsProvider({
      name: "Identifiants",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe sont requis");
        }

        const user = await prisma.utilisateurs.findUnique({
          where: { email: credentials.email },
          select: {
            id_utilisateur: true,
            email: true,
            prenom: true,
            nom: true,
            role: true,
            hash_mot_de_passe: true,
          },
        });

        if (!user || !user.hash_mot_de_passe) {
          throw new Error("Utilisateur non trouvé ou mot de passe non défini");
        }

        const isValid = await bcrypt.compare(credentials.password, user.hash_mot_de_passe);
        if (!isValid) {
          throw new Error("Mot de passe incorrect");
        }

        return {
          id: user.id_utilisateur,
          email: user.email,
          name: `${user.prenom || ""} ${user.nom || ""}`.trim() || null,
          role: user.role,
        };
      },
    }),
    // Fournisseur Google
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      profile(profile) {
        return {
          id: profile.sub,
          email: profile.email,
          name: profile.name,
          role: "etudiant" as role_type, // Par défaut, nouveaux utilisateurs Google sont étudiants
          image: profile.picture,
        };
      },
    }),
    // Fournisseur GitHub
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
      profile(profile) {
        return {
          id: profile.id.toString(),
          email: profile.email || `${profile.login}@github.com`,
          name: profile.name || profile.login,
          role: "etudiant" as role_type, // Par défaut, nouveaux utilisateurs GitHub sont étudiants
          image: profile.avatar_url,
        };
      },
    }),
  ],
  callbacks: {
    // Callback pour valider la connexion
    async signIn({ user, account, profile }) {
      // Logique supplémentaire si nécessaire (ex. : vérification de l'email)
      console.log("Utilisateur connecté :", { id: user.id, email: user.email, role: user.role });
      return true; // Autoriser la connexion
    },
    // Callback pour personnaliser le token JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    // Callback pour personnaliser la session
    async session({ session, token }) {
      if (token.id && token.role) {
        session.user = {
          id: token.id,
          role: token.role,
          email: token.email ?? "", // Toujours défini grâce au provider ou authorize
          name: token.name,
        };
      }
      return session;
    },
    // Callback pour gérer la redirection après connexion
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      return `${baseUrl}/dashboard`; // Redirection par défaut vers le dashboard
    },
  },
  pages: {
    signIn: "/auth/connexion", // Page de connexion personnalisée
    error: "/auth/erreur",     // Page d'erreur personnalisée
  },
  session: {
    strategy: "jwt",           // Utiliser JWT pour la gestion de session
    maxAge: 30 * 24 * 60 * 60, // Durée de vie de la session : 30 jours
  },
  secret: process.env.NEXTAUTH_SECRET ?? "default-secret-for-dev", // Secret obligatoire pour signer les JWT
  debug: process.env.NODE_ENV === "development", // Activer le débogage en développement
};

// Initialisation de NextAuth avec les options
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };