import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import api from "../api/axios";
import ThemeToggle from "../components/ThemeToggle";

const ResumeHistory = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchReports();
  }, [page]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/candidates/reports/', {
        params: { page, limit: 10 }
      });

      if (page === 1) {
        setReports(response.data.results || []);
      } else {
        setReports((prev) => [...prev, ...(response.data.results || [])]);
      }

      setHasMore(response.data.next !== null);
      setError("");
    } catch (err) {
      console.error("Failed to fetch resume reports:", err);
      setError("Failed to load resume history. Please try again.");
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading resume history...</p>
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
            className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
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
            <div>
              <div className="flex items-center gap-4 mb-2">
                <Link
                  to="/home"
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 flex items-center gap-2 text-sm font-semibold shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  Back to Dashboard
                </Link>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                Resume History
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                View all your past resume analyses and scores
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
              No Resume Reports Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Upload and analyze a resume to see your reports here
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
                      <div className="flex flex-col items-center gap-2">
                        <div className={`w-16 h-16 rounded-2xl ${getScoreBgColor(report.overall_score)} flex items-center justify-center`}>
                          <span className={`text-2xl font-bold ${getScoreColor(report.overall_score)}`}>
                            {report.overall_score}
                          </span>
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">Overall</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className={`w-16 h-16 rounded-2xl ${getScoreBgColor(report.ats_score)} flex items-center justify-center`}>
                          <span className={`text-2xl font-bold ${getScoreColor(report.ats_score)}`}>
                            {report.ats_score}
                          </span>
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">ATS</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {report.resume_file_name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(report.created_at)}
                        </p>
                      </div>
                    </div>
                    {/* Top suggestion preview */}
                    {report.recommendations && report.recommendations.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-semibold text-purple-600">Top Suggestion:</span> {report.recommendations[0]}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="ml-6">
                    <button
                      onClick={() => setSelectedReport(selectedReport?.id === report.id ? null : report)}
                      className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold"
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
                      {/* Analytics */}
                      {report.analytics && (
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Analytics</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {Object.entries(report.analytics).map(([key, value]) => (
                              <div key={key} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                  {key.replace('_', ' ')}
                                </p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {value}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

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

                      {/* Weaknesses */}
                      {report.weaknesses && report.weaknesses.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Areas for Improvement</h4>
                          <ul className="space-y-2">
                            {report.weaknesses.map((weakness, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-orange-600 mt-1">•</span>
                                <span className="text-gray-700 dark:text-gray-300">{weakness}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Recommendations */}
                      {report.recommendations && report.recommendations.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Recommendations</h4>
                          <ul className="space-y-2">
                            {report.recommendations.map((recommendation, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-blue-600 mt-1">{index + 1}.</span>
                                <span className="text-gray-700 dark:text-gray-300">{recommendation}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Improved Bullet Example */}
                      {report.improved_bullet_example && (
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Example Improvement</h4>
                          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono">
                              {report.improved_bullet_example}
                            </pre>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && reports.length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={loading}
              className="px-8 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:bg-gray-400 transition-colors font-semibold"
            >
              {loading ? "Loading..." : "Load More Reports"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeHistory;