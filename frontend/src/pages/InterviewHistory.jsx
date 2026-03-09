import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import ThemeToggle from "../components/ThemeToggle";

const InterviewHistory = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.get('/interview/reports/');
      setReports(response.data);
    } catch (err) {
      console.error("Failed to fetch interview reports:", err);
      setError("Failed to load interview history");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading interview history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchReports}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <motion.div
              className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30"
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
                  d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V12zm0 3h.008v.008H6.75V12z"
                />
              </svg>
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Interview History
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                View all your past interview reports and analyses
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* Reports List */}
        {reports.length === 0 ? (
          <div className="text-center py-12">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Interview Reports Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Complete an interview to see your analysis reports here
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {reports.map((report) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/80 p-6 hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className={`w-16 h-16 rounded-2xl ${getScoreBgColor(report.overall_score)} flex items-center justify-center`}>
                        <span className={`text-2xl font-bold ${getScoreColor(report.overall_score)}`}>
                          {report.overall_score}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {report.interview_type === 'technical' ? 'Technical' : 'Behavioral'} Interview
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(report.created_at)} • {report.duration} minutes
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Questions</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{report.question_count}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Responses</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{report.response_count}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Tone</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                          {report.tone_analysis?.dominant_tone || 'N/A'}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Sentiment</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                          {report.tone_analysis?.sentiment || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2">
                      {report.detailed_feedback}
                    </p>
                  </div>
                  <div className="ml-6">
                    <button
                      onClick={() => setSelectedReport(selectedReport?.id === report.id ? null : report)}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
                    >
                      {selectedReport?.id === report.id ? 'Hide Details' : 'View Details'}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {selectedReport?.id === report.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
                    >
                      {/* Skill Scores */}
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Skill Breakdown</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {Object.entries(report.skill_scores || {}).map(([skill, score]) => (
                            <div key={skill} className="text-center">
                              <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                {skill.replace('_', ' ')}
                              </p>
                              <p className={`text-lg font-semibold ${getScoreColor(score)}`}>
                                {score}%
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Strengths */}
                      {report.strengths && report.strengths.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Strengths</h4>
                          <ul className="space-y-2">
                            {report.strengths.map((strength, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-green-600 mt-1">•</span>
                                <span className="text-gray-700 dark:text-gray-300">{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Improvements */}
                      {report.improvements && report.improvements.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Areas for Improvement</h4>
                          <ul className="space-y-2">
                            {report.improvements.map((improvement, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-orange-600 mt-1">•</span>
                                <span className="text-gray-700 dark:text-gray-300">{improvement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewHistory;