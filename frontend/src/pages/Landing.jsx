import React from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

// Testimonials data with diverse names and locations
const testimonials = [
  {
    name: "Priya Sharma",
    location: "Mumbai Tech Hub",
    year: "2026",
    quote: "Interview Bloom completely changed our hiring process. The AI insights are invaluable.",
    rating: 5
  },
  {
    name: "James Chen",
    location: "San Francisco",
    year: "2026",
    quote: "Reduced our hiring time by 70% while improving candidate quality.",
    rating: 5
  },
  {
    name: "Emma Richardson",
    location: "London College",
    year: "2026",
    quote: "The bias reduction features ensure we hire the best talent fairly.",
    rating: 5
  },
  {
    name: "Rajesh Kumar",
    location: "Bangalore Startup",
    year: "2026",
    quote: "Best investment we made for our talent acquisition team this year.",
    rating: 5
  },
  {
    name: "Sophie Dubois",
    location: "Paris Innovation Zone",
    year: "2026",
    quote: "Candidates love the platform. Amazing experience from both sides.",
    rating: 5
  }
];

const workflowSteps = [
  {
    icon: "📝",
    title: "Create Interview",
    description: "Set up your interview in seconds with customizable questions and formats.",
    features: ["Custom Questions", "Video Mode", "Technical Assessment"]
  },
  {
    icon: "📅",
    title: "Schedule & Invite",
    description: "Automated scheduling sends invites and handles calendar synchronization effortlessly.",
    features: ["Auto Scheduling", "Email Invites", "Timezone Support"]
  },
  {
    icon: "🤖",
    title: "AI Conducts Interview",
    description: "Our advanced AI interviewer conducts the interview with natural conversation flow.",
    features: ["Natural AI", "Real-time Analysis", "Multi-language"]
  },
  {
    icon: "📊",
    title: "Get Analytics",
    description: "Comprehensive reports with skills assessment, scores, and candidate insights.",
    features: ["Skill Scores", "Sentiment Analysis", "Comparison Reports"]
  }
];

const Landing = () => {
  React.useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-up');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('[data-scroll-animate]');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 dark:bg-indigo-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl italic">B</span>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                Interview Bloom
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition duration-200"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition duration-200"
              >
                How It Works
              </a>
              <Link
                to="/login"
                className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition duration-200"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-indigo-600 dark:bg-indigo-500 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition transform hover:scale-105 duration-200 shadow-md"
              >
                Get Started
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium text-sm mb-6 border border-indigo-100 dark:border-indigo-800 animate-fade-in">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Powered by Advanced AI
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-8 animate-fade-in-up">
            AI-Powered Interviews with <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              Interview Bloom
            </span>
          </h1>
          <p
            className="max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-300 mb-10 animate-fade-in-up"
            style={{ animationDelay: "200ms" }}
          >
            Autonomous AI interviews with voice & text modes, resume parsing,
            adaptive questions, emotion detection, and bias-free candidate
            assessment.
          </p>
          <div
            className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 animate-fade-in-up"
            style={{ animationDelay: "400ms" }}
          >
            <Link
              to="/register"
              className="btn-primary px-8 py-4 text-lg w-full sm:w-auto"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      {/* Interview Management Section */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-block mb-6 px-6 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800">
              <span className="text-indigo-700 dark:text-indigo-300 font-semibold text-sm">Streamlined Interview Management</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Manage Your Entire Interview Lifecycle Seamlessly
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
              From scheduling to evaluation, our platform handles every aspect of your hiring process with intelligent automation and real-time insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {/* Create & Schedule */}
            <ManagementCard
              icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>}
              title="Create & Schedule"
              description="Set up interviews in seconds. Automated scheduling syncs with calendars and sends invitations instantly."
              features={["Auto-scheduling", "Calendar sync", "Instant invites"]}
              delay="0"
            />
            {/* Candidate Tracking */}
            <ManagementCard
              icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM12 14a8 8 0 00-8 8v2h16v-2a8 8 0 00-8-8z" /></svg>}
              title="Candidate Tracking"
              description="Track candidates through the entire pipeline. Monitor progress, status, and performance metrics in real-time."
              features={["Pipeline visibility", "Status updates", "Performance logs"]}
              delay="100"
            />
            {/* Real-Time Feedback */}
            <ManagementCard
              icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
              title="Real-Time Feedback"
              description="Capture notes and feedback during interviews. Collaborative evaluation shared instantly with your team."
              features={["Live notes", "Team collaboration", "Instant sharing"]}
              delay="200"
            />
            {/* Advanced Analytics */}
            <ManagementCard
              icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
              title="Advanced Analytics"
              description="AI-powered insights analyze performance across candidates. Identify top performers and make data-driven decisions."
              features={["Score analysis", "Performance trends", "Comparative metrics"]}
              delay="300"
            />
            {/* Automated Scoring */}
            <ManagementCard
              icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              title="Automated Scoring"
              description="Get objective, bias-free evaluations. Multi-metric scoring covers technical skills, communication, and cultural fit."
              features={["Fair evaluation", "Multiple metrics", "Bias-free scoring"]}
              delay="400"
            />
            {/* Streamlined Communication */}
            <ManagementCard
              icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
              title="Streamlined Communication"
              description="Keep candidates informed with automated emails and updates. Build strong employer branding throughout the process."
              features={["Auto email", "Status updates", "Candidate experience"]}
              delay="500"
            />
          </div>

          {/* Workflow Diagram */}
          <div className="mt-20 bg-white dark:bg-gray-800 rounded-2xl p-8 md:p-12 border border-gray-100 dark:border-gray-700 shadow-xl">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Interview Management Workflow</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-2">
              <FlowStep step="1" title="Create Interview" icon="📋" />
              <div className="hidden md:flex items-center justify-center">
                <div className="w-8 h-0.5 bg-gradient-to-r from-indigo-500 to-transparent dark:from-indigo-400"></div>
              </div>
              <FlowStep step="2" title="Schedule & Invite" icon="📅" />
              <div className="hidden md:flex items-center justify-center">
                <div className="w-8 h-0.5 bg-gradient-to-r from-indigo-500 to-transparent dark:from-indigo-400"></div>
              </div>
              <FlowStep step="3" title="Conduct Interview" icon="🎙️" />
              <div className="hidden md:flex items-center justify-center">
                <div className="w-8 h-0.5 bg-gradient-to-r from-indigo-500 to-transparent dark:from-indigo-400"></div>
              </div>
              <FlowStep step="4" title="Review & Evaluate" icon="✅" />
            </div>
          </div>
        </div>
      </section>
      <section className="py-12 bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                50K+
              </div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                Interviews Completed
              </div>
            </div>
            <div className="p-6 border-l border-gray-100 dark:border-gray-800">
              <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                96.8%
              </div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                AI Accuracy
              </div>
            </div>
            <div className="p-6 border-l border-gray-100 dark:border-gray-800">
              <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                70%
              </div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                Time Saved
              </div>
            </div>
            <div className="p-6 border-l border-gray-100 dark:border-gray-800">
              <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                94%
              </div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                User Trust Score
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-24 bg-gray-50 dark:bg-gray-800 transition-colors duration-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Hire Smarter
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Powerful features designed for modern hiring teams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              }
              title="AI-Led Interviews"
              description="Autonomous AI interviewers conduct interviews without human intervention, ensuring consistence and standardization."
            />
            <FeatureCard
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              }
              title="Resume & Skill Analysis"
              description="Extract and analyze resumes to identify relevant skills, qualifications, and experience for better candidate matching."
            />
            <FeatureCard
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              }
              title="AI-Powered Planning"
              description="Intelligently plan and structure interviews based on job requirements and candidate qualifications."
            />
            <FeatureCard
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              title="Adaptive Questions"
              description="Dynamic question flows adjust based on candidate's experience and previous answers for depth."
            />
            <FeatureCard
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                  />
                </svg>
              }
              title="Multi-Metric Scoring"
              description="Comprehensive evaluation including technical skills, communication, problem-solving, behavior analysis, and sentiment assessment."
            />
            <FeatureCard
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              }
              title="Bias Reduction"
              description="Data-driven evaluation removes subjective judgments and ensures fair, unbiased candidate assessment."
            />
          </div>
        </div>
      </section>

      {/* How It Works - Interview Management Workflow */}
      <section id="how-it-works" className="py-24 bg-white dark:bg-gray-900 transition-colors duration-300" data-scroll-animate>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 animate-fade-in-up">
              Interview Management Workflow
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              Everything you need to create, schedule, conduct, and analyze interviews
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {workflowSteps.map((step, idx) => (
              <div
                key={idx}
                className="group p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-indigo-300 dark:hover:border-indigo-600 animate-fade-in-up"
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-16 w-16 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/40 dark:to-indigo-900/20 group-hover:scale-110 transition duration-300 text-3xl">
                      {step.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                      {step.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {step.features.map((feature, fIdx) => (
                        <span
                          key={fIdx}
                          className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-100 dark:border-indigo-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition duration-300"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-indigo-100 dark:text-indigo-900/30 group-hover:text-indigo-200 dark:group-hover:text-indigo-800/50 transition duration-300">
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-300" data-scroll-animate>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 animate-fade-in-up">
              Trusted by Top Talent
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              Candidates and hiring teams around the world love Interview Bloom
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="group p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:-translate-y-2 hover:border-indigo-300 dark:hover:border-indigo-600 animate-fade-in-up"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition duration-300">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                      {testimonial.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {testimonial.location}
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed line-clamp-3">
                  "{testimonial.quote}"
                </p>
                <div className="flex text-yellow-400 mb-3">
                  {"⭐".repeat(testimonial.rating)}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {testimonial.year}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Transform Your Hiring?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10">
            Join companies that hire smarter, faster, and fairer with Interview Bloom.
          </p>
          <Link
            to="/register"
            className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition transform hover:scale-105 duration-200 shadow-xl hover:shadow-2xl"
          >
            Start Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      {/* Footer */}
      <section className="py-12 bg-gray-900 dark:bg-black text-gray-400 dark:text-gray-500 transition-colors duration-300 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-indigo-600 dark:bg-indigo-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs italic">B</span>
              </div>
              <span className="font-bold text-white">Interview Bloom</span>
            </div>
            <div className="flex space-x-6 mb-4 md:mb-0">
              <a href="#" className="hover:text-white transition duration-200">
                Privacy
              </a>
              <a href="#" className="hover:text-white transition duration-200">
                Terms
              </a>
              <a href="#" className="hover:text-white transition duration-200">
                Contact
              </a>
            </div>
            <div>
              © 2026 Interview Bloom. All rights reserved.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const ManagementCard = ({ icon, title, description, features, delay }) => (
  <div
    className="group p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-indigo-300 dark:hover:border-indigo-600 animate-fade-in-up"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mb-4 group-hover:scale-110 transition duration-300">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
      {title}
    </h3>
    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
      {description}
    </p>
    <div className="flex flex-wrap gap-2">
      {features.map((feature, idx) => (
        <span
          key={idx}
          className="inline-flex items-center px-2 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-100 dark:border-indigo-800"
        >
          {feature}
        </span>
      ))}
    </div>
  </div>
);

const FlowStep = ({ step, title, icon }) => (
  <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition duration-300">
    <div className="text-4xl mb-3">{icon}</div>
    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">Step {step}</span>
    <h4 className="text-sm font-bold text-gray-900 dark:text-white text-center">
      {title}
    </h4>
  </div>
);

const FeatureCard = ({ icon, title, description }) => (
  <div className="card-base p-8 hover:-translate-y-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl transition-all duration-300">
    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
      {title}
    </h3>
    <p className="text-gray-600 dark:text-gray-400 mb-0">
      {description}
    </p>
  </div>
);

const Step = ({ number, title, description, color }) => (
  <div className="flex flex-col items-center group">
    <div
      className={`w-16 h-16 ${color} text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6 group-hover:scale-110 transition duration-300 shadow-xl ring-8 ring-white dark:ring-gray-900`}
    >
      {number}
    </div>
    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
      {title}
    </h3>
    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-center px-4">
      {description}
    </p>
  </div>
);

export default Landing;
