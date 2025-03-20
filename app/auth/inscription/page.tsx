"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";

// Schéma de validation Zod
const inscriptionSchema = z.object({
  email: z.string().email("Format d'email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  prenom: z.string().min(1, "Le prénom est obligatoire"),
  nom: z.string().min(1, "Le nom est obligatoire"),
  role: z.enum(["etudiant", "professeur", "administrateur"]),
});

type InscriptionFormValues = z.infer<typeof inscriptionSchema>;

// Composant pour le fond animé avec des couleurs plus contrastées
const AnimatedBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
    <div 
      className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600"
      style={{
        animation: 'gradientShift 15s ease infinite',
        backgroundSize: '300% 300%',
        willChange: 'background-position',
      }}
    />
    <div className="absolute inset-0" style={{
      backgroundImage: `radial-gradient(circle at 50% 35%, rgba(255,255,255,0.5) 0%, transparent 70%)`,
    }}/>
    <div className="absolute inset-0 opacity-20">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNGgtMnYtMWMwLS42LS40LTEtMS0xcy0xIC40LTEgMWgtMnYtMWMwLS42LS40LTEtMS0xcy0xIC40LTEgMWgtMnYtMWMwLS42LS40LTEtMS0xcy0xIC40LTEgMUgzNlYzNHptMC0xMGMwLTIuMiAxLjgtNCA0LTRzNCAxLjggNCA0aC0ydi0xYzAtLjYtLjQtMS0xLTFzLTEgLjQtMSAxaC0ydi0xYzAtLjYtLjQtMS0xLTFzLTEgLjQtMSAxaC0ydi0xYzAtLjYtLjQtMS0xLTFzLTEgLjQtMSAxSDM2VjI0em0tMTAgMGMwLTIuMiAxLjgtNCA0LTRzNCAxLjggNCA0aC0ydi0xYzAtLjYtLjQtMS0xLTFzLTEgLjQtMSAxaC0ydi0xYzAtLjYtLjQtMS0xLTFzLTEgLjQtMSAxaC0ydi0xYzAtLjYtLjQtMS0xLTFzLTEgLjQtMSAxSDI2VjI0em0wIDEwYzAtMi4yIDEuOC00IDQtNHM0IDEuOCA0IDRoLTJ2LTFjMC0uNi0uNC0xLTEtMXMtMSAuNC0xIDFoLTJ2LTFjMC0uNi0uNC0xLTEtMXMtMSAuNC0xIDFoLTJ2LTFjMC0uNi0uNC0xLTEtMXMtMSAuNC0xIDFIMjZWMzR6IiBmaWxsPSIjRkZGIiBmaWxsLXJ1bGU9Im5vbnplcm8iIGZpbGwtb3BhY2l0eT0iLjMiLz48L2c+PC9zdmc+')]"
        style={{ backgroundSize: '60px 60px' }}
      />
    </div>
  </div>
);

export default function InscriptionPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  // Initialisation du formulaire
  const form = useForm<InscriptionFormValues>({
    resolver: zodResolver(inscriptionSchema),
    defaultValues: {
      email: "",
      password: "",
      prenom: "",
      nom: "",
      role: "etudiant",
    },
  });

  // Gestion de la soumission
  const onSubmit = useCallback(
    async (values: InscriptionFormValues) => {
      setError(null);
      try {
        const response = await fetch("/api/auth/inscription", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });

        if (response.ok) {
          router.push("/auth/connexion");
          router.refresh();
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Une erreur est survenue lors de l'inscription.");
        }
      } catch (err) {
        setError("Une erreur est survenue lors de la communication avec le serveur.");
      }
    },
    [router]
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="w-full max-w-5xl flex flex-col md:flex-row shadow-2xl overflow-hidden rounded-lg">
        {/* Partie gauche : Formulaire */}
        <div className="w-full md:w-1/2 p-8 bg-white/90 backdrop-blur-sm">
          <h2 className="text-3xl font-bold text-center text-blue-600 mb-8">
            Créer un compte
          </h2>

          {error && (
            <div className="text-red-500 text-center text-sm mb-4">{error}</div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <FormField
                  control={form.control}
                  name="prenom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-500">Prénom</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Votre prénom" 
                          {...field} 
                          className="border-blue-200 focus:border-blue-400 placeholder-blue-300 text-blue-600"
                        />
                      </FormControl>
                      <FormMessage className="text-blue-500" />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <FormField
                  control={form.control}
                  name="nom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-500">Nom</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Votre nom" 
                          {...field} 
                          className="border-blue-200 focus:border-blue-400 placeholder-blue-300 text-blue-600"
                        />
                      </FormControl>
                      <FormMessage className="text-blue-500" />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-500">Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Votre email" 
                          {...field} 
                          type="email" 
                          className="border-blue-200 focus:border-blue-400 placeholder-blue-300 text-blue-600"
                        />
                      </FormControl>
                      <FormMessage className="text-blue-500" />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-500">Mot de passe</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Votre mot de passe" 
                          {...field} 
                          type="password" 
                          className="border-blue-200 focus:border-blue-400 placeholder-blue-300 text-blue-600"
                        />
                      </FormControl>
                      <FormMessage className="text-blue-500" />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-500">Rôle</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-blue-200 text-blue-600">
                            <SelectValue placeholder="Choisissez un rôle" className="text-blue-300" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white border-blue-200">
                          <SelectItem value="etudiant" className="text-blue-600 hover:bg-blue-50">Étudiant</SelectItem>
                          <SelectItem value="professeur" className="text-blue-600 hover:bg-blue-50">Professeur</SelectItem>
                          <SelectItem value="administrateur" className="text-blue-600 hover:bg-blue-50">Administrateur</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-blue-500" />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">S'inscrire</Button>
              </motion.div>
            </form>
          </Form>

          {/* Section inscription avec Google/GitHub */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-blue-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-blue-500">Ou s'inscrire avec</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                className="w-full inline-flex justify-center py-2 px-4 border border-blue-200 rounded-md shadow-sm bg-white text-sm font-medium text-blue-600 hover:bg-blue-50"
              >
                Google
              </button>
              <button
                onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
                className="w-full inline-flex justify-center py-2 px-4 border border-blue-200 rounded-md shadow-sm bg-white text-sm font-medium text-blue-600 hover:bg-blue-50"
              >
                GitHub
              </button>
            </div>
          </div>

          <div className="text-center text-sm text-blue-600 mt-4">
            Vous avez déjà un compte ?{" "}
            <Link href="/auth/connexion" className="text-blue-700 hover:text-blue-800 font-medium">
              Connectez-vous
            </Link>
          </div>
        </div>

        {/* Partie droite : Animations */}
        <div className="w-full md:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600">
          <div className="absolute inset-0 bg-blue-400/20" />
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="text-white text-center z-10 backdrop-blur-sm bg-white/20 p-8 rounded-xl shadow-lg border border-white/30"
            >
              <motion.h3 
                className="text-4xl font-bold mb-6 text-white"
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Rejoignez-nous !
              </motion.h3>
              <motion.p 
                className="text-xl mb-8 text-blue-50"
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Commencez votre aventure dans le monde des bases de données.
              </motion.p>
              <motion.div 
                className="flex justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="w-24 h-1 bg-blue-200 rounded-full"></div>
              </motion.div>
              <motion.p 
                className="mt-8 text-blue-50 text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Accédez à notre plateforme d'apprentissage et développez vos compétences dès maintenant.
              </motion.p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}