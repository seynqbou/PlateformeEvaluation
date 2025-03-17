import SessionWrapper from "./SessionWrapper";
import "./globals.css";

export const metadata = {
  title: "Plateforme d'Évaluation",
  description: "Une plateforme pour étudiants et professeurs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-gray-50">
        <SessionWrapper>{children}</SessionWrapper>
      </body>
    </html>
  );
}