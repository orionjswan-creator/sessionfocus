"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Pause, Play, ShieldCheck, Square } from "lucide-react";
import { Button } from "./Button";
import { formatClock } from "@/lib/time";

type RecorderState = "idle" | "recording" | "paused" | "ended";
type MicPermissionState = "checking" | "ready" | "prompt" | "blocked" | "unsupported";

export type SpeechResult = {
  text: string;
  isFinal: boolean;
  confidence: number;
  elapsedSeconds: number;
};

type AudioRecorderProps = {
  onChunk: (chunk: Blob) => void;
  onSpeechResult: (result: SpeechResult) => void;
  onEnd: () => void;
  onStateChange?: (state: RecorderState) => void;
};

type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      length: number;
      [index: number]: {
        transcript: string;
        confidence: number;
      };
    };
  };
};

declare global {
  interface Window {
    SpeechRecognition?: new () => BrowserSpeechRecognition;
    webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
  }
}

export function AudioRecorder({ onChunk, onSpeechResult, onEnd, onStateChange }: AudioRecorderProps) {
  const [state, setState] = useState<RecorderState>("idle");
  const [seconds, setSeconds] = useState(0);
  const [micStatus, setMicStatus] = useState("Not requested");
  const [speechStatus, setSpeechStatus] = useState("Real transcript not started");
  const [micPermission, setMicPermission] = useState<MicPermissionState>("checking");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const speechRef = useRef<BrowserSpeechRecognition | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startedAtRef = useRef<number>(0);
  const recordingRef = useRef(false);

  useEffect(() => {
    onStateChange?.(state);
  }, [onStateChange, state]);

  useEffect(() => {
    void refreshPermissionStatus();
  }, []);

  useEffect(() => {
    if (state !== "recording") return;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [state]);

  async function start() {
    if (!window.navigator?.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setMicPermission("unsupported");
      setMicStatus("Unavailable in this browser");
      return;
    }

    setMicStatus("Requesting microphone");
    try {
      const stream = await window.navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) onChunk(event.data);
      };
      recorder.start(5000);
      setState("recording");
      recordingRef.current = true;
      setSeconds(0);
      startedAtRef.current = Date.now();
      setMicPermission("ready");
      setMicStatus("Microphone recording");
      startSpeechRecognition();
    } catch {
      setMicStatus("Microphone blocked");
      setSpeechStatus("Microphone permission is required before recording can start");
      setMicPermission("blocked");
      recordingRef.current = false;
      setState("idle");
    }
  }

  async function refreshPermissionStatus() {
    if (!window.navigator?.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setMicPermission("unsupported");
      setMicStatus("Unavailable in this browser");
      setSpeechStatus("Audio recording requires microphone capture and MediaRecorder support");
      return;
    }

    const hasSpeech = Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition);
    setSpeechStatus(hasSpeech ? "Ready" : "Live transcript unavailable here; audio recording can still run");

    try {
      const permissions = window.navigator.permissions;
      if (!permissions?.query) {
        setMicPermission("prompt");
        setMicStatus("Permission can be requested");
        return;
      }
      const status = await permissions.query({ name: "microphone" as PermissionName });
      applyPermissionState(status.state);
      status.onchange = () => applyPermissionState(status.state);
    } catch {
      setMicPermission("prompt");
      setMicStatus("Permission can be requested");
    }
  }

  function applyPermissionState(stateName: PermissionState) {
    if (stateName === "granted") {
      setMicPermission("ready");
      setMicStatus("Ready");
    } else if (stateName === "denied") {
      setMicPermission("blocked");
      setMicStatus("Blocked by browser");
    } else {
      setMicPermission("prompt");
      setMicStatus("Permission can be requested");
    }
  }

  async function requestMicrophoneAccess() {
    if (!window.navigator?.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setMicPermission("unsupported");
      setMicStatus("Unavailable in this browser");
      return;
    }
    setMicStatus("Requesting permission");
    try {
      const stream = await window.navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setMicPermission("ready");
      setMicStatus("Ready");
      await refreshPermissionStatus();
    } catch (error) {
      setMicPermission("blocked");
      setMicStatus(error instanceof DOMException && error.name === "NotAllowedError" ? "Permission denied" : "Request failed");
      setSpeechStatus("Microphone access is required before recording can start");
    }
  }

  function startSpeechRecognition() {
    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Recognition) {
      setSpeechStatus("Audio is recording. Live transcript requires a real STT provider for this browser.");
      return;
    }

    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const alternative = result[0];
        const text = alternative.transcript.trim();
        if (!text) continue;
        onSpeechResult({
          text,
          isFinal: result.isFinal,
          confidence: alternative.confidence || 0.75,
          elapsedSeconds: Math.max(0, Math.floor((Date.now() - startedAtRef.current) / 1000))
        });
      }
    };
    recognition.onerror = () => setSpeechStatus("Speech recognition had an error; audio chunks are still recording");
    recognition.onend = () => {
      if (recordingRef.current) {
        try {
          recognition.start();
        } catch {
          setSpeechStatus("Speech recognition stopped");
        }
      }
    };
    speechRef.current = recognition;
    try {
      recognition.start();
      setSpeechStatus("Real browser speech transcript active");
    } catch {
      setSpeechStatus("Speech recognition could not start");
    }
  }

  function pause() {
    recorderRef.current?.pause();
    speechRef.current?.stop();
    recordingRef.current = false;
    setState("paused");
  }

  function resume() {
    recorderRef.current?.resume();
    recordingRef.current = true;
    startSpeechRecognition();
    setState("recording");
  }

  function end() {
    recordingRef.current = false;
    speechRef.current?.abort();
    recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    setState("ended");
    setMicStatus("Ended");
    setSpeechStatus("Ended");
    onEnd();
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-md border border-moss/15 bg-white p-3">
          <p className="text-xs text-ink/60">Timer</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{formatClock(seconds)}</p>
        </div>
        <div className="rounded-md border border-moss/15 bg-white p-3">
          <p className="text-xs text-ink/60">Microphone</p>
          <p className="mt-1 text-sm font-medium">{micStatus}</p>
        </div>
        <div className="rounded-md border border-moss/15 bg-white p-3">
          <p className="text-xs text-ink/60">Streaming</p>
          <p className="mt-1 text-sm font-medium">{state === "recording" ? "Audio chunks every 5s" : "Idle"}</p>
        </div>
      </div>

      <div className="rounded-md border border-moss/15 bg-white p-3">
        <p className="text-xs text-ink/60">Live transcript source</p>
        <p className="mt-1 text-sm font-medium">{speechStatus}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={requestMicrophoneAccess} disabled={state === "recording"}>
          <ShieldCheck size={16} aria-hidden />
          Request Microphone Access
        </Button>
        <Button
          onClick={start}
          disabled={micPermission === "unsupported" || state === "recording" || state === "paused"}
        >
          <Mic size={16} aria-hidden />
          Start Recording
        </Button>
        <Button variant="secondary" onClick={pause} disabled={state !== "recording"}>
          <Pause size={16} aria-hidden />
          Pause
        </Button>
        <Button variant="secondary" onClick={resume} disabled={state !== "paused"}>
          <Play size={16} aria-hidden />
          Resume
        </Button>
        <Button variant="danger" onClick={end} disabled={state === "idle" || state === "ended"}>
          <Square size={16} aria-hidden />
          End Session
        </Button>
      </div>
      {micPermission === "blocked" ? (
        <p className="text-sm leading-6 text-clay">
          Microphone access is blocked for this site. Use the browser permission icon near the address bar to allow
          microphone access, then press Request Microphone Access again.
        </p>
      ) : null}
    </div>
  );
}
