import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 12 },
  },
};

const cardVariants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 120, damping: 15 },
  },
};

export default function Recommendations() {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [skillInsights, setSkillInsights] = useState(null);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [inputSkills, setInputSkills] = useState("");
  const [error, setError] = useState("");
  const [selectedFeature, setSelectedFeature] = useState("all");
  const [activeSample, setActiveSample] = useState(null);

  // Available skills set for selection
  const availableSkills = [
    { category: "Programming", skills: ["Python", "JavaScript", "Java", "C++", "C#", "NextJS", "ReactJS", "NodeJS", "TypeScript", "Swift", "Kotlin", "Go", "Rust"] },
    { category: "Frameworks & Backend", skills: ["Django", "Flask", "Spring Boot", "Express", "ASP.NET", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch"] },
    { category: "AI & Data Science", skills: ["Machine Learning", "Deep Learning", "Artificial Intelligence", "Natural Language Processing", "TensorFlow", "PyTorch", "Scikit-learn", "Pandas", "NumPy", "OpenCV"] },
    { category: "Cloud & DevOps", skills: ["AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "CI/CD", "Terraform", "Ansible", "Linux", "Networking"] },
    { category: "Design & Other", skills: ["AutoCAD", "Solidworks", "UI Design", "UX Research", "Figma", "Digital Marketing", "SEO", "Project Management", "Product Strategy"] }
  ];

  const toggleSkill = (skill) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill) 
        : [...prev, skill]
    );
  };

  // Sample skill presets by role
  const samplePresets = [
    {
      id: "fullstack",
      label: "Full Stack Dev",
      emoji: "⚡",
      color: "from-blue-500 to-indigo-600",
      skills: ["ReactJS", "NodeJS", "JavaScript", "NextJS", "TypeScript", "PostgreSQL", "Django"]
    },
    {
      id: "datascience",
      label: "Data Scientist",
      emoji: "🧠",
      color: "from-purple-500 to-fuchsia-600",
      skills: ["Python", "Machine Learning", "TensorFlow", "Pandas", "SQL", "Deep Learning", "Scikit-learn"]
    },
    {
      id: "devops",
      label: "DevOps Engineer",
      emoji: "🛠",
      color: "from-emerald-500 to-teal-600",
      skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Linux", "Terraform", "Ansible"]
    }
  ];

  const handlePreset = (preset) => {
    setActiveSample(preset.id);
    setSelectedSkills(preset.skills);
    fetchRecommendations(preset.skills.join(", "));
  };

  const fetchRecommendations = async (skillsString) => {
    const finalSkills = skillsString || selectedSkills.join(", ") || inputSkills;
    if (!finalSkills.trim()) {
      setError("Please select or type at least one skill.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await api.post("/api/candidates/recommendations/", {
        skills: finalSkills,
        top_n: 12,
      });

      setRecommendations(response.data.recommendations || []);
      setSkillInsights(response.data.skill_insights || {});

      if (response.data.recommendations?.length === 0) {
        setError("No job matches found. Try adding more skills like 'JavaScript' or 'Python'.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch recommendations.");
    } finally {
      setLoading(false);
    }
  };

  const filteredRecommendations = recommendations.filter(job => {
    if (selectedFeature === "all") return true;
    if (selectedFeature === "skills") return job.match_score > 60;
    if (selectedFeature === "experience") return job.experience_required !== "N/A";
    if (selectedFeature === "education") return job.education_required.toLowerCase().includes("bachelor") || job.education_required.toLowerCase().includes("master") || job.education_required.toLowerCase().includes("b.sc");
    return true;
  });

  const getMatchColor = (score) => {
    if (score >= 80) return "from-green-500 to-emerald-600";
    if (score >= 60) return "from-blue-500 to-indigo-600";
    if (score >= 40) return "from-yellow-500 to-orange-600";
    return "from-red-500 to-pink-600";
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 pb-20"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3">
          Smart{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Career Paths
          </span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Discover your perfect match based on the skills you pick
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Skill Selection */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div
            variants={itemVariants}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-2xl p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-indigo-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </span>
              Select Your Skills
            </h3>

            <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {availableSkills.map((cat, i) => (
                <div key={i} className="space-y-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
                    {cat.category}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {cat.skills.map(skill => (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                          selectedSkills.includes(skill)
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105"
                            : "bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 border-gray-100 dark:border-gray-600 hover:border-indigo-300"
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={inputSkills}
                  onChange={(e) => setInputSkills(e.target.value)}
                  placeholder="Or type other skills..."
                  className="w-full pl-4 pr-12 py-3 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm"
                />
              </div>

              <button
                onClick={() => fetchRecommendations()}
                disabled={loading || (selectedSkills.length === 0 && !inputSkills.trim())}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold hover:shadow-2xl hover:shadow-indigo-500/30 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  </svg>
                )}
                {loading ? "Analyzing..." : "Find Career Paths"}
              </button>
            </div>
          </motion.div>

          {/* Quick Presets */}
          <motion.div variants={itemVariants} className="space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">
              Popular Roles
            </p>
            <div className="grid grid-cols-1 gap-2">
              {samplePresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePreset(preset)}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl text-left transition-all ${
                    activeSample === preset.id
                      ? `bg-gradient-to-r ${preset.color} text-white shadow-lg`
                      : "bg-white/80 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 border border-transparent hover:border-indigo-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{preset.emoji}</span>
                    <span className="font-semibold">{preset.label}</span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 opacity-50">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column: Recommendations Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Filters */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-between gap-4"
          >
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {["all", "skills", "experience", "education"].map(f => (
                <button
                  key={f}
                  onClick={() => setSelectedFeature(f)}
                  className={`px-5 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${
                    selectedFeature === f
                      ? "bg-white dark:bg-gray-800 text-indigo-600 shadow-xl border border-indigo-100 dark:border-indigo-900"
                      : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {f === "all" ? "All Recommendations" : f.charAt(0).toUpperCase() + f.slice(1) + " Focused"}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-3xl p-6 text-red-600 dark:text-red-400 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold">Recommendation Issue</p>
                  <p className="text-sm opacity-80">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Area */}
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredRecommendations.length > 0 ? (
                filteredRecommendations.map((job, idx) => (
                  <motion.div
                    key={`${job.job_title}-${idx}`}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ scale: 1.01, x: 10 }}
                    className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-[2rem] border border-white/40 dark:border-gray-700/40 p-8 shadow-xl hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getMatchColor(job.match_score)} flex items-center justify-center text-white shadow-lg shadow-indigo-500/20`}>
                            <span className="text-xl font-black">{job.match_score}%</span>
                          </div>
                          <div>
                            <h4 className="text-2xl font-black text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                              {job.job_title}
                            </h4>
                            <p className="text-gray-500 font-medium">Top Match Rank #{idx + 1}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {job.required_skills.split(",").slice(0, 5).map((s, i) => (
                            <span key={i} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold uppercase tracking-wider">
                              {s.trim()}
                            </span>
                          ))}
                          {job.required_skills.split(",").length > 5 && (
                            <span className="px-3 py-1 bg-gray-50 dark:bg-gray-700/50 text-gray-400 rounded-lg text-xs font-bold">
                              +{job.required_skills.split(",").length - 5} more
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 min-w-[200px]">
                        <div className="flex items-center gap-3 text-sm font-bold text-gray-600 dark:text-gray-300">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          Experience: {job.experience_required || 'Not specified'}
                        </div>
                        <div className="flex items-center gap-3 text-sm font-bold text-gray-600 dark:text-gray-300">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          Edu: {job.education_required || 'Degree not listed'}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                !loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-24 text-center space-y-6"
                  >
                    <div className="w-32 h-32 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 text-indigo-200">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      </svg>
                    </div>
                    <div>
                      <h5 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Ready to explore?</h5>
                      <p className="text-gray-500 max-w-xs mx-auto">Select your skills on the left and find your next big opportunity!</p>
                    </div>
                  </motion.div>
                )
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
