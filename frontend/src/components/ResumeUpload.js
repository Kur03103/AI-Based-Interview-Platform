import React, { useState } from "react";
import axios from "axios";
import api from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";

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

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [resumeData, setResumeData] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setError("");
      setExtractedText("");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setFileName(droppedFile.name);
      setError("");
      setExtractedText("");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setLoading(true);
    setError("");
    setExtractedText("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/ocr/extract",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      let responseText = response.data.text;
      let parsedData;

      try {
        // Check if response is an object (already parsed by axios)
        if (typeof responseText === "object") {
          parsedData = responseText;
        } else {
          // It's a string, try to clean it if it has markdown code blocks
          const cleanedText = responseText
            .replace(/```json\n?|\n?```/g, "")
            .trim();
          parsedData = JSON.parse(cleanedText);
        }
      } catch (e) {
        console.warn("JSON Parse failed, falling back to raw text:", e);
        parsedData = null;
      }

      if (parsedData) {
        setResumeData(parsedData);
        setExtractedText(formatResumeToText(parsedData));
      } else {
        // Fallback to raw text if parsing fails completely
        setExtractedText(response.data.text);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError(
        err.response?.data?.error ||
          "Failed to extract text. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setFileName("");
    setExtractedText("");
    setResumeData(null);
    setError("");
  };

  const handleSaveToSystem = async () => {
    if (!resumeData) return;

    // Helper to clean up URL fields
    const sanitizeUrl = (url) => {
      if (!url) return null;
      if (typeof url !== "string") return null;
      const lower = url.trim().toLowerCase();
      if (["null", "none", "n/a", "not provided", ""].includes(lower))
        return null;

      // If it looks like a URL but is missing protocol, add https
      if (!url.match(/^https?:\/\//i) && url.match(/^[\w.-]+\.[a-z]{2,}/i)) {
        return "https://" + url.trim();
      }

      // If it doesn't look like a URL at all, return null to avoid validation error
      try {
        new URL(
          url.trim().startsWith("http") ? url.trim() : "https://" + url.trim(),
        );
        return url.trim();
      } catch (e) {
        return null;
      }
    };

    // Flatten the data and sanitize URLs
    const payload = {
      ...resumeData.personal_info,

      // Sanitize specific URL fields
      linkedin_url: sanitizeUrl(resumeData.personal_info?.linkedin_url),
      github_url: sanitizeUrl(resumeData.personal_info?.github_url),
      portfolio_url: sanitizeUrl(resumeData.personal_info?.portfolio_url),

      education: resumeData.education,
      skills: resumeData.skills,
      achievements: resumeData.achievements,
    };

    try {
      // Use the authenticated 'api' instance instead of raw 'axios'
      const response = await api.post("/api/cv/save/", payload);
      alert(
        "CV saved to system successfully! Person ID: " +
          response.data.person_id,
      );
    } catch (err) {
      console.error("Save error:", err);
      // Better error message handling
      let errorMessage = err.message;
      if (err.response && err.response.data) {
        if (err.response.data.details) {
          errorMessage = JSON.stringify(err.response.data.details, null, 2);
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else {
          errorMessage = JSON.stringify(err.response.data, null, 2);
        }
      }
      alert("Failed to save CV:\n" + errorMessage);
    }
  };

  const formatResumeToText = (data) => {
    if (!data) return "";
    let text = "";

    // Personal Info
    if (data.personal_info) {
      text += "Personal Information\n";
      const pi = data.personal_info;
      if (pi.first_name || pi.last_name)
        text += `Name: ${pi.first_name || ""} ${pi.last_name || ""}\n`;
      if (pi.email) text += `Email: ${pi.email}\n`;
      if (pi.phone) text += `Phone: ${pi.phone}\n`;
      if (pi.linkedin_url) text += `LinkedIn: ${pi.linkedin_url}\n`;
      if (pi.github_url) text += `GitHub: ${pi.github_url}\n`;
      if (pi.portfolio_url) text += `Portfolio: ${pi.portfolio_url}\n`;
      text += "\n";
    }

    // Education
    if (data.education && data.education.length > 0) {
      text += "Education\n";
      data.education.forEach((edu) => {
        if (edu.degree) text += `${edu.degree}\n`;
        if (edu.institution)
          text += `${edu.institution} (${edu.start_date || ""} - ${edu.end_date || ""})\n`;
        if (edu.gpa) text += `GPA: ${edu.gpa}\n`;
        text += "\n";
      });
    }

    // Skills
    if (data.skills && data.skills.length > 0) {
      text += "Skills\n";
      const categories = {};
      data.skills.forEach((skill) => {
        const cat = skill.category || "Other";
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(skill.name);
      });
      Object.keys(categories).forEach((cat) => {
        text += `${cat}: ${categories[cat].join(", ")}\n`;
      });
      text += "\n";
    }

    // Achievements
    if (data.achievements && data.achievements.length > 0) {
      text += "Achievements & Certifications\n";
      data.achievements.forEach((ach) => {
        text += `• ${ach.title}`;
        if (ach.date) text += ` (${ach.date})`;
        text += "\n";
        if (ach.description) text += `  ${ach.description}\n`;
      });
    }

    return text;
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
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30"
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          </motion.div>
          <div className="px-3 py-1 rounded-full bg-purple-100 text-purple-600 text-xs font-semibold">
            AI OCR
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">
          Upload{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            Resume
          </span>
        </h1>
        <p className="text-lg text-gray-500">
          Upload your CV to extract text using AI-powered OCR technology
        </p>
      </motion.div>

      {/* Upload Section */}
      <motion.div
        variants={itemVariants}
        className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/40 shadow-xl p-8"
      >
        <div className="space-y-6">
          {/* File Input */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
              Select Resume (PDF or Image)
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
                id="resume-upload"
              />
              <motion.label
                htmlFor="resume-upload"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`flex items-center justify-center w-full px-8 py-12 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
                  isDragging
                    ? "border-indigo-500 bg-indigo-50"
                    : fileName
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/50"
                }`}
              >
                <div className="text-center">
                  {fileName ? (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-center"
                    >
                      <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-8 h-8 text-white"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <p className="text-lg font-semibold text-emerald-700">
                        {fileName}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Click to change file
                      </p>
                    </motion.div>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-8 h-8 text-white"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                          />
                        </svg>
                      </div>
                      <p className="text-lg font-semibold text-gray-700">
                        {isDragging
                          ? "Drop your file here"
                          : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        PDF, JPG, PNG up to 10MB
                      </p>
                    </>
                  )}
                </div>
              </motion.label>
            </div>
          </div>

          {/* Action Buttons */}
          <motion.div variants={itemVariants} className="flex gap-4">
            <motion.button
              onClick={handleUpload}
              disabled={!file || loading}
              whileHover={!file || loading ? {} : { scale: 1.02, y: -2 }}
              whileTap={!file || loading ? {} : { scale: 0.98 }}
              className={`flex-1 py-4 px-8 rounded-xl font-semibold text-white transition-all duration-300 ${
                loading || !file
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-xl hover:shadow-indigo-500/25"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Analyzing Resume...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                    />
                  </svg>
                  Extract with AI
                </span>
              )}
            </motion.button>

            <AnimatePresence>
              {(file || extractedText) && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8, width: 0 }}
                  animate={{ opacity: 1, scale: 1, width: "auto" }}
                  exit={{ opacity: 0, scale: 0.8, width: 0 }}
                  onClick={handleClear}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-4 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors duration-200 flex items-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Clear
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
              <p className="text-red-800 text-sm font-medium">{error}</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Extracted Text Display */}
      <AnimatePresence>
        {extractedText && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, type: "spring", bounce: 0.2 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100/80 p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 text-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Extracted Content
                  </h3>
                  <p className="text-sm text-gray-500">
                    AI-powered text recognition complete
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={() => navigator.clipboard.writeText(extractedText)}
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2.5 text-sm bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 shadow-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                    />
                  </svg>
                  Copy
                </motion.button>
                {resumeData && (
                  <motion.button
                    onClick={handleSaveToSystem}
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2.5 text-sm bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-200 flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M9 12l3 3m0 0l3-3m-3 3V2.25"
                      />
                    </svg>
                    Save to System
                  </motion.button>
                )}
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-6 max-h-96 overflow-y-auto border border-gray-200/60 shadow-inner">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                {extractedText}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
