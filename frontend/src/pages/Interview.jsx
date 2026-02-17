import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Interview = () => {
    // --- State ---
    const [isInterviewActive, setIsInterviewActive] = useState(false);
    const [status, setStatus] = useState('Idle'); // Idle, Listening, Processing, AI Speaking, Error
    const [conversation, setConversation] = useState([]);
    const [isMuted, setIsMuted] = useState(false);
    const [sessionId, setSessionId] = useState('');

    // --- Refs ---
    const recognitionRef = useRef(null);
    const synthRef = useRef(window.speechSynthesis);
    const isMutedRef = useRef(false); // Ref for immediate access in callbacks
    const isProcessingRef = useRef(false); // Ref to prevent double-processing

    const navigate = useNavigate();

    // --- Initialization ---
    useEffect(() => {
        // Generate Session ID on mount
        setSessionId(`session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

        // Initialize Speech Recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false; // Capture one phrase at a time
            recognition.lang = 'en-US';
            recognition.interimResults = false;

            recognition.onstart = () => {
                console.log("Mic started");
                if (!isProcessingRef.current && !synthRef.current.speaking) {
                    setStatus('Listening');
                }
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                console.log("User said:", transcript);
                handleUserResponse(transcript);
            };

            recognition.onerror = (event) => {
                // If pure silence/no-speech, we just want to restart if valid
                if (event.error === 'no-speech') {
                    // Ignore, let onend handle restart
                } else if (event.error === 'not-allowed') {
                    alert("Microphone access denied. Please allow microphone access.");
                    stopInterview();
                } else {
                    console.warn("Speech Recognition Error:", event.error);
                }
            };

            recognition.onend = () => {
                console.log("Mic stopped");
                // The "heartbeat" of the loop:
                // Restart ONLY if: Active AND Not Muted AND Not Processing AND AI Not Speaking
                if (isInterviewActive && !isMutedRef.current && !isProcessingRef.current && !synthRef.current.speaking) {
                    try { recognition.start(); } catch (e) { }
                }
            };

            recognitionRef.current = recognition;
        } else {
            alert("Your browser does not support Speech Recognition. Please use Chrome or Edge.");
        }

        return () => {
            // Cleanup: Just stop media, don't reset state here (avoids flickers on re-renders)
            if (recognitionRef.current) recognitionRef.current.stop();
            if (synthRef.current) synthRef.current.cancel();
        };
    }, []); // Run ONCE on mount

    // Watch for state changes to manual start/stop mic
    useEffect(() => {
        // Update refs for callbacks
        isMutedRef.current = isMuted;

        if (isMuted) {
            if (recognitionRef.current) recognitionRef.current.stop();
            if (synthRef.current.speaking) synthRef.current.cancel();
            setStatus('Muted');
        } else if (isInterviewActive && !isProcessingRef.current && !synthRef.current.speaking) {
            startListening();
        }
    }, [isInterviewActive, isMuted]);


    // --- Core Logic ---

    const startInterview = () => {
        setIsInterviewActive(true);
        setConversation([]);
        setIsMuted(false);
        isMutedRef.current = false;

        // Reset processing flags
        isProcessingRef.current = false;

        // No initial greeting - we wait for the side effect to start the mic.
        // The user will say "Hello" to kick it off.
    };

    const stopInterview = () => {
        setIsInterviewActive(false);
        setStatus('Idle');
        isProcessingRef.current = false;

        // Force stop everything
        if (recognitionRef.current) {
            recognitionRef.current.onend = null; // Prevent auto-restart loop during teardown
            recognitionRef.current.abort(); // Hard stop
        }
        if (synthRef.current) synthRef.current.cancel();
    };

    const endInterview = () => {
        stopInterview();
        navigate('/home');
    };

    const startListening = () => {
        // Strict guard: Only start if active, unmuted, not processing, and AI not speaking
        if (!isInterviewActive || isMutedRef.current || isProcessingRef.current || synthRef.current.speaking) {
            console.log("Skipping listening start:", { active: isInterviewActive, muted: isMutedRef.current, processing: isProcessingRef.current, speaking: synthRef.current.speaking });
            return;
        }

        try {
            // Need to handle 'already started' error gracefully
            recognitionRef.current.start();
        } catch (e) {
            // Usually means recognition is already running, which is fine.
        }
    };

    const handleUserResponse = async (text) => {
        const cleanText = text.trim();
        if (!cleanText) return;

        console.log("Processing user input:", cleanText);

        isProcessingRef.current = true;
        setStatus('Processing');

        // STOP MIC immediately to prevent self-listening
        if (recognitionRef.current) recognitionRef.current.stop();
        // Also cancel any stray speech 
        if (synthRef.current.speaking) synthRef.current.cancel();

        setConversation(prev => [...prev, { role: 'user', content: cleanText }]);

        try {
            console.log("Sending to backend...");
            const response = await fetch('http://127.0.0.1:8000/api/interview/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_message: cleanText,
                    session_id: sessionId
                }),
            });

            const data = await response.json();
            console.log("Backend response:", data);

            if (data.ai_response) {
                setConversation(prev => [...prev, { role: 'ai', content: data.ai_response }]);
                speakResponse(data.ai_response);
            } else {
                console.error("No AI response in data:", data);
                setStatus('Error');
                isProcessingRef.current = false;
            }
        } catch (error) {
            console.error("API Error during fetch:", error);
            setStatus('Error');
            isProcessingRef.current = false;
        }
    };

    const speakResponse = (text) => {
        if (!isInterviewActive) return;

        // Ensure mic is stopped
        if (recognitionRef.current) recognitionRef.current.stop();

        setStatus('AI Speaking');
        isProcessingRef.current = true; // Block mic

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 1.0;

        // Try to pick a better voice
        const voices = synthRef.current.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha'));
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.onend = () => {
            if (isInterviewActive && !isMutedRef.current) {
                isProcessingRef.current = false;
                startListening(); // Resume listening after speaking
            }
        };

        utterance.onerror = () => {
            isProcessingRef.current = false;
            if (isInterviewActive && !isMutedRef.current) startListening();
        }

        synthRef.current.speak(utterance);
    };

    const toggleMute = () => {
        setIsMuted(prev => !prev);
    };

    // --- Render ---
    return (
        <div className="flex flex-col h-screen w-full bg-gray-900 text-white font-sans overflow-hidden items-center justify-center relative">

            {/* Top Bar - Session Info */}
            <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center bg-gray-900 bg-opacity-90 z-10">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="text-sm font-medium tracking-wide text-gray-300">Live Interview Session</span>
                </div>
                <div className="text-xs text-gray-500">{sessionId}</div>
            </div>

            {/* Main Content - Avatar & Status */}
            {!isInterviewActive ? (
                // Start Screen
                <div className="flex flex-col items-center justify-center p-8 text-center max-w-lg z-10">
                    <div className="w-32 h-32 bg-gray-800 rounded-full flex items-center justify-center mb-6 shadow-2xl border border-gray-700">
                        <svg className="w-16 h-16 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                    </div>
                    <h1 className="text-3xl font-light mb-3 tracking-tight">AI Technical Interview</h1>
                    <p className="text-gray-400 mb-10 text-lg">Ready to begin your session?</p>
                    <button
                        onClick={startInterview}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-full font-medium transition-all shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-0.5"
                    >
                        Start Interview
                    </button>
                    <div className="mt-8 text-sm text-gray-500 max-w-xs">
                        *Ensure you are in a quiet environment and your microphone is working.
                    </div>
                </div>
            ) : (
                // Active Call Interface
                <div className="flex flex-col items-center justify-center w-full h-full relative">

                    {/* Visualizer / Avatar Area */}
                    <div className="relative mb-12 flex flex-col items-center">
                        {/* Status Badge */}
                        <div className={`absolute -top-16 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${status === 'Listening' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                            status === 'AI Speaking' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                status === 'Processing' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                    'bg-gray-700 text-gray-400'
                            }`}>
                            {status === 'Listening' && !isMuted ? 'LISTENING...' :
                                status === 'AI Speaking' ? 'INTERVIEWER SPEAKING' :
                                    status === 'Processing' ? 'THINKING...' : status}
                        </div>

                        {/* Main Avatar Circle */}
                        <div className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 relative ${status === 'AI Speaking' ? 'shadow-[0_0_50px_rgba(59,130,246,0.3)] scale-105 border-2 border-blue-500/50' :
                            status === 'Listening' && !isMuted ? 'shadow-[0_0_50px_rgba(34,197,94,0.2)] border-2 border-green-500/50' :
                                'bg-gray-800 border-4 border-gray-800'
                            }`}>
                            {/* Ripples when AI speaking */}
                            {status === 'AI Speaking' && (
                                <>
                                    <div className="absolute w-full h-full rounded-full border border-blue-400 opacity-20 animate-ping"></div>
                                    <div className="absolute w-56 h-56 rounded-full border border-blue-500 opacity-10 animate-pulse"></div>
                                </>
                            )}

                            <div className="w-44 h-44 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden relative z-10">
                                <svg className={`w-20 h-20 text-gray-400 transition-colors duration-300 ${status === 'AI Speaking' ? 'text-blue-400' : ''}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                            </div>
                        </div>

                        {/* User Transcript Preview */}
                        <div className="mt-8 h-12 text-center px-4 max-w-2xl">
                            {conversation.length > 0 && conversation[conversation.length - 1].role === 'user' && status === 'Processing' && (
                                <p className="text-gray-400 italic text-lg animate-pulse">"{conversation[conversation.length - 1].content}"</p>
                            )}
                        </div>
                    </div>

                    {/* Bottom Control Bar */}
                    <div className="absolute bottom-8 flex items-center space-x-6 px-8 py-4 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700/50 backdrop-blur-sm">

                        {/* Mic Toggle */}
                        <button
                            onClick={toggleMute}
                            className={`p-4 rounded-full transition-all duration-200 focus:outline-none ${isMuted
                                ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30'
                                : 'bg-gray-700 hover:bg-gray-600 text-white'
                                }`}
                            title={isMuted ? "Unmute" : "Mute"}
                        >
                            {isMuted ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" /></svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                            )}
                        </button>

                        {/* Visualizer Bar (Simulated) */}
                        <div className="hidden md:flex space-x-1 items-end h-8">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className={`w-1 bg-gray-500 rounded-full transition-all duration-100 ${(status === 'Listening' && !isMuted) || status === 'AI Speaking' ? 'animate-pulse h-full bg-blue-400' : 'h-2'
                                    }`} style={{ animationDelay: `${i * 0.1}s` }}></div>
                            ))}
                        </div>

                        {/* End Call */}
                        <button
                            onClick={endInterview}
                            className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all duration-200 shadow-lg shadow-red-600/30 w-16 flex justify-center"
                            title="End Call"
                        >
                            <svg className="w-6 h-6 transform rotate-135" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2 2m2-2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 01-2-2h6" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Interview;
