import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  useInView,
  AnimatePresence,
} from "framer-motion";

/* ─────────────────────────────────────────────────────────────
   ANIMATION VARIANTS
───────────────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const fadeLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: (i = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ─────────────────────────────────────────────────────────────
   3D TILT CARD
───────────────────────────────────────────────────────────── */
function TiltCard({ children, className = "" }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const xSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const ySpring = useSpring(y, { stiffness: 300, damping: 30 });
  const rotateX = useTransform(ySpring, [-0.5, 0.5], ["6deg", "-6deg"]);
  const rotateY = useTransform(xSpring, [-0.5, 0.5], ["-6deg", "6deg"]);

  const onMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   QUICK ACTION CARD
───────────────────────────────────────────────────────────── */
function ActionCard({
  title,
  description,
  icon,
  gradient,
  accentColor,
  badge,
  cta,
  onClick,
  index,
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px 0px" });

  return (
    <motion.div
      ref={ref}
      custom={index}
      variants={scaleIn}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="h-full"
    >
      <TiltCard className="h-full cursor-pointer">
        <motion.div
          onClick={onClick}
          whileHover={{ y: -6 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative h-full rounded-3xl overflow-hidden bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl border border-white/60 dark:border-gray-700/50 p-8 group hover:shadow-2xl transition-shadow duration-500"
          style={{ transform: "translateZ(20px)" }}
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity duration-500 rounded-3xl`}
          />

          {badge && (
            <span className="absolute top-5 right-5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300">
              {badge}
            </span>
          )}

          <div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg mb-6 group-hover:scale-110 transition-transform duration-500`}
            style={{ transform: "translateZ(40px)" }}
          >
            {icon}
          </div>

          <h3
            className="text-xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight"
            style={{ transform: "translateZ(30px)" }}
          >
            {title}
          </h3>
          <p
            className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8"
            style={{ transform: "translateZ(20px)" }}
          >
            {description}
          </p>

          <div
            className={`flex items-center gap-2 text-sm font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent group-hover:translate-x-2 transition-transform duration-300`}
            style={{ transform: "translateZ(30px)" }}
          >
            <span>{cta}</span>
            <svg
              className="w-4 h-4 text-indigo-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </div>

          <div
            className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${gradient} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-b-3xl`}
          />
        </motion.div>
      </TiltCard>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   JOURNEY STEP
───────────────────────────────────────────────────────────── */
function JourneyStep({
  step,
  title,
  description,
  icon,
  gradient,
  isLast,
  index,
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px 0px" });

  return (
    <div ref={ref} className="relative flex flex-col items-center text-center">
      {!isLast && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{
            duration: 0.8,
            delay: index * 0.2 + 0.4,
            ease: "easeOut",
          }}
          className="hidden lg:block absolute top-10 h-0.5 bg-gradient-to-r from-indigo-300 to-purple-200 dark:from-indigo-800 dark:to-purple-900 origin-left"
          style={{ width: "80%", left: "55%" }}
        />
      )}

      <motion.div
        custom={index}
        variants={fadeUp}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="flex flex-col items-center"
      >
        <div className="relative mb-4">
          <div
            className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-xl shadow-indigo-500/20`}
          >
            {icon}
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white dark:bg-gray-900 border-2 border-indigo-400 flex items-center justify-center">
            <span className="text-xs font-black text-indigo-600">{step}</span>
          </div>
        </div>

        <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">
          {title}
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[140px] leading-relaxed">
          {description}
        </p>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   HIGHLIGHT CARD
───────────────────────────────────────────────────────────── */
function HighlightCard({ icon, title, text, gradient, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px 0px" });

  return (
    <motion.div
      ref={ref}
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="relative rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/60 dark:border-gray-700/50 p-6 overflow-hidden group hover:shadow-xl hover:shadow-indigo-500/10 transition-shadow duration-300"
    >
      <div
        className={`absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl ${gradient} opacity-[0.07] rounded-bl-full group-hover:scale-125 group-hover:opacity-[0.13] transition-all duration-500`}
      />

      <div
        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-md mb-4`}
      >
        {icon}
      </div>
      <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
        {title}
      </h4>
      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
        {text}
      </p>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   TIP CARD
───────────────────────────────────────────────────────────── */
function TipCard({ number, tip, category, gradient, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px 0px" });

  return (
    <motion.div
      ref={ref}
      custom={index}
      variants={fadeLeft}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="flex gap-4 p-5 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/60 dark:border-gray-700/50 hover:shadow-lg transition-shadow duration-300"
    >
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xs font-black shadow-md`}
      >
        {number}
      </div>
      <div>
        <span
          className={`text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}
        >
          {category}
        </span>
        <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5 leading-relaxed">
          {tip}
        </p>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SPLIT TEXT — letter-by-letter animated reveal
───────────────────────────────────────────────────────────── */
function SplitText({ text, className = "", delay = 0, once = true }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once });
  const chars = Array.from(text);
  return (
    <span ref={ref} className={`inline-block ${className}`} aria-label={text}>
      {chars.map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 36, rotateX: -40 }} 
          animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
          transition={{
            duration: 0.45,
            delay: delay + i * 0.04,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="inline-block"
          style={{ transformOrigin: "bottom center" }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   FLOATING SPARKLE PARTICLE
───────────────────────────────────────────────────────────── */
function Particle({ x, y, size, color, delay, duration }) {
  return (
    <motion.div
      className={`absolute rounded-full pointer-events-none ${color}`}
      style={{ left: x, top: y, width: size, height: size }}
      animate={{
        y: [0, -20, 0, 12, 0],
        x: [0, 10, -8, 4, 0],
        opacity: [0, 0.85, 0.6, 0.85, 0],
        scale: [0.6, 1, 0.85, 1.1, 0.6],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN DASHBOARD
───────────────────────────────────────────────────────────── */
export default function Dashboard({ userName, setActiveSection }) {
  const heroRef = useRef(null);
  const isHeroInView = useInView(heroRef, { once: true });
  const [showCursor, setShowCursor] = useState(true);

  // hide blinking cursor after the name finishes revealing
  useEffect(() => {
    if (!isHeroInView) return;
    const chars = Array.from(userName || "");
    const totalDelay = (0.6 + chars.length * 0.04 + 0.8) * 1000;
    const t = setTimeout(() => setShowCursor(false), totalDelay);
    return () => clearTimeout(t);
  }, [isHeroInView, userName]);

  const particles = [
    {
      x: "8%",
      y: "18%",
      size: 8,
      color: "bg-indigo-400/70",
      delay: 0,
      duration: 4.2,
    },
    {
      x: "88%",
      y: "12%",
      size: 6,
      color: "bg-purple-400/70",
      delay: 0.7,
      duration: 3.8,
    },
    {
      x: "5%",
      y: "70%",
      size: 5,
      color: "bg-pink-400/70",
      delay: 1.2,
      duration: 5.1,
    },
    {
      x: "92%",
      y: "65%",
      size: 7,
      color: "bg-blue-400/70",
      delay: 0.4,
      duration: 4.6,
    },
    {
      x: "50%",
      y: "5%",
      size: 5,
      color: "bg-fuchsia-400/70",
      delay: 1.8,
      duration: 3.6,
    },
    {
      x: "20%",
      y: "88%",
      size: 6,
      color: "bg-cyan-400/70",
      delay: 0.9,
      duration: 4.9,
    },
    {
      x: "75%",
      y: "82%",
      size: 4,
      color: "bg-indigo-300/70",
      delay: 2.1,
      duration: 3.3,
    },
    {
      x: "35%",
      y: "2%",
      size: 4,
      color: "bg-violet-400/70",
      delay: 1.5,
      duration: 4.4,
    },
  ];

  const actions = [
    {
      title: "AI Interview",
      description:
        "Practice live mock interviews with voice interaction. Get instant AI feedback on every answer.",
      icon: (
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
          />
        </svg>
      ),
      gradient: "from-blue-500 to-indigo-600",
      accentColor: "text-indigo-400",
      badge: "LIVE AI",
      cta: "Start Now",
      onClick: () => setActiveSection("interview"),
    },
    {
      title: "Smart Resume",
      description:
        "Upload your resume for instant ATS scoring, keyword analysis, and improvement suggestions.",
      icon: (
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
      ),
      gradient: "from-purple-500 to-fuchsia-600",
      accentColor: "text-purple-400",
      badge: "ATS READY",
      cta: "Upload Resume",
      onClick: () => setActiveSection("resume"),
    },
    {
      title: "Job Match",
      description:
        "Get AI-powered job recommendations tailored to your skills, experience, and career goals.",
      icon: (
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
          />
        </svg>
      ),
      gradient: "from-emerald-400 to-teal-600",
      accentColor: "text-emerald-400",
      badge: "SMART MATCH",
      cta: "Get Matches",
      onClick: () => setActiveSection("recommendations"),
    },
  ];

  const journey = [
    {
      step: 1,
      title: "Upload Resume",
      description: "Import your CV for instant AI analysis",
      gradient: "from-blue-500 to-indigo-600",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
      ),
    },
    {
      step: 2,
      title: "Practice Interview",
      description: "Live voice interview with AI coach",
      gradient: "from-purple-500 to-violet-600",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
          />
        </svg>
      ),
    },
    {
      step: 3,
      title: "Get Report",
      description: "Detailed feedback with emotion & tone analysis",
      gradient: "from-pink-500 to-rose-600",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3"
          />
        </svg>
      ),
    },
    {
      step: 4,
      title: "Land the Job",
      description: "Personalized tips to ace real interviews",
      gradient: "from-amber-400 to-orange-500",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0"
          />
        </svg>
      ),
    },
  ];

  const highlights = [
    {
      title: "Voice + Text Modes",
      text: "Speak naturally or type your answers. The AI adapts to your preferred communication style.",
      gradient: "from-blue-500 to-indigo-600",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
          />
        </svg>
      ),
    },
    {
      title: "Emotion & Tone Detection",
      text: "Real-time analysis of your confidence, sentiment, and communication tone during interviews.",
      gradient: "from-purple-500 to-fuchsia-600",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
          />
        </svg>
      ),
    },
    {
      title: "Downloadable Reports",
      text: "Full HTML report with scores, skill breakdown, feedback, and complete transcript after each session.",
      gradient: "from-emerald-400 to-teal-600",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
      ),
    },
    {
      title: "Technical & Resume from CV",
      text: "Specialized interview modes for coding roles and leadership positions with adaptive AI questions.",
      gradient: "from-pink-500 to-rose-600",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
          />
        </svg>
      ),
    },
    {
      title: "ATS Resume Scoring",
      text: "Check how well your resume passes applicant tracking systems and get keyword recommendations.",
      gradient: "from-amber-400 to-orange-500",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
          />
        </svg>
      ),
    },
    {
      title: "Smart Job Matching",
      text: "AI-powered recommendations matched to your resume, skills, and ideal job profile.",
      gradient: "from-sky-400 to-cyan-600",
      icon: (
        <svg
          className="w-5 h-5"
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
      ),
    },
  ];

  const tips = [
    {
      number: "01",
      category: "Confidence",
      tip: "Use the STAR method — Situation, Task, Action, Result — to structure every Resume from CV and behavioral answer.",
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      number: "02",
      category: "Technical",
      tip: "Think out loud during coding questions. Interviewers value your thought process as much as the solution.",
      gradient: "from-purple-500 to-fuchsia-600",
    },
    {
      number: "03",
      category: "Body Language",
      tip: "Sit upright, maintain eye contact with the camera, and smile naturally to project confidence.",
      gradient: "from-emerald-400 to-teal-600",
    },
    {
      number: "04",
      category: "Preparation",
      tip: "Research the company's products, culture, and recent news. Tailor answers to their specific context.",
      gradient: "from-pink-500 to-rose-600",
    },
    {
      number: "05",
      category: "Communication",
      tip: "Pause before answering complex questions. A 2–3 second pause shows thoughtfulness, not hesitation.",
      gradient: "from-amber-400 to-orange-500",
    },
    {
      number: "06",
      category: "Follow-up",
      tip: "Always ask 1–2 thoughtful questions at the end. It shows genuine interest and engagement.",
      gradient: "from-sky-400 to-cyan-600",
    },
  ];

  return (
    <div className="space-y-24 lg:space-y-32 pb-16">
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative text-center max-w-5xl mx-auto pt-4"
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-r from-indigo-300/30 via-purple-300/30 to-pink-300/30 dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-pink-900/20 rounded-full blur-3xl -z-10 pointer-events-none"
        />

        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate={isHeroInView ? "visible" : "hidden"}
          className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/60 dark:border-gray-700/50 shadow-lg"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"
          >
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
              />
            </svg>
          </motion.div>
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300 tracking-wide">
            AI-POWERED INTERVIEW COACH
          </span>
        </motion.div>

        <div className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight mb-6">
          {/* "Welcome back," — staggered per-character drop-in */}
          <div className="overflow-hidden pb-1">
            <SplitText
              text="Welcome back,"
              delay={0.2}
              className="text-gray-900 dark:text-white"
            />
          </div>

          {/* Username — staggered + shimmer sweep + blinking cursor */}
          <div className="relative inline-flex items-baseline gap-1 overflow-visible mt-1">
            {/* aurora glow behind the name */}
            <motion.div
              animate={{
                opacity: [0.35, 0.65, 0.35],
                scaleX: [0.9, 1.05, 0.9],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-r from-indigo-400/30 via-purple-400/30 to-pink-400/30 blur-2xl rounded-full -z-10"
            />

            <span className="relative">
              {/* shimmer sweep overlay */}
              <motion.span
                initial={{ x: "-110%" }}
                animate={isHeroInView ? { x: "110%" } : { x: "-110%" }}
                transition={{
                  duration: 0.9,
                  delay: 0.6 + Array.from(userName || "").length * 0.04,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-white/20 to-transparent skew-x-[-20deg] pointer-events-none z-10"
              />
              <SplitText
                text={userName}
                delay={0.5}
                className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent"
              />
            </span>

            {/* blinking cursor */}
            <AnimatePresence>
              {showCursor && isHeroInView && (
                <motion.span
                  initial={{ opacity: 1 }}
                  animate={{ opacity: [1, 0, 1] }}
                  exit={{ opacity: 0, transition: { duration: 0.3 } }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="inline-block w-[3px] h-[0.85em] bg-indigo-500 rounded-full ml-1 mb-1 self-end"
                />
              )}
            </AnimatePresence>
          </div>

          {/* decorative underline */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isHeroInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.6 + Array.from(userName || "").length * 0.04 + 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-400 rounded-full origin-left mt-1"
          />
        </div>

        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate={isHeroInView ? "visible" : "hidden"}
          className="text-xl sm:text-2xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-light leading-relaxed mb-10"
        >
          Your AI coach is ready.{" "}
          <span className="text-gray-800 dark:text-gray-200 font-medium">
            Practice, improve, and land your dream job
          </span>{" "}
          with intelligent feedback.
        </motion.p>

        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate={isHeroInView ? "visible" : "hidden"}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.button
            onClick={() => setActiveSection("interview")}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(99,102,241,0.35)",
            }}
            whileTap={{ scale: 0.97 }}
            className="group relative px-8 py-4 rounded-2xl font-bold text-lg text-white overflow-hidden shadow-2xl shadow-indigo-500/30"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_100%] animate-gradient" />
            <span className="relative flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
                />
              </svg>
              Start Interview
            </span>
          </motion.button>

          <motion.button
            onClick={() => setActiveSection("resume")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="px-8 py-4 rounded-2xl font-bold text-lg text-gray-700 dark:text-gray-200 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/60 dark:border-gray-700/50 hover:bg-white/90 dark:hover:bg-gray-700/80 transition-all shadow-lg"
          >
            Upload Resume
          </motion.button>
        </motion.div>
      </section>

      {/* ── QUICK ACTION CARDS ────────────────────────────────────── */}
      <section>
        <div className="text-center mb-10">
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px 0px" }}
            className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500 dark:text-indigo-400 mb-3"
          >
            What would you like to do?
          </motion.p>
          <motion.h2
            custom={1}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px 0px" }}
            className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white"
          >
            Pick your path
          </motion.h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {actions.map((card, i) => (
            <ActionCard key={card.title} {...card} index={i} />
          ))}
        </div>
      </section>

      {/* ── JOURNEY STEPS ─────────────────────────────────────────── */}
      <section className="relative">
        <div className="text-center mb-14">
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px 0px" }}
            className="text-xs font-bold uppercase tracking-[0.2em] text-purple-500 dark:text-purple-400 mb-3"
          >
            How it works
          </motion.p>
          <motion.h2
            custom={1}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px 0px" }}
            className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white"
          >
            Your journey to success
          </motion.h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6 relative">
          {journey.map((step, i) => (
            <JourneyStep
              key={step.step}
              {...step}
              isLast={i === journey.length - 1}
              index={i}
            />
          ))}
        </div>
      </section>

      {/* ── PLATFORM HIGHLIGHTS ───────────────────────────────────── */}
      <section>
        <div className="text-center mb-10">
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px 0px" }}
            className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-500 dark:text-emerald-400 mb-3"
          >
            Everything you need
          </motion.p>
          <motion.h2
            custom={1}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px 0px" }}
            className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white"
          >
            Platform capabilities
          </motion.h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {highlights.map((h, i) => (
            <HighlightCard key={h.title} {...h} index={i} />
          ))}
        </div>
      </section>

      {/* ── PRO TIPS ──────────────────────────────────────────────── */}
      <section>
        <div className="text-center mb-10">
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px 0px" }}
            className="text-xs font-bold uppercase tracking-[0.2em] text-pink-500 dark:text-pink-400 mb-3"
          >
            Interview playbook
          </motion.p>
          <motion.h2
            custom={1}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px 0px" }}
            className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white"
          >
            Pro tips to ace your interview
          </motion.h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tips.map((t, i) => (
            <TipCard key={t.number} {...t} index={i} />
          ))}
        </div>
      </section>

      {/* ── FINAL CTA BANNER ──────────────────────────────────────── */}
      <section>
        <motion.div
          variants={scaleIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px 0px" }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-10 md:p-14 text-center shadow-2xl shadow-indigo-500/30"
        >
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

          <div className="relative z-10">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="w-14 h-14 mx-auto mb-6 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
            >
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                />
              </svg>
            </motion.div>

            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Ready to land your dream job?
            </h2>
            <p className="text-white/80 text-lg max-w-xl mx-auto mb-8 font-light">
              Start your first AI-powered interview session now. Get real-time
              feedback and a full performance report.
            </p>
            <motion.button
              onClick={() => setActiveSection("interview")}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
              }}
              whileTap={{ scale: 0.97 }}
              className="px-10 py-4 rounded-2xl bg-white text-indigo-700 font-bold text-lg shadow-2xl hover:bg-white/90 transition-all"
            >
              Start Free Interview →
            </motion.button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
