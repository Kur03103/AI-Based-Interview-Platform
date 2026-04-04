import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "../components/ThemeToggle";
import api from "../api/axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

const Interview = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
  const [timeRemaining, setTimeRemaining] = useState(0); // seconds remaining
  const [showFinalResults, setShowFinalResults] = useState(false);
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Refs
  const recognitionRef = useRef(null);
  const recognitionRunningRef = useRef(false);
  const synthRef = useRef(window.speechSynthesis || null);
  const isMutedRef = useRef(false);
  const isProcessingRef = useRef(false);
  const chatEndRef = useRef(null);
  const mediaStreamRef = useRef(null); // Keep mic stream alive for permission and recording
  const mediaRecorderRef = useRef(null); // Records audio to send to backend STT
  const audioChunksRef = useRef([]);
  const recordingTimeoutRef = useRef(null);
  const isInterviewActiveRef = useRef(false); // Ref version for callbacks
  const silenceTimerRef = useRef(null); // silence auto-send timer
  const accumulatedTranscriptRef = useRef(""); // accumulated speech before sending
  const audioContextRef = useRef(null); // Web Audio API context for volume detection
  const analyserRef = useRef(null); // Analyser for detecting speech/silence
  const silenceDetectionIntervalRef = useRef(null); // Interval for checking silence
  const lastSoundTimeRef = useRef(0); // Timestamp of last detected sound
  const isMounted = useRef(true);
  
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, userTranscript]);

  // Countdown Timer Effect
  useEffect(() => {
    if (!isInterviewActive || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time's up - end interview
          clearInterval(timer);
          handleInterviewComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isInterviewActive, timeRemaining]);

  // Format time remaining for display (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Debug modal state
  useEffect(() => {
    console.log("[DEBUG] showDurationModal changed:", showDurationModal);
  }, [showDurationModal]);

  // Handle interview type from navigation state
  useEffect(() => {
    if (location.state?.interviewType && !selectedInterviewType) {
      const type = location.state.interviewType;
      console.log("[Interview] Received interview type from navigation:", type);
      setSelectedInterviewType(type);
      setShowDurationModal(true);
      // Clear the navigation state to prevent re-triggering
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, selectedInterviewType, navigate, location.pathname]);

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
          // If we are muted, do not send anything
          if (isMutedRef.current) return;

          // Time to send after 2 seconds of silence!
          const finalText = accumulatedTranscriptRef.current.trim();
          const textToSend = (finalText + " " + interim).trim();

          if (!textToSend) return;

          console.log(
            "[Interview] 2 seconds silence detected, sending:",
            textToSend,
          );

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
        }, 2000); // 2 seconds of silence
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
    const handleVoicesChanged = () => {
      if (synthRef.current) synthRef.current.getVoices();
    };

    if (synthRef.current) {
      window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
      synthRef.current.getVoices(); // Initial call
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.onresult = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onstart = null;
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (synthRef.current) {
        window.speechSynthesis.onvoiceschanged = null;
        try {
          synthRef.current.cancel();
        } catch (e) {}
      }
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
    setInterviewCompleted(false);
    setShowFinalResults(false);

    // Initialize AudioContext on user gesture to prevent browser warnings
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (
          window.AudioContext || window.webkitAudioContext
        )();
      }
      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }
    } catch (e) {
      console.warn("Could not initialize AudioContext on start:", e);
    }

    // Initialize countdown timer (convert minutes to seconds)
    setTimeRemaining(selectedDuration * 60);

    console.log("[Interview] Requesting initial AI greeting...");
    // Trigger initial AI greeting; once the AI finishes speaking,
    // we will automatically start recording the candidate's answer.
    try {
      await handleSendToBackend("");
      console.log("[Interview] Initial AI greeting completed");
    } catch (e) {
      console.warn("[Interview] initial greeting failed", e);
    }
  };

  const handleInterviewComplete = () => {
    console.log("[Interview] Interview time completed");
    setInterviewCompleted(true);
    stopInterview();
    setShowFinalResults(true);
    fetchAnalysis(conversation);
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
    // Close audio context
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current
        .close()
        .catch((e) =>
          console.warn("[Interview] Error closing audio context", e),
        );
      audioContextRef.current = null;
    }
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
    setInterviewCompleted(true);
    stopInterview();
    setShowFinalResults(true);
    fetchAnalysis(conversation);
  };

  // ── Emotion / Tone Analysis ──────────────────────────────────────────────
  const fetchAnalysis = async (conv) => {
    if (!conv || conv.length === 0) return;
    setIsAnalyzing(true);
    setAnalysisData(null);
    try {
      const response = await api.post("/api/interview/analyze/", {
        session_id: sessionId,
        conversation: conv,
        interview_type: selectedInterviewType,
        duration: selectedDuration,
      });
      const data = response.data;
      if (isMounted.current) {
        setAnalysisData(data);
        // Automatically save the report (don't block UI if it fails)
        saveInterviewReport(data);
      }
    } catch (err) {
      console.error("[Interview] Analysis fetch error:", err);
    } finally {
      if (isMounted.current) setIsAnalyzing(false);
    }
  };

  // ── Save Interview Report ────────────────────────────────────────────────
  const saveInterviewReport = async (reportData) => {
    try {
      const response = await api.post('/api/interview/reports/save/', reportData);
      console.log("[Interview] Report saved successfully:", response.data);
      // Could show a toast notification here if desired
    } catch (error) {
      console.error("[Interview] Failed to save report:", error);
      // Don't show error to user - report is still available for download
    }
  };

  // ── Report Download ───────────────────────────────────────────────────────
  const downloadReport = () => {
    const d = analysisData;
    const date = new Date().toLocaleString();
    const type =
      selectedInterviewType === "technical" ? "Technical" : "Resume CV";
    const skillKey =
      selectedInterviewType === "technical"
        ? "technical_depth"
        : "empathy_and_self_awareness";
    const skillLabel =
      selectedInterviewType === "technical"
        ? "Technical Depth"
        : "Empathy & Self-Awareness";

    const scoreBar = (val) =>
      `<div style="background:#1e293b;border-radius:4px;height:10px;width:100%;margin-top:4px;">
        <div style="background:linear-gradient(90deg,#6366f1,#8b5cf6);height:100%;border-radius:4px;width:${val}%;"></div>
      </div>`;

    const toneColor = (tone) => {
      const map = {
        confident: "#22c55e",
        nervous: "#f97316",
        enthusiastic: "#a78bfa",
        hesitant: "#fb923c",
        calm: "#60a5fa",
        anxious: "#f87171",
        assertive: "#34d399",
        uncertain: "#facc15",
      };
      return map[tone] || "#94a3b8";
    };

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Interview Report – ${type}</title>
<style>
  body{font-family:'Segoe UI',Arial,sans-serif;background:#0f172a;color:#e2e8f0;margin:0;padding:32px;}
  .container{max-width:860px;margin:0 auto;background:#1e293b;border-radius:16px;padding:40px;box-shadow:0 25px 50px rgba(0,0,0,0.5);}
  h1{font-size:28px;font-weight:800;background:linear-gradient(90deg,#818cf8,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin:0 0 4px;}
  .meta{color:#94a3b8;font-size:13px;margin-bottom:32px;}
  .section{background:#0f172a;border-radius:12px;padding:24px;margin-bottom:20px;border:1px solid #334155;}
  h2{font-size:16px;font-weight:700;color:#818cf8;text-transform:uppercase;letter-spacing:.05em;margin:0 0 16px;}
  .score-big{font-size:56px;font-weight:900;background:linear-gradient(135deg,#818cf8,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1;}
  .stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;}
  .stat-box{background:#1e293b;border-radius:10px;padding:16px;text-align:center;border:1px solid #334155;}
  .stat-val{font-size:28px;font-weight:800;color:#818cf8;}
  .stat-lbl{font-size:11px;color:#94a3b8;margin-top:4px;}
  .skill-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;}
  .skill-name{font-size:14px;color:#cbd5e1;}
  .skill-pct{font-size:13px;font-weight:700;color:#818cf8;}
  .tone-badge{display:inline-block;padding:4px 12px;border-radius:99px;font-size:12px;font-weight:700;text-transform:capitalize;}
  .tag{display:inline-block;background:#1e3a5f;color:#93c5fd;font-size:11px;padding:3px 10px;border-radius:99px;margin:3px 3px 0 0;}
  .bullet{display:flex;gap:10px;align-items:flex-start;margin-bottom:10px;font-size:14px;color:#cbd5e1;}
  .dot-green{width:8px;height:8px;border-radius:50%;background:#22c55e;flex-shrink:0;margin-top:5px;}
  .dot-yellow{width:8px;height:8px;border-radius:50%;background:#facc15;flex-shrink:0;margin-top:5px;}
  .transcript-line{padding:10px 0;border-bottom:1px solid #1e293b;font-size:13px;}
  .label-you{color:#4ade80;font-weight:700;font-size:11px;}
  .label-ai{color:#60a5fa;font-weight:700;font-size:11px;}
  .content-text{color:#94a3b8;margin-top:4px;line-height:1.6;}
  @media print{body{background:#fff;color:#000;padding:0;} .container{box-shadow:none;}}
</style>
</head>
<body>
<div class="container">
  <h1>Interview Report</h1>
  <div class="meta">
    ${type} Interview &nbsp;|&nbsp; ${d.duration} minutes &nbsp;|&nbsp; Generated: ${date}<br/>
    Session: ${sessionId}
  </div>

  <!-- Scores -->
  <div class="section">
    <h2>Overall Performance</h2>
    <div style="display:flex;align-items:center;gap:32px;">
      <div>
        <div class="score-big">${d.overall_score}</div>
        <div style="font-size:13px;color:#94a3b8;margin-top:4px;">Overall Score / 100</div>
      </div>
      <div style="flex:1;">
        ${scoreBar(d.overall_score)}
      </div>
    </div>
    <div class="stat-grid" style="margin-top:20px;">
      <div class="stat-box"><div class="stat-val">${d.duration}m</div><div class="stat-lbl">Duration</div></div>
      <div class="stat-box"><div class="stat-val">${d.question_count}</div><div class="stat-lbl">Questions</div></div>
      <div class="stat-box"><div class="stat-val">${d.response_count}</div><div class="stat-lbl">Responses</div></div>
    </div>
  </div>

  <!-- Tone Analysis -->
  <div class="section">
    <h2>Emotion & Tone Analysis</h2>
    <div style="display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start;">
      <div>
        <div style="font-size:12px;color:#94a3b8;margin-bottom:8px;">Dominant Tone</div>
        <span class="tone-badge" style="background:${toneColor(d.tone_analysis?.dominant_tone)}22;color:${toneColor(d.tone_analysis?.dominant_tone)};border:1px solid ${toneColor(d.tone_analysis?.dominant_tone)}55;">
          ${d.tone_analysis?.dominant_tone || "calm"}
        </span>
      </div>
      <div>
        <div style="font-size:12px;color:#94a3b8;margin-bottom:8px;">Confidence Score</div>
        <div style="font-size:24px;font-weight:800;color:#818cf8;">${d.tone_analysis?.confidence_score || 0}<span style="font-size:14px;">/100</span></div>
      </div>
      <div>
        <div style="font-size:12px;color:#94a3b8;margin-bottom:8px;">Overall Sentiment</div>
        <div style="font-size:14px;font-weight:700;color:${d.tone_analysis?.sentiment === "positive" ? "#22c55e" : d.tone_analysis?.sentiment === "negative" ? "#f87171" : "#94a3b8"};text-transform:capitalize;">${d.tone_analysis?.sentiment || "neutral"}</div>
      </div>
    </div>
    <div style="margin-top:16px;">
      <div style="font-size:12px;color:#94a3b8;margin-bottom:8px;">Detected Tone Tags</div>
      ${(d.tone_analysis?.tone_tags || []).map((t) => `<span class="tag">${t}</span>`).join("")}
    </div>
  </div>

  <!-- Skill Scores -->
  <div class="section">
    <h2>Skill Breakdown</h2>
    ${[
      ["Communication", d.skill_scores?.communication],
      ["Response Quality", d.skill_scores?.response_quality],
      ["Engagement", d.skill_scores?.engagement],
      [skillLabel, d.skill_scores?.[skillKey]],
    ]
      .map(
        ([label, val]) => `
      <div class="skill-row">
        <span class="skill-name">${label}</span>
        <span class="skill-pct">${val || 0}%</span>
      </div>
      ${scoreBar(val || 0)}
      <div style="margin-bottom:12px;"></div>
    `,
      )
      .join("")}
  </div>

  <!-- Strengths / Improvements -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
    <div class="section" style="margin-bottom:0;">
      <h2>Strengths</h2>
      ${(d.strengths || []).map((s) => `<div class="bullet"><div class="dot-green"></div><div>${s}</div></div>`).join("")}
    </div>
    <div class="section" style="margin-bottom:0;">
      <h2>Areas to Improve</h2>
      ${(d.improvements || []).map((s) => `<div class="bullet"><div class="dot-yellow"></div><div>${s}</div></div>`).join("")}
    </div>
  </div>

  <!-- Detailed Feedback -->
  <div class="section">
    <h2>Detailed Feedback</h2>
    <p style="font-size:14px;color:#cbd5e1;line-height:1.7;margin:0;">${d.detailed_feedback || ""}</p>
  </div>

  <!-- Full Transcript -->
  <div class="section">
    <h2>Full Transcript</h2>
    ${conversation
      .map(
        (msg) => `
      <div class="transcript-line">
        <div class="${msg.role === "user" ? "label-you" : "label-ai"}">${msg.role === "user" ? "You" : "Interviewer"}</div>
        <div class="content-text">${msg.content}</div>
      </div>
    `,
      )
      .join("")}
  </div>

  <div style="text-align:center;margin-top:24px;color:#475569;font-size:12px;">
    Generated by Interview Bloom AI &nbsp;•&nbsp; ${date}
  </div>
</div>
</body></html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `interview-report-${sessionId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const startRecognitionIfReady = () => {
    if (!recognitionRef.current) return;
    if (recognitionRunningRef.current) return;

    // Do not start recognition if AI is speaking or processing
    if (
      !isInterviewActiveRef.current ||
      isMutedRef.current ||
      isProcessingRef.current ||
      synthRef.current?.speaking
    ) {
      console.log("[Interview] Not starting recognition - conditions not met");
      return;
    }

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
    if (silenceDetectionIntervalRef.current) {
      clearInterval(silenceDetectionIntervalRef.current);
      silenceDetectionIntervalRef.current = null;
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
    if (isMutedRef.current) return;

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

      const response = await api.post("/api/interview/stt/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data = response.data;
      console.log("[Interview] STT backend response", data);

      const text = (data && data.text ? data.text : "").trim();
      if (!text) {
        console.warn("[Interview] STT returned empty text");
        if (isMounted.current) {
            setStatus("Error");
            isProcessingRef.current = false;
        }
        return;
      }

      // Show user's transcribed answer and continue interview as usual
      if (isMounted.current) {
          setConversation((prev) => [...prev, { role: "user", content: text }]);
          await handleSendToBackend(text);
      }
    } catch (err) {
      console.error("[Interview] STT API error", err);
      if (isMounted.current) {
          setStatus("Error");
          isProcessingRef.current = false;
      }
    }
  };

  const startRecordingTurn = () => {
    if (!mediaStreamRef.current) {
      console.warn("[Interview] No media stream available for recording");
      return;
    }
    if (!isInterviewActiveRef.current || isMutedRef.current) return;

    // Do not start recording if AI is speaking or processing
    if (isProcessingRef.current || synthRef.current?.speaking) {
      console.warn(
        "[Interview] Cannot start recording - AI is speaking or processing",
      );
      return;
    }

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

        // Stop silence detection
        if (silenceDetectionIntervalRef.current) {
          clearInterval(silenceDetectionIntervalRef.current);
          silenceDetectionIntervalRef.current = null;
        }

        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        audioChunksRef.current = [];

        if (isMutedRef.current) {
          console.log("[Interview] Recording stopped because of mute, discarding audio");
          setStatus("Muted");
          return;
        }

        // Only send if we have actual audio data
        if (blob.size > 0) {
          await sendRecordedAudioToBackend(blob);
        } else {
          console.warn("[Interview] No audio data recorded");
          isProcessingRef.current = false;
          setStatus("Listening");
          // Restart recording if still active
          if (isInterviewActiveRef.current && !isMutedRef.current) {
            setTimeout(() => startRecordingTurn(), 500);
          }
        }
      };

      recorder.start();
      setStatus("Listening");
      console.log("[Interview] Recording started with silence detection");

      // Initialize Web Audio API for silence detection
      if (!audioContextRef.current) {
        audioContextRef.current = new (
          window.AudioContext || window.webkitAudioContext
        )();
      }
      
      if (audioContextRef.current.state === "suspended") {
          audioContextRef.current.resume().catch(e => console.warn("AudioContext resume failed", e));
      }

      const audioContext = audioContextRef.current;
      const source = audioContext.createMediaStreamSource(
        mediaStreamRef.current,
      );
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      // Reset last sound time
      lastSoundTimeRef.current = Date.now();
      let hasSoundBeenDetected = false;

      // Check for silence every 100ms
      silenceDetectionIntervalRef.current = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);

        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;

        // Threshold for detecting sound (adjust if needed)
        const soundThreshold = 5; // Lower = more sensitive

        if (average > soundThreshold) {
          // Sound detected
          lastSoundTimeRef.current = Date.now();
          hasSoundBeenDetected = true;
        } else {
          // Silence detected
          const silenceDuration = Date.now() - lastSoundTimeRef.current;

          // If silence for 2 seconds AND we've detected sound before, stop recording
          if (silenceDuration > 2000 && hasSoundBeenDetected) {
            console.log(
              "[Interview] 2 seconds of silence detected, auto-stopping",
            );
            clearInterval(silenceDetectionIntervalRef.current);
            silenceDetectionIntervalRef.current = null;

            if (
              mediaRecorderRef.current &&
              mediaRecorderRef.current.state === "recording"
            ) {
              try {
                mediaRecorderRef.current.stop();
              } catch (e) {
                console.warn("[Interview] Auto-stop recording failed", e);
              }
            }
          }
        }
      }, 100);

      // Safety timeout: auto-stop after 30 seconds max
      if (recordingTimeoutRef.current)
        clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = setTimeout(() => {
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state === "recording"
        ) {
          console.log(
            "[Interview] Auto-stopping recording after 30 seconds max",
          );
          if (silenceDetectionIntervalRef.current) {
            clearInterval(silenceDetectionIntervalRef.current);
            silenceDetectionIntervalRef.current = null;
          }
          try {
            mediaRecorderRef.current.stop();
          } catch (e) {
            console.warn("[Interview] Auto-stop recording failed", e);
          }
        }
      }, 30000); // 30 seconds max
    } catch (e) {
      console.error("[Interview] Could not start recording:", e);
    }
  };

  const handleSendToBackend = async (message) => {
    if (!sessionId) return;
    if (isMutedRef.current && message !== "") return; // Allow initial greeting (empty msg) but block user speech if muted.

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
      const response = await api.post("/api/interview/", {
        message: message,
        session_id: sessionId,
        interview_type: selectedInterviewType,
        duration: selectedDuration,
      });
      const data = response.data;
      console.log("[Interview] backend response", data);

      if (data && data.ai_response) {
        const aiText = data.ai_response;
        if (isMounted.current) {
            setConversation((prev) => [...prev, { role: "ai", content: aiText }]);
            setAiTranscript(aiText);
        }

        // Use browser TTS
        await speakResponse(aiText);
      } else {
        console.error("Unexpected backend response", data);
        if (isMounted.current) {
            setStatus("Error");
            isProcessingRef.current = false;
            if (isInterviewActiveRef.current && !isMutedRef.current)
              startRecordingTurn();
        }
      }
    } catch (err) {
      console.error("Interview API error", err);
      if (isMounted.current) {
          setStatus("Error");
          isProcessingRef.current = false;
          if (isInterviewActiveRef.current && !isMutedRef.current)
            startRecordingTurn();
      }
    } finally {
      // Clear any user interim
      if (isMounted.current) setUserTranscript("");
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
        console.log("[Interview] Audio playback ended");
        isProcessingRef.current = false;
        setStatus(isMutedRef.current ? "Muted" : "Listening");
        // Resume recording after a 1 second pause to ensure audio has fully finished
        if (isInterviewActive && !isMutedRef.current) {
          setTimeout(() => {
            console.log("[Interview] Starting recording after audio playback");
            startRecordingTurn();
          }, 1000); // 1 second delay
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
        console.log("[Interview] AI finished speaking");
        isProcessingRef.current = false;
        setStatus(isMutedRef.current ? "Muted" : "Listening");
        // Resume recording after a 1 second pause to ensure AI has fully finished
        if (isInterviewActiveRef.current && !isMutedRef.current) {
          setTimeout(() => {
            console.log("[Interview] Starting recording after AI speech");
            startRecordingTurn();
          }, 1000); // 1 second delay
        }
        resolve();
      };

      utter.onerror = (e) => {
        console.warn("[Interview] TTS error:", e);
        isProcessingRef.current = false;
        setStatus("Listening");
        if (isInterviewActiveRef.current && !isMutedRef.current) {
          setTimeout(() => {
            console.log("[Interview] Starting recording after TTS error");
            startRecordingTurn();
          }, 1000); // 1 second delay
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
      isMutedRef.current = next; // Immediate update!
      
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
    <div className="flex flex-col h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-black dark:via-gray-900 dark:to-black text-white font-sans overflow-hidden items-center justify-center relative transition-colors duration-300">
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

      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center bg-gray-900/50 dark:bg-black/50 backdrop-blur-md z-10 border-b border-white/10 dark:border-white/5 transition-colors duration-300">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${isInterviewActive ? "bg-green-400 animate-pulse" : "bg-red-500 animate-pulse"}`}
            ></div>
            <span className="text-sm font-medium tracking-wide text-gray-300">
              {selectedInterviewType === "technical"
                ? "Technical"
                : "Resume CV"}{" "}
              Interview Session
            </span>
          </div>
        </div>

        {/* Right side: Timer + ThemeToggle + Session ID */}
        <div className="flex items-center space-x-3">
          {/* Countdown Timer */}
          {isInterviewActive && timeRemaining > 0 && (
            <div className="flex items-center space-x-2 bg-indigo-500/20 px-4 py-2 rounded-lg border border-indigo-500/30">
              <svg
                className="w-4 h-4 text-indigo-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span
                className={`text-base font-mono font-bold ${timeRemaining <= 60 ? "text-red-400" : "text-indigo-300"}`}
              >
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}

          <ThemeToggle />
          <div className="text-xs text-gray-500">{sessionId}</div>
        </div>
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
                    { icon: "", text: "Real-time feedback" },
                    { icon: "", text: "Instant scoring" },
                    { icon: "", text: "Detailed report" },
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

            {/* Resume CV Interview Card */}
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
                  Resume CV Interview
                </h3>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Practice questions tailored to your resume, job role, and
                  technical background with personalized AI analysis.
                </p>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {[
                    { icon: "", text: "AI behavior analysis" },
                    { icon: "", text: "Skill matching" },
                    { icon: "", text: "Communication insights" },
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
                    console.log("[DEBUG] Resume CV button clicked");
                    setSelectedInterviewType("behavioral");
                    setShowDurationModal(true);
                    console.log("[DEBUG] Modal state set to true");
                  }}
                  className="w-full px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 rounded-xl font-semibold text-white shadow-lg hover:shadow-pink-500/50 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  Start Resume CV Interview
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
                WARNING: Microphone access denied. Please enable it in browser
                settings.
              </div>
            )}
            {micPermission === "granted" && (
              <div className="px-6 py-3 bg-green-500/20 border border-green-500/50 rounded-xl text-green-300">
                Microphone ready
              </div>
            )}
            {!micPermission && (
              <p className="text-gray-400 text-sm">
                Microphone permission will be requested when you start
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
                  ? "LISTENING..."
                  : status === "AI Speaking"
                    ? "INTERVIEWER SPEAKING"
                    : status === "Processing"
                      ? "PROCESSING..."
                      : status === "Muted"
                        ? "MUTED"
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

            {/* Interview Transcript */}
            <div className="mt-8 w-full max-w-4xl px-4">
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg border border-gray-700/50 p-6 max-h-96 overflow-y-auto">
                <h3 className="text-lg font-semibold text-gray-200 mb-4 border-b border-gray-700 pb-2">
                  Interview Transcript
                </h3>
                <div className="space-y-4">
                  {conversation.length === 0 && !userTranscript && (
                    <p className="text-gray-500 text-center text-sm italic">
                      Your conversation will appear here...
                    </p>
                  )}
                  {conversation.map((msg, idx) => (
                    <div
                      key={idx}
                      className="py-2 border-b border-gray-700/30 last:border-0"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex-shrink-0 w-20 text-xs font-semibold ${
                            msg.role === "user"
                              ? "text-green-400"
                              : "text-blue-400"
                          }`}
                        >
                          {msg.role === "user" ? "You:" : "Interviewer:"}
                        </div>
                        <div className="flex-1 text-sm text-gray-300 leading-relaxed">
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* User is currently speaking (interim) */}
                  {userTranscript && (
                    <div className="py-2 border-t border-yellow-700/30">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-20 text-xs font-semibold text-yellow-400 flex items-center">
                          <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 animate-pulse mr-1"></span>
                          You:
                        </div>
                        <div className="flex-1 text-sm text-yellow-200/80 leading-relaxed italic">
                          {userTranscript}
                        </div>
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
                    Speak now...
                  </p>
                )}
                {status === "Processing" && (
                  <p className="text-yellow-400 text-sm">
                    Processing your response...
                  </p>
                )}
                {status === "AI Speaking" && (
                  <p className="text-blue-400 text-sm">
                    Interviewer is responding...
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
                  { minutes: 2, label: "Quick", icon: "" },
                  { minutes: 10, label: "Short", icon: "" },
                  { minutes: 15, label: "Standard", icon: "" },
                  { minutes: 30, label: "Extended", icon: "" },
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
                    <div className="text-3xl font-bold text-white mb-2">
                      {option.minutes}
                      <span className="text-sm ml-1">min</span>
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

      {/* Final Results Modal */}
      <AnimatePresence>
        {showFinalResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-gray-900/95 backdrop-blur-2xl rounded-3xl p-8 max-w-3xl w-full border border-white/20 shadow-2xl max-h-[92vh] overflow-y-auto"
            >
              {/* ── Header ─────────────────────────────────────── */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold mb-1 text-white">
                  Interview Completed
                </h2>
                <p className="text-gray-400 text-sm">
                  {selectedInterviewType === "technical"
                    ? "Technical"
                    : "Resume CV"}{" "}
                  Interview · {selectedDuration} min
                </p>
              </div>

              {/* ── Stats Row ───────────────────────────────────── */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  {
                    value: selectedDuration,
                    label: "Minutes",
                    color: "text-indigo-400",
                  },
                  {
                    value: conversation.filter((m) => m.role === "user").length,
                    label: "Responses",
                    color: "text-purple-400",
                  },
                  {
                    value: conversation.filter((m) => m.role === "ai").length,
                    label: "Questions",
                    color: "text-pink-400",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="bg-white/5 rounded-xl p-4 border border-white/10 text-center"
                  >
                    <div className={`text-2xl font-bold ${s.color} mb-1`}>
                      {s.value}
                    </div>
                    <div className="text-xs text-gray-400">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* ── Analysis Loading / Results ───────────────────── */}
              {isAnalyzing ? (
                <div className="bg-white/5 rounded-2xl p-10 border border-white/10 mb-6 flex flex-col items-center gap-4">
                  <div className="w-12 h-12 rounded-full border-4 border-indigo-500/40 border-t-indigo-500 animate-spin" />
                  <p className="text-gray-300 text-sm font-medium">
                    Analyzing your interview with AI…
                  </p>
                  <p className="text-gray-500 text-xs">
                    Detecting tone, scoring responses, generating feedback
                  </p>
                </div>
              ) : analysisData ? (
                <>
                  {/* ── Overall Score ─────────────────────────────── */}
                  <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-2xl p-6 border border-indigo-500/20 mb-6 flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-5xl font-black text-white">
                        {analysisData.overall_score}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">/ 100</div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-gray-200">
                          Overall Score
                        </span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            analysisData.overall_score >= 80
                              ? "bg-green-500/20 text-green-400"
                              : analysisData.overall_score >= 60
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {analysisData.overall_score >= 80
                            ? "Excellent"
                            : analysisData.overall_score >= 60
                              ? "Good"
                              : "Needs Work"}
                        </span>
                      </div>
                      <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${analysisData.overall_score}%` }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ── Tone & Emotion Analysis ──────────────────── */}
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-6">
                    <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-4 flex items-center gap-2">
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
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                      Tone &amp; Emotion Analysis
                    </h3>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-black/20 rounded-xl p-4 text-center">
                        <div className="text-xs text-gray-500 mb-2">
                          Dominant Tone
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-bold capitalize ${
                            {
                              confident: "bg-green-500/20 text-green-400",
                              nervous: "bg-orange-500/20 text-orange-400",
                              enthusiastic: "bg-violet-500/20 text-violet-400",
                              hesitant: "bg-orange-400/20 text-orange-300",
                              calm: "bg-blue-500/20 text-blue-400",
                              assertive: "bg-emerald-500/20 text-emerald-400",
                            }[analysisData.tone_analysis?.dominant_tone] ||
                            "bg-gray-700 text-gray-300"
                          }`}
                        >
                          {analysisData.tone_analysis?.dominant_tone || "calm"}
                        </span>
                      </div>
                      <div className="bg-black/20 rounded-xl p-4 text-center">
                        <div className="text-xs text-gray-500 mb-2">
                          Confidence
                        </div>
                        <div className="text-2xl font-black text-indigo-400">
                          {analysisData.tone_analysis?.confidence_score}
                          <span className="text-sm text-gray-500">/100</span>
                        </div>
                      </div>
                      <div className="bg-black/20 rounded-xl p-4 text-center">
                        <div className="text-xs text-gray-500 mb-2">
                          Sentiment
                        </div>
                        <div
                          className={`text-sm font-bold capitalize ${
                            analysisData.tone_analysis?.sentiment === "positive"
                              ? "text-green-400"
                              : analysisData.tone_analysis?.sentiment ===
                                  "negative"
                                ? "text-red-400"
                                : "text-gray-300"
                          }`}
                        >
                          {analysisData.tone_analysis?.sentiment || "neutral"}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(analysisData.tone_analysis?.tone_tags || []).map(
                        (tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 rounded-full bg-indigo-900/40 border border-indigo-500/30 text-indigo-300 text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ),
                      )}
                    </div>
                  </div>

                  {/* ── Skill Scores ─────────────────────────────── */}
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-6">
                    <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-4">
                      Skill Breakdown
                    </h3>
                    <div className="space-y-4">
                      {[
                        [
                          "Communication",
                          analysisData.skill_scores?.communication,
                        ],
                        [
                          "Response Quality",
                          analysisData.skill_scores?.response_quality,
                        ],
                        ["Engagement", analysisData.skill_scores?.engagement],
                        selectedInterviewType === "technical"
                          ? [
                              "Technical Depth",
                              analysisData.skill_scores?.technical_depth,
                            ]
                          : [
                              "Empathy & Self-Awareness",
                              analysisData.skill_scores
                                ?.empathy_and_self_awareness,
                            ],
                      ].map(([label, val]) => (
                        <div key={label}>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-sm text-gray-300">
                              {label}
                            </span>
                            <span
                              className={`text-xs font-bold ${
                                val >= 80
                                  ? "text-green-400"
                                  : val >= 60
                                    ? "text-yellow-400"
                                    : "text-red-400"
                              }`}
                            >
                              {val ?? 0}%
                            </span>
                          </div>
                          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${val ?? 0}%` }}
                              transition={{
                                duration: 1,
                                ease: "easeOut",
                                delay: 0.2,
                              }}
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── Strengths + Improvements (side by side) ───── */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/5 rounded-2xl p-5 border border-green-500/20">
                      <h3 className="text-sm font-bold text-green-400 uppercase tracking-wider mb-3">
                        ✓ Strengths
                      </h3>
                      <ul className="space-y-2">
                        {(analysisData.strengths || []).map((s, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-gray-300"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0 mt-1.5" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-5 border border-yellow-500/20">
                      <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-wider mb-3">
                        △ Areas to Improve
                      </h3>
                      <ul className="space-y-2">
                        {(analysisData.improvements || []).map((s, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-gray-300"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0 mt-1.5" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* ── Personalized Feedback ────────────────────── */}
                  <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-2xl p-5 border border-indigo-500/20 mb-6">
                    <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider mb-3">
                      AI Feedback
                    </h3>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {analysisData.detailed_feedback}
                    </p>
                  </div>
                </>
              ) : (
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-6 text-center text-gray-500 text-sm">
                  Analysis unavailable — no conversation data found.
                </div>
              )}

              {/* ── Full Transcript (collapsible) ─────────────────── */}
              <details className="mb-6 group">
                <summary className="cursor-pointer bg-white/5 rounded-xl px-5 py-3 border border-white/10 text-sm font-semibold text-gray-300 flex items-center justify-between list-none">
                  <span>Full Transcript ({conversation.length} messages)</span>
                  <svg
                    className="w-4 h-4 transition-transform group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <div className="mt-2 bg-white/5 rounded-xl p-5 border border-white/10 max-h-72 overflow-y-auto space-y-3 text-sm">
                  {conversation.map((msg, idx) => (
                    <div
                      key={idx}
                      className="pb-2 border-b border-gray-700/30 last:border-0"
                    >
                      <div
                        className={`font-semibold text-xs mb-1 ${msg.role === "user" ? "text-green-400" : "text-blue-400"}`}
                      >
                        {msg.role === "user" ? "You" : "Interviewer"}
                      </div>
                      <div className="text-gray-300 leading-relaxed">
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
              </details>

              {/* ── Action Buttons ──────────────────────────────── */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    setShowFinalResults(false);
                    setInterviewCompleted(false);
                    setConversation([]);
                    setSelectedInterviewType(null);
                    setSelectedDuration(null);
                    setAnalysisData(null);
                  }}
                  className="flex-1 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl font-semibold text-white shadow-lg hover:shadow-indigo-500/40 transition-all duration-300 text-sm"
                >
                  New Interview
                </button>
                <button
                  disabled={!analysisData || isAnalyzing}
                  onClick={downloadReport}
                  className={`flex-1 px-5 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                    analysisData && !isAnalyzing
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg hover:shadow-emerald-500/40"
                      : "bg-gray-700 text-gray-500 cursor-not-allowed"
                  }`}
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
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download Report
                </button>
                <button
                  onClick={() => navigate("/interview-history")}
                  className="flex-1 px-5 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium text-white border border-white/20 transition-all duration-300 text-sm"
                >
                  View History
                </button>
                <button
                  onClick={() => navigate("/home")}
                  className="flex-1 px-5 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium text-white border border-white/20 transition-all duration-300 text-sm"
                >
                  Dashboard
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
