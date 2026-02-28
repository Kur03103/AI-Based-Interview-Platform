import React, { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

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

function AnimatedProgress({ score }) {
  const progress = useMotionValue(0);

  useEffect(() => {
    const animation = animate(progress, score, {
      duration: 1.5,
      ease: "easeOut",
    });
    return animation.stop;
  }, [score, progress]);

  return (
    <motion.div
      className="bg-gradient-to-r from-indigo-600 to-purple-600 h-full rounded-full"
      style={{ width: useTransform(progress, (v) => `${v}%`) }}
    />
  );
}

export default function Proposal() {
  const skills = [
    { skill: "Technical Skills", score: 85 },
    { skill: "Communication", score: 78 },
    { skill: "Problem Solving", score: 92 },
    { skill: "Teamwork", score: 88 },
  ];

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
          Analytics &{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Insights
          </span>
        </h1>
        <p className="text-lg text-gray-500">
          Personalized talent assessment and recommendations
        </p>
      </motion.div>

      {/* Proposal Overview */}
      <motion.div
        variants={itemVariants}
        className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/40 shadow-xl p-8"
      >
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-7 h-7 text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Talent Assessment Report
            </h2>
            <p className="text-gray-500 text-sm">
              Generated on February 28, 2026
            </p>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8">
          <div className="space-y-8">
            {/* Skills Section */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Core Skills Assessment
              </h3>
              <div className="space-y-5">
                {skills.map((item, idx) => (
                  <motion.div
                    key={idx}
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <span className="text-gray-700 font-medium w-40">
                      {item.skill}
                    </span>
                    <div className="flex-1 mx-6 bg-gray-100 rounded-full h-3 overflow-hidden">
                      <AnimatedProgress score={item.score} />
                    </div>
                    <span className="text-indigo-600 font-bold w-12 text-right">
                      {item.score}%
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
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
                <h3 className="text-lg font-bold text-emerald-900">
                  Recommendations
                </h3>
              </div>
              <ul className="space-y-3 text-emerald-800">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0"></span>
                  Focus on advanced system design patterns
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0"></span>
                  Enhance cross-team collaboration skills through mentoring
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0"></span>
                  Explore leadership development programs
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0"></span>
                  Consider specialized technical certifications
                </li>
              </ul>
            </motion.div>

            {/* Next Steps */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
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
                      d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-blue-900">Next Steps</h3>
              </div>
              <ul className="space-y-3 text-blue-800">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                    1
                  </span>
                  Schedule a follow-up interview to discuss results
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                    2
                  </span>
                  Create a personalized development plan
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                    3
                  </span>
                  Enroll in recommended skill-building courses
                </li>
              </ul>
            </motion.div>
          </div>
        </div>

        <div className="mt-8 flex space-x-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
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
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
            Download Report
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2"
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
                d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
              />
            </svg>
            Share with Employer
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
