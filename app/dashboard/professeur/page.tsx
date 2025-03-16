// app/dashboard/professeur/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { difficulte_exercice } from "@prisma/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import SubmissionReview from "@/components/SubmissionReview"; // Import the component
import ExerciseFileUpload from "@/components/ExerciseFileUpload";


// --- Form Schema ---
const formSchema = z.object({
  titre: z.string().min(1, "Le titre est obligatoire"),
  description: z.string().min(1, "La description est obligatoire"),
  date_echeance: z.date().optional(),
  difficulte: z.nativeEnum(difficulte_exercice),
  format_reponse_attendu: z.string().min(1, "Le format de réponse est obligatoire"),
  visible_aux_etudiants: z.boolean(),
  correction_reference: z.string().optional(),
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
  correction_reference?: string;
  // Add other fields as needed
}


export default function ProfessorDashboard() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]); // Replace 'any' with a proper type
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const exercisesPerPage = 10;
  // Submission Review
  const [reviewSubmission, setReviewSubmission] = useState<any | null>(null); // State for the submission being reviewed
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false); // Add this state

    // --- Fetch Exercises ---
  const fetchExercises = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/exercices");
      if (!response.ok) {
        throw new Error("Failed to fetch exercises");
      }
      const data = await response.json();
      let userId = null;
      if (typeof window !== "undefined") {
        const session = localStorage.getItem("session");
        if (session) {
          userId = JSON.parse(session)?.user?.id;
        }
      }
      const filteredExercises = userId
        ? data.filter((ex: any) => ex.id_professeur === userId)
        : [];

      setExercises(filteredExercises);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

    // --- Fetch Exercise Details and Submissions---
  const fetchExerciseDetails = async (exerciseId: string) => {
    try {
      const exerciseResponse = await fetch(`/api/exercices/${exerciseId}`);
      if (!exerciseResponse.ok) {
        throw new Error("Failed to fetch exercise details");
      }
      const exerciseData = await exerciseResponse.json();
      setSelectedExercise(exerciseData);

      const submissionsResponse = await fetch(`/api/exercices/${exerciseId}/soumissions`);
      if (!submissionsResponse.ok) {
        throw new Error("Failed to fetch submissions");
      }
      const submissionsData = await submissionsResponse.json();
      setSubmissions(submissionsData);
    } catch (error) {
      console.error("Error fetching exercise details:", error);
      // Handle error appropriately (e.g., show error message to user)
    }
  };

  // --- Form Instance ---
    const form = useForm<ExerciseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titre: "",
      description: "",
      date_echeance: undefined,
      difficulte: "moyen",
      format_reponse_attendu: "",
      visible_aux_etudiants: false,
      correction_reference: "",
    },
    // Add this to reset form after upload
    values: {
      titre: editingExercise?.titre || "",
      description: editingExercise?.description || "",
      date_echeance: editingExercise?.date_echeance
        ? new Date(editingExercise.date_echeance)
        : undefined,
      difficulte: editingExercise?.difficulte || "moyen",
      format_reponse_attendu: editingExercise?.format_reponse_attendu || "",
      visible_aux_etudiants: editingExercise?.visible_aux_etudiants || false,
      correction_reference: editingExercise?.correction_reference || "",
    },
  });


  // --- Handle Form Submission ---
    const onSubmit = async (data: ExerciseFormValues) => {
      setIsDialogOpen(false); // Close *before* the async operation
       try {
        const url = editingExercise
          ? `/api/exercices/${editingExercise.id_exercice}`
          : "/api/exercices";
        const method = editingExercise ? "PUT" : "POST";
        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "An error occurred");
        }
        // Refetch exercise, Use the  fetchExercises function
        await fetchExercises();

        // Reset form and close dialog
        form.reset();
        setIsDialogOpen(false);
        setEditingExercise(null);


      } catch (error: any) {
         setError(error.message);

      }
    };


  // --- Edit Exercise ---
  const handleEdit = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setUploadSuccess(false); // Reset upload success on edit

    // Convert date_echeance to Date object if it exists
    const dateEcheance = exercise.date_echeance
      ? new Date(exercise.date_echeance)
      : undefined;

    form.setValue("titre", exercise.titre);
    form.setValue("description", exercise.description);
    form.setValue("date_echeance", dateEcheance);
    form.setValue("difficulte", exercise.difficulte || "moyen");
    form.setValue("format_reponse_attendu", exercise.format_reponse_attendu);
    form.setValue("visible_aux_etudiants", exercise.visible_aux_etudiants);
    form.setValue("correction_reference", exercise.correction_reference || "");

    setIsDialogOpen(true);
  };


  // --- Delete Exercise ---
  const handleDelete = async (exerciseId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet exercice ?")) {
      try {
        const response = await fetch(`/api/exercices/${exerciseId}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Failed to delete exercise");
        }

         // Refetch exercises to update the list
        await fetchExercises(); // Use await here

      } catch (error: any) {
         setError(error.message);
      }
    }
  };

  const handleViewSubmissions = (exerciseId: string) => {
      fetchExerciseDetails(exerciseId); // Fetch and display details
  };
  const handleReviewSubmission = (submission: any) => {
    setReviewSubmission(submission);
    setReviewDialogOpen(true);
  };

  const onUploadSuccess = useCallback(() => {
    setUploadSuccess(true); // Set upload success state
    // Optionally, refetch exercise details to show the uploaded file
    if (editingExercise) {
      fetchExerciseDetails(editingExercise.id_exercice);
    }
  }, [editingExercise]);

    // --- Pagination Logic ---
  const indexOfLastExercise = currentPage * exercisesPerPage;
  const indexOfFirstExercise = indexOfLastExercise - exercisesPerPage;
  const currentExercises = exercises.slice(indexOfFirstExercise, indexOfLastExercise);
  // Put paginate inside the component.
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    // --- Filtered Exercises ---
    const filteredExercises = currentExercises.filter((exercise) =>
    exercise.titre.toLowerCase().includes(searchTerm.toLowerCase())
  );


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
            <p>{exercises.length}</p> {/* Total number of exercises */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Soumissions Reçues</CardTitle>
          </CardHeader>
          <CardContent>
            <p>0</p> {/*  Replace with actual submission count */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Taux de Réussite Moyen</CardTitle>
          </CardHeader>
          <CardContent>
            <p>75%</p> {/* Replace with calculated average success rate */}
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
      <Button onClick={() => {setIsDialogOpen(true); setEditingExercise(null); form.reset();}} className="mb-4">
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
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
           {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                Chargement...
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-red-500">
                {error}
              </TableCell>
            </TableRow>
          ) : filteredExercises.length === 0 ? (
             <TableRow>
              <TableCell colSpan={5} className="text-center">
                Aucun exercice trouvé.
              </TableCell>
            </TableRow>
          ): (
            filteredExercises.map((exercise) => (
              <TableRow key={exercise.id_exercice}>
                <TableCell>{exercise.titre}</TableCell>
                <TableCell>
                  {new Date(exercise.date_creation).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {exercise.date_echeance
                    ? new Date(exercise.date_echeance).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell>{exercise.actif ? "Actif" : "Inactif"}</TableCell>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingExercise ? "Éditer l'Exercice" : "Créer un Exercice"}</DialogTitle>
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
                      <Textarea
                        placeholder="Description de l'exercice"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* --- Date Picker --- */}
              <FormField
                control={form.control}
                name="date_echeance"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date d'échéance</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Choisir une date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0,0,0,0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
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
              <FormField
                control={form.control}
                name="correction_reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correction de Référence</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Saisissez la correction de référence ici..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
                {/* --- File Upload --- */}
              {editingExercise && (
                <ExerciseFileUpload
                  id_exercice={editingExercise.id_exercice}
                  onUploadSuccess={onUploadSuccess}
                />
              )}
              {uploadSuccess && (
                <p className="text-green-500">Fichier téléversé avec succès!</p>
              )}
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
                <p><strong>Description:</strong> {selectedExercise.description}</p>
                <p><strong>Date d'échéance:</strong> {selectedExercise.date_echeance ? new Date(selectedExercise.date_echeance).toLocaleDateString(): "Non définie"}</p>
                <p><strong>Difficulté:</strong> {selectedExercise.difficulte}</p>
                <p><strong>Format de réponse attendu:</strong> {selectedExercise.format_reponse_attendu}</p>
                <p><strong>Correction de Référence:</strong>{selectedExercise.correction_reference || "Non fournie"}</p>

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
                        <TableCell>
                          {submission.corrections?.[0]?.note ?? "-"}
                        </TableCell>
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