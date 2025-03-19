// app/dashboard/professeur/page.tsx (FULLY CORRECTED - Uncontrolled Input and Session)
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { difficulte_exercice } from "@prisma/client";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
//import { fr } from "date-fns/locale"; // Import if needed
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import SubmissionReview from "@/components/SubmissionReview";
import ExerciseFileUpload from "@/components/ExerciseFileUpload";
import ExerciseSubjectUpload from "@/components/ExerciseSubjectUpload";
import { useSession } from "next-auth/react";

// --- Form Schema ---
const formSchema = z.object({
  titre: z.string().min(1, "Le titre est obligatoire"),
  description: z.string().min(1, "La description est obligatoire"),
  date_echeance: z.string().optional(), // Use string for input type="date"
  difficulte: z.nativeEnum(difficulte_exercice),
  format_reponse_attendu: z.string().min(1, "Le format de réponse est obligatoire"),
  visible_aux_etudiants: z.boolean(),
  id_cours: z.string().uuid("L'ID du cours doit être un UUID valide"), // Add id_cours validation
});

type ExerciseFormValues = z.infer<typeof formSchema>;

// --- Interface for Exercise ---
interface Exercise {
  id_exercice: string;
  titre: string;
  description: string;
  date_creation: string;
  date_echeance: string | null;
  actif: boolean;
  difficulte: difficulte_exercice;
  format_reponse_attendu: string;
  visible_aux_etudiants: boolean;
  id_professeur?: string;
  id_cours: string; // Include id_cours
  exercice_fichier: {
    fichiers: {
      nom: string;
    };
  }[];
}

export default function ProfessorDashboard() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewSubmission, setReviewSubmission] = useState<any | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const { data: session, status } = useSession(); // Get session and status
  const router = useRouter();
  const exercisesPerPage = 10;

  const [tempExerciseId, setTempExerciseId] = useState<string | null>(null);


  // --- Form Instance ---
  const form = useForm<ExerciseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titre: "",
      description: "",
      date_echeance: undefined, // Use undefined for date inputs
      difficulte: "moyen",
      format_reponse_attendu: "",
      visible_aux_etudiants: false,
      id_cours: "",
    },
  });


  // --- useEffect for Editing (CORRECTED) ---
    useEffect(() => {
    if (editingExercise) {
      // Use form.reset to set ALL form values.  This is the key.
      form.reset({
        titre: editingExercise.titre,
        description: editingExercise.description,
        date_echeance: editingExercise.date_echeance
          ? format(new Date(editingExercise.date_echeance), "yyyy-MM-dd")
          : undefined, // Handle null/undefined dates
        difficulte: editingExercise.difficulte,
        format_reponse_attendu: editingExercise.format_reponse_attendu,
        visible_aux_etudiants: editingExercise.visible_aux_etudiants,
        id_cours: editingExercise.id_cours,
      });
    } else {
      // Reset to default values when NOT editing.
      form.reset({
        titre: "",
        description: "",
        date_echeance: undefined,
        difficulte: "moyen",
        format_reponse_attendu: "",
        visible_aux_etudiants: false,
        id_cours: "",
      });
      setTempExerciseId(null); // Clear temp ID when creating new
    }
  }, [editingExercise, form]);


    const fetchExercises = useCallback(async () => {
    // *** IMPORTANT: Check loading state ***
    if (status === "loading") return;

    setLoading(true);
    setError(null);

    // *** IMPORTANT: Only fetch if authenticated ***
    if (status === "authenticated" && session?.user) {
      try {
        const response = await fetch("/api/exercices");
        if (!response.ok) throw new Error("Échec de la récupération des exercices");
        const data = await response.json();
        const userId = session.user.id;
        const filteredExercises = userId
          ? data.filter((ex: Exercise) => ex.id_professeur === userId)
          : [];
        setExercises(filteredExercises);
      } catch (err: any) {
        setError(err.message || "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    }
  }, [status, session]);  // Correct dependencies

   // --- Fetch Exercise Details and Submissions ---
    const fetchExerciseDetails = async (exerciseId: string) => {
    try {
      const exerciseResponse = await fetch(`/api/exercices/${exerciseId}`);
      if (!exerciseResponse.ok) throw new Error("Échec de la récupération des détails");
      const exerciseData = await exerciseResponse.json();
      setSelectedExercise(exerciseData);

      const submissionsResponse = await fetch(`/api/exercices/${exerciseId}/soumissions`);
      if (!submissionsResponse.ok) throw new Error("Échec de la récupération des soumissions");
      const submissionsData = await submissionsResponse.json();
      setSubmissions(submissionsData);
    } catch (error) {
      console.error("Erreur lors de la récupération des détails:", error);
      setError("Impossible de charger les détails de l'exercice");
    }
  };

     const onSubmit = async (data: ExerciseFormValues) => {
      try {
        let url, method;

        if (editingExercise) {
          // Editing existing exercise
          url = `/api/exercices/${editingExercise.id_exercice}`;
          method = "PUT";
        } else if (tempExerciseId) {
            // Updating the temporary exercise
            url = `/api/exercices/${tempExerciseId}`; // Use the temporary exercise ID
            method = "PUT"; // Use PUT to update
        }else {
          // Creating a new exercise
          url = "/api/exercices";
          method = "POST";
        }

        const formattedData = {
            ...data,
            date_echeance: data.date_echeance
                ? format(new Date(data.date_echeance), 'yyyy-MM-dd')
                : null,
        };


        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formattedData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Une erreur est survenue");
        }

        await fetchExercises(); // Refresh exercises
        setIsDialogOpen(false);  // Close dialog
        setEditingExercise(null); // Clear editing state
        setUploadSuccess(false); // Reset upload success
        setTempExerciseId(null); // Clear temp ID

      } catch (error: any) {
        setError(error.message);
      }
    };

     const handleEdit = (exercise: Exercise) => {
        console.log("Editing exercise:", exercise);
        setEditingExercise(exercise);
        setUploadSuccess(false);
        setIsDialogOpen(true);
    };
    const handleDelete = async (exerciseId: string) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer cet exercice ?")) {
            try {
                const response = await fetch(`/api/exercices/${exerciseId}`, {
                    method: "DELETE",
                });
                if (!response.ok) throw new Error("Échec de la suppression");
                await fetchExercises();
            } catch (error: any) {
                setError(error.message);
            }
        }
    };

     const handleViewSubmissions = (exerciseId: string) => {
      fetchExerciseDetails(exerciseId);
    };

    const handleReviewSubmission = (submission: any) => {
        setReviewSubmission(submission);
        setReviewDialogOpen(true);
    };

     const onUploadSuccess = useCallback((uploadedExerciseId?: string) => {
        setUploadSuccess(true);
        if (uploadedExerciseId) {
            setTempExerciseId(uploadedExerciseId);
        }
        fetchExercises();
    }, [fetchExercises]);

    const indexOfLastExercise = currentPage * exercisesPerPage;
    const indexOfFirstExercise = indexOfLastExercise - exercisesPerPage;
    const currentExercises = exercises.slice(indexOfFirstExercise, indexOfLastExercise);
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    const filteredExercises = currentExercises.filter((exercise) =>
        exercise.titre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        fetchExercises();
    }, [fetchExercises]);


    // --- Conditional Rendering based on Session Status ---
    if (status === "loading") {
        return <div className="p-8 text-center">Chargement...</div>;
    }

      if (status === "unauthenticated") {
        return (
        <div className="p-8 text-center">
            <p>Vous n'êtes pas connecté. Veuillez vous connecter pour accéder au tableau de bord.</p>
            {/*  Add a link/button to your login page here */}
        </div>
        );
    }

    // If authenticated, render the dashboard
       return (
        <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Tableau de Bord Professeur</h1>

        {/* --- Statistics Cards --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
            <CardHeader>
                <CardTitle>Exercices Créés</CardTitle>
            </CardHeader>
            <CardContent>
                <p>{exercises.length}</p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader>
                <CardTitle>Soumissions Reçues</CardTitle>
            </CardHeader>
            <CardContent>
                <p>0</p> {/* Replace with actual calculation */}
            </CardContent>
            </Card>
            <Card>
            <CardHeader>
                <CardTitle>Taux de Réussite Moyen</CardTitle>
            </CardHeader>
            <CardContent>
                <p>75%</p> {/* Replace with actual calculation */}
            </CardContent>
            </Card>
        </div>

        {/* --- Search Input --- */}
        <Input
            type="text"
            placeholder="Rechercher par titre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4 max-w-md"
        />

        {/* --- Create Exercise Button --- */}
        <Button
            onClick={() => {
                setIsDialogOpen(true);  // Open dialog
                setEditingExercise(null); // Clear editing state
                form.reset();          // Reset form
            }}
            className="mb-4"
        >
            Créer un Exercice
        </Button>

        {/* --- Exercise List Table --- */}
        <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Date de Création</TableHead>
                    <TableHead>Date d'Échéance</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Sujet</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {loading ? (
                    <TableRow>
                    <TableCell colSpan={6} className="text-center">Chargement...</TableCell>
                    </TableRow>
                ) : error ? (
                    <TableRow>
                    <TableCell colSpan={6} className="text-center text-red-500">{error}</TableCell>
                    </TableRow>
                ) : filteredExercises.length === 0 ? (
                    <TableRow>
                    <TableCell colSpan={6} className="text-center">Aucun exercice trouvé.</TableCell>
                    </TableRow>
                ) : (
                    filteredExercises.map((exercise) => (
                        <TableRow key={exercise.id_exercice}>
                        <TableCell>{exercise.titre}</TableCell>
                        <TableCell>{new Date(exercise.date_creation).toLocaleDateString()}</TableCell>
                        <TableCell>
                            {exercise.date_echeance
                            ? new Date(exercise.date_echeance).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell>{exercise.actif ? "Actif" : "Inactif"}</TableCell>
                        <TableCell>
                            {exercise.exercice_fichier && exercise.exercice_fichier.length > 0
                            ? exercise.exercice_fichier[0].fichiers.nom
                            : "Aucun fichier"}
                        </TableCell>
                        <TableCell>
                            <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(exercise)}
                            className="mr-2"
                            >
                            Éditer
                            </Button>
                            <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(exercise.id_exercice)}
                            className="mr-2"
                            >
                            Supprimer
                            </Button>
                            <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewSubmissions(exercise.id_exercice)}
                            >
                            Voir
                            </Button>
                        </TableCell>
                        </TableRow>
                    ))
                )}
                </TableBody>
            </Table>

        {/* --- Pagination --- */}
        <div className="flex justify-center mt-4">
            {exercises.length > exercisesPerPage && (
            <>
                <Button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="mr-2"
                >
                Précédent
                </Button>
                <Button
                onClick={() => paginate(currentPage + 1)}
                disabled={indexOfLastExercise >= exercises.length}
                >
                Suivant
                </Button>
            </>
            )}
        </div>

        {/* --- Create/Edit Exercise Dialog --- */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[425px] max-h-[calc(100vh-10rem)] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>
                {editingExercise ? "Éditer l'Exercice" : "Créer un Exercice"}
                </DialogTitle>
                <DialogDescription>
                {editingExercise
                    ? "Modifiez les détails de l'exercice ici."
                    : "Ajoutez un nouvel exercice à votre cours."}
                </DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="titre"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Titre</FormLabel>
                        <FormControl>
                        <Input placeholder="Titre de l'exercice" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                        <Textarea placeholder="Description de l'exercice" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                    <FormField
                        control={form.control}
                        name="id_cours"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Cours</FormLabel>
                                <FormControl>
                                    <Input placeholder="ID du cours" {...field} />
                                </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* --- Simple Date Input --- */}
                    <FormField
                        control={form.control}
                        name="date_echeance"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Date d'échéance</FormLabel>
                                <FormControl>
                                    <Input
                                        type="date"
                                        {...field}
                                        className="w-full"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                <FormField
                    control={form.control}
                    name="difficulte"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Difficulté</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="Choisir une difficulté" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="facile">Facile</SelectItem>
                            <SelectItem value="moyen">Moyen</SelectItem>
                            <SelectItem value="difficile">Difficile</SelectItem>
                            <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="format_reponse_attendu"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Format de Réponse Attendu</FormLabel>
                        <FormControl>
                        <Input
                            placeholder="Ex: Rapport PDF, code Python, etc."
                            {...field}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="visible_aux_etudiants"
                    render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2">
                        <FormControl>
                        <input
                            type="checkbox"
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            className="mr-2 h-4 w-4"
                        />
                        </FormControl>
                        <FormLabel>Visible aux Étudiants</FormLabel>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                {/* Always show BOTH upload components, conditionally based on editingExercise */}
                    <FormItem>
                    <FormLabel>Sujet de l'exercice</FormLabel>
                        <ExerciseSubjectUpload
                            id_exercice={editingExercise?.id_exercice || tempExerciseId || ""}
                            onUploadSuccess={onUploadSuccess}
                        />
                    </FormItem>

                    <FormItem>
                    <FormLabel>Correction de l'exercice (optionnelle)</FormLabel>
                        <ExerciseFileUpload
                            id_exercice={editingExercise?.id_exercice || tempExerciseId || ""}
                            onUploadSuccess={onUploadSuccess}
                        />
                    </FormItem>

                    {uploadSuccess && <p className="text-green-500">Fichier téléversé avec succès!</p>}

                <DialogFooter>
                    <Button type="submit">
                    {editingExercise ? "Enregistrer les modifications" : "Créer"}
                    </Button>
                </DialogFooter>
                </form>
            </Form>
            </DialogContent>
        </Dialog>

        {/* --- Exercise Details and Submissions Dialog --- */}
        {selectedExercise && (
            <Dialog open={!!selectedExercise} onOpenChange={() => setSelectedExercise(null)}>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>{selectedExercise.titre}</DialogTitle>
                </DialogHeader>
                <p>
                <strong>Description:</strong> {selectedExercise.description}
                </p>
                <p>
                <strong>Date d'échéance:</strong>{" "}
                {selectedExercise.date_echeance
                    ? new Date(selectedExercise.date_echeance).toLocaleDateString()
                    : "Non définie"}
                </p>
                <p>
                <strong>Difficulté:</strong> {selectedExercise.difficulte}
                </p>
                <p>
                <strong>Format de réponse attendu:</strong>{" "}
                {selectedExercise.format_reponse_attendu}
                </p>


                <h2 className="text-lg font-semibold mt-4">Soumissions</h2>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Étudiant</TableHead>
                    <TableHead>Date de Soumission</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {submissions.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center">
                        Aucune soumission trouvée.
                        </TableCell>
                    </TableRow>
                    ) : (
                    submissions.map((submission) => (
                        <TableRow key={submission.id_soumission}>
                        <TableCell>
                            {submission.etudiants?.prenom} {submission.etudiants?.nom}
                        </TableCell>
                        <TableCell>
                            {new Date(submission.date_soumission).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{submission.statut}</TableCell>
                        <TableCell>{submission.corrections?.[0]?.note ?? "-"}</TableCell>
                        <TableCell>
                            <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReviewSubmission(submission)}
                            >
                            Voir/Ajuster
                            </Button>
                        </TableCell>
                        </TableRow>
                    ))
                    )}
                </TableBody>
                </Table>
            </DialogContent>
            </Dialog>
        )}

        {/* --- Submission Review Dialog --- */}
        {reviewDialogOpen && reviewSubmission && (
            <SubmissionReview
            submission={reviewSubmission}
            correction={reviewSubmission.corrections?.[0]}
            open={reviewDialogOpen}
            onClose={() => setReviewDialogOpen(false)}
            />
        )}
        </div>
    );
}