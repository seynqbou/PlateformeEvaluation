"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from 'next/navigation';
import dynamic from "next/dynamic";

// Dynamically import heavy components to improve initial load time
const Typewriter = dynamic(() => import("typewriter-effect"), {
  ssr: false,
  loading: () => <span className="text-4xl md:text-6xl lg:text-7xl font-bold text-white">Devenez un Architecte de Données</span>
});

// Types
interface ValuePropositionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  delay?: number;
}

// Animation variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom) => ({
    opacity: 1,
    y: 0,
    transition: { 
      delay: custom * 0.1,
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1]
    }
  }),
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

// --- Animated Background with Optimized Performance ---
const AnimatedBackground = () => (
  <div
    className="absolute inset-0 -z-10 overflow-hidden"
    aria-hidden="true"
  >
    <div 
      className="absolute inset-0 bg-gradient-to-br from-blue-900 via-cyan-800 to-cyan-700"
      style={{
        animation: 'gradientShift 15s ease infinite',
        backgroundSize: '300% 300%',
        willChange: 'background-position',
      }}
    />
    <div className="absolute inset-0" style={{
      backgroundImage: `radial-gradient(circle at 50% 35%, rgba(255,255,255,0.08) 0%, transparent 45%)`,
    }}/>
    <style jsx>{`
      @keyframes gradientShift {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }
    `}</style>
  </div>
);

// --- Enhanced Hero Section with Intersection Observer ---
const HeroSection = () => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const handleCTAClick = useCallback(() => {
    signIn("google", { callbackUrl: "/dashboard" });
  }, []);

  // Sample SQL code for the editor
  const sqlCode = useMemo(() => (
    `-- Requête pour analyser les performances des utilisateurs
SELECT 
  u.username,
  COUNT(e.id) AS total_exercises,
  AVG(e.score) AS average_score,
  MAX(e.completed_at) AS last_activity
FROM users u
LEFT JOIN exercises e ON u.id = e.user_id
WHERE e.completed_at > NOW() - INTERVAL '30 days'
GROUP BY u.username
ORDER BY average_score DESC
LIMIT 10;`
  ), []);

  return (
    <section 
      ref={sectionRef}
      className="relative w-full min-h-[85vh] flex items-center justify-center py-16 md:py-20 lg:py-24 overflow-hidden"
    >
      <AnimatedBackground />

      <div className="container relative flex flex-col items-center text-center px-4">
        <AnimatePresence>
          {isVisible && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4">
                  <Typewriter
                    options={{
                      strings: ["Devenez un Architecte de Données", "Master SQL with AI", "Build Data Mastery"],
                      autoStart: true,
                      loop: true,
                      wrapperClassName: "font-bold",
                      cursorClassName: "text-cyan-400",
                      delay: 50
                    }}
                  />
                </h1>
                <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
                  Plateforme immersive pour maîtriser SQL à travers des défis réels et des corrections IA personnalisées en temps réel.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="flex flex-wrap justify-center gap-4 mb-12"
              >
                <Button 
                  variant="default" 
                  size="lg" 
                  onClick={handleCTAClick}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Commencer le Défi Gratuit
                </Button>

                <Link href="/auth/inscription">
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-2 hover:bg-white/10 transition-all"
                  >
                    Créer un compte
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="w-full max-w-3xl mx-auto bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-700 shadow-2xl overflow-hidden"
              >
                <div className="flex items-center bg-gray-800 px-4 py-2 border-b border-gray-700">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="ml-4 text-xs text-gray-400">sql_challenge.sql</span>
                </div>
                <pre className="text-sm p-4 overflow-x-auto">
                  {sqlCode.split('\n').map((line, i) => (
                    <div key={i} className="flex">
                      <span className="w-8 inline-block text-gray-500 select-none">{i + 1}</span>
                      <code className="text-left">
                        {line.includes('SELECT') && <span className="text-cyan-400">SELECT </span>}
                        {line.includes('FROM') && <span className="text-cyan-400">FROM </span>}
                        {line.includes('WHERE') && <span className="text-cyan-400">WHERE </span>}
                        {line.includes('GROUP BY') && <span className="text-cyan-400">GROUP BY </span>}
                        {line.includes('ORDER BY') && <span className="text-cyan-400">ORDER BY </span>}
                        {line.includes('LIMIT') && <span className="text-cyan-400">LIMIT </span>}
                        {line.includes('LEFT JOIN') && <span className="text-cyan-400">LEFT JOIN </span>}
                        {line.includes('ON') && <span className="text-cyan-400">ON </span>}
                        {line.replace(/SELECT |FROM |WHERE |GROUP BY |ORDER BY |LIMIT |LEFT JOIN |ON /g, '')}
                      </code>
                    </div>
                  ))}
                </pre>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

// --- Value Proposition Card (with Improved Animations) ---
const ValuePropositionCard = ({ title, description, icon, delay = 0 }: ValuePropositionProps) => (
  <motion.div
    variants={fadeInUp}
    custom={delay}
    whileHover={{ 
      scale: 1.03, 
      boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.15)",
      transition: { duration: 0.2 } 
    }}
    whileTap={{ scale: 0.98 }}
    className="h-full"
  >
    <Card className="h-full flex flex-col border-gray-200 transition-all duration-200 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-3 text-xl">
          <span className="text-cyan-600 p-2 bg-cyan-50 rounded-lg">{icon}</span> 
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  </motion.div>
);

// Modifiez les styles du conteneur principal
const containerStyles = "container mx-auto px-4 max-w-6xl"

// Mise à jour du ValuePropositionGrid
const ValuePropositionGrid = () => {
  // Using refs and intersection observer for better performance
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const valuePropositions = [
    {
      title: "Correction IA en Temps Réel",
      description: "Recevez un feedback instantané et personnalisé sur votre code SQL grâce à notre IA avancée, augmentant votre vitesse d'apprentissage.",
      icon: <span>🤖</span>,
    },
    {
      title: "Benchmark Contre d'Autres Apprenants",
      description: "Comparez vos compétences et progressez en vous mesurant à la communauté pour rester motivé et identifier vos points forts.",
      icon: <span>📊</span>,
    },
    {
      title: "Progression Visuelle",
      description: "Suivez votre parcours d'apprentissage avec une visualisation claire de vos acquis et une feuille de route personnalisée.",
      icon: <span>🌳</span>,
    },
    {
      title: "Intégration GitHub Classroom",
      description: "Importez et exportez facilement vos exercices avec GitHub Classroom pour les intégrer à vos projets existants.",
      icon: <span><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg></span>,
    },
    {
      title: "Défis Basés sur des Cas Réels",
      description: "Travaillez sur des exercices conçus à partir de problématiques SQL rencontrées en entreprise et préparés par des professionnels.",
      icon: <span>💼</span>,
    },
    {
      title: "Accès à une Communauté Active",
      description: "Échangez avec d'autres apprenants, posez vos questions et partagez vos connaissances dans un environnement collaboratif.",
      icon: <span>💬</span>,
    }
  ];

  return (
    <section ref={sectionRef} className="py-16 bg-gray-50"> {/* Réduit le padding vertical */}
      <div className={containerStyles}> {/* Ajout de max-w-6xl et mx-auto */}
        <motion.div
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={staggerContainer}
          className="space-y-8" // Réduit l'espacement vertical
        >
          <motion.div variants={fadeInUp} className="text-center max-w-3xl mx-auto"> {/* Augmente max-w */}
            <h2 className="text-3xl font-bold mb-4">Pourquoi Choisir Notre Plateforme ?</h2>
            <p className="text-gray-600">Une expérience d'apprentissage conçue pour vous faire progresser efficacement en SQL.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Réduit le gap */}
            {valuePropositions.map((prop, index) => (
              <ValuePropositionCard
                key={index}
                title={prop.title}
                description={prop.description}
                icon={prop.icon}
                delay={index}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Mise à jour du LiveDemoSection
const LiveDemoSection = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("editor");
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Start loading animation once section is visible
          const timer = setTimeout(() => setIsLoading(false), 800);
          return () => clearTimeout(timer);
        }
      },
      { threshold: 0.2 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Example data
  const results = [
    { id: 1, name: "John Doe", email: "john@example.com", score: 95 },
    { id: 2, name: "Jane Smith", email: "jane@example.com", score: 87 },
    { id: 3, name: "Robert Johnson", email: "robert@example.com", score: 92 }
  ];

  return (
    <section 
      ref={sectionRef} 
      className="relative py-16 bg-gradient-to-b from-gray-900 to-gray-800 text-white"
    >
      <div className={containerStyles}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Essayez Notre Environnement SQL</h2>
            <p className="text-gray-300">Un aperçu de notre interface intuitive et puissante.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl overflow-hidden"
          >
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-700">
              <button 
                className={`px-6 py-3 focus:outline-none ${activeTab === "editor" ? "text-cyan-400 border-b-2 border-cyan-400" : "text-gray-400 hover:text-gray-200"}`}
                onClick={() => setActiveTab("editor")}
              >
                Éditeur SQL
              </button>
              <button 
                className={`px-6 py-3 focus:outline-none ${activeTab === "schema" ? "text-cyan-400 border-b-2 border-cyan-400" : "text-gray-400 hover:text-gray-200"}`}
                onClick={() => setActiveTab("schema")}
              >
                Schéma
              </button>
              <button 
                className={`px-6 py-3 focus:outline-none ${activeTab === "results" ? "text-cyan-400 border-b-2 border-cyan-400" : "text-gray-400 hover:text-gray-200"}`}
                onClick={() => setActiveTab("results")}
              >
                Résultats
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-64 flex items-center justify-center"
                  >
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
                  </motion.div>
                ) : (
                  <>
                    {activeTab === "editor" && (
                      <motion.div
                        key="editor"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-64 overflow-y-auto"
                      >
                        <pre className="text-sm text-gray-300 font-mono bg-gray-900 p-4 rounded-lg">
                          <code>{`-- Analysez les ventes par catégorie
SELECT 
  c.category_name,
  COUNT(p.product_id) as total_products,
  SUM(s.quantity * p.price) as total_revenue
FROM sales s
JOIN products p ON s.product_id = p.product_id
JOIN categories c ON p.category_id = c.category_id
WHERE s.sale_date BETWEEN '2023-01-01' AND '2023-12-31'
GROUP BY c.category_name
ORDER BY total_revenue DESC;`}</code>
                        </pre>
                        <div className="flex justify-end mt-4">
                          <Button variant="default" size="sm" className="bg-cyan-600 hover:bg-cyan-700">
                            Exécuter la requête
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === "schema" && (
                      <motion.div
                        key="schema"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-64 flex items-center justify-center bg-gray-900 rounded-lg"
                      >
                        <div className="relative h-full w-full">
                          <svg width="100%" height="100%" viewBox="0 0 600 300" className="p-4">
                            {/* Products Table */}
                            <rect x="50" y="50" width="200" height="100" rx="5" fill="#2d3748" stroke="#4a5568" strokeWidth="2" />
                            <text x="150" y="30" textAnchor="middle" fill="#e2e8f0" fontWeight="bold">Products</text>
                            <line x1="50" y1="75" x2="250" y2="75" stroke="#4a5568" strokeWidth="2" />
                            <text x="60" y="65" fill="#a0aec0">product_id (PK)</text>
                            <text x="60" y="95" fill="#a0aec0">product_name</text>
                            <text x="60" y="115" fill="#a0aec0">price</text>
                            <text x="60" y="135" fill="#a0aec0">category_id (FK)</text>

                            {/* Categories Table */}
                            <rect x="50" y="200" width="200" height="80" rx="5" fill="#2d3748" stroke="#4a5568" strokeWidth="2" />
                            <text x="150" y="180" textAnchor="middle" fill="#e2e8f0" fontWeight="bold">Categories</text>
                            <line x1="50" y1="225" x2="250" y2="225" stroke="#4a5568" strokeWidth="2" />
                            <text x="60" y="215" fill="#a0aec0">category_id (PK)</text>
                            <text x="60" y="245" fill="#a0aec0">category_name</text>
                            <text x="60" y="265" fill="#a0aec0">description</text>

                            {/* Sales Table */}
                            <rect x="350" y="75" width="200" height="100" rx="5" fill="#2d3748" stroke="#4a5568" strokeWidth="2" />
                            <text x="450" y="55" textAnchor="middle" fill="#e2e8f0" fontWeight="bold">Sales</text>
                            <line x1="350" y1="100" x2="550" y2="100" stroke="#4a5568" strokeWidth="2" />
                            <text x="360" y="90" fill="#a0aec0">sale_id (PK)</text>
                            <text x="360" y="120" fill="#a0aec0">product_id (FK)</text>
                            <text x="360" y="140" fill="#a0aec0">quantity</text>
                            <text x="360" y="160" fill="#a0aec0">sale_date</text>

                            {/* Relationship lines */}
                            <line x1="150" y1="150" x2="150" y2="200" stroke="#4299e1" strokeWidth="2" />
                            <polygon points="145,195 150,205 155,195" fill="#4299e1" />
                            
                            <line x1="250" y1="100" x2="350" y2="120" stroke="#4299e1" strokeWidth="2" />
                            <polygon points="345,115 355,120 345,125" fill="#4299e1" />
                          </svg>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === "results" && (
                      <motion.div
                        key="results"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-64 overflow-x-auto"
                      >
                        <table className="min-w-full bg-gray-900 rounded-lg overflow-hidden">
                          <thead>
                            <tr className="bg-gray-700">
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Score</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-800">
                            {results.map((user) => (
                              <tr key={user.id} className="hover:bg-gray-800">
                                <td className="px-4 py-3 whitespace-nowrap">{user.id}</td>
                                <td className="px-4 py-3 whitespace-nowrap">{user.name}</td>
                                <td className="px-4 py-3 whitespace-nowrap">{user.email}</td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    user.score >= 90 ? "bg-green-900 text-green-200" : 
                                    user.score >= 80 ? "bg-blue-900 text-blue-200" : 
                                    "bg-yellow-900 text-yellow-200"
                                  }`}>
                                    {user.score}%
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </motion.div>
                    )}
                  </>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// --- Animated Features Section (with Improved Visual Appeal) ---
const AnimatedFeaturesSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="py-20 bg-white">
      <div className={containerStyles}> {/* Remplace "container px-4" par containerStyles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-3xl font-bold mb-4">Fonctionnalités Clés</h2>
          <p className="text-gray-600">Des outils puissants pour accélérer votre apprentissage du SQL.</p>
        </motion.div>

        {/* SGBD Support */}
        <div className="max-w-5xl mx-auto"> {/* Ajout d'un conteneur pour centrer */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-16"
          >
            <h3 className="text-2xl font-semibold text-center mb-8">Support Multi-SGBD</h3>
            <div className="flex justify-center items-center gap-8 flex-wrap">
              <motion.div
                animate={isVisible ? { 
                  scale: [1, 1.05, 1], 
                  rotate: [0, 2, 0, -2, 0],
                } : {}}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                className="flex flex-col items-center"
              >
                <div className="w-20 h-20 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                  <span className="text-4xl font-bold text-blue-700">Pg</span>
                </div>
                <span className="text-sm font-medium">PostgreSQL</span>
              </motion.div>
              
              <motion.div
                animate={isVisible ? { 
                  scale: [1, 1.05, 1], 
                  rotate: [0, 2, 0, -2, 0],
                } : {}}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 0.5 }}
                className="flex flex-col items-center"
              >
                <div className="w-20 h-20 bg-orange-100 rounded-lg flex items-center justify-center mb-2">
                  <span className="text-4xl font-bold text-orange-700">My</span>
                </div>
                <span className="text-sm font-medium">MySQL</span>
              </motion.div>
              
              <motion.div
                animate={isVisible ? { 
                  scale: [1, 1.05, 1], 
                  rotate: [0, 2, 0, -2, 0],
                } : {}}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }}
                className="flex flex-col items-center"
              >
                <div className="w-20 h-20 bg-red-100 rounded-lg flex items-center justify-center mb-2">
                  <span className="text-4xl font-bold text-red-700">Or</span>
                </div>
                <span className="text-sm font-medium">Oracle</span>
              </motion.div>
              
              <motion.div
                animate={isVisible ? { 
                  scale: [1, 1.05, 1], 
                  rotate: [0, 2, 0, -2, 0],
                } : {}}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1.5 }}
                className="flex flex-col items-center"
              >
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                  <span className="text-4xl font-bold text-gray-700">SQ</span>
                </div>
                <span className="text-sm font-medium">SQLite</span>
              </motion.div>
            </div>
          </motion.div>

          {/* AI Features */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16"
          >
            <div>
              <h3 className="text-2xl font-semibold mb-4">Assistance IA Avancée</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-5 h-5 bg-cyan-500 rounded-full mr-3 mt-1"></div>
                  <p className="text-gray-700">Correction instantanée de vos requêtes SQL avec suggestions d'amélioration</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-5 h-5 bg-cyan-500 rounded-full mr-3 mt-1"></div>
                  <p className="text-gray-700">Explications détaillées des concepts SQL adaptées à votre niveau</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-5 h-5 bg-cyan-500 rounded-full mr-3 mt-1"></div>
                  <p className="text-gray-700">Génération d'exercices personnalisés selon vos points faibles</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-5 h-5 bg-cyan-500 rounded-full mr-3 mt-1"></div>
                  <p className="text-gray-700">Conseils d'optimisation pour améliorer les performances de vos requêtes</p>
                </li>
              </ul>
            </div>
            <motion.div
              animate={isVisible ? { opacity: 1, y: [10, -10] } : { opacity: 0 }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", repeatType: "reverse" }}
              className="relative rounded-xl overflow-hidden shadow-2xl"
            >
              <div className="bg-gradient-to-br from-gray-900 to-blue-900 p-6 text-white">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-xl">🤖</span>
                  </div>
                  <h4 className="font-medium">Assistant SQL</h4>
                </div>
                <div className="bg-blue-800/50 p-4 rounded-lg mb-3">
                  <p className="text-sm font-mono">Votre requête possède une erreur de syntaxe à la ligne 3. La clause WHERE doit précéder GROUP BY. De plus, votre jointure pourrait être optimisée pour améliorer les performances.</p>
                </div>
                <div className="bg-blue-700/50 p-4 rounded-lg">
                  <p className="text-sm font-mono">Suggestion: Utilisez un index sur la colonne customer_id pour accélérer l'exécution de votre requête sur de grands volumes de données.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Analytics Features */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
          >
            <motion.div
              animate={isVisible ? { rotate: [0, 2, 0, -2, 0] } : { opacity: 0 }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="relative rounded-xl overflow-hidden shadow-2xl order-2 md:order-1"
            >
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                <div className="flex flex-col space-y-4">
                  <div className="h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-md w-3/4"></div>
                  <div className="h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-md w-2/3"></div>
                  <div className="h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-md w-1/2"></div>
                  <div className="h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-md w-2/5"></div>
                  <div className="h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-md w-1/3"></div>
                </div>
                <div className="mt-4 grid grid-cols-5 gap-2">
                  <div className="text-xs text-center">JOIN</div>
                  <div className="text-xs text-center">WHERE</div>
                  <div className="text-xs text-center">GROUP</div>
                  <div className="text-xs text-center">HAVING</div>
                  <div className="text-xs text-center">UNION</div>
                </div>
              </div>
            </motion.div>
            <div className="order-1 md:order-2">
              <h3 className="text-2xl font-semibold mb-4">Analytiques de Progression</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-5 h-5 bg-cyan-500 rounded-full mr-3 mt-1"></div>
                  <p className="text-gray-700">Visualisation détaillée de vos forces et faiblesses par concept SQL</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-5 h-5 bg-cyan-500 rounded-full mr-3 mt-1"></div>
                  <p className="text-gray-700">Suivi de votre progression dans le temps avec des objectifs personnalisés</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-5 h-5 bg-cyan-500 rounded-full mr-3 mt-1"></div>
                  <p className="text-gray-700">Comparaison anonyme avec d'autres apprenants de même niveau</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-5 h-5 bg-cyan-500 rounded-full mr-3 mt-1"></div>
                  <p className="text-gray-700">Recommandations d'exercices basées sur votre historique d'apprentissage</p>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// --- Call to Action Section ---
const CallToActionSection = () => {
  const handleCTAClick = useCallback(() => {
    signIn("google", { callbackUrl: "/dashboard" });
  }, []);

  return (
    <section className="py-20 bg-gradient-to-r from-blue-900 via-cyan-800 to-cyan-700 text-white">
      <div className={containerStyles}> {/* Remplace "container px-4" par containerStyles */}
        <div className="max-w-4xl mx-auto text-center"> {/* Ajout d'un conteneur avec largeur maximale */}
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Prêt à Devenir un Expert SQL?</h2>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto mb-8">
            Rejoignez des milliers d'apprenants et transformez vos compétences en bases de données dès aujourd'hui.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              variant="default" 
              size="lg" 
              onClick={handleCTAClick}
              className="bg-white text-blue-900 hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
            >
              Commencer Gratuitement
            </Button>
            <Link href="/plans">
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 hover:bg-white/10 transition-all"
              >
                Voir les Abonnements
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

// Mise à jour du Footer
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className={containerStyles}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">SQL Mastery</h3>
              <p className="mb-4">Plateforme d'apprentissage SQL avec IA pour débutants et professionnels.</p>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-white transition-colors">
                  <span>Twitter</span>
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  <span>LinkedIn</span>
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  <span>GitHub</span>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">Ressources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tutoriels</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">Entreprise</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Équipe</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carrières</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">Légal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Conditions d'utilisation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Politique de confidentialité</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Mentions légales</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p>&copy; {new Date().getFullYear()} SQL Mastery. Tous droits réservés.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- Main Landing Page Component ---
export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <ValuePropositionGrid />
      <LiveDemoSection />
      <AnimatedFeaturesSection />
      <CallToActionSection />
      <Footer />
    </main>
  );
}