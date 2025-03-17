// app/dashboard/etudiant/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react"; // Import useSession
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import PerformanceChart from "@/components/PerformanceChart"; // Import
import { useDropzone } from 'react-dropzone';
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form"
  import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { statut_soumission, type_soumission } from "@prisma/client"; // Correct import
import { useRouter } from "next/navigation";

// --- Submission Form Schema ---
const submissionSchema = z.object({
    contenu: z.string().optional(),
  });

type SubmissionFormValues = z.infer<typeof submissionSchema>;

// --- Interface for Exercise ---
interface Exercise {
  id_exercice: string;
  titre: string;
  description: string;
  date_echeance: string | null;
  difficulte: string;
  format_reponse_attendu: string;
  submissionStatus: string;
  submissionId: string | null;
}

// --- Interface for Submission ---
interface Submission {
    id_soumission: string;
    statut: statut_soumission;
    contenu: string | null;
    type: type_soumission;
    corrections: { note: number; commentaire: string }[];
    fichiers?: { nom: string; chemin: string }
}


export default function EtudiantDashboard() {
  const { data: session, status } = useSession(); // Get session data
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // State to hold the selected file


  // --- Form Instance ---
    const form = useForm<SubmissionFormValues>({
        resolver: zodResolver(submissionSchema),
    });

  // --- Fetch Exercises (Filtering on client for now) ---
  const fetchExercises = useCallback(async () => {
   if (status === "loading") return; // Prevent early fetches

    setLoading(true);
    setError(null);

    if (status === "authenticated" && session?.user) {
      try {
          const response = await fetch("/api/exercices");
          if (!response.ok) {
            throw new Error("Failed to fetch exercises");
          }
          const data = await response.json();

          // Get user ID from the session
          const userId = session.user.id;

          // Filter exercises based on visibility
          const filteredExercises = data.filter((ex: any) => ex.visible_aux_etudiants === true);

        // Fetch submissions for the student using session user ID
        if (userId) {
            const submissionsResponse = await fetch(`/api/etudiants/${userId}/soumissions`);
          if (submissionsResponse.ok) {
            const submissionsData = await submissionsResponse.json();

            // Merge exercises with submission status
            const exercisesWithStatus = filteredExercises.map((exercise: Exercise) => {
              const userSubmission = submissionsData.find((sub: any) => sub.id_exercice === exercise.id_exercice);
              return {
                ...exercise,
                submissionStatus: userSubmission ? userSubmission.statut : "Non soumis",
                submissionId: userSubmission ? userSubmission.id_soumission : null,
              };
            });
            setExercises(exercisesWithStatus);
          } else {
            setExercises(filteredExercises); // Still set exercises, even if submissions fetch fails
          }
        } else {
          setExercises(filteredExercises); // No user ID, show visible exercises
        }
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    }
  }, [status, session]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

    const handleViewExercise = async (exerciseId: string) => {
    try {
      const response = await fetch(`/api/exercices/${exerciseId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch exercise details");
      }
      const data = await response.json();
      setSelectedExercise(data);

      // If exercise is already submitted, fetch submission details
      if (data.submissionId) {
        const submissionResponse = await fetch(`/api/soumissions/${data.submissionId}`);
        if(submissionResponse.ok) {
            const submissionData = await submissionResponse.json();
            setSubmission(submissionData);
        } else {
            setSubmission(null); // No submission or error fetching
        }
      } else {
        setSubmission(null); // No submission yet
      }
    } catch (error) {
      console.error("Error fetching exercise details:", error);
      setError("Failed to load exercise details."); // Set user-friendly error
    }
  };
    // --- Handle form submit ---
    const submitData = async (formData: FormData) => {

        try {
            const response = await fetch('/api/soumissions', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Submission failed');
            }
            // Refresh exercises and close dialog
            router.refresh();
            await fetchExercises();
            form.reset();
            setSelectedExercise(null);
            setSelectedFile(null); // Clear selected file

        } catch (error: any) {
            setError(error.message);
        }
    };

       // --- Handle file drop ---
      const onDrop = useCallback(
        (acceptedFiles: File[]) => {
          if (acceptedFiles.length > 0) {
            setSelectedFile(acceptedFiles[0]); // Store the selected file
          }
        },
        []
      );

        const { getRootProps, getInputProps, isDragActive  } = useDropzone({
        accept: {
            "application/pdf": [".pdf"],
        },
        onDrop, // Pass onDrop
        multiple: false,
    });

  // --- Sample Data for Chart ---
  const chartData = [
    { name: 'Exercice 1', note: 15 },
    { name: 'Exercice 2', note: 12 },
    { name: 'Exercice 3', note: 18 },
  ];

    // --- Filtered Exercises ---
    const filteredExercises = exercises.filter((exercise) =>
    exercise.titre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Tableau de Bord Étudiant</h1>

       {/* --- Search Input --- */}
       <Input
        type="text"
        placeholder="Rechercher par titre..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 max-w-md"
      />

      {/* --- Exercise List Table --- */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titre</TableHead>
            <TableHead>Date d'Échéance</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                Chargement...
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-red-500">
                {error}
              </TableCell>
            </TableRow>
          ) : (
            filteredExercises.map((exercise) => (
              <TableRow key={exercise.id_exercice}>
                <TableCell>{exercise.titre}</TableCell>
                <TableCell>
                  {exercise.date_echeance
                    ? new Date(exercise.date_echeance).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell>{exercise.submissionStatus}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewExercise(exercise.id_exercice)}
                  >
                    {exercise.submissionStatus === "Non soumis" ? "Soumettre" : "Voir"}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* --- Exercise Details/Submission Dialog --- */}
      {selectedExercise && (
        <Dialog open={!!selectedExercise} onOpenChange={() => setSelectedExercise(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedExercise.titre}</DialogTitle>
              <DialogDescription>
                {selectedExercise.description}
              </DialogDescription>
            </DialogHeader>
                <p><strong>Date d'échéance:</strong> {selectedExercise.date_echeance ? new Date(selectedExercise.date_echeance).toLocaleDateString(): "Non définie"}</p>
                <p><strong>Difficulté:</strong> {selectedExercise.difficulte}</p>
                <p><strong>Format de réponse attendu:</strong> {selectedExercise.format_reponse_attendu}</p>

            {!submission && (
                <>
                 <Form {...form}>
                    {/* No onSubmit in the form tag, handle submission in button click */}
                    <form  className="space-y-4">
                        <div {...getRootProps()} className="border-2 border-dashed p-4 rounded-md cursor-pointer">
                            <input {...getInputProps()} />
                            {isDragActive ? (
                            <p>Déposez le fichier ici...</p>
                            ) : (
                            <>
                            <p>Faites glisser et déposez un fichier PDF ici, ou cliquez pour sélectionner un fichier.</p>
                             {selectedFile && <p>Fichier sélectionné: {selectedFile.name}</p>}
                             </>
                            )}
                        </div>
                        <FormField
                            control={form.control}
                            name="contenu"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Réponse (Optionnel)</FormLabel>
                                <FormControl>
                                <Textarea
                                    placeholder="Saisissez votre réponse ici..."
                                    {...field}
                                />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <Button type="button" onClick={() => {
                            if (selectedExercise) {
                                const formData = new FormData();
                                if (selectedFile) {
                                    formData.append("file", selectedFile);
                                }
                                formData.append("id_exercice", selectedExercise.id_exercice);
                                const contenu = form.getValues("contenu");
                                if (contenu) {
                                    formData.append("contenu", contenu);
                                }

                                if (selectedFile || contenu) { // Check for file OR text content
                                    submitData(formData);
                                } else {
                                    setError("Veuillez fournir un fichier ou une réponse textuelle.");
                                }
                            }
                        }}>
                            Soumettre
                        </Button>
                    </form>
                 </Form>

                </>
            )}

             {submission && (

                <Card className="mt-4">
                    <CardHeader>
                        <CardTitle>Votre Soumission</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {submission.fichiers && (<a href={submission.fichiers.chemin.replace("uploads", "/uploads")} download={submission.fichiers.nom}><Button variant="outline">Télécharger le fichier soumis</Button></a>)}
                        {submission.contenu && (<p><strong>Reponse:</strong> {submission.contenu}</p>)}
                         {submission.corrections && submission.corrections.length > 0 ? (
                            <>
                                <p><strong>Note:</strong> {submission.corrections[0].note}</p>
                                <p><strong>Commentaire:</strong> {submission.corrections[0].commentaire}</p>

                            </>
                            ) : (
                            <p>Statut: {submission.statut}</p>
                            )}

                    </CardContent>
                </Card>
            )}

          </DialogContent>
        </Dialog>
      )}

       {/* --- Performance Chart --- */}
       <Card className="mt-6">
        <CardHeader>
          <CardTitle>Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <PerformanceChart data={chartData} />
        </CardContent>
      </Card>

    </div>
  );
}