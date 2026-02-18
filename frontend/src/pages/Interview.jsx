import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const Interview = () => {
    const navigate = useNavigate();

    // State
    const [isInterviewActive, setIsInterviewActive] = useState(false);
    const [status, setStatus] = useState('Idle'); // Idle, Listening, Processing, AI Speaking, Muted, Error
    const [conversation, setConversation] = useState([]);
    const [userTranscript, setUserTranscript] = useState(''); // interim or final user text
    const [aiTranscript, setAiTranscript] = useState(''); // current AI reply
    const [isMuted, setIsMuted] = useState(false);
    const [sessionId, setSessionId] = useState('');

    // Refs
    const recognitionRef = useRef(null);
    const recognitionRunningRef = useRef(false);
    const synthRef = useRef(window.speechSynthesis || null);
    const isMutedRef = useRef(false);
    const isProcessingRef = useRef(false);

    // Init on mount
    useEffect(() => {
        setSessionId(`session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Speech Recognition not supported. Use Chrome/Edge.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = true;
        // Use non-continuous mode: we'll manually restart after AI finishes
        recognition.continuous = false;

        recognition.onstart = () => {
            recognitionRunningRef.current = true;
            if (!isProcessingRef.current && !synthRef.current?.speaking) setStatus(isMutedRef.current ? 'Muted' : 'Listening');
        };

        recognition.onresult = (event) => {
            let interim = '';
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const res = event.results[i];
                if (res.isFinal) finalTranscript += res[0].transcript;
                else interim += res[0].transcript;
            }

            if (interim) {
                setUserTranscript(interim);
            }

            if (finalTranscript) {
                setUserTranscript('');
                setConversation(prev => [...prev, { role: 'user', content: finalTranscript }]);
                // Send final transcript to backend
                handleSendToBackend(finalTranscript.trim());
            }
        };

        recognition.onerror = (e) => {
            console.warn('Recognition error', e.error);
            if (e.error === 'not-allowed' || e.error === 'permission-denied') {
                alert('Microphone permission denied.');
                stopInterview();
            }
        };

        // onend will not auto-restart; we restart explicitly after AI finishes
        recognition.onend = () => {
            recognitionRunningRef.current = false;
            console.log('[Interview] recognition.onend fired');
            // If interview is inactive, set Idle
            if (!isInterviewActive) {
                setStatus('Idle');
            } else {
                // If we are not processing and not speaking, set Listening so UI reflects readiness
                if (!isProcessingRef.current && !synthRef.current?.speaking && !isMutedRef.current) {
                    setStatus('Listening');
                }
            }
        };

        recognitionRef.current = recognition;

        // Ensure voices are loaded
        if (synthRef.current) {
            if (synthRef.current.getVoices().length === 0) {
                window.speechSynthesis.onvoiceschanged = () => { synthRef.current.getVoices(); };
            }
        }

        return () => {
            if (recognitionRef.current) {
                try { recognitionRef.current.onend = null; recognitionRef.current.stop(); } catch (e) { }
            }
            if (synthRef.current) try { synthRef.current.cancel(); } catch (e) { }
        };
    }, []);

    // Keep refs in sync
    useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

    // Start interview and trigger initial AI greeting
    const startInterview = async () => {
        setConversation([]);
        setAiTranscript('');
        setUserTranscript('');
        setIsMuted(false);
        setIsInterviewActive(true);
        isMutedRef.current = false;
        isProcessingRef.current = false;

        // Trigger initial AI greeting first. We'll start the mic after the AI finishes speaking.
        try {
            await handleSendToBackend('');
        } catch (e) {
            console.warn('[Interview] initial greeting failed', e);
        }
    };

    const stopInterview = () => {
        setIsInterviewActive(false);
        setStatus('Idle');
        isProcessingRef.current = false;
        try { if (recognitionRef.current) { recognitionRef.current.onend = null; recognitionRef.current.stop(); } } catch (e) { }
        try { if (synthRef.current) synthRef.current.cancel(); } catch (e) { }
    };

    const endInterview = () => {
        stopInterview();
        navigate('/home');
    };

    const startRecognitionIfReady = () => {
        if (!recognitionRef.current) return;
        if (recognitionRunningRef.current) return;
        if (!isInterviewActive || isMutedRef.current || isProcessingRef.current || synthRef.current?.speaking) return;
        try { recognitionRef.current.start(); } catch (e) { }
    };

    const handleSendToBackend = async (message) => {
        if (!sessionId) return;
        // If message is empty, backend will return initial greeting
        isProcessingRef.current = true;
        console.log('[Interview] Sending to backend:', { sessionId, message });
        setStatus('Processing');

        // Stop mic while AI processes
        try { if (recognitionRef.current) recognitionRef.current.stop(); } catch (e) { console.warn('[Interview] stop recognition failed', e); }

        try {
            const res = await fetch(`${API_BASE}/api/interview/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_message: message, session_id: sessionId })
            });
            const data = await res.json();
            console.log('[Interview] backend response', data);

            if (data && data.response_text) {
                const aiText = data.response_text;
                setConversation(prev => [...prev, { role: 'ai', content: aiText }]);
                setAiTranscript(aiText);

                // If backend provided audio_url, play that audio file. Otherwise fallback to browser TTS.
                if (data.audio_url) {
                    console.log('[Interview] Playing backend audio_url', data.audio_url);
                    await playAudioFromUrl(data.audio_url);
                } else {
                    console.warn('[Interview] No audio_url returned, falling back to SpeechSynthesis');
                    await speakResponse(aiText);
                }
            } else {
                console.error('Unexpected backend response', data);
                setStatus('Error');
            }
        } catch (err) {
            console.error('Interview API error', err);
            setStatus('Error');
        } finally {
            isProcessingRef.current = false;
            // Clear any user interim
            setUserTranscript('');
            // Resume recognition if allowed
            if (isInterviewActive && !isMutedRef.current) startRecognitionIfReady();
        }
    };

    // Play audio returned from backend and manage mic state
    const playAudioFromUrl = (url) => new Promise((resolve) => {
        console.log('[Interview] playAudioFromUrl start', url);
        // If muted, don't play audio; just resolve and keep mic stopped
        if (isMutedRef.current) {
            console.log('[Interview] Muted — skipping audio playback');
            setStatus('Muted');
            resolve();
            return;
        }

        // Ensure mic is stopped while playing
        try { if (recognitionRef.current) recognitionRef.current.stop(); } catch (e) { console.warn('[Interview] stop recognition before audio failed', e); }

        setStatus('AI Speaking');
        isProcessingRef.current = true;

        const audio = new Audio(url);
        audio.crossOrigin = 'anonymous';
        audio.preload = 'auto';

        audio.onended = () => {
            console.log('[Interview] audio playback ended');
            isProcessingRef.current = false;
            setStatus(isMutedRef.current ? 'Muted' : 'Listening');
            // Resume recognition if allowed
            if (isInterviewActive && !isMutedRef.current) {
                startRecognitionIfReady();
            }
            resolve();
        };

        audio.onerror = (e) => {
            console.error('[Interview] audio playback error', e);
            isProcessingRef.current = false;
            setStatus('Error');
            resolve();
        };

        // Play (returns promise in modern browsers)
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => { console.log('[Interview] audio playing'); }).catch((err) => {
                console.warn('[Interview] audio play() rejected, falling back to SpeechSynthesis', err);
                // Fallback to browser TTS
                resolve();
            });
        }
    });

    const speakResponse = (text) => new Promise((resolve) => {
        if (!synthRef.current) {
            resolve();
            return;
        }

        // Stop recognition to avoid self-capture
        try { if (recognitionRef.current) recognitionRef.current.stop(); } catch (e) { }

        setStatus('AI Speaking');
        isProcessingRef.current = true;

        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'en-US';
        utter.rate = 1.0;

        const voices = synthRef.current.getVoices() || [];
        const preferred = voices.find(v => /en-(US|GB)|Google US English|Samantha|Microsoft/gi.test(v.name)) || voices.find(v => v.lang && v.lang.startsWith('en'));
        if (preferred) utter.voice = preferred;

        utter.onend = () => {
            isProcessingRef.current = false;
            setStatus(isMutedRef.current ? 'Muted' : 'Listening');
            // Resume recognition if allowed
            if (isInterviewActive && !isMutedRef.current) {
                startRecognitionIfReady();
            }
            resolve();
        };

        utter.onerror = () => {
            isProcessingRef.current = false;
            setStatus('Error');
            resolve();
        };

        // Speak
        try { synthRef.current.speak(utter); } catch (e) { console.error('TTS speak failed', e); resolve(); }
    });

    const toggleMute = () => {
        setIsMuted(prev => {
            const next = !prev;
            if (next) {
                try { if (recognitionRef.current) recognitionRef.current.stop(); } catch (e) { }
                try { if (synthRef.current) synthRef.current.cancel(); } catch (e) { }
                setStatus('Muted');
            } else {
                setStatus('Listening');
                startRecognitionIfReady();
            }
            return next;
        });
    };

    // Render
    return (
        <div className="flex flex-col h-screen w-full bg-gray-900 text-white font-sans overflow-hidden items-center justify-center relative">

            <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center bg-gray-900 bg-opacity-90 z-10">
                <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${isInterviewActive ? 'bg-green-400 animate-pulse' : 'bg-red-500 animate-pulse'}`}></div>
                    <span className="text-sm font-medium tracking-wide text-gray-300">Live Interview Session</span>
                </div>
                <div className="text-xs text-gray-500">{sessionId}</div>
            </div>

            {!isInterviewActive ? (
                <div className="flex flex-col items-center justify-center p-8 text-center max-w-lg z-10">
                    <div className="w-32 h-32 bg-gray-800 rounded-full flex items-center justify-center mb-6 shadow-2xl border border-gray-700">
                        <svg className="w-16 h-16 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                    </div>
                    <h1 className="text-3xl font-light mb-3 tracking-tight">AI Technical Interview</h1>
                    <p className="text-gray-400 mb-10 text-lg">Ready to begin your session?</p>
                    <button onClick={startInterview} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-full font-medium transition-all shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-0.5">Start Interview</button>
                    <div className="mt-8 text-sm text-gray-500 max-w-xs">*Ensure you are in a quiet environment and your microphone is working.</div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center w-full h-full relative">

                    <div className="relative mb-6 flex flex-col items-center">
                        <div className={`absolute -top-16 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${status === 'Listening' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : status === 'AI Speaking' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : status === 'Processing' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : status === 'Muted' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-gray-700 text-gray-400'}` }>
                            {status === 'Listening' && !isMuted ? 'LISTENING...' : status === 'AI Speaking' ? 'INTERVIEWER SPEAKING' : status === 'Processing' ? 'THINKING...' : status}
                        </div>

                        <div className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 relative ${status === 'AI Speaking' ? 'shadow-[0_0_50px_rgba(59,130,246,0.3)] scale-105 border-2 border-blue-500/50' : status === 'Listening' && !isMuted ? 'shadow-[0_0_50px_rgba(34,197,94,0.2)] border-2 border-green-500/50' : 'bg-gray-800 border-4 border-gray-800'}`}>
                            {status === 'AI Speaking' && (<><div className="absolute w-full h-full rounded-full border border-blue-400 opacity-20 animate-ping"></div><div className="absolute w-56 h-56 rounded-full border border-blue-500 opacity-10 animate-pulse"></div></>)}
                            <div className="w-44 h-44 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden relative z-10">
                                <svg className={`w-20 h-20 text-gray-400 transition-colors duration-300 ${status === 'AI Speaking' ? 'text-blue-400' : ''}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                            </div>
                        </div>

                        {/* Subtitles Area */}
                        <div className="mt-8 w-full max-w-2xl text-center px-4">
                            {/* User Interim / Final */}
                            {userTranscript ? (
                                <p className="text-yellow-300 italic text-lg">You: {userTranscript}</p>
                            ) : null}

                            {/* Latest AI reply */}
                            {aiTranscript ? (
                                <p className="text-blue-300 mt-2 text-lg">Interviewer: {aiTranscript}</p>
                            ) : null}
                        </div>
                    </div>

                    <div className="absolute bottom-8 flex items-center space-x-6 px-8 py-4 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700/50 backdrop-blur-sm">
                        <button onClick={toggleMute} className={`p-4 rounded-full transition-all duration-200 focus:outline-none ${isMuted ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg' : 'bg-gray-700 hover:bg-gray-600 text-white'}`} title={isMuted ? 'Unmute' : 'Mute'}>
                            {isMuted ? (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" /></svg>) : (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>) }
                        </button>

                        <div className="hidden md:flex space-x-1 items-end h-8">{[...Array(5)].map((_, i) => (<div key={i} className={`w-1 bg-gray-500 rounded-full transition-all duration-100 ${ (status === 'Listening' && !isMuted) || status === 'AI Speaking' ? 'animate-pulse h-full bg-blue-400' : 'h-2' }`} style={{ animationDelay: `${i * 0.1}s` }}></div>))}</div>

                        <button onClick={endInterview} className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all duration-200 shadow-lg w-16 flex justify-center" title="End Call">
                            <svg className="w-6 h-6 transform rotate-135" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2 2m2-2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 01-2-2h6" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Interview;
