// components/ExerciseFileUpload.tsx

"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ExerciseFileUploadProps {
    id_exercice: string;
    onUploadSuccess: () => void;
}
function ExerciseFileUpload({id_exercice, onUploadSuccess}: ExerciseFileUploadProps) {

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

   const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setError(null); // Clear previous errors on new file drop
      handleUpload(acceptedFiles[0]); // Directly handle upload here
    }
  }, [id_exercice, onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    accept: {
        "application/pdf": [".pdf"], // Example: Only accept PDFs
        // Add other MIME types as needed
      },
    onDrop,
    multiple: false, // Important: Only allow one file per exercise (for now)
  });

  const handleUpload = async (file: File) => {

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("isReference", "true"); // Indicate this is a reference file

    try {
      const response = await fetch(`/api/exercices/${id_exercice}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      // Success!
      onUploadSuccess(); // Notify parent component
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
          acceptedFiles.length > 0 && "border-green-500 bg-green-100" // Example styling
        )}
      >
        <input {...getInputProps()} />
        {acceptedFiles.length > 0 ? (
          <p>Fichier sélectionné: {acceptedFiles[0].name}</p>
        ) : isDragActive ? (
          <p>Déposez le fichier ici...</p>
        ) : (
          <p>Faites glisser et déposez un fichier PDF ici, ou cliquez pour sélectionner.</p>
        )}
      </div>
        {isUploading && <p>Téléchargement en cours...</p>}
        {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}

export default ExerciseFileUpload;