import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

const Interview = () => {
  const navigate = useNavigate();

  // State
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [status, setStatus] = useState("Idle"); // Idle, Listening, Processing, AI Speaking, Muted, Error
  const [conversation, setConversation] = useState([]);
  const [userTranscript, setUserTranscript] = useState(""); // interim or final user text
  const [aiTranscript, setAiTranscript] = useState(""); // current AI reply
  const [isMuted, setIsMuted] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [micPermission, setMicPermission] = useState(null); // null, 'granted', 'denied'
  const [manualInput, setManualInput] = useState(""); // fallback typed input
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [selectedInterviewType, setSelectedInterviewType] = useState(null); // 'technical' or 'behavioral'
  const [selectedDuration, setSelectedDuration] = useState(null); // 2, 10, 15, or 30 (minutes)

  // Refs
  const recognitionRef = useRef(null);
  const recognitionRunningRef = useRef(false);
  const synthRef = useRef(window.speechSynthesis || null);
  const isMutedRef = useRef(false);
  const isProcessingRef = useRef(false);
  const chatEndRef = useRef(null);
  const mediaStreamRef = useRef(null); // Keep mic stream alive for macOS indicator
  const mediaRecorderRef = useRef(null); // Records audio to send to backend STT
  const audioChunksRef = useRef([]);
  const recordingTimeoutRef = useRef(null);
  const isInterviewActiveRef = useRef(false); // Ref version for callbacks
  const silenceTimerRef = useRef(null); // 3-second silence auto-send timer (for Web Speech, may be unused)
  const accumulatedTranscriptRef = useRef(""); // accumulated speech before sending

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, userTranscript]);

  // Debug modal state
  useEffect(() => {
    console.log("[DEBUG] showDurationModal changed:", showDurationModal);
  }, [showDurationModal]);

  // Init on mount
  useEffect(() => {
    setSessionId(
      `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    );

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // We now rely primarily on our own STT backend, so it's OK if the
      // browser Web Speech API is missing. Just skip wiring it up.
      console.warn(
        "[Interview] Browser SpeechRecognition not available; using backend STT only.",
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    // Continuous mode: we manually stop after 3 seconds of silence
    recognition.continuous = true;

    recognition.onstart = () => {
      recognitionRunningRef.current = true;
      // Do NOT clear accumulatedTranscriptRef here to allow for restarts
      if (!isProcessingRef.current && !synthRef.current?.speaking)
        setStatus(isMutedRef.current ? "Muted" : "Listening");
    };

    recognition.onresult = (event) => {
      let interim = "";
      let finalChunk = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const res = event.results[i];
        if (res.isFinal) {
          finalChunk += res[0].transcript + " ";
        } else {
          interim += res[0].transcript;
        }
      }

      if (finalChunk) {
        accumulatedTranscriptRef.current += " " + finalChunk;
        accumulatedTranscriptRef.current =
          accumulatedTranscriptRef.current.trim();
      }

      const liveText = (
        accumulatedTranscriptRef.current +
        " " +
        interim
      ).trim();
      setUserTranscript(liveText); // Always update UI

      // Reset silence timer
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

      if (liveText) {
        silenceTimerRef.current = setTimeout(() => {
          // Time to send!
          const finalText = accumulatedTranscriptRef.current.trim();
          const textToSend = (finalText + " " + interim).trim();

          if (!textToSend) return;

          console.log("[Interview] Silence send:", textToSend);

          // Clear state immediately to prevent double sends or stale UI
          setUserTranscript("");
          accumulatedTranscriptRef.current = "";

          // Stop mic
          try {
            if (recognitionRef.current) recognitionRef.current.stop();
          } catch (e) {}

          setConversation((prev) => [
            ...prev,
            { role: "user", content: textToSend },
          ]);
          handleSendToBackend(textToSend);
        }, 3000);
      }
    };

    recognition.onerror = (e) => {
      console.warn("Recognition error", e.error);

      if (e.error === "not-allowed" || e.error === "permission-denied") {
        alert("Microphone permission denied.");
        stopInterview();
        return;
      }

      if (e.error === "network") {
        setStatus("Error");
        alert(
          "Browser speech recognition service is unavailable (network error).\n\n" +
            "Things to try:\n" +
            "• Make sure you are online and using Chrome (not Safari/Firefox).\n" +
            "• If you are on Brave/VPN/AdBlock, temporarily disable shields for this site.\n" +
            "• Close other apps using the mic and try again.\n\n" +
            "If this keeps happening, we’ll need to switch to a custom STT backend instead of the browser’s built‑in service.",
        );
        // Stop trying to auto-restart recognition; end the interview cleanly
        stopInterview();
        return;
      }
    };

    // onend: fires when recognition stops
    recognition.onend = () => {
      recognitionRunningRef.current = false;
      console.log("[Interview] recognition.onend fired");

      // If we are supposed to be listening but recognition stopped (e.g. browser timeout), restart it
      // Note: We avoid restarting if we are Muted, Processing, or AI Speaking
      if (
        isInterviewActiveRef.current &&
        !isMutedRef.current &&
        !isProcessingRef.current &&
        !synthRef.current?.speaking
      ) {
        console.log("Restarting recognition...");
        try {
          recognition.start();
          recognitionRunningRef.current = true;
        } catch (e) {
          console.warn("Restart failed", e);
        }
      }
    };

    recognitionRef.current = recognition;

    // Ensure voices are loaded
    if (synthRef.current) {
      if (synthRef.current.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          synthRef.current.getVoices();
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (synthRef.current)
        try {
          synthRef.current.cancel();
        } catch (e) {}
    };
  }, []);

  // Keep refs in sync
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Request microphone permission AND keep stream alive so macOS shows mic indicator
  const requestMicPermission = async () => {
    try {
      // Keep the stream alive — this makes macOS show the mic dot
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      setMicPermission("granted");
      return true;
    } catch (err) {
      console.error("[Interview] Mic permission denied", err);
      setMicPermission("denied");
      alert(
        "Microphone permission is required for the interview. Please enable it in your browser settings.",
      );
      return false;
    }
  };

  // Start interview and trigger initial AI greeting
  const startInterview = async () => {
    // Log selected interview type and duration for future backend integration
    console.log("[Interview] Starting interview:", {
      type: selectedInterviewType,
      duration: selectedDuration,
    });

    // Request mic permission first
    const hasPermission = await requestMicPermission();
    if (!hasPermission) {
      return;
    }

    setConversation([]);
    setAiTranscript("");
    setUserTranscript("");
    setIsMuted(false);
    setIsInterviewActive(true);
    isInterviewActiveRef.current = true;
    isMutedRef.current = false;
    isProcessingRef.current = false;

    // Trigger initial AI greeting; once the AI finishes speaking,
    // we will automatically start recording the candidate's answer.
    try {
      await handleSendToBackend("");
    } catch (e) {
      console.warn("[Interview] initial greeting failed", e);
    }
  };

  const stopInterview = () => {
    setIsInterviewActive(false);
    isInterviewActiveRef.current = false;
    setStatus("Idle");
    isProcessingRef.current = false;
    // Clear silence timer
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    accumulatedTranscriptRef.current = "";
    // Release mic stream — removes macOS mic indicator
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    // Stop any ongoing recording
    stopRecordingIfNeeded();
    try {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
    } catch (e) {}
    try {
      if (synthRef.current) synthRef.current.cancel();
    } catch (e) {}
  };

  const endInterview = () => {
    stopInterview();
    navigate("/home");
  };

  const startRecognitionIfReady = () => {
    if (!recognitionRef.current) return;
    if (recognitionRunningRef.current) return;
    if (
      !isInterviewActiveRef.current ||
      isMutedRef.current ||
      isProcessingRef.current ||
      synthRef.current?.speaking
    )
      return;
    try {
      recognitionRef.current.start();
      accumulatedTranscriptRef.current = ""; // fresh start each turn
      console.log("[Interview] Mic started — listening");
    } catch (e) {
      console.warn("[Interview] Could not start recognition:", e);
    }
  };

  // --- New: custom voice capture using MediaRecorder + backend STT ---

  const stopRecordingIfNeeded = () => {
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === "recording") {
      try {
        recorder.stop();
      } catch (e) {
        console.warn("[Interview] stopRecordingIfNeeded failed", e);
      }
    }
  };

  const sendRecordedAudioToBackend = async (audioBlob) => {
    if (!sessionId || !audioBlob || !audioBlob.size) return;

    console.log(
      "[Interview] Sending audio to STT backend, size:",
      audioBlob.size,
    );
    setStatus("Processing");
    isProcessingRef.current = true;

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "speech.webm");
      formData.append("sessionId", sessionId);

      const res = await fetch(`${API_BASE}/api/interview/stt/`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      console.log("[Interview] STT backend response", data);

      const text = (data && data.text ? data.text : "").trim();
      if (!text) {
        console.warn("[Interview] STT returned empty text");
        setStatus("Error");
        isProcessingRef.current = false;
        return;
      }

      // Show user's transcribed answer and continue interview as usual
      setConversation((prev) => [...prev, { role: "user", content: text }]);
      await handleSendToBackend(text);
    } catch (err) {
      console.error("[Interview] STT API error", err);
      setStatus("Error");
      isProcessingRef.current = false;
    }
  };

  const startRecordingTurn = () => {
    if (!mediaStreamRef.current) {
      console.warn("[Interview] No media stream available for recording");
      return;
    }
    if (!isInterviewActiveRef.current || isMutedRef.current) return;

    // Avoid double-recording
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    )
      return;

    try {
      const recorder = new MediaRecorder(mediaStreamRef.current);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        console.log(
          "[Interview] Recorder stopped, chunks:",
          audioChunksRef.current.length,
        );
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        audioChunksRef.current = [];
        await sendRecordedAudioToBackend(blob);
      };

      recorder.start();
      setStatus("Listening");
      console.log("[Interview] Recording started");

      // Safety timeout: auto-stop after 12 seconds to avoid infinite recording
      if (recordingTimeoutRef.current)
        clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = setTimeout(() => {
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state === "recording"
        ) {
          console.log("[Interview] Auto-stopping recording after timeout");
          try {
            mediaRecorderRef.current.stop();
          } catch (e) {
            console.warn("[Interview] Auto-stop recording failed", e);
          }
        }
      }, 12000);
    } catch (e) {
      console.error("[Interview] Could not start recording:", e);
    }
  };

  const handleSendToBackend = async (message) => {
    if (!sessionId) return;
    // Clear any pending silence timer to avoid double-sending
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    accumulatedTranscriptRef.current = "";
    isProcessingRef.current = true;
    console.log("[Interview] Sending to backend:", { sessionId, message });
    setStatus("Processing");

    // Stop any browser mic sources while AI processes
    stopRecordingIfNeeded();
    try {
      if (recognitionRef.current) recognitionRef.current.stop();
    } catch (e) {
      console.warn("[Interview] stop recognition failed", e);
    }

    try {
      const res = await fetch(`${API_BASE}/api/interview/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message, sessionId: sessionId }),
      });
      const data = await res.json();
      console.log("[Interview] backend response", data);

      if (data && data.ai_response) {
        const aiText = data.ai_response;
        setConversation((prev) => [...prev, { role: "ai", content: aiText }]);
        setAiTranscript(aiText);

        // Use browser TTS
        await speakResponse(aiText);
      } else {
        console.error("Unexpected backend response", data);
        setStatus("Error");
        isProcessingRef.current = false;
        if (isInterviewActiveRef.current && !isMutedRef.current)
          startRecordingTurn();
      }
    } catch (err) {
      console.error("Interview API error", err);
      setStatus("Error");
      isProcessingRef.current = false;
      if (isInterviewActiveRef.current && !isMutedRef.current)
        startRecordingTurn();
    } finally {
      // Clear any user interim
      setUserTranscript("");
      // Note: Mic will auto-restart after AI finishes speaking (in speakResponse)
    }
  };

  // Play audio returned from backend and manage mic state
  const playAudioFromUrl = (url) =>
    new Promise((resolve) => {
      console.log("[Interview] playAudioFromUrl start", url);
      // If muted, don't play audio; just resolve and keep mic stopped
      if (isMutedRef.current) {
        console.log("[Interview] Muted — skipping audio playback");
        setStatus("Muted");
        resolve();
        return;
      }

      // Ensure mic/recording is stopped while playing
      stopRecordingIfNeeded();
      try {
        if (recognitionRef.current) recognitionRef.current.stop();
      } catch (e) {
        console.warn("[Interview] stop recognition before audio failed", e);
      }

      setStatus("AI Speaking");
      isProcessingRef.current = true;

      const audio = new Audio(url);
      audio.crossOrigin = "anonymous";
      audio.preload = "auto";

      audio.onended = () => {
        console.log("[Interview] audio playback ended");
        isProcessingRef.current = false;
        setStatus(isMutedRef.current ? "Muted" : "Listening");
        // Resume recording after a brief pause
        if (isInterviewActive && !isMutedRef.current) {
          setTimeout(() => {
            startRecordingTurn();
          }, 500);
        }
        resolve();
      };

      audio.onerror = (e) => {
        console.error("[Interview] audio playback error", e);
        isProcessingRef.current = false;
        setStatus("Error");
        resolve();
      };

      // Play (returns promise in modern browsers)
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("[Interview] audio playing");
          })
          .catch((err) => {
            console.warn(
              "[Interview] audio play() rejected, falling back to SpeechSynthesis",
              err,
            );
            // Fallback to browser TTS
            resolve();
          });
      }
    });

  const speakResponse = (text) =>
    new Promise((resolve) => {
      if (!synthRef.current) {
        resolve();
        return;
      }

      // Stop any listening/recording to avoid self-capture
      stopRecordingIfNeeded();
      try {
        if (recognitionRef.current) recognitionRef.current.stop();
      } catch (e) {}

      setStatus("AI Speaking");
      isProcessingRef.current = true;

      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "en-US";
      utter.rate = 1.0;
      utter.pitch = 1.0;

      // Prefer Google US English (available in Chrome on macOS/Windows)
      const voices = synthRef.current.getVoices() || [];
      const preferred =
        voices.find((v) => v.name === "Google US English") ||
        voices.find((v) => v.name === "Samantha") || // macOS default
        voices.find((v) => /Google.*English/i.test(v.name)) ||
        voices.find((v) => v.lang === "en-US" && v.localService === false) || // remote = Google
        voices.find((v) => v.lang === "en-US");
      if (preferred) {
        utter.voice = preferred;
        console.log("[Interview] TTS voice:", preferred.name);
      }

      utter.onend = () => {
        isProcessingRef.current = false;
        setStatus(isMutedRef.current ? "Muted" : "Listening");
        // Resume recording after a brief pause (more natural conversation)
        if (isInterviewActiveRef.current && !isMutedRef.current) {
          setTimeout(() => {
            startRecordingTurn();
          }, 500);
        }
        resolve();
      };

      utter.onerror = (e) => {
        console.warn("[Interview] TTS error:", e);
        isProcessingRef.current = false;
        setStatus("Listening");
        if (isInterviewActiveRef.current && !isMutedRef.current) {
          setTimeout(() => startRecordingTurn(), 500);
        }
        resolve();
      };

      // Speak
      try {
        synthRef.current.cancel(); // clear queue first
        synthRef.current.speak(utter);
      } catch (e) {
        console.error("TTS speak failed", e);
        resolve();
      }
    });

  // Fallback: send typed text instead of speech (when browser STT fails)
  const handleManualSend = async () => {
    const text = manualInput.trim();
    if (!text || !sessionId) return;

    // Push user message to conversation immediately
    setConversation((prev) => [...prev, { role: "user", content: text }]);
    setManualInput("");

    // Stop any ongoing recognition/recording before sending
    stopRecordingIfNeeded();
    try {
      if (recognitionRef.current) recognitionRef.current.stop();
    } catch (e) {}

    await handleSendToBackend(text);
  };

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (next) {
        // Muting: stop any recording and TTS
        stopRecordingIfNeeded();
        try {
          if (recognitionRef.current) recognitionRef.current.stop();
        } catch (e) {}
        try {
          if (synthRef.current) synthRef.current.cancel();
        } catch (e) {}
        setStatus("Muted");
      } else {
        setStatus("Listening");
        startRecordingTurn();
      }
      return next;
    });
  };

  // Render
  return (
    <div className="flex flex-col h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white font-sans overflow-hidden items-center justify-center relative">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -50, 0],
            y: [0, 50, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-pink-500/20 rounded-full blur-3xl"
        />
      </div>

      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center bg-gray-900/50 backdrop-blur-md z-10 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${isInterviewActive ? "bg-green-400 animate-pulse" : "bg-red-500 animate-pulse"}`}
          ></div>
          <span className="text-sm font-medium tracking-wide text-gray-300">
            Live Interview Session
          </span>
        </div>
        <div className="text-xs text-gray-500">{sessionId}</div>
      </div>

      {!isInterviewActive ? (
        <div className="flex flex-col items-center justify-center w-full h-full p-8 z-10">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Choose Your Interview
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
              Select an interview type to begin your AI-powered practice session
            </p>
          </motion.div>

          {/* Interview Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full px-4">
            {/* Technical Interview Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group relative bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 hover:border-indigo-400/50 transition-all duration-300 shadow-xl hover:shadow-indigo-500/20"
            >
              {/* Gradient Glow */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative z-10">
                {/* Icon */}
                <div className="w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-8 h-8 text-white"
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
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold mb-3 text-white">
                  Technical Interview
                </h3>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Practice coding problems, algorithms, system design, and
                  technical concepts with AI-powered feedback.
                </p>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {[
                    { icon: "⚡", text: "Real-time feedback" },
                    { icon: "📊", text: "Instant scoring" },
                    { icon: "📝", text: "Detailed report" },
                  ].map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-3 text-gray-300"
                    >
                      <span className="text-xl">{feature.icon}</span>
                      <span>{feature.text}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => {
                    console.log("[DEBUG] Technical button clicked");
                    setSelectedInterviewType("technical");
                    setShowDurationModal(true);
                    console.log("[DEBUG] Modal state set to true");
                  }}
                  className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl font-semibold text-white shadow-lg hover:shadow-indigo-500/50 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  Start Technical Interview
                </button>
              </div>
            </motion.div>

            {/* Behavioral Interview Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group relative bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 hover:border-pink-400/50 transition-all duration-300 shadow-xl hover:shadow-pink-500/20"
            >
              {/* Gradient Glow */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative z-10">
                {/* Icon */}
                <div className="w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold mb-3 text-white">
                  Behavioral Interview
                </h3>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Master soft skills, leadership scenarios, and behavioral
                  questions with personalized AI analysis.
                </p>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {[
                    { icon: "🧠", text: "AI behavior analysis" },
                    { icon: "🎯", text: "Skill matching" },
                    { icon: "💬", text: "Communication insights" },
                  ].map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-3 text-gray-300"
                    >
                      <span className="text-xl">{feature.icon}</span>
                      <span>{feature.text}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => {
                    console.log("[DEBUG] Behavioral button clicked");
                    setSelectedInterviewType("behavioral");
                    setShowDurationModal(true);
                    console.log("[DEBUG] Modal state set to true");
                  }}
                  className="w-full px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 rounded-xl font-semibold text-white shadow-lg hover:shadow-pink-500/50 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  Start Behavioral Interview
                </button>
              </div>
            </motion.div>
          </div>

          {/* Microphone Permission Status */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 text-center"
          >
            {micPermission === "denied" && (
              <div className="px-6 py-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 max-w-md">
                ⚠️ Microphone access denied. Please enable it in browser
                settings.
              </div>
            )}
            {micPermission === "granted" && (
              <div className="px-6 py-3 bg-green-500/20 border border-green-500/50 rounded-xl text-green-300">
                ✓ Microphone ready
              </div>
            )}
            {!micPermission && (
              <p className="text-gray-400 text-sm">
                🎤 Microphone permission will be requested when you start
              </p>
            )}
          </motion.div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-start w-full h-full relative pt-20 pb-32 overflow-y-auto">
          <div className="relative mb-4 flex flex-col items-center">
            <div
              className={`absolute -top-16 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors duration-300 flex items-center gap-2 ${status === "Listening" ? "bg-green-500/20 text-green-400 border border-green-500/30" : status === "AI Speaking" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : status === "Processing" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" : status === "Muted" ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-gray-700 text-gray-400"}`}
            >
              {/* Microphone Icon with Animation */}
              {status === "Listening" && !isMuted && (
                <svg
                  className="w-4 h-4 animate-pulse"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <span>
                {status === "Listening" && !isMuted
                  ? "🎤 LISTENING..."
                  : status === "AI Speaking"
                    ? "🗣️ INTERVIEWER SPEAKING"
                    : status === "Processing"
                      ? "⏳ THINKING..."
                      : status === "Muted"
                        ? "🔇 MUTED"
                        : status}
              </span>
            </div>

            <div
              className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 relative ${status === "AI Speaking" ? "shadow-[0_0_50px_rgba(59,130,246,0.3)] scale-105 border-2 border-blue-500/50" : status === "Listening" && !isMuted ? "shadow-[0_0_50px_rgba(34,197,94,0.4)] border-2 border-green-500/50 animate-pulse" : "bg-gray-800 border-4 border-gray-800"}`}
            >
              {status === "AI Speaking" && (
                <>
                  <div className="absolute w-full h-full rounded-full border border-blue-400 opacity-20 animate-ping"></div>
                  <div className="absolute w-40 h-40 rounded-full border border-blue-500 opacity-10 animate-pulse"></div>
                </>
              )}
              <div className="w-28 h-28 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden relative z-10">
                <svg
                  className={`w-14 h-14 text-gray-400 transition-colors duration-300 ${status === "AI Speaking" ? "text-blue-400" : ""}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>

            {/* Chat Transcript */}
            <div className="mt-8 w-full max-w-3xl px-4">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-4 max-h-64 overflow-y-auto">
                <div className="space-y-3">
                  {conversation.length === 0 && !userTranscript && (
                    <p className="text-gray-500 text-center text-sm italic">
                      Conversation will appear here...
                    </p>
                  )}
                  {conversation.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          msg.role === "user"
                            ? "bg-green-600/20 border border-green-500/30 text-green-100"
                            : "bg-blue-600/20 border border-blue-500/30 text-blue-100"
                        }`}
                      >
                        <div className="text-xs font-semibold mb-1 opacity-70">
                          {msg.role === "user" ? "You" : "Interviewer"}
                        </div>
                        <div className="text-sm">{msg.content}</div>
                      </div>
                    </div>
                  ))}
                  {/* User is currently speaking (interim) — live transcription */}
                  {userTranscript && (
                    <div className="flex justify-end">
                      <div className="max-w-[80%] rounded-lg px-4 py-2 bg-yellow-600/20 border border-yellow-500/30 text-yellow-100">
                        <div className="text-xs font-semibold mb-1 opacity-70 flex items-center gap-1">
                          <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                          You (speaking... auto-sends after 3s silence)
                        </div>
                        <div className="text-sm">{userTranscript}</div>
                      </div>
                    </div>
                  )}
                  {/* Auto-scroll anchor */}
                  <div ref={chatEndRef} />{" "}
                </div>
              </div>

              {/* Current Status Indicator */}
              <div className="mt-3 text-center">
                {status === "Listening" && !userTranscript && (
                  <p className="text-green-400 text-sm animate-pulse">
                    🎤 Speak now...
                  </p>
                )}
                {status === "Processing" && (
                  <p className="text-yellow-400 text-sm">
                    ⏳ AI is thinking...
                  </p>
                )}
                {status === "AI Speaking" && (
                  <p className="text-blue-400 text-sm">
                    🗣️ AI is responding...
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 flex flex-col md:flex-row md:items-center md:space-x-6 space-y-4 md:space-y-0 px-8 py-4 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700/50 backdrop-blur-sm w-[95%] max-w-4xl">
            <button
              onClick={toggleMute}
              className={`p-4 rounded-full transition-all duration-200 focus:outline-none relative ${isMuted ? "bg-red-500 hover:bg-red-600 text-white shadow-lg" : status === "Listening" ? "bg-green-500 hover:bg-green-600 text-white animate-pulse shadow-lg shadow-green-500/50" : "bg-gray-700 hover:bg-gray-600 text-white"}`}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {/* Listening indicator */}
              {status === "Listening" && !isMuted && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              )}
              {isMuted ? (
                <svg
                  className="w-6 h-6"
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3l18 18"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
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
              )}
            </button>

            <div className="hidden md:flex space-x-1 items-end h-8">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-100 ${status === "Listening" && !isMuted ? "animate-pulse bg-green-400" : status === "AI Speaking" ? "animate-pulse bg-blue-400" : "bg-gray-500 h-2"}`}
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    height:
                      (status === "Listening" && !isMuted) ||
                      status === "AI Speaking"
                        ? `${20 + Math.random() * 12}px`
                        : "8px",
                  }}
                ></div>
              ))}
            </div>

            {/* Typed input fallback when voice STT is not working */}
            <div className="flex-1 flex items-center space-x-2">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleManualSend();
                }}
                placeholder="Type your answer here if the mic isn't working..."
                className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleManualSend}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium"
              >
                Send
              </button>
            </div>

            <button
              onClick={endInterview}
              className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all duration-200 shadow-lg w-16 flex justify-center"
              title="End Call"
            >
              <svg
                className="w-6 h-6 transform rotate-135"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 8l2-2m0 0l2-2m-2 2l-2 2m2-2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 01-2-2h6"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Duration Selection Modal - Rendered at root level for proper z-index stacking */}
      <AnimatePresence>
        {showDurationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
            onClick={() => {
              console.log("[DEBUG] Modal backdrop clicked");
              setShowDurationModal(false);
              setSelectedDuration(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => {
                console.log("[DEBUG] Modal content clicked");
                e.stopPropagation();
              }}
              className="bg-gray-900/95 backdrop-blur-2xl rounded-3xl p-8 max-w-2xl w-full border border-white/20 shadow-2xl"
            >
              {/* Modal Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Select Interview Duration
                </h2>
                <p className="text-gray-400">
                  Choose how long you'd like to practice
                </p>
              </div>

              {/* Duration Options */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { minutes: 2, label: "Quick", icon: "⚡" },
                  { minutes: 10, label: "Short", icon: "🎯" },
                  { minutes: 15, label: "Standard", icon: "💡" },
                  { minutes: 30, label: "Extended", icon: "🚀" },
                ].map((option) => (
                  <button
                    key={option.minutes}
                    onClick={() => {
                      console.log("[DEBUG] Duration selected:", option.minutes);
                      setSelectedDuration(option.minutes);
                    }}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                      selectedDuration === option.minutes
                        ? "bg-gradient-to-br from-indigo-600 to-purple-600 border-indigo-400 shadow-lg shadow-indigo-500/50 scale-105"
                        : "bg-white/5 border-white/20 hover:border-indigo-400/50 hover:bg-white/10"
                    }`}
                  >
                    <div className="text-3xl mb-2">{option.icon}</div>
                    <div className="text-2xl font-bold text-white mb-1">
                      {option.minutes}
                    </div>
                    <div className="text-xs text-gray-400">{option.label}</div>
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    console.log("[DEBUG] Cancel clicked");
                    setShowDurationModal(false);
                    setSelectedDuration(null);
                  }}
                  className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium text-white border border-white/20 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    console.log(
                      "[DEBUG] Begin Interview clicked, duration:",
                      selectedDuration,
                    );
                    if (selectedDuration) {
                      setShowDurationModal(false);
                      startInterview();
                    }
                  }}
                  disabled={!selectedDuration}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    selectedDuration
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg hover:shadow-indigo-500/50"
                      : "bg-gray-700 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Begin Interview
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Interview;
