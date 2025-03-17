import { withAuth } from "next-auth/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { role_type } from "@prisma/client";

// Typage pour le JWT (doit correspondre à types/next-auth.d.ts)
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: role_type;
    email?: string;
    name?: string | null;
  }
}

// Définition des méthodes HTTP
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS";

// Structure des permissions pour chaque route
type RoutePermission = {
  path: RegExp;
  roles: ReadonlyArray<role_type> | "authenticated"; // "authenticated" pour tout utilisateur connecté
  methods?: HttpMethod[];
};

// Configuration des permissions par route
const ROUTE_PERMISSIONS: ReadonlyArray<RoutePermission> = [
  {
    path: /^\/admin(\/|$)/,
    roles: [role_type.administrateur],
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
  {
    path: /^\/professeur(\/|$)/,
    roles: [role_type.professeur],
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
  {
    path: /^\/etudiant(\/|$)/,
    roles: [role_type.etudiant],
    methods: ["GET"],
  },
  {
    path: /^\/dashboard\/etudiant(\/|$)/,
    roles: [role_type.etudiant],
    methods: ["GET"],
  },
  {
    path: /^\/dashboard\/professeur(\/|$)/,
    roles: [role_type.professeur],
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
  {
    path: /^\/dashboard\/professor(\/|$)/,
    roles: [role_type.professeur],
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
  {
    path: /^\/dashboard\/admin(\/|$)/,
    roles: [role_type.administrateur],
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
  {
    path: /^\/dashboard(\/|$)/,
    roles: "authenticated", // Tous les utilisateurs authentifiés peuvent accéder à /dashboard
    methods: ["GET"],
  },
  {
    path: /^\/api\/secure(\/|$)/,
    roles: [role_type.administrateur, role_type.professeur],
    methods: ["POST", "PUT", "DELETE"],
  },
  {
    path: /^\/profil(\/|$)/,
    roles: "authenticated", // Tous les utilisateurs authentifiés
    methods: ["GET", "PUT"],
  },
];

// Vérification de la validité du rôle
const isValidRole = (role: unknown): role is role_type => {
  return Object.values(role_type).includes(role as role_type);
};

// Middleware principal
export default withAuth(
  async function middleware(req: NextRequest) {
    const { pathname, origin } = req.nextUrl;
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // Si pas de token, rediriger ou retourner une erreur
    if (!token) {
      if (pathname.startsWith("/api")) {
        return new NextResponse(
          JSON.stringify({ error: "Non authentifié", message: "Veuillez vous connecter pour accéder à cette ressource" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }
      const signInUrl = new URL("/auth/connexion", origin);
      signInUrl.searchParams.set("callbackUrl", encodeURI(req.url));
      return NextResponse.redirect(signInUrl);
    }

    // Vérification de la validité du rôle
    if (token.role && !isValidRole(token.role)) {
      return new NextResponse(
        JSON.stringify({ error: "Rôle invalide", message: "Votre rôle utilisateur n'est pas reconnu" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Vérification des permissions pour la route demandée
    for (const permission of ROUTE_PERMISSIONS) {
      if (permission.path.test(pathname)) {
        const methodAllowed = !permission.methods || permission.methods.includes(req.method as HttpMethod);
        const roleAllowed =
          permission.roles === "authenticated" || (token.role && permission.roles.includes(token.role));

        if (!methodAllowed) {
          return new NextResponse(
            JSON.stringify({ error: "Méthode non autorisée", message: `La méthode ${req.method} n'est pas permise pour cette route` }),
            { status: 405, headers: { "Content-Type": "application/json" } }
          );
        }

        if (!roleAllowed) {
          if (pathname.startsWith("/api")) {
            return new NextResponse(
              JSON.stringify({ error: "Accès non autorisé", message: "Vous n'avez pas les permissions nécessaires" }),
              { status: 403, headers: { "Content-Type": "application/json" } }
            );
          }
          return NextResponse.redirect(new URL("/acces-refuse", origin));
        }

        // Si tout est valide, passer à la requête suivante
        return NextResponse.next();
      }
    }

    // Si aucune règle ne correspond, autoriser par défaut pour les routes non listées (peut être ajusté)
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Autoriser uniquement les utilisateurs authentifiés
    },
    pages: {
      signIn: "/auth/connexion",
      error: "/auth/erreur",
    },
  }
);

// Configuration des routes à protéger
export const config = {
  matcher: [
    "/admin/:path*",
    "/professeur/:path*",
    "/etudiant/:path*",
    "/profil/:path*",
    "/dashboard/:path*", // Inclut toutes les sous-routes de /dashboard
    "/api/secure/:path*",
  ],
};