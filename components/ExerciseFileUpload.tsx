// components/ExerciseFileUpload.tsx (Complete, Enhanced, and Corrected)
"use client";

import { useState, useCallback, useEffect } from "react";  // Import useEffect
import { useDropzone, type DropzoneState, type FileRejection } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, Upload, CheckCircle, XCircle } from "lucide-react";
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface ExerciseFileUploadProps {
  id_exercice: string;
  onUploadSuccess: (exerciceId?: string) => void;
}

function ExerciseFileUpload({ id_exercice, onUploadSuccess }: ExerciseFileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [textContent, setTextContent] = useState<string>("");

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    const url = id_exercice ? `/api/exercices/${id_exercice}/upload` : `/api/exercices/temp/upload`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("isReference", "true");

    try {
      const onUploadProgress = (event: ProgressEvent) => {
        const percentCompleted = Math.round((event.loaded * 100) / event.total);
        setUploadProgress(percentCompleted);
      };

      const response = await fetch(url, {
        method: "POST",
        body: formData,
        headers: {},
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const responseData = await response.json();
      const uploadedExerciseId = responseData.exerciceId;
      onUploadSuccess(uploadedExerciseId);

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsUploading(false);
    }
  }, [id_exercice, onUploadSuccess]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        setError(null);
        setUploadedFile(acceptedFiles[0]);
        handleUpload(acceptedFiles[0]);
      }
    },
    [handleUpload]
  );

  const { getRootProps, getInputProps, isDragActive, acceptedFiles, rejectedFiles } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt", ".md"],
    },
    onDrop,
    multiple: false,
  }) as DropzoneState & { rejectedFiles: FileRejection[] };


    const handleRemoveFile = () => {
        setUploadedFile(null);
        setNumPages(null);
        setTextContent("");
    };


  return (
    <div className="my-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-md p-4 cursor-pointer flex items-center justify-center transition-colors",
          isDragActive
            ? "border-blue-500 bg-blue-100"
            : "border-gray-300 hover:border-blue-400",
          (acceptedFiles.length > 0 || uploadedFile) && "border-green-500 bg-green-100",
          rejectedFiles?.length > 0 && "border-red-500 bg-red-100"
        )}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          {uploadedFile ? (
            <div className="flex items-center justify-center">
                <p className="text-green-600">Fichier sélectionné: {uploadedFile.name}</p>
                <Button type="button" variant="ghost" size="icon" onClick={handleRemoveFile}>
                    <XCircle className="h-4 w-4 text-red-500" />
                </Button>
            </div>
          ) : isDragActive ? (
            <p>Déposez le fichier ici...</p>
          ) : (
            <p>
              Faites glisser un fichier PDF/texte ici, ou cliquez.
            </p>
          )}
        </div>
      </div>

      {(rejectedFiles?.length ?? 0) > 0 && (
        <div className="text-red-500 text-sm mt-2">
          {rejectedFiles.map((rejection: FileRejection) => (
            rejection.errors.map((e: { code: string; message: string }) => (
              <p key={e.code}>
                {e.code === "file-too-large"
                  ? "Fichier trop volumineux (max 20MB)."
                  : e.message}
              </p>
            ))
          ))}
        </div>
      )}

      {isUploading && (
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Téléchargement... {uploadProgress}%
            </span>
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
          <div className="bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {error && <p className="text-red-500 mt-2">{error}</p>}

        {/* PDF Preview */}
      {uploadedFile && uploadedFile.type === 'application/pdf' && (
        <div className="mt-4">
          <Document
            file={uploadedFile}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<p>Chargement du PDF...</p>}
            error={<p className="text-red-500">Impossible d'afficher le PDF.</p>}
            className="max-w-full"
          >
             {Array.from(new Array(numPages || 0), (el, index) => (
                <Page
                  key={`page_${index + 1}`}
                  pageNumber={index + 1}
                  width={250}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}

                />
             ))}
          </Document>
        </div>
      )}
        {/* Text File Preview */}
        {uploadedFile && uploadedFile.type.startsWith('text/') && (
            <div className="mt-4 p-2 bg-gray-100 rounded-md border">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                {textContent || "Chargement du contenu..."}
              </pre>
            </div>
        )}
    </div>
  );

    // Effect to read text file content
    useEffect(() => {
        if (uploadedFile && uploadedFile.type.startsWith('text/')) {
            const reader = new FileReader();
            reader.onload = (e: ProgressEvent<FileReader>) => {
                if (e.target && typeof e.target.result === 'string') {
                    setTextContent(e.target.result.substring(0, 1000));
                }
            };
            reader.onerror = () => {
                setError("Erreur lors de la lecture du fichier texte.");
                setTextContent("");
            }
            reader.readAsText(uploadedFile);
        } else {
             setTextContent("");
        }
    }, [uploadedFile]);
}

export default ExerciseFileUpload;