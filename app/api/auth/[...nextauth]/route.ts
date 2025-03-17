import NextAuth, { type AuthOptions, type DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { role_type } from "@prisma/client";
import type { Adapter } from "next-auth/adapters";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: role_type;
    } & DefaultSession["user"];
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

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,  // Cast to Adapter
  providers: [
    CredentialsProvider({
      name: "Identifiants",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
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

        if (!user?.hash_mot_de_passe) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.hash_mot_de_passe
        );

        return isValid
          ? {
              id: user.id_utilisateur,
              email: user.email,
              name: `${user.prenom} ${user.nom}`,
              role: user.role,
            }
          : null;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          email: profile.email,
          name: profile.name || profile.login,
          role: "etudiant" as role_type, // Force role to "etudiant"
          image: profile.picture,
        };
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.id.toString(),
          email: profile.email || `${profile.login}@github.com`,
          name: profile.name || profile.login,
          role: "etudiant" as role_type, // Force role to "etudiant"
          image: profile.avatar_url,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // No need to check for existing user here; PrismaAdapter handles it
      return true; 
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id && token?.role) {
        session.user = {
          ...session.user,
          id: token.id,
          role: token.role,
          name: token.name,
          email: token.email!,  // Safe to use "!" because we set email in jwt
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/connexion",
    error: "/auth/erreur",
    // newUser: "/auth/inscription"  <-- Remove this line.  We handle new user redirection in the onClick of the Google/GitHub buttons
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };