export default function ErrorPage() {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h1 className="text-3xl font-bold text-red-600">Erreur d'Authentification</h1>
        <p className="mt-4 text-lg text-gray-700">
          Une erreur est survenue lors de la redirection. Veuillez vérifier vos identifiants ou contacter l'administrateur.
        </p>
        <a href="/auth/connexion" className="mt-6 text-blue-500 hover:underline">
          Retour à la connexion
        </a>
      </div>
    );
  }