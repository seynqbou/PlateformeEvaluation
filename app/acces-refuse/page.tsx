// app/acces-refuse/page.tsx
export default function AccessDenied() {
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-2xl text-red-600">Accès Refusé</h1>
        <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
      </div>
    );
  }