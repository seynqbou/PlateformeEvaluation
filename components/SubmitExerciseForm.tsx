// components/SubmitExerciseForm.tsx
"use client";

import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface SubmitExerciseFormProps {
  id_exercice: string;
}

function SubmitExerciseForm({ id_exercice }: SubmitExerciseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [contenu, setContenu] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
    },
    onDrop,
    multiple: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    if (acceptedFiles[0]) {
      formData.append("file", acceptedFiles[0]);
    }
    formData.append("id_exercice", id_exercice);
    formData.append("contenu", contenu);

    try {
      const response = await fetch("/api/soumissions", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setSuccess(true);
        setContenu("");
        if (inputRef.current) {
          inputRef.current.value = ""; // Clear the file input
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Submission failed");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Soumettre l'exercice</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Soumettre l'exercice</DialogTitle>
          <DialogDescription>
            Soumettez votre réponse à l'exercice ici. Vous pouvez soit
            télécharger un fichier PDF, soit saisir votre réponse directement
            dans la zone de texte.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-md p-4 cursor-pointer flex items-center justify-center",
              isDragActive ? "border-blue-500 bg-blue-100" : "border-gray-300",
              acceptedFiles.length > 0 && "border-green-500 bg-green-100"
            )}
          >
            <input {...getInputProps()} ref={inputRef} />
            {acceptedFiles.length > 0 ? (
              <p>Fichier sélectionné: {acceptedFiles[0].name}</p>
            ) : isDragActive ? (
              <p>Déposez le fichier ici...</p>
            ) : (
              <p>
                Faites glisser et déposez un fichier PDF ici, ou cliquez pour
                sélectionner un fichier.
              </p>
            )}
          </div>
          <Textarea
            placeholder="Ou saisissez votre réponse ici..."
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
          />

          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">Soumission réussie!</p>}

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Soumission..." : "Soumettre"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default SubmitExerciseForm;