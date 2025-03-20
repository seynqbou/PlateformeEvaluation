// app/auth/connexion/page.tsx
"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion"; // Importez motion

const connexionSchema = z.object({
  email: z.string().email("Format d'email invalide"),
  password: z.string().min(1, "Le mot de passe est obligatoire"),
});

type ConnexionFormValues = z.infer<typeof connexionSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session) {
      if (session.user.role === "professeur") {
        router.push("/dashboard/professeur");
      } else if (session.user.role === "etudiant") {
        router.push("/dashboard/etudiant");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    }
  }, [session, status, router]);

  const form = useForm<ConnexionFormValues>({
    resolver: zodResolver(connexionSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = useCallback(
    async (values: ConnexionFormValues) => {
      setError(null);
      const result = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (result?.error) {
        setError("Identifiants invalides");
      }
    },
    []
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="w-full max-w-5xl flex flex-col md:flex-row shadow-2xl overflow-hidden rounded-lg">
        {/* Partie gauche : Formulaire */}
        <div className="w-full md:w-1/2 p-8 bg-white/90 backdrop-blur-sm">
          <h2 className="text-3xl font-bold text-center text-blue-600 mb-8">
            Connexion
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
                transition={{ duration: 0.5, delay: 0.3 }}
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
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                  Se connecter
                </Button>
              </motion.div>
            </form>
          </Form>

          {/* --- Section Connexion avec Google/GitHub --- */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-blue-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-blue-500">
                  Ou continuer avec
                </span>
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
            Pas de compte ?{" "}
            <Link
              href="/auth/inscription"
              className="text-blue-700 hover:text-blue-800 font-medium"
            >
              Créer un compte
            </Link>
          </div>
        </div>

        {/* Partie droite : Animations (comme sur la page d'inscription) */}
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
                Bienvenue !
              </motion.h3>
              <motion.p
                className="text-xl mb-8 text-blue-50"
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Connectez-vous pour accéder à votre espace personnel.
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
                Retrouvez vos cours, exercices et bien plus encore.
              </motion.p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}