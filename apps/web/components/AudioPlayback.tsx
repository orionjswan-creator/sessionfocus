"use client";

import { useEffect, useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import { Button } from "./Button";
import { createAudioUrl } from "@/lib/audioStorage";

export function AudioPlayback({ sessionId, chunkCount }: { sessionId: string; chunkCount: number }) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioSize, setAudioSize] = useState(0);
  const [audioType, setAudioType] = useState("audio/webm");
  const [status, setStatus] = useState("No recorded audio loaded");

  useEffect(() => {
    void loadAudio();
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, chunkCount]);

  async function loadAudio() {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    const audio = await createAudioUrl(sessionId);
    if (!audio) {
      setAudioUrl(null);
      setAudioSize(0);
      setStatus("No recorded audio chunks found for this session");
      return;
    }
    setAudioUrl(audio.url);
    setAudioType(audio.type);
    setAudioSize(audio.size);
    setStatus(`Loaded ${chunkCount} chunk${chunkCount === 1 ? "" : "s"} (${formatBytes(audio.size)})`);
  }

  function downloadAudio() {
    if (!audioUrl) return;
    const anchor = document.createElement("a");
    anchor.href = audioUrl;
    anchor.download = `sessionfocus-${sessionId}.webm`;
    anchor.click();
  }

  return (
    <div className="rounded-md border border-moss/15 bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold">Audio Playback</h3>
          <p className="mt-1 text-xs text-ink/60">{status}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" className="px-3" onClick={loadAudio}>
            <RefreshCw size={15} aria-hidden />
            Reload
          </Button>
          <Button variant="secondary" className="px-3" onClick={downloadAudio} disabled={!audioUrl}>
            <Download size={15} aria-hidden />
            Download
          </Button>
        </div>
      </div>
      {audioUrl ? (
        <audio className="w-full" controls src={audioUrl}>
          <track kind="captions" />
        </audio>
      ) : (
        <p className="rounded-md border border-dashed border-moss/25 p-4 text-sm text-ink/60">
          Record audio on the Live screen, end the session, then return here to play it back.
        </p>
      )}
      <p className="mt-2 text-xs text-ink/50">
        Stored as {audioType}; {audioSize ? formatBytes(audioSize) : "0 B"} currently available in this browser.
      </p>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
