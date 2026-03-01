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
  const [activeTab, setActiveTab] = useState("recommendations");
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [qualityAnalysis, setQualityAnalysis] = useState(null);
  const [skillInsights, setSkillInsights] = useState(null);
  const [inputSkills, setInputSkills] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [error, setError] = useState("");
  const [selectedFeature, setSelectedFeature] = useState("all");

  // Sample skills for testing
  const sampleSkills =
    "Python, Machine Learning, Data Analysis, Deep Learning, TensorFlow, React, JavaScript";

  const fetchRecommendations = async (skills) => {
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/api/candidates/recommendations/", {
        skills: skills || inputSkills,
        top_n: 5,
      });

      setRecommendations(response.data.recommendations || []);
      setSkillInsights(response.data.skill_insights || {});

      if (
        response.data.recommendations &&
        response.data.recommendations.length === 0
      ) {
        setError("No job matches found. Try adding more skills.");
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.details ||
        "Failed to fetch recommendations. Please ensure the backend server is running.";
      setError(errorMsg);
      console.error("Recommendations error:", err);
    } finally {
      setLoading(false);
    }
  };

  const analyzeQuality = async (text) => {
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/api/candidates/quality/", {
        resume_text: text || resumeText,
      });

      setQualityAnalysis(response.data.analysis || null);
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.details ||
        "Failed to analyze resume quality. Please ensure the backend server is running.";
      setError(errorMsg);
      console.error("Quality analysis error:", err);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { id: "all", label: "All Features" },
    { id: "skills", label: "Skills Match" },
    { id: "experience", label: "Experience" },
    { id: "education", label: "Education" },
  ];

  const getMatchColor = (score) => {
    if (score >= 80) return "from-green-500 to-emerald-600";
    if (score >= 60) return "from-blue-500 to-indigo-600";
    if (score >= 40) return "from-yellow-500 to-orange-600";
    return "from-red-500 to-pink-600";
  };

  const getQualityBadge = (category) => {
    const badges = {
      Excellent: { color: "from-green-500 to-emerald-600", icon: "🏆" },
      High: { color: "from-blue-500 to-indigo-600", icon: "⭐" },
      Medium: { color: "from-yellow-500 to-orange-600", icon: "📊" },
      Low: { color: "from-red-500 to-pink-600", icon: "📈" },
    };
    return badges[category] || badges["Medium"];
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">
          Job{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Recommendations
          </span>
        </h1>
        <p className="text-lg text-gray-500">
          AI-powered job matching and resume quality analysis
        </p>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        variants={itemVariants}
        className="flex gap-4 border-b border-gray-200"
      >
        {["recommendations", "prediction"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 px-2 font-semibold text-sm transition-all relative ${
              activeTab === tab
                ? "text-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "recommendations"
              ? "Job Recommendations"
              : "Quality Prediction"}
            {activeTab === tab && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600"
              />
            )}
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === "recommendations" && (
          <motion.div
            key="recommendations"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Feature Selection */}
            <motion.div
              variants={itemVariants}
              className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/40 shadow-xl p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Filter by Feature
              </h3>
              <div className="flex flex-wrap gap-3">
                {features.map((feature) => (
                  <button
                    key={feature.id}
                    onClick={() => setSelectedFeature(feature.id)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all transform hover:scale-105 ${
                      selectedFeature === feature.id
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                        : "bg-white/80 text-gray-700 border border-gray-200 hover:border-indigo-300"
                    }`}
                  >
                    {feature.label}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Input Skills */}
            <motion.div
              variants={itemVariants}
              className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/40 shadow-xl p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-indigo-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                  />
                </svg>
                Enter Your Skills
              </h3>
              <div className="space-y-4">
                <textarea
                  value={inputSkills}
                  onChange={(e) => setInputSkills(e.target.value)}
                  placeholder="E.g., Python, Machine Learning, React, Database Management..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all resize-none"
                  rows="3"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => fetchRecommendations(inputSkills)}
                    disabled={loading || !inputSkills.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Loading..." : "Get Recommendations"}
                  </button>
                  <button
                    onClick={() => {
                      setInputSkills(sampleSkills);
                      fetchRecommendations(sampleSkills);
                    }}
                    className="px-6 py-3 bg-white/80 text-gray-700 rounded-xl font-semibold border border-gray-200 hover:border-indigo-300 transition-all"
                  >
                    Try Sample
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700"
              >
                {error}
              </motion.div>
            )}

            {/* Skill Insights */}
            {skillInsights && skillInsights.top_skills && (
              <motion.div
                variants={cardVariants}
                className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/40 shadow-xl p-6"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-purple-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                    />
                  </svg>
                  Your Top Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skillInsights.top_skills.slice(0, 10).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 rounded-full text-sm font-medium border border-purple-200"
                    >
                      {skill.skill}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-sm text-gray-600">
                  Total skills identified:{" "}
                  <span className="font-semibold text-gray-900">
                    {skillInsights.total_skills_identified}
                  </span>
                </p>
              </motion.div>
            )}

            {/* Recommendations Grid */}
            {recommendations.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {recommendations.map((job, idx) => (
                  <motion.div
                    key={idx}
                    variants={cardVariants}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/80 p-6 hover:shadow-2xl transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-gray-900 mb-2">
                          {job.job_title}
                        </h4>
                        <div className="flex items-center gap-2 mb-3">
                          <span
                            className={`px-4 py-1.5 bg-gradient-to-r ${getMatchColor(job.match_score)} text-white rounded-full text-sm font-semibold shadow-lg`}
                          >
                            {job.match_score}% Match
                          </span>
                          <span className="text-sm text-gray-500">
                            Rank #{idx + 1}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">
                          Required Skills
                        </p>
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {job.required_skills}
                        </p>
                      </div>

                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                        <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-2">
                          Responsibilities
                        </p>
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {job.responsibilities}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 border border-green-100">
                          <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">
                            Education
                          </p>
                          <p className="text-sm text-gray-700">
                            {job.education_required}
                          </p>
                        </div>
                        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-3 border border-orange-100">
                          <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-1">
                            Experience
                          </p>
                          <p className="text-sm text-gray-700">
                            {job.experience_required}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              !loading &&
              inputSkills && (
                <motion.div
                  variants={itemVariants}
                  className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/40 shadow-xl p-12 text-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-16 h-16 mx-auto text-gray-400 mb-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                  <p className="text-gray-600">
                    No recommendations found. Try different skills.
                  </p>
                </motion.div>
              )
            )}
          </motion.div>
        )}

        {activeTab === "prediction" && (
          <motion.div
            key="prediction"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Resume Input */}
            <motion.div
              variants={itemVariants}
              className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/40 shadow-xl p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-indigo-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
                Paste Your Resume Text
              </h3>
              <div className="space-y-4">
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your complete resume text here for quality analysis..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all resize-none"
                  rows="8"
                />
                <button
                  onClick={() => analyzeQuality(resumeText)}
                  disabled={loading || !resumeText.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Analyzing..." : "Analyze Resume Quality"}
                </button>
              </div>
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700"
              >
                {error}
              </motion.div>
            )}

            {/* Quality Analysis Results */}
            {qualityAnalysis && (
              <motion.div variants={cardVariants} className="space-y-6">
                {/* Overall Score */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/80 p-8 text-center">
                  <div
                    className={`inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-r ${getQualityBadge(qualityAnalysis.match_category).color} mb-4 shadow-2xl`}
                  >
                    <span className="text-5xl">
                      {getQualityBadge(qualityAnalysis.match_category).icon}
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">
                    {qualityAnalysis.match_category} Quality
                  </h3>
                  <div className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-4">
                    {qualityAnalysis.score}%
                  </div>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    {qualityAnalysis.quality_assessment}
                  </p>
                </div>

                {/* Category Breakdown */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/80 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    Category Breakdown
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(qualityAnalysis.probabilities || {}).map(
                      ([category, probability]) => (
                        <div key={category} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-700">
                              {category}
                            </span>
                            <span className="font-bold text-gray-900">
                              {probability}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${probability}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className={`h-full bg-gradient-to-r ${getMatchColor(probability)} shadow-inner`}
                            />
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
