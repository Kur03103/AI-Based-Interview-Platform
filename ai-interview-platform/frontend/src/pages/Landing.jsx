import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl italic">B</span>
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                                Interview Bloom
                            </span>
                        </div>
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#features" className="text-gray-600 hover:text-indigo-600 font-medium transition duration-200">Features</a>
                            <a href="#how-it-works" className="text-gray-600 hover:text-indigo-600 font-medium transition duration-200">How It Works</a>
                            <Link to="/login" className="text-gray-600 hover:text-indigo-600 font-medium transition duration-200">Login</Link>
                            <Link to="/register" className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition transform hover:scale-105 duration-200 shadow-md">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 font-medium text-sm mb-6 border border-indigo-100 animate-fade-in">
                        <span className="relative flex h-2 w-2 mr-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        Powered by Advanced AI
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 animate-fade-in-up">
                        AI-Powered Interviews with <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                            Interview Bloom
                        </span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-xl text-gray-600 mb-10 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                        Autonomous AI interviews with voice & text modes, resume parsing, adaptive questions, emotion detection, and bias-free candidate assessment.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                        <Link to="/register" className="btn-primary px-8 py-4 text-lg w-full sm:w-auto">
                            Get Started Free
                        </Link>
                        <button className="flex items-center space-x-2 text-gray-700 font-semibold hover:text-indigo-600 transition duration-200 border-2 border-gray-200 px-8 py-4 rounded-lg w-full sm:w-auto justify-center hover:border-indigo-600">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                            </svg>
                            <span>Watch Demo</span>
                        </button>
                    </div>

                    <div className="mt-20 relative max-w-5xl mx-auto animate-scale-in" style={{ animationDelay: '600ms' }}>
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25"></div>
                        <div className="relative bg-gray-50 rounded-2xl border border-gray-200 shadow-2xl overflow-hidden aspect-video flex items-center justify-center group cursor-pointer">
                            <div className="absolute inset-0 bg-indigo-600/5 group-hover:bg-indigo-600/0 transition-all duration-300"></div>
                            <div className="w-20 h-20 bg-white rounded-full shadow-xl flex items-center justify-center transition transform group-hover:scale-110 duration-300 z-10">
                                <svg className="w-10 h-10 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>
                            <p className="absolute bottom-10 text-gray-400 font-medium">Platform Demo Video</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 bg-white border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div className="p-6">
                            <div className="text-4xl font-bold text-indigo-600 mb-1">50K+</div>
                            <div className="text-sm font-medium text-gray-500 uppercase tracking-widest">Interviews Completed</div>
                        </div>
                        <div className="p-6 border-l border-gray-100">
                            <div className="text-4xl font-bold text-indigo-600 mb-1">96.8%</div>
                            <div className="text-sm font-medium text-gray-500 uppercase tracking-widest">AI Accuracy</div>
                        </div>
                        <div className="p-6 border-l border-gray-100">
                            <div className="text-4xl font-bold text-indigo-600 mb-1">70%</div>
                            <div className="text-sm font-medium text-gray-500 uppercase tracking-widest">Time Saved</div>
                        </div>
                        <div className="p-6 border-l border-gray-100">
                            <div className="text-4xl font-bold text-indigo-600 mb-1">94%</div>
                            <div className="text-sm font-medium text-gray-500 uppercase tracking-widest">User Trust Score</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">Everything You Need to Hire Smarter</h2>
                        <p className="text-xl text-gray-600">Powerful features designed for modern hiring teams.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>}
                            title="AI-Led Interviews"
                            description="Autonomous AI interviewers conduct interviews without human intervention, ensuring consistence and standardization."
                        />
                        <FeatureCard
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                            title="Resume & Skill Analysis"
                            description="Deeply behavior scan based on your brand's intent match with your descriptions to find personal options processing."
                        />
                        <FeatureCard
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                            title="AI-Powered Planning"
                            description="Automatically defined skills, education, and experiences from creators, hiring relevant content for looking."
                        />
                        <FeatureCard
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                            title="Adaptive Questions"
                            description="Dynamic question flows adjust based on candidate's experience and previous answers for depth."
                        />
                        <FeatureCard
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>}
                            title="Multi-Metric Scoring"
                            description="Comprehensive evaluation including technical skills, communication, stress, behavior tendencies, and sediment analysis."
                        />
                        <FeatureCard
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                            title="Bias Reduction"
                            description="Data-driven evaluation removes subjective judgments and ensures fair, unbiased candidate assessment."
                        />
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">How It Works</h2>
                        <p className="text-xl text-gray-600">Simple, fast, and powerful - AI-led interviews in three steps.</p>
                    </div>

                    <div className="relative">
                        {/* Connection Line */}
                        <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-indigo-100 -z-10"></div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            <Step
                                number="1"
                                title="Launch Interview"
                                description="Configure high-quality online interviews within minutes using our platform."
                                color="bg-blue-600"
                            />
                            <Step
                                number="2"
                                title="AI Analysis"
                                description="Our AI processes video, audio, and responses to generate comprehensive insights."
                                color="bg-purple-600"
                            />
                            <Step
                                number="3"
                                title="Make Decisions"
                                description="Review intelligent insights and sentiments with your team to hire the best talent."
                                color="bg-emerald-600"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Trusted By / Footer Section */}
            <section className="py-24 bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-5xl font-bold mb-8">Trusted by Leading Companies</h2>
                    <p className="text-indigo-300 mb-12">Join thousands of companies who hire smarter with Interview Bloom.</p>

                    <div className="flex flex-wrap justify-center gap-8 mb-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Placeholder Logos */}
                        <div className="w-32 h-12 bg-gray-700 rounded animate-pulse"></div>
                        <div className="w-32 h-12 bg-gray-700 rounded animate-pulse"></div>
                        <div className="w-32 h-12 bg-gray-700 rounded animate-pulse"></div>
                        <div className="w-32 h-12 bg-gray-700 rounded animate-pulse"></div>
                        <div className="w-32 h-12 bg-gray-700 rounded animate-pulse"></div>
                    </div>

                    <div className="border-t border-gray-800 pt-12 flex flex-col md:flex-row justify-between items-center text-gray-400">
                        <div className="flex items-center space-x-2 mb-4 md:mb-0">
                            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
                                <span className="text-white font-bold text-xs italic">B</span>
                            </div>
                            <span className="font-bold text-white">Interview Bloom</span>
                        </div>
                        <div className="flex space-x-6">
                            <a href="#" className="hover:text-white transition">Privacy</a>
                            <a href="#" className="hover:text-white transition">Terms</a>
                            <a href="#" className="hover:text-white transition">Contact</a>
                        </div>
                        <div className="mt-4 md:mt-0">
                            © 2025 Interview Bloom. All rights reserved.
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }) => (
    <div className="card-base p-8 hover:-translate-y-1">
        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-6">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
);

const Step = ({ number, title, description, color }) => (
    <div className="flex flex-col items-center group">
        <div className={`w-16 h-16 ${color} text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6 group-hover:scale-110 transition duration-300 shadow-xl ring-8 ring-white`}>
            {number}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed text-center px-4">{description}</p>
    </div>
);

export default Landing;
