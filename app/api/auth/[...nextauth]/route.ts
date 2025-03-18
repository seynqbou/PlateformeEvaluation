// app/api/auth/[...nextauth]/route.ts
import NextAuth, { type AuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { role_type } from "@prisma/client";
import type { Adapter } from "next-auth/adapters";

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

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
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
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      profile(profile) {
        return {
          id: profile.sub,
          email: profile.email,
          name: profile.name,
          role: "etudiant" as role_type,
          image: profile.picture,
        };
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
      profile(profile) {
        return {
          id: profile.id.toString(),
          email: profile.email || `${profile.login}@github.com`,
          name: profile.name || profile.login,
          role: "etudiant" as role_type,
          image: profile.avatar_url,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
        console.log("Utilisateur connecté :", { id: user.id, email: user.email, role: user.role });
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
      if (token.id && token.role) {
        session.user = {
          id: token.id,
          role: token.role,
          email: token.email ?? "",
          name: token.name,
        };
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      return `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: "/auth/connexion",
    error: "/auth/erreur",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET ?? "default-secret-for-dev",
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };