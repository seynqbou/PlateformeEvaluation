"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Mapping des rôles vers leurs chemins respectifs
const roleToPath: Record<string, string> = {
  etudiant: "/dashboard/etudiant",
  professeur: "/dashboard/professeur",
  administrateur: "/dashboard/admin",
};

export default function DashboardRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "authenticated" && session?.user?.role) {
      const role = session.user.role.toLowerCase();
      const redirectPath = roleToPath[role] || "/auth/erreur";
      console.log(`Redirection vers ${redirectPath} pour le rôle ${role}`);
      router.replace(redirectPath);
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-500">Redirection en cours...</p>
      </div>
    );
  }

  return null; // Cette page ne rend rien, elle redirige uniquement
}