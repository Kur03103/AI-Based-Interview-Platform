import React from "react";
import { motion } from "framer-motion";

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

const FeatureIcon = ({ type }) => {
  const icons = {
    realtime: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-8 h-8"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    ai: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-8 h-8"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
        />
      </svg>
    ),
    report: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-8 h-8"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
        />
      </svg>
    ),
    cloud: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-8 h-8"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
        />
      </svg>
    ),
  };
  return icons[type] || icons.ai;
};

export default function About() {
  const features = [
    {
      type: "realtime",
      title: "Real-Time Evaluation",
      description:
        "Get instant feedback and scoring as you progress through the interview.",
      color: "from-blue-500 to-indigo-600",
    },
    {
      type: "ai",
      title: "AI-Powered Analysis",
      description:
        "Advanced algorithms analyze your responses for comprehensive skill assessment.",
      color: "from-purple-500 to-fuchsia-600",
    },
    {
      type: "report",
      title: "Detailed Reports",
      description:
        "Receive comprehensive reports with insights and recommendations for growth.",
      color: "from-emerald-500 to-teal-600",
    },
    {
      type: "cloud",
      title: "Accessible Anywhere",
      description:
        "Interview from anywhere, anytime. No special setup required.",
      color: "from-orange-500 to-rose-600",
    },
  ];

  const steps = [
    {
      step: "1",
      title: "Create Account",
      desc: "Sign up in seconds with your email",
    },
    {
      step: "2",
      title: "Select Interview Type",
      desc: "Choose technical or behavioral interview",
    },
    {
      step: "3",
      title: "Begin Interview",
      desc: "Answer AI-generated questions in real-time",
    },
    {
      step: "4",
      title: "Receive Report",
      desc: "Get detailed assessment and recommendations",
    },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-10"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">
          About{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            InterviewBloom
          </span>
        </h1>
        <p className="text-lg text-gray-500">
          Revolutionizing talent assessment through AI
        </p>
      </motion.div>

      {/* Main Story */}
      <motion.div
        variants={itemVariants}
        className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/40 shadow-xl p-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          InterviewBloom is an AI-powered platform designed to transform how
          companies evaluate talent and how candidates showcase their skills. We
          believe that great talent assessment should be fair, efficient, and
          insightful.
        </p>
        <p className="text-gray-600 leading-relaxed">
          Using cutting-edge artificial intelligence and machine learning, we
          provide real-time interviews with instant scoring, personalized
          feedback, and actionable insights for both candidates and employers.
        </p>
      </motion.div>

      {/* Features Grid */}
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Why Choose InterviewBloom?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4, scale: 1.02 }}
              className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group"
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-tr ${feature.color} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                <FeatureIcon type={feature.type} />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* How It Works */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-br from-indigo-50/80 to-purple-50/80 backdrop-blur-xl rounded-3xl border border-indigo-100 shadow-xl p-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-8">How It Works</h2>
        <div className="space-y-6">
          {steps.map((item, idx) => (
            <motion.div
              key={idx}
              className="flex items-start space-x-5"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-lg shadow-indigo-500/30">
                {item.step}
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg">
                  {item.title}
                </h4>
                <p className="text-gray-500">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-3 gap-6 bg-white/60 backdrop-blur-xl rounded-3xl border border-white/40 shadow-xl p-8"
      >
        {[
          {
            value: "10K+",
            label: "Users Interviewed",
            color: "text-indigo-600",
          },
          {
            value: "95%",
            label: "Satisfaction Rate",
            color: "text-purple-600",
          },
          { value: "50+", label: "Companies Trust Us", color: "text-pink-600" },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            className="text-center"
            whileHover={{ scale: 1.05 }}
          >
            <p className={`text-4xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-gray-500 mt-2 text-sm">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
