import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

/* ─────────────────────────────────────────────────────────────
   ADMIN PANEL DATA
───────────────────────────────────────────────────────────── */



/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */

function ScoreBadge({ score }) {
  if (score === null) return <span className="text-xs text-gray-400">—</span>;
  const cls =
    score >= 90
      ? "bg-emerald-100 text-emerald-700"
      : score >= 75
        ? "bg-blue-100 text-blue-700"
        : score >= 60
          ? "bg-amber-100 text-amber-700"
          : "bg-red-100 text-red-700";
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${cls}`}
    >
    </span>
  );
}

function StatusPill({ status }) {
  const map = {
    active: "bg-emerald-100 text-emerald-700",
    inactive: "bg-gray-100 text-gray-500",
    pending: "bg-amber-100 text-amber-700",
    completed: "bg-blue-100 text-blue-700",
    analyzed: "bg-purple-100 text-purple-700",
  };
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${map[status] || map.inactive}`}
    >
      {status}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   NAV ITEMS
───────────────────────────────────────────────────────────── */
const NAV = [
  {
    id: "overview",
    label: "Overview",
    icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
  },
  {
    id: "users",
    label: "Users",
    icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
  },
  {
    id: "interviews",
    label: "Interviews",
    icon: "M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z",
  },
  {
    id: "resumes",
    label: "Resumes",
    icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: "M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z",
  },
  {
    id: "settings",
    label: "Settings",
    icon: "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  },
];


function StatCard({ label, value, sub, gradient, icon, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        y: -4,
        transition: { type: "spring", stiffness: 300, damping: 20 },
      }}
      className="relative bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 p-6 overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
    >
      <div
        className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${gradient} opacity-[0.07] rounded-bl-full`}
      />
      <div
        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-md mb-4`}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d={icon}
          />
        </svg>
      </div>
      <div className="text-3xl font-black text-gray-900 mb-1">{value}</div>
      <div className="text-sm font-semibold text-gray-700">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </motion.div>
  );
}

function Overview({ users = [], interviews = [], resumes = [] }) {
  const totalInterviews = interviews.length;
  const resumesAnalyzed = resumes.length;

  const avgInterviewScore = totalInterviews
    ? Math.round(interviews.reduce((sum, r) => sum + (r.overall_score || 0), 0) / totalInterviews)
    : 0;

  const scoreBands = [
    { label: "90–100", count: interviews.filter((i) => (i.overall_score || 0) >= 90).length, color: "from-emerald-500 to-green-400" },
    { label: "75–89", count: interviews.filter((i) => (i.overall_score || 0) >= 75 && (i.overall_score || 0) < 90).length, color: "from-blue-500 to-indigo-400" },
    { label: "60–74", count: interviews.filter((i) => (i.overall_score || 0) >= 60 && (i.overall_score || 0) < 75).length, color: "from-amber-500 to-yellow-400" },
    { label: "< 60", count: interviews.filter((i) => (i.overall_score || 0) < 60).length, color: "from-red-500 to-pink-400" },
  ];

  const activity = [
    ...interviews.map((inv) => ({
      icon: "🎤",
      text: `${inv.user?.username || inv.username || "Unknown"} completed interview`,
      sub: `${inv.overall_score || 0}% score`,
      date: inv.updated_at || inv.created_at,
    })),
    ...resumes.map((res) => ({
      icon: "📄",
      text: `${res.username || res.email || "Unknown"} uploaded resume`,
      sub: `ATS ${res.ats_score ?? "N/A"}`,
      date: res.updated_at || res.created_at,
    })),
  ]
    .filter((a) => a.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);


  const stats = [
    {
      label: "Total Users",
      value: String(users.length),
      sub: "Live users",
      gradient: "from-blue-500 to-indigo-600",
      icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
    },
    {
      label: "Total Interviews",
      value: String(totalInterviews),
      sub: "+7 this week",
      gradient: "from-purple-500 to-violet-600",
      icon: "M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z",
    },
    {
      label: "Resumes Analyzed",
      value: String(resumesAnalyzed),
      sub: "+3 this week",
      gradient: "from-emerald-500 to-teal-600",
      icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
    },
    {
      label: "Avg Score",
      value: `${avgInterviewScore}%`,
      sub: "Across all sessions",
      gradient: "from-pink-500 to-rose-600",
      icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((s, i) => (
          <StatCard key={s.label} {...s} index={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity feed */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 p-6 shadow-lg"
        >
          <h3 className="font-bold text-gray-900 text-lg mb-5">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {activity.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.06 }}
                className="flex items-start gap-3"
              >
                <span className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-sm bg-indigo-100 text-indigo-700">
                  {a.icon}
                </span>
                <div>
                  <p className="text-xs font-semibold text-gray-800 leading-tight">
                    {a.text}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{a.date ? new Date(a.date).toLocaleString() : 'Unknown'}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Score dist */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.55 }}
        className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 p-6 shadow-lg"
      >
        <h3 className="font-bold text-gray-900 text-lg mb-6">
          Score Distribution
        </h3>
        <div className="space-y-4">
          {scoreBands.map((band, i) => (
            <div key={band.label} className="flex items-center gap-4">
              <span className="text-sm font-semibold text-gray-600 w-16 text-right">
                {band.label}
              </span>
              <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(totalInterviews > 0 ? (band.count / totalInterviews) * 100 : 0)}%` }}
                  transition={{
                    duration: 0.7,
                    delay: 0.6 + i * 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={`h-full bg-gradient-to-r ${band.color} rounded-full shadow-inner`}
                />
              </div>
              <span className="text-sm font-black text-gray-900 w-8">
                {band.count}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function Users({ users = [], loading = false, error = '', formatDate, onUserRemoved }) {
  const [search, setSearch] = useState("");
  const filtered = users.filter(
    (u) =>
      (u.username || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase()),
  );

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`/api/auth/admin/users/${id}/`);
      onUserRemoved?.(id);
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Could not delete user. Ensure you have permission and the user is not protected.');
    }
  };
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-md text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <div className="flex gap-3">
          <motion.button
            onClick={() => window.location.href = '/admin'}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-bold shadow-md hover:shadow-lg transition-shadow"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V18zm0 2.25h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5v-.008zm2.25-2.25h.008v.008H18.75V18zm2.25 0h.008v.008H21V18zm-2.25 2.25h.008v.008H18.75v-.008zm2.25 0h.008v.008H21v-.008z"
              />
            </svg>
            Admin Panel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold shadow-md hover:shadow-lg transition-shadow"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Add User
          </motion.button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg overflow-hidden"
      >
        <div className="p-4 text-sm text-gray-500">
          {loading ? (
            "Loading users..."
          ) : error ? (
            <span className="text-red-500">{error}</span>
          ) : filtered.length === 0 ? (
            "No users found."
          ) : null}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-4">
                  User
                </th>
                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-4">
                  Status
                </th>
                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((u, i) => (
                <motion.tr
                  key={u.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-indigo-50/40 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {(u.username || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {u.username || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-400">{u.email || 'No email'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusPill status={u.is_active ? 'active' : 'inactive'} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-indigo-100 hover:text-indigo-600 flex items-center justify-center transition-colors">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteUser(u.id)}
                        className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition-colors"
                        title="Delete user"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

function Interviews({ interviews = [], loading = false, error = '', formatDate, chooseInterviewType }) {
  const [selectedReport, setSelectedReport] = useState(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg overflow-hidden"
    >
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-bold text-gray-900 text-lg">
          All Interview Sessions
        </h3>
        <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
          {loading ? 'Loading...' : `${interviews.length} total`}
        </span>
      </div>

      {loading ? (
        <div className="px-6 py-8 text-gray-500">Loading interview history...</div>
      ) : error ? (
        <div className="px-6 py-8 text-red-500">{error}</div>
      ) : interviews.length === 0 ? (
        <div className="px-6 py-8 text-gray-500">No interview history available.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-4">ID</th>
                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-4">Candidate</th>
                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-4">Type</th>
                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-4">Score</th>
                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-4">Duration</th>
                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-4">Date</th>
                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {interviews.map((s, i) => (
                <motion.tr
                  key={s.id}
                  onClick={() => setSelectedReport(s)}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`hover:bg-indigo-50/40 transition-colors ${selectedReport?.id === s.id ? 'bg-indigo-100/40' : ''}`}
                >
                  <td className="px-6 py-4 text-xs font-mono font-bold text-indigo-600">{(s.id || '').toString().slice(0, 8)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                        {(s.user?.username || 'U').charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-semibold text-gray-800">{s.user?.username || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      chooseInterviewType(s) === 'Technical'
                        ? 'bg-blue-100 text-blue-700'
                        : chooseInterviewType(s) === 'Resume from CV'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-amber-100 text-amber-700'
                    }`}>
                      {chooseInterviewType(s)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <ScoreBadge score={s.overall_score || 0} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{s.duration ? `${s.duration} min` : 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(s.created_at || s.updated_at)}</td>
                  <td className="px-6 py-4">
                    <StatusPill status={s.overall_score >= 70 ? 'completed' : 'needs review'} />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {selectedReport && (
          <div className="p-5 border-t border-gray-200 bg-gray-50">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h4 className="text-lg font-bold text-gray-900">Interview Detail</h4>
                <p className="text-sm text-gray-500">{selectedReport.user?.username || 'Unknown candidate'}</p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-xs px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
              >
                Close
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs text-gray-400">Date</p>
                <p className="font-semibold">{formatDate(selectedReport.created_at || selectedReport.updated_at)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Duration</p>
                <p className="font-semibold">{selectedReport.duration ? `${selectedReport.duration} min` : 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Score</p>
                <p className="font-semibold">{selectedReport.overall_score || 0}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Status</p>
                <StatusPill status={selectedReport.overall_score >= 70 ? 'completed' : 'needs review'} />
              </div>
            </div>
            <div className="mt-4 grid gap-4">
              <div>
                <p className="text-xs text-gray-400">Strengths</p>
                <ul className="list-disc pl-4 text-sm text-gray-700">
                  {(selectedReport.strengths || []).map((item, idx) => <li key={idx}>{item}</li>)}
                </ul>
              </div>
              <div>
                <p className="text-xs text-gray-400">Areas for Improvement</p>
                <ul className="list-disc pl-4 text-sm text-gray-700">
                  {(selectedReport.improvements || []).map((item, idx) => <li key={idx}>{item}</li>)}
                </ul>
              </div>
              <div>
                <p className="text-xs text-gray-400">Detailed Feedback</p>
                <p className="text-sm text-gray-700">{selectedReport.detailed_feedback || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}
    </motion.div>
  );
}

function Resumes({ resumes = [], loading = false, error = '', formatDate }) {
  const [selectedResume, setSelectedResume] = useState(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg overflow-hidden"
    >
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-bold text-gray-900 text-lg">Uploaded Resumes</h3>
        <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
          {loading ? 'Loading...' : `${resumes.length} files`}
        </span>
      </div>

      {loading ? (
        <div className="px-6 py-8 text-gray-500">Loading resume history...</div>
      ) : error ? (
        <div className="px-6 py-8 text-red-500">{error}</div>
      ) : resumes.length === 0 ? (
        <div className="px-6 py-8 text-gray-500">No resume history available.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-4">ID</th>
                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-4">File</th>
                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-4">ATS Score</th>
                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-4">Size</th>
                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-4">Uploaded</th>
                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {resumes.map((r, i) => (
                <motion.tr
                  key={r.id}
                  onClick={() => setSelectedResume(r)}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`hover:bg-indigo-50/40 transition-colors ${selectedResume?.id === r.id ? 'bg-indigo-100/40' : ''}`}
                >
                  <td className="px-6 py-4 text-xs font-mono font-bold text-purple-600">{(r.id || '').toString().slice(0, 8)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center text-red-500 text-xs font-bold">
                        {r.resume_file_name?.toLowerCase().endsWith('.docx') ? 'W' : 'PDF'}
                      </div>
                      <span className="text-xs text-gray-600 font-medium">{r.resume_file_name || 'Unnamed'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <ScoreBadge score={r.ats_score || 0} />
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">{r.analysis?.file_size || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(r.created_at || r.updated_at)}</td>
                  <td className="px-6 py-4">
                    <StatusPill status={r.ats_score ? 'analyzed' : 'pending'} />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {selectedResume && (
        <div className="p-5 border-t border-gray-200 bg-gray-50">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="text-lg font-bold text-gray-900">Resume Report Details</h4>
              <p className="text-sm text-gray-500">{selectedResume.username || selectedResume.email || 'Unknown candidate'}</p>
            </div>
            <button
              onClick={() => setSelectedResume(null)}
              className="text-xs px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
            >
              Close
            </button>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs text-gray-400">Candidate</p>
              <p className="font-semibold">{selectedResume.username || selectedResume.email || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Created At</p>
              <p className="font-semibold">{formatDate(selectedResume.created_at)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Overall Score</p>
              <p className="font-semibold">{selectedResume.overall_score}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">ATS Score</p>
              <p className="font-semibold">{selectedResume.ats_score}%</p>
            </div>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs text-gray-400">Strengths</p>
              <ul className="list-disc pl-4 text-sm text-gray-700">
                {(selectedResume.strengths || []).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs text-gray-400">Weaknesses</p>
              <ul className="list-disc pl-4 text-sm text-gray-700">
                {(selectedResume.weaknesses || []).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function Analytics({ users = [], interviews = [], resumes = [], chooseInterviewType }) {
  const totalInterviews = interviews.length;
  const analyzedResumes = resumes.filter((r) => r.overall_score !== null && r.overall_score !== undefined).length;

  const avgInterviewScore = totalInterviews
    ? Math.round(
        interviews.reduce((sum, r) => sum + (r.overall_score || 0), 0) / totalInterviews
      )
    : 0;

  const avgResumeScore = analyzedResumes
    ? Math.round(
        resumes.reduce((sum, r) => sum + (r.overall_score || 0), 0) / analyzedResumes
      )
    : 0;

  const scoreBands = [
    { label: '90–100', count: interviews.filter((i) => (i.overall_score || 0) >= 90).length, color: 'from-emerald-500 to-green-400' },
    { label: '75–89', count: interviews.filter((i) => (i.overall_score || 0) >= 75 && (i.overall_score || 0) < 90).length, color: 'from-blue-500 to-indigo-400' },
    { label: '60–74', count: interviews.filter((i) => (i.overall_score || 0) >= 60 && (i.overall_score || 0) < 75).length, color: 'from-amber-500 to-yellow-400' },
    { label: '< 60', count: interviews.filter((i) => (i.overall_score || 0) < 60).length, color: 'from-red-500 to-pink-400' },
  ];

  const interviewTypes = [
    { label: 'Technical', pct: 0, color: 'from-blue-500 to-indigo-600' },
    { label: 'Resume from CV', pct: 0, color: 'from-purple-500 to-violet-600' },
  ];

  const typeCounts = interviews.reduce(
    (acc, item) => {
      const type = (chooseInterviewType ? chooseInterviewType(item) : (item.interview_type || 'Unknown')).toLowerCase();
      if (type.includes('technical')) acc.technical++;
      else if (type.includes('behavioral')) acc.behavioral++;
      else acc.leadership++;
      return acc;
    },
    { technical: 0, behavioral: 0, leadership: 0 }
  );

  const totalTypes = Math.max(1, typeCounts.technical + typeCounts.behavioral);
  interviewTypes[0].pct = Math.round((typeCounts.technical / totalTypes) * 100);
  interviewTypes[1].pct = Math.round((typeCounts.behavioral / totalTypes) * 100);

  const topPerformers = [...interviews]
    .sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Interview type donut-style */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 p-6 shadow-lg"
        >
          <h3 className="font-bold text-gray-900 text-lg mb-6">
            Interview Type Breakdown
          </h3>
          <div className="space-y-4">
            {interviewTypes.map((t, i) => (
              <div key={t.label}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm font-semibold text-gray-700">
                    {t.label}
                  </span>
                  <span className="text-sm font-black text-gray-900">
                    {t.pct}%
                  </span>
                </div>
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${t.pct}%` }}
                    transition={{
                      duration: 0.7,
                      delay: 0.2 + i * 0.12,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className={`h-full bg-gradient-to-r ${t.color} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top performers */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 p-6 shadow-lg"
        >
          <h3 className="font-bold text-gray-900 text-lg mb-6">
            Top Performers
          </h3>
          <div className="space-y-4">
            {topPerformers.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-4 p-3 rounded-xl bg-white/60 border border-white/60"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-md ${
                    i === 0
                      ? "bg-gradient-to-br from-amber-400 to-orange-500"
                      : i === 1
                        ? "bg-gradient-to-br from-gray-400 to-gray-500"
                        : "bg-gradient-to-br from-orange-400 to-amber-600"
                  }`}
                >
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">{p.user?.username || p.username || 'Unknown'}</p>
                  <p className="text-xs text-gray-400">
                    {`${(chooseInterviewType ? chooseInterviewType(p) : p.interview_type || 'Unknown')} session`} · {p.created_at ? new Date(p.created_at).toLocaleDateString('en-US') : 'Unknown date'}
                  </p>
                </div>
                <ScoreBadge score={p.score} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>



      {/* Score distribution */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
        className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 p-6 shadow-lg"
      >
        <h3 className="font-bold text-gray-900 text-lg mb-6">Score Distribution</h3>
        <div className="space-y-3">
          {scoreBands.map((band) => (
            <div key={band.label} className="flex items-center gap-3">
              <div className="w-24 text-xs text-gray-500">{band.label}</div>
              <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${band.color}`}
                  style={{ width: `${totalInterviews ? (band.count / totalInterviews) * 100 : 0}%` }}
                />
              </div>
              <div className="text-xs font-semibold text-gray-700">{band.count}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Platform health */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.45 }}
        className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 p-6 shadow-lg"
      >
        <h3 className="font-bold text-gray-900 text-lg mb-6">
          Platform Health
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "API Uptime",
              value: "99.8%",
              color: "text-emerald-600",
              bg: "bg-emerald-50",
              sub: "30-day avg",
            },
            {
              label: "Avg Interview Score",
              value: `${avgInterviewScore}%`,
              color: "text-blue-600",
              bg: "bg-blue-50",
              sub: "from live interviews",
            },
            {
              label: "Avg Resume Score",
              value: `${avgResumeScore}%`,
              color: "text-purple-600",
              bg: "bg-purple-50",
              sub: "from resume analytics",
            },
            {
              label: "Users Total",
              value: `${users.length}`,
              color: "text-indigo-600",
              bg: "bg-indigo-50",
              sub: "active accounts",
            },
          ].map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.08 }}
              className={`${m.bg} rounded-xl p-4 border border-white/60`}
            >
              <p className={`text-2xl font-black ${m.color}`}>{m.value}</p>
              <p className="text-sm font-semibold text-gray-700 mt-1">
                {m.label}
              </p>
              <p className="text-xs text-gray-400">{m.sub}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function Settings() {
  const [form, setForm] = useState({
    siteName: "InterviewBloom",
    maxSlots: "10",
    aiModel: "mistral-small-latest",
    sttProvider: "groq-whisper",
    emailNotif: true,
    autoReport: true,
  });
  return (
    <div className="space-y-6 max-w-3xl">
      {[
        {
          title: "General",
          fields: [
            { key: "siteName", label: "Platform Name", type: "text" },
            {
              key: "maxSlots",
              label: "Max Concurrent Interview Slots",
              type: "number",
            },
          ],
        },
        {
          title: "AI Configuration",
          fields: [
            { key: "aiModel", label: "LLM Model", type: "text" },
            { key: "sttProvider", label: "STT Provider", type: "text" },
          ],
        },
      ].map((section, si) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: si * 0.1 }}
          className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 p-6 shadow-lg"
        >
          <h3 className="font-bold text-gray-900 text-lg mb-5">
            {section.title}
          </h3>
          <div className="space-y-4">
            {section.fields.map((f) => (
              <div key={f.key}>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                  {f.label}
                </label>
                <input
                  type={f.type}
                  value={form[f.key]}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [f.key]: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 text-sm text-gray-800 bg-white/80 outline-none transition-all"
                />
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Toggles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 p-6 shadow-lg"
      >
        <h3 className="font-bold text-gray-900 text-lg mb-5">
          Notifications & Automation
        </h3>
        <div className="space-y-4">
          {[
            {
              key: "emailNotif",
              label: "Email notifications on interview completion",
            },
            {
              key: "autoReport",
              label: "Auto-generate and email performance reports",
            },
          ].map((t) => (
            <div key={t.key} className="flex items-center justify-between py-2">
              <span className="text-sm font-semibold text-gray-700">
                {t.label}
              </span>
              <button
                onClick={() => setForm((p) => ({ ...p, [t.key]: !p[t.key] }))}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${form[t.key] ? "bg-gradient-to-r from-indigo-600 to-purple-600" : "bg-gray-200"}`}
              >
                <motion.div
                  animate={{ x: form[t.key] ? 24 : 2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
                />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-lg hover:shadow-indigo-300/40 hover:shadow-xl transition-shadow"
      >
        Save Changes
      </motion.button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function AdminPanel() {
  const [active, setActive] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [users, setUsers] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingInterviews, setLoadingInterviews] = useState(true);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [errorUsers, setErrorUsers] = useState("");
  const [errorInterviews, setErrorInterviews] = useState("");
  const [errorResumes, setErrorResumes] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const navigate = useNavigate();

  const SECTION_TITLES = {
    overview: "Overview",
    users: "Users",
    interviews: "Interviews",
    resumes: "Resumes",
    analytics: "Analytics",
    settings: "Settings",
  };

  const isMounted = React.useRef(true);

  useEffect(() => {
    isMounted.current = true;
    const loadData = async () => {
      try {
        setLoadingUsers(true);
        const usersRes = await api.get('/api/auth/admin/users/');
        if (isMounted.current) setUsers(usersRes.data || []);
      } catch (err) {
        console.error('Failed to load users:', err);
        const message = err?.response?.data?.detail || 'Unable to load users';
        if (isMounted.current) {
          setErrorUsers(message);
          setUsers([]);
        }
      } finally {
        if (isMounted.current) setLoadingUsers(false);
      }

      try {
        setLoadingInterviews(true);
        const interviewsRes = await api.get('/api/interview/reports/');
        if (isMounted.current) setInterviews(interviewsRes.data || []);
      } catch (err) {
        console.error('Failed to load interview reports:', err);
        if (isMounted.current) {
          setErrorInterviews('Unable to load interview reports');
          setInterviews([]);
        }
      } finally {
        if (isMounted.current) setLoadingInterviews(false);
      }

      try {
        setLoadingResumes(true);
        const resumesRes = await api.get('/api/candidates/reports/?page=1&limit=1000');
        if (isMounted.current) setResumes(resumesRes.data?.results || []);
      } catch (err) {
        console.error('Failed to load resume reports:', err);
        if (isMounted.current) {
          setErrorResumes('Unable to load resume reports');
          setResumes([]);
        }
      } finally {
        if (isMounted.current) setLoadingResumes(false);
      }
    };

    loadData();
    return () => {
      isMounted.current = false;
    };
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const chooseInterviewType = (report) => {
    if (report.skill_scores && report.skill_scores.technical_depth !== undefined) {
      return 'Technical';
    }
    if (report.skill_scores && report.skill_scores.empathy_and_self_awareness !== undefined) {
      return 'Resume from CV';
    }
    return 'Unknown';
  };

  const renderContent = () => {
    switch (active) {
      case "overview":
        return <Overview users={users} interviews={interviews} resumes={resumes} />;
      case "users":
        return (
          <Users
            users={users}
            loading={loadingUsers}
            error={errorUsers}
            formatDate={formatDate}
            onUserRemoved={(id) => setUsers((prev) => prev.filter((u) => u.id !== id))}
          />
        );
      case "interviews":
        return (
          <Interviews
            interviews={interviews}
            loading={loadingInterviews}
            error={errorInterviews}
            formatDate={formatDate}
            chooseInterviewType={chooseInterviewType}
          />
        );
      case "resumes":
        return (
          <Resumes
            resumes={resumes}
            loading={loadingResumes}
            error={errorResumes}
            formatDate={formatDate}
          />
        );
      case "analytics":
        return <Analytics users={users} interviews={interviews} resumes={resumes} chooseInterviewType={chooseInterviewType} />;
      case "settings":
        return <Settings />;
      default:
        return <Overview users={users} interviews={interviews} resumes={resumes} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/60 to-indigo-50 flex overflow-hidden">
      {/* ── SIDEBAR ─────────────────────────────────────────────── */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 260 : 72 }}
        transition={{ type: "spring", stiffness: 280, damping: 30 }}
        className="relative flex-shrink-0 h-screen sticky top-0 flex flex-col bg-white/70 backdrop-blur-2xl border-r border-white/60 shadow-xl z-30"
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100/80 flex items-center gap-3 overflow-hidden">
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-white font-bold text-lg">IB</span>
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="absolute -inset-1 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl opacity-20 blur-md"
            />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="overflow-hidden"
              >
                <div className="text-base font-black tracking-tight text-gray-900 whitespace-nowrap">
                  Interview
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Bloom
                  </span>
                </div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Admin Panel
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 px-3 overflow-y-auto">
          {NAV.map((item) => {
            const isActive = active === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => setActive(item.id)}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.97 }}
                title={!sidebarOpen ? item.label : undefined}
                className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? "text-white"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/60"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebarActive"
                    className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg shadow-indigo-400/30"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
                <svg
                  className="relative z-10 flex-shrink-0 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={isActive ? 2 : 1.7}
                    d={item.icon}
                  />
                </svg>
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      className="relative z-10 text-sm font-semibold whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </nav>

        {/* Back to app */}
        <div className="p-3 border-t border-gray-100/80">
          <motion.button
            onClick={() => navigate("/home")}
            whileHover={{ x: 3 }}
            whileTap={{ scale: 0.97 }}
            title={!sidebarOpen ? "Back to App" : undefined}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
          >
            <svg
              className="flex-shrink-0 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.7}
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="text-sm font-semibold whitespace-nowrap"
                >
                  Back to App
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Collapse toggle */}
        <motion.button
          onClick={() => setSidebarOpen((v) => !v)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="absolute -right-3.5 top-20 w-7 h-7 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-500 hover:text-indigo-600 transition-colors z-40"
        >
          <motion.svg
            animate={{ rotate: sidebarOpen ? 0 : 180 }}
            transition={{ duration: 0.3 }}
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </motion.svg>
        </motion.button>
      </motion.aside>

      {/* ── MAIN ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-auto">
        {/* Top bar */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="sticky top-0 z-20 bg-white/70 backdrop-blur-2xl border-b border-white/60 shadow-sm px-6 py-4 flex items-center justify-between"
        >
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">
              {SECTION_TITLES[active]}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {active === "overview" && "Platform snapshot & recent activity"}
              {active === "users" && "Manage registered users"}
              {active === "interviews" && "View all interview sessions"}
              {active === "resumes" && "Review uploaded resumes"}
              {active === "analytics" && "Performance metrics & insights"}
              {active === "settings" && "Configure platform settings"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative hidden sm:block">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <input
                placeholder="Quick search..."
                value={globalSearch}
                onChange={(e) => {
                  setGlobalSearch(e.target.value);
                  setGlobalSearchOpen(e.target.value.length > 0);
                }}
                onFocus={() => {
                  if (globalSearch.length > 0) setGlobalSearchOpen(true);
                }}
                onBlur={() => {
                  setTimeout(() => setGlobalSearchOpen(false), 200);
                }}
                className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-white/60 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 w-48"
              />
              <AnimatePresence>
                {globalSearchOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full mt-2 w-64 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50 text-sm"
                  >
                    {users
                      .filter(u =>
                        (u.username || '').toLowerCase().includes(globalSearch.toLowerCase()) ||
                        (u.email || '').toLowerCase().includes(globalSearch.toLowerCase())
                      )
                      .slice(0, 5)
                      .map(u => (
                        <div
                          key={u.id}
                          className="px-4 py-2 hover:bg-indigo-50 cursor-pointer border-b border-gray-50 flex flex-col"
                          onClick={() => {
                            setGlobalSearch("");
                            setGlobalSearchOpen(false);
                            setActive("users");
                          }}
                        >
                          <span className="font-bold text-gray-800">{u.username}</span>
                          <span className="text-xs text-gray-500">{u.email}</span>
                        </div>
                      ))}
                    {users.filter(u =>
                      (u.username || '').toLowerCase().includes(globalSearch.toLowerCase()) ||
                      (u.email || '').toLowerCase().includes(globalSearch.toLowerCase())
                    ).length === 0 && (
                      <div className="px-4 py-3 text-gray-500 italic">No users found</div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notification bell */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setNotifOpen(!notifOpen)}
                className={`relative w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${notifOpen ? 'bg-indigo-600 text-white' : 'bg-white/60 border-gray-200 text-gray-500 hover:text-indigo-600'}`}
              >
                <svg
                  className="w-[18px] h-[18px]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                  />
                </svg>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-1 ring-white" />
              </motion.button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-80 bg-white/90 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="font-bold text-gray-900">Notifications</h3>
                      <span className="text-[10px] font-bold text-white bg-indigo-600 px-1.5 py-0.5 rounded-full">3 New</span>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {[
                        { title: "New User Registered", time: "2 mins ago", sub: "User 'johndoe' joined the platform", icon: "👤", color: "bg-blue-100" },
                        { title: "Interview Completed", time: "15 mins ago", sub: "Technical interview #124 finished", icon: "🎤", color: "bg-green-100" },
                        { title: "System Update", time: "1 hour ago", sub: "Mistral v2.1 integration successful", icon: "⚙️", color: "bg-purple-100" },
                      ].map((n, i) => (
                        <div key={i} className="p-4 hover:bg-gray-50/50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors">
                          <div className="flex gap-3">
                            <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${n.color}`}>{n.icon}</span>
                            <div className="flex-1">
                              <p className="text-xs font-bold text-gray-900">{n.title}</p>
                              <p className="text-[10px] text-gray-500 leading-tight mt-0.5">{n.sub}</p>
                              <p className="text-[9px] text-indigo-500 font-bold mt-1 uppercase tracking-tighter">{n.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="w-full py-3 text-xs font-bold text-gray-400 hover:text-indigo-600 hover:bg-gray-50 transition-colors">
                      View All Notifications
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Admin avatar */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100/60 cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-xs shadow">
                A
              </div>
              <span className="text-xs font-bold text-gray-700 hidden sm:block">
                Admin
              </span>
              <span className="text-[10px] font-semibold text-indigo-500 bg-indigo-100 px-1.5 py-0.5 rounded-full hidden sm:block">
                SUPER
              </span>
            </motion.div>
          </div>
        </motion.header>

        {/* Content */}
        <main className="flex-1 p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
