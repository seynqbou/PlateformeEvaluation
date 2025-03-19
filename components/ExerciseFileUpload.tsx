// components/ExerciseFileUpload.tsx (CORRECTED - Accepts PDF)
"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, Upload } from "lucide-react"; // Import Loader2 and Upload

interface ExerciseFileUploadProps {
  id_exercice: string;
  onUploadSuccess: (exerciceId?: string) => void; // Corrected callback type
}

function ExerciseFileUpload({ id_exercice, onUploadSuccess }: ExerciseFileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        setError(null); // Clear previous errors
        handleUpload(acceptedFiles[0]);
      }
    },
    [id_exercice, onUploadSuccess]
  );

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],  // CORRECTED: Accept PDF files
    },
    onDrop,
    multiple: false,
  });

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setError(null);

    // Check if id_exercice is empty or not.  If empty, we're in "create" mode.
    const url = id_exercice ? `/api/exercices/${id_exercice}/upload` : `/api/exercices/temp/upload`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("isReference", "true"); // Indicate this is a reference file

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      // Success! Get the exercise ID from the response.
      const responseData = await response.json();
      const uploadedExerciseId = responseData.exerciceId;

      // Pass the exerciseId (whether temporary or existing)
      onUploadSuccess(uploadedExerciseId); // Notify parent component
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="my-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-md p-4 cursor-pointer flex items-center justify-center",
          isDragActive ? "border-blue-500 bg-blue-100" : "border-gray-300",
          acceptedFiles.length > 0 && "border-green-500 bg-green-100"
        )}
      >
        <input {...getInputProps()} />
        {acceptedFiles.length > 0 ? (
          <p>Fichier sélectionné: {acceptedFiles[0].name}</p>
        ) : isDragActive ? (
          <p>Déposez le fichier ici...</p>
        ) : (
          <p>
            Faites glisser et déposez un fichier PDF ici, ou cliquez pour
            sélectionner.
          </p>
        )}
      </div>
      {isUploading && (
        <div className="flex items-center">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Téléchargement en cours...
        </div>
      )}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}

export default ExerciseFileUpload;