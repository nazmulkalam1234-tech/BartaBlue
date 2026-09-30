import React, { useState, useEffect, useRef } from 'react';
import { Mic, Trash2, Send, Pause, Play, Disc } from 'lucide-react';

interface VoiceRecorderProps {
  onSendVoice: (duration: number, audioUrl?: string) => void;
  onCancel: () => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onSendVoice, onCancel }) => {
  const [seconds, setSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Attempt real browser MediaStream recording
    let localStream: MediaStream | null = null;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          localStream = stream;
          const recorder = new MediaRecorder(stream);
          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              audioChunksRef.current.push(e.data);
            }
          };
          recorder.start();
          setMediaRecorder(recorder);
        })
        .catch(() => {
          // Fallback simulation mode works silently without blocking
        });
    }

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!isPaused) {
      timerRef.current = window.setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  const handleSend = () => {
    const recordedDuration = Math.max(1, seconds);
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      try {
        mediaRecorder.stop();
      } catch {
        // Ignore
      }
    }
    onSendVoice(recordedDuration);
  };

  const handleCancel = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      try {
        mediaRecorder.stop();
      } catch {
        // Ignore
      }
    }
    onCancel();
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    return `${mins}:${remainingSec < 10 ? '0' : ''}${remainingSec}`;
  };

  return (
    <div className="flex items-center gap-3 w-full bg-slate-900/95 border border-blue-500/30 rounded-2xl px-4 py-2.5 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* Delete / Cancel button */}
      <button
        type="button"
        onClick={handleCancel}
        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
        title="Discard voice recording"
      >
        <Trash2 size={18} />
      </button>

      {/* Recording status with pulsing indicator */}
      <div className="flex items-center gap-2.5">
        <span className="relative flex h-3 w-3">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isPaused ? 'bg-amber-400' : 'bg-red-400'} opacity-75`}></span>
          <span className={`relative inline-flex rounded-full h-3 w-3 ${isPaused ? 'bg-amber-500' : 'bg-red-500'}`}></span>
        </span>
        <span className="font-mono text-sm font-semibold tracking-wider text-slate-200 min-w-[42px]">
          {formatTimer(seconds)}
        </span>
      </div>

      {/* Animated audio waves */}
      <div className="flex-1 flex items-center justify-center gap-1 h-7 px-2 overflow-hidden">
        {[8, 16, 24, 12, 28, 18, 10, 22, 14, 26, 8, 20, 15, 25, 12, 18, 22, 14, 26, 9].map((h, i) => (
          <span
            key={i}
            style={{
              height: isPaused ? '4px' : `${h}px`,
              animationDelay: `${(i % 5) * 0.15}s`,
            }}
            className={`w-1 rounded-full transition-all duration-300 ${
              isPaused ? 'bg-slate-600' : 'bg-blue-500 animate-pulse'
            }`}
          />
        ))}
      </div>

      <div className="text-[11px] text-blue-400 hidden sm:flex items-center gap-1 font-medium">
        <Disc size={12} className="animate-spin" />
        <span>Voice Note</span>
      </div>

      {/* Pause / Resume */}
      <button
        type="button"
        onClick={() => setIsPaused(!isPaused)}
        className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
        title={isPaused ? 'Resume' : 'Pause'}
      >
        {isPaused ? <Play size={18} /> : <Pause size={18} />}
      </button>

      {/* Send voice button */}
      <button
        type="button"
        onClick={handleSend}
        className="p-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center"
        title="Send voice note"
      >
        <Send size={18} />
      </button>
    </div>
  );
};
