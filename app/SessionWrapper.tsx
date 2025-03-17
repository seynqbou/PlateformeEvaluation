"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

interface SessionWrapperProps {
  children: ReactNode;
}

export default function SessionWrapper({ children }: SessionWrapperProps) {
  return (
    <SessionProvider>
      <SessionHandler>{children}</SessionHandler>
    </SessionProvider>
  );
}

function SessionHandler({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      console.log("Utilisateur non authentifié, redirection vers la page de connexion...");
      router.replace("/auth/connexion");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-lg font-semibold text-gray-600">Chargement de la session...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null; // La redirection est déjà en cours
  }

  return <>{children}</>;
}