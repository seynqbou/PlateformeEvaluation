// components/SubmissionReview.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { type_soumission } from "@prisma/client";

interface SubmissionReviewProps {
  submission: any; // Replace 'any' with a proper type later
  correction: any;  // Replace 'any' with a proper type
  open: boolean;
  onClose: () => void;
}

function SubmissionReview({ submission, correction, open, onClose }: SubmissionReviewProps) {
  const [note, setNote] = useState<number | undefined>(correction?.note);
  const [commentaire, setCommentaire] = useState<string | undefined>(correction?.commentaire);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
    const router = useRouter();


  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/corrections/${correction.id_correction}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note, commentaire }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update correction");
      }
      // Refresh the page or update the local state to reflect changes.
      router.refresh();
      onClose(); // Close the dialog

    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

    // Handle file download (if submission is a file)
    const handleDownload = () => {
      if (submission.id_fichier && submission.fichiers?.chemin) {
        const downloadLink = document.createElement("a");

        // Construct the correct path.  'public' is at the root of your project.
        downloadLink.href = submission.fichiers.chemin.replace("uploads", "/uploads");
        downloadLink.download = submission.fichiers.nom; // Set the desired filename
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Révision de la Soumission</DialogTitle>
          <DialogDescription>
            Consultez la soumission de l'étudiant, la correction de référence,
            et ajustez la note et le commentaire si nécessaire.
          </DialogDescription>
        </DialogHeader>

        <div>
          <h3 className="text-lg font-semibold">Réponse de l'Étudiant</h3>
           {submission.type === type_soumission.texte ? (
            <p>{submission.contenu}</p>
          ) : (
            <Button onClick={handleDownload} variant="outline">
              Télécharger le fichier
            </Button>
          )}

          <h3 className="text-lg font-semibold mt-4">Correction de Référence</h3>
            {/* Assuming you have access to the reference correction here */}
            <p>{correction.corrections_reference?.contenu || "Non fournie"}</p>


          <h3 className="text-lg font-semibold mt-4">Note Générée par l'IA</h3>
          <p>{correction?.note ?? "-"}</p>

          <div className="mt-4">
            <label htmlFor="note" className="block text-sm font-medium">
              Ajuster la Note
            </label>
            <Input
              type="number"
              id="note"
              value={note ?? ""}
              onChange={(e) => setNote(parseFloat(e.target.value))}
              className="mt-1"
              min={0}
              max={20}
            />
          </div>

          <div className="mt-4">
            <label htmlFor="commentaire" className="block text-sm font-medium">
              Commentaire
            </label>
            <Textarea
              id="commentaire"
              value={commentaire ?? ""}
              onChange={(e) => setCommentaire(e.target.value)}
              className="mt-1"
            />
          </div>
           {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>

        <DialogFooter>
           <Button onClick={handleSave} disabled={loading}>
            {loading ? "Enregistrement..." : "Enregistrer"}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Annuler
          </Button>

        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SubmissionReview;