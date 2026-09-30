import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, FileText, Sparkles, Check } from 'lucide-react';

interface VoicePlayerProps {
  duration?: number;
  isCurrentUser?: boolean;
  transcription?: string;
  onOpenPlusModal?: () => void;
  isPlusUser?: boolean;
}

export const VoicePlayer: React.FC<VoicePlayerProps> = ({
  duration = 24,
  isCurrentUser = false,
  transcription,
  onOpenPlusModal,
  isPlusUser = true,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showTranscription, setShowTranscription] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const timerRef = useRef<number | null>(null);

  const defaultTranscription =
    transcription ||
    (isCurrentUser
      ? 'Hey, the new WebRTC audio codecs and encrypted attachments are fully synchronized on desktop and mobile.'
      : 'I tested the end-to-end encryption handshake and the audio pipeline — latency is under 15ms!');

  // Generate pseudo-random waveform bars that stay constant
  const bars = [
    20, 45, 80, 60, 30, 90, 75, 40, 60, 100, 85, 50, 35, 70, 95, 60, 40, 85, 70, 50, 30, 65, 90, 40, 25
  ];

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const cycleSpeed = () => {
    if (playbackSpeed === 1) setPlaybackSpeed(1.5);
    else if (playbackSpeed === 1.5) setPlaybackSpeed(2);
    else setPlaybackSpeed(1);
  };

  const handleTranscribeToggle = () => {
    if (!showTranscription) {
      setIsTranscribing(true);
      setTimeout(() => {
        setIsTranscribing(false);
        setShowTranscription(true);
      }, 600);
    } else {
      setShowTranscription(false);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      const stepTime = 100 / (duration * 10 * playbackSpeed);
      timerRef.current = window.setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, duration, playbackSpeed]);

  const currentSeconds = Math.floor((progress / 100) * duration);
  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex flex-col gap-2 min-w-[240px] sm:min-w-[290px] py-1">
      <div className="flex items-center gap-3 px-1">
        <button
          onClick={togglePlay}
          type="button"
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md shrink-0 ${
            isCurrentUser
              ? 'bg-white text-blue-600 hover:bg-blue-50'
              : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/25'
          }`}
          title={isPlaying ? 'Pause' : 'Play audio note'}
        >
          {isPlaying ? <Pause size={18} className="fill-current" /> : <Play size={18} className="fill-current ml-0.5" />}
        </button>

        <div className="flex-1 flex flex-col justify-center gap-1.5">
          {/* Waveform bars */}
          <div
            className="flex items-center gap-[3px] h-8 cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const newProgress = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
              setProgress(newProgress);
            }}
          >
            {bars.map((height, i) => {
              const barProgress = (i / bars.length) * 100;
              const isPlayed = barProgress <= progress;
              return (
                <span
                  key={i}
                  style={{ height: `${Math.max(6, (height / 100) * 28)}px` }}
                  className={`w-1 rounded-full transition-colors duration-150 ${
                    isPlayed
                      ? isCurrentUser
                        ? 'bg-white'
                        : 'bg-blue-500'
                      : isCurrentUser
                      ? 'bg-blue-300/40'
                      : 'bg-slate-600/50'
                  }`}
                />
              );
            })}
          </div>

          {/* Time and metadata */}
          <div className="flex items-center justify-between text-[11px] font-mono opacity-80">
            <span>{isPlaying ? formatTime(currentSeconds) : formatTime(duration)}</span>
            <div className="flex items-center gap-1.5">
              {/* Transcribe Button */}
              <button
                onClick={handleTranscribeToggle}
                type="button"
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 transition-all ${
                  showTranscription
                    ? isCurrentUser
                      ? 'bg-white text-blue-900 font-bold'
                      : 'bg-blue-500 text-white font-bold'
                    : isCurrentUser
                    ? 'bg-blue-700/60 hover:bg-blue-800 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                }`}
                title="Transcribe voice to text"
              >
                <Sparkles size={10} className="text-amber-300" />
                <span>{isTranscribing ? 'Transcribing...' : showTranscription ? 'Hide Text' : 'Transcribe'}</span>
              </button>

              <Volume2 size={12} />
              <button
                onClick={cycleSpeed}
                type="button"
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-sans transition-all ${
                  isCurrentUser
                    ? 'bg-blue-700/60 hover:bg-blue-800 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                }`}
                title="Change audio playback speed"
              >
                {playbackSpeed}x
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Voice-to-Text Transcription Card */}
      {showTranscription && (
        <div
          className={`p-2.5 rounded-xl text-xs leading-relaxed border transition-all animate-in fade-in duration-200 ${
            isCurrentUser
              ? 'bg-blue-700/40 border-blue-400/30 text-white'
              : 'bg-slate-900/90 border-slate-700/70 text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] opacity-75 font-mono mb-1">
            <span className="flex items-center gap-1">
              <Sparkles size={10} className="text-amber-300" />
              <span>Voice-to-Text Transcription</span>
            </span>
            <span className="text-emerald-400 font-bold">99.4% Match</span>
          </div>
          <p className="italic font-sans">"{defaultTranscription}"</p>
        </div>
      )}
    </div>
  );
};

