import React, { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  useSpring,
} from "framer-motion";

// Quick access to icons
const PlayIcon = () => (
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
      d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
    />
  </svg>
);

const DocIcon = () => (
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
);

const BulbIcon = () => (
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
      d="M12 18v-5.25m0 0a6.001 6.001 0 00-5.951 5.808 6.75 6.75 0 006.637 6.663c-.255.032-.512.049-.773.049-.261 0-.518-.017-.773-.049a6.75 6.75 0 006.637-6.663A6.001 6.001 4.5 0 0012 12.75zm0 0a6.001 6.001 0 015.951 5.808 6.75 6.75 0 01-6.637 6.663c.255.032.512.049.773.049.261 0.518-.017.773-.049a6.75 6.75 0 01-6.637-6.663A6.001 6.001 0 0112 12.75z"
    />
  </svg>
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
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

function FeatureCard({ title, description, icon, color, buttonText, onClick }) {
  // Parallax Tilt Effect
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      variants={itemVariants}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="relative h-full"
      onClick={onClick}
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div
        className="relative h-full overflow-hidden rounded-3xl bg-white/70 backdrop-blur-2xl p-8 border border-white/60 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500 cursor-pointer group"
        style={{ transform: "translateZ(20px)" }}
      >
        {/* Animated Glow on Hover */}
        <div
          className={`absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 bg-gradient-to-r ${color} blur-xl transition-opacity duration-700`}
        />

        {/* Content */}
        <div className="relative z-10">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-tr ${color} text-white shadow-lg mb-6 group-hover:scale-110 transition-transform duration-500 ease-out`}
            style={{ transform: "translateZ(40px)" }}
          >
            {icon}
          </div>

          <h3
            className="text-2xl font-bold text-gray-900 mb-3 tracking-tight group-hover:text-indigo-900 transition-colors"
            style={{ transform: "translateZ(30px)" }}
          >
            {title}
          </h3>
          <p
            className="text-gray-600 text-sm leading-relaxed mb-8"
            style={{ transform: "translateZ(20px)" }}
          >
            {description}
          </p>

          <div
            className="flex items-center text-sm font-bold group-hover:translate-x-2 transition-transform duration-300"
            style={{ transform: "translateZ(30px)" }}
          >
            <span
              className={`bg-clip-text text-transparent bg-gradient-to-r ${color}`}
            >
              {buttonText}
            </span>
            <svg
              className="w-4 h-4 ml-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AnimatedCounter({ value }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    const animation = animate(count, value, {
      duration: 1.5,
      type: "spring",
      bounce: 0,
    });
    return animation.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
}

function StatCard({ label, value, subtext, color }) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative bg-white/70 backdrop-blur-2xl rounded-2xl p-6 border border-white/60 overflow-hidden group hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300"
    >
      {/* Animated Gradient Background */}
      <div
        className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${color} opacity-5 rounded-bl-full group-hover:scale-125 group-hover:opacity-10 transition-all duration-500`}
      />

      <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2 z-10 relative">
        {label}
      </p>
      <div className="flex items-end space-x-2 relative z-10">
        <h4 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          <AnimatedCounter value={parseFloat(value) || 0} />
        </h4>
        {subtext && (
          <span
            className={`text-sm font-medium mb-1.5 ${subtext.includes("+") ? "text-emerald-500" : "text-gray-400"}`}
          >
            {subtext}
          </span>
        )}
      </div>

      <div className="w-full bg-gradient-to-r from-gray-100 to-gray-200 h-2 mt-4 rounded-full overflow-hidden relative z-10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "60%" }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          className={`h-full bg-gradient-to-r ${color} shadow-lg`}
        />
      </div>
    </motion.div>
  );
}

export default function Dashboard({ userName, setActiveSection }) {
  const cards = [
    {
      id: 1,
      title: "AI Interview",
      description:
        "Practice with AI-powered mock interviews. Get real-time feedback on your responses.",
      icon: <PlayIcon />,
      color: "from-blue-500 to-indigo-600",
      buttonText: "Start Now",
      onClick: () => setActiveSection("interview"),
    },
    {
      id: 2,
      title: "Smart Resume",
      description:
        "Upload and analyze your resume with AI. Get ATS optimization tips instantly.",
      icon: <DocIcon />,
      color: "from-purple-500 to-fuchsia-600",
      buttonText: "Upload",
      onClick: () => setActiveSection("resume"),
    },
    {
      id: 3,
      title: "Recommendations",
      description:
        "Get AI-powered job recommendations and resume quality predictions instantly.",
      icon: <BulbIcon />,
      color: "from-emerald-400 to-teal-500",
      buttonText: "Get Jobs",
      onClick: () => setActiveSection("recommendations"),
    },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-16 lg:space-y-24"
    >
      {/* Hero Section */}
      <motion.div variants={itemVariants} className="relative">
        {/* Floating Gradient Light */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-indigo-300/30 via-purple-300/30 to-pink-300/30 rounded-full blur-3xl pointer-events-none -z-10"
        />

        <div className="text-center max-w-5xl mx-auto relative z-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-xl border border-white/60 shadow-lg mb-8"
          >
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-3 h-3 text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                />
              </svg>
            </motion.div>
            <span className="text-sm font-semibold text-gray-700">
              AI-Powered Platform
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-[1.1]"
          >
            Welcome back, <br className="hidden sm:block" />
            <motion.span
              className="relative inline-block"
              whileHover={{ scale: 1.02 }}
            >
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {userName}
              </span>
              <motion.div
                animate={{
                  scaleX: [0, 1, 1, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 1,
                  ease: "easeInOut",
                }}
                className="absolute bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 origin-left"
              />
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light mb-12"
          >
            Your AI interview coach is ready.{" "}
            <span className="text-gray-900 font-medium">
              Practice, improve, and land your dream job
            </span>{" "}
            with intelligent feedback.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              onClick={() => setActiveSection("interview")}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(99, 102, 241, 0.3)",
              }}
              whileTap={{ scale: 0.95 }}
              className="group relative px-8 py-4 rounded-2xl font-bold text-lg text-white overflow-hidden shadow-2xl shadow-indigo-500/30"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_100%] animate-gradient" />
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center gap-2">
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
                    d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
                  />
                </svg>
                Start Interview
              </span>
            </motion.button>

            <motion.button
              onClick={() => setActiveSection("about")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-2xl font-bold text-lg text-gray-700 bg-white/60 backdrop-blur-xl border border-white/60 hover:bg-white/80 transition-all shadow-lg"
            >
              Learn More
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Feature Cards */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
      >
        {cards.map((card, i) => (
          <FeatureCard key={card.id} {...card} delay={i * 0.1} />
        ))}
      </motion.div>

      {/* Stats Section */}
      <motion.div variants={itemVariants} className="pt-8">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-gray-900 mb-3"
          >
            Your Performance
          </motion.h2>
          <p className="text-gray-600">
            Track your interview preparation progress
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard
            label="Interviews Completed"
            value="0"
            subtext="+0 this week"
            color="from-blue-400 to-blue-600"
          />
          <StatCard
            label="Average Score"
            value="0.0"
            subtext="Needs Data"
            color="from-purple-400 to-purple-600"
          />
          <StatCard
            label="Skills Assessed"
            value="0"
            subtext="Total Skills"
            color="from-pink-400 to-pink-600"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
