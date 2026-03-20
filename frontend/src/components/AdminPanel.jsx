import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userReports, setUserReports] = useState({ interviews: [], resumes: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/auth/admin/users/');
      setUsers(response.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReports = async (userId) => {
    try {
      const [interviewRes, resumeRes] = await Promise.all([
        api.get(`/api/interview/reports/?user=${userId}`),
        api.get(`/api/candidates/reports/?user=${userId}`)
      ]);
      const interviews = interviewRes.data;
      const resumes = resumeRes.data;
      setUserReports({ interviews, resumes });

      // Compute analytics
      const avgInterviewScore = interviews.length
        ? Math.round(interviews.reduce((sum, r) => sum + r.overall_score, 0) / interviews.length)
        : 0;
      const avgResumeScore = resumes.length
        ? Math.round(resumes.reduce((sum, r) => sum + r.overall_score, 0) / resumes.length)
        : 0;
      setAnalytics({
        totalInterviews: interviews.length,
        totalResumes: resumes.length,
        avgInterviewScore,
        avgResumeScore,
      });
    } catch (err) {
      console.error("Failed to fetch user reports:", err);
      setUserReports({ interviews: [], resumes: [] });
      setAnalytics(null);
    }
  };

  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    setEditingUser(null);
    await fetchUserReports(user.id);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditForm({
      username: user.username || "",
      email: user.email || "",
      name: user.name || "",
      age: user.age || "",
      is_staff: user.is_staff || false,
      is_superuser: user.is_superuser || false,
    });
  };

  const handleSaveUser = async () => {
    try {
      const response = await api.patch(`/api/auth/admin/users/${editingUser.id}/`, editForm);
      setUsers(users.map((u) => (u.id === editingUser.id ? response.data : u)));
      setSelectedUser(response.data);
      setEditingUser(null);
    } catch (err) {
      console.error("Failed to save user:", err);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading admin data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchUsers}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Users List */}
      <div className="lg:col-span-1">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Users</h2>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {users.map((user) => (
            <motion.div
              key={user.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleUserSelect(user)}
              className={`p-4 rounded-xl cursor-pointer transition-all ${
                selectedUser?.id === user.id
                  ? "bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500"
                  : "bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {user.username?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">{user.username}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                </div>
                {(user.is_staff || user.is_superuser) && (
                  <span className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full">
                    Admin
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* User Details and Reports */}
      <div className="lg:col-span-2">
        {selectedUser ? (
          <div className="space-y-6">
            {/* User Details */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">User Details</h3>
                <button
                  onClick={() => handleEditUser(selectedUser)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Edit User
                </button>
              </div>

              {editingUser ? (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      value={editForm.age}
                      onChange={(e) => setEditForm({...editForm, age: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editForm.is_staff}
                        onChange={(e) => setEditForm({...editForm, is_staff: e.target.checked})}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Staff</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editForm.is_superuser}
                        onChange={(e) => setEditForm({...editForm, is_superuser: e.target.checked})}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Superuser</span>
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveUser}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingUser(null)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Username</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedUser.username}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedUser.name || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Age</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedUser.age || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Joined</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{formatDate(selectedUser.date_joined)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Role</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {selectedUser.is_superuser ? 'Superuser' : selectedUser.is_staff ? 'Staff' : 'User'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Analytics Overview */}
            {analytics && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total Interviews</p>
                      <p className="text-2xl font-bold">{analytics.totalInterviews}</p>
                    </div>
                    <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Total Resumes</p>
                      <p className="text-2xl font-bold">{analytics.totalResumes}</p>
                    </div>
                    <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Avg Interview Score</p>
                      <p className="text-2xl font-bold">{analytics.avgInterviewScore}%</p>
                    </div>
                    <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Avg Resume Score</p>
                      <p className="text-2xl font-bold">{analytics.avgResumeScore}%</p>
                    </div>
                    <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Interview Reports */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Interview Reports ({userReports.interviews.length})
              </h3>
              {userReports.interviews.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">No interview reports found</p>
              ) : (
                <div className="space-y-4">
                  {userReports.interviews.map((report) => (
                    <motion.div
                      key={report.id}
                      whileHover={{ scale: 1.01 }}
                      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            {report.overall_score}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">Interview Analysis</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(report.created_at)}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(report.overall_score)} bg-gray-100 dark:bg-gray-700`}>
                          {report.overall_score >= 80 ? 'Excellent' : report.overall_score >= 60 ? 'Good' : 'Needs Improvement'}
                        </span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white mb-2">Strengths</h5>
                          <ul className="space-y-1">
                            {report.strengths?.map((strength, index) => (
                              <li key={index} className="text-sm text-gray-700 dark:text-gray-300">• {strength}</li>
                            )) || <li className="text-sm text-gray-700 dark:text-gray-300">No strengths listed</li>}
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white mb-2">Areas for Improvement</h5>
                          <ul className="space-y-1">
                            {report.areas_for_improvement?.map((area, index) => (
                              <li key={index} className="text-sm text-gray-700 dark:text-gray-300">• {area}</li>
                            )) || <li className="text-sm text-gray-700 dark:text-gray-300">No areas listed</li>}
                          </ul>
                        </div>
                      </div>
                      <div className="mt-4">
                        <h5 className="font-medium text-gray-900 dark:text-white mb-2">Detailed Feedback</h5>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{report.detailed_feedback}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Resume Reports */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Resume Reports ({userReports.resumes.length})
              </h3>
              {userReports.resumes.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">No resume reports found</p>
              ) : (
                <div className="space-y-4">
                  {userReports.resumes.map((report) => (
                    <motion.div
                      key={report.id}
                      whileHover={{ scale: 1.01 }}
                      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold">
                            {report.overall_score}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">{report.file_name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(report.created_at)}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(report.overall_score)} bg-gray-100 dark:bg-gray-700`}>
                          {report.overall_score >= 80 ? 'Excellent' : report.overall_score >= 60 ? 'Good' : 'Needs Improvement'}
                        </span>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Overall Score</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{report.overall_score}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 dark:text-gray-400">ATS Score</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{report.ats_score}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 dark:text-gray-400">File Size</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{report.file_size || 'N/A'}</p>
                        </div>
                      </div>
                      {report.analysis && (
                        <div className="mt-4 grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-white mb-2">Keywords Found</h5>
                            <div className="flex flex-wrap gap-2">
                              {report.analysis.keywords?.map((keyword, index) => (
                                <span key={index} className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs">
                                  {keyword}
                                </span>
                              )) || <span className="text-sm text-gray-700 dark:text-gray-300">No keywords found</span>}
                            </div>
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-white mb-2">Missing Keywords</h5>
                            <div className="flex flex-wrap gap-2">
                              {report.analysis.missing_keywords?.map((keyword, index) => (
                                <span key={index} className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full text-xs">
                                  {keyword}
                                </span>
                              )) || <span className="text-sm text-gray-700 dark:text-gray-300">No missing keywords</span>}
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
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
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Select a User
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Choose a user from the list to view their details and reports
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
