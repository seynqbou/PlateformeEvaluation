// components/ExerciseSubjectUpload.tsx (CORRECTED - Accepts PDF and text)
"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, Upload } from "lucide-react"; // Import Loader2

interface ExerciseSubjectUploadProps {
  id_exercice: string;
    onUploadSuccess?: (exerciceId?: string) => void; // Corrected callback
}

export default function ExerciseSubjectUpload({
  id_exercice,
  onUploadSuccess,
}: ExerciseSubjectUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles[0]) return;

      setIsUploading(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("file", acceptedFiles[0]);
        formData.append("isReference", "false");

        // Check if id_exercice is empty. If so, use a temporary endpoint.
        const url = id_exercice
          ? `/api/exercices/${id_exercice}/upload`
          : `/api/exercices/temp/upload`; // Temporary endpoint

        const response = await fetch(url, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Échec du téléversement");

        // Get exercise ID from the response
        const responseData = await response.json();
        const uploadedExerciseId = responseData.exerciceId;

        onUploadSuccess?.(uploadedExerciseId);  // Pass the exerciseId
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setIsUploading(false);
      }
    },
    [id_exercice, onUploadSuccess]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],  // CORRECTED: Accept PDF
      "text/plain": [".txt", ".md"] // CORRECTED: Accept TXT and MD
    },
    maxFiles: 1
  });

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-md p-6 text-center cursor-pointer",
          isDragActive ? "border-primary bg-primary/10" : "border-muted",
          error && "border-destructive bg-destructive/10"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm">
          {isDragActive
            ? "Déposez le sujet ici..."
            : "Glissez-déposez un PDF/texte ou cliquez"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Formats acceptés: PDF, TXT, MD
        </p>
      </div>

      {isUploading && (
        <div className="flex items-center justify-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Téléversement en cours...
        </div>
      )}

      {error && (
        <p className="text-destructive text-sm">{error}</p>
      )}
    </div>
  );
}