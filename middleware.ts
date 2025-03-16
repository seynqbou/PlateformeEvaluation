import { withAuth } from "next-auth/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { role_type } from "@prisma/client";

// Déclaration des types étendus pour NextAuth
declare module "next-auth/jwt" {
  interface JWT {
    role?: role_type;
  }
}

// Configuration type-safe des permissions
type RoutePermission = {
  path: RegExp;
  roles: ReadonlyArray<role_type>;
  methods?: HttpMethod[];
};

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS';

const ROUTE_PERMISSIONS: ReadonlyArray<RoutePermission> = [
  { 
    path: /^\/admin(\/|$)/,
    roles: [role_type.administrateur],
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  },
  { 
    path: /^\/professeur(\/|$)/, 
    roles: [role_type.professeur],
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  },
  { 
    path: /^\/etudiant(\/|$)/,
    roles: [role_type.etudiant],
    methods: ['GET']
  },
  {
    path: /^\/api\/secure(\/|$)/,
    roles: [role_type.administrateur, role_type.professeur],
    methods: ['POST', 'PUT', 'DELETE']
  }
];

// Vérificateur de type pour les rôles
const isValidRole = (role: unknown): role is role_type => {
  return Object.values(role_type).includes(role as role_type);
};

export default withAuth(
  async function middleware(req: NextRequest) {
    const { pathname, origin } = req.nextUrl;
    const token = await getToken({ req });

    // 1. Gestion des non-authentifiés
    if (!token) {
      const signInUrl = new URL('/auth/connexion', origin);
      signInUrl.searchParams.set('callbackUrl', encodeURI(req.url));
      return NextResponse.redirect(signInUrl);
    }

    // 2. Validation du rôle
    if (!token.role || !isValidRole(token.role)) {
      return new NextResponse(
        JSON.stringify({ error: 'Rôle utilisateur invalide' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Vérification des permissions
    for (const permission of ROUTE_PERMISSIONS) {
      if (permission.path.test(pathname)) {
        const methodAllowed = !permission.methods || 
          permission.methods.includes(req.method as HttpMethod) || 
          req.method === 'OPTIONS';

        const roleAllowed = permission.roles.includes(token.role);

        if (!methodAllowed || !roleAllowed) {
          if (pathname.startsWith('/api')) {
            return new NextResponse(
              JSON.stringify({ error: 'Accès non autorisé' }),
              { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
          }
          return NextResponse.redirect(new URL('/acces-refuse', origin));
        }
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/auth/connexion',
      error: '/auth/erreur'
    }
  }
);

export const config = {
  matcher: [
    '/admin/:path*',
    '/professeur/:path*',
    '/etudiant/:path*',
    '/profil',
    '/dashboard',
    '/api/secure/:path*'
  ]
};