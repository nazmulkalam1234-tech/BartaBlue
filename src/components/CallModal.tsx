import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MonitorUp,
  Volume2,
  VolumeX,
  Lock,
  Maximize2,
  Minimize2,
  Sparkles,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { ActiveCall } from '../types';
import { soundEffects } from '../services/soundEffects';

interface CallModalProps {
  call: ActiveCall;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({
  call,
  onEndCall,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
}) => {
  const [duration, setDuration] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [is4KQuality, setIs4KQuality] = useState(call.is4KQuality ?? true);
  const [status, setStatus] = useState<'calling' | 'ringing' | 'connected' | 'ended'>(call.status);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Sound effects on call start and timer increment
  useEffect(() => {
    let cancelRing: (() => void) | undefined;
    if (status === 'calling' || status === 'ringing') {
      cancelRing = soundEffects.playCallRingTone();
      const timer = setTimeout(() => {
        setStatus('connected');
        if (cancelRing) cancelRing();
      }, 3200);
      return () => {
        clearTimeout(timer);
        if (cancelRing) cancelRing();
      };
    }
  }, [status]);

  // Duration timer
  useEffect(() => {
    if (status === 'connected') {
      const interval = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status]);

  // Camera stream attachment if video is enabled
  useEffect(() => {
    if (call.type === 'video' && call.isVideoEnabled) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: true })
          .then((stream) => {
            localStreamRef.current = stream;
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
            }
          })
          .catch(() => {
            // Simulated video fallback
          });
      }
    } else {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
    }

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [call.type, call.isVideoEnabled]);

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleEnd = () => {
    soundEffects.playCallEndTone();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    onEndCall();
  };

  // Minimized Floating Widget
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 border border-blue-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex items-center gap-4 animate-in fade-in duration-200">
        <div className="relative">
          <img
            src={call.peer.avatar}
            alt={call.peer.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
          />
          <span className="absolute -bottom-1 -right-1 bg-green-500 w-3.5 h-3.5 rounded-full border-2 border-slate-900" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-white truncate max-w-[140px]">{call.peer.name}</span>
          <span className="text-xs text-blue-400 font-mono">
            {status === 'connected' ? formatDuration(duration) : 'Connecting...'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMute}
            className={`p-2 rounded-xl text-xs ${call.isMuted ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-300'}`}
          >
            {call.isMuted ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
          <button
            onClick={() => setIsMinimized(false)}
            className="p-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl"
            title="Maximize call"
          >
            <Maximize2 size={16} />
          </button>
          <button
            onClick={handleEnd}
            className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-lg shadow-red-600/30"
            title="End call"
          >
            <PhoneOff size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[90vh] max-h-[750px] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between">
        {/* Top Header Bar */}
        <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-slate-950/80 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-700/50">
              <Lock size={13} className="text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400">256-bit E2EE Verified Call</span>
            </div>

            <button
              onClick={() => setIs4KQuality(!is4KQuality)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all backdrop-blur-md border ${
                is4KQuality
                  ? 'bg-amber-400/20 border-amber-400/50 text-amber-300 shadow-md shadow-amber-400/20'
                  : 'bg-slate-900/80 border-slate-700 text-slate-400'
              }`}
              title="Toggle 4K Ultra-HD Quality (BartaBlue Plus Feature)"
            >
              <Sparkles size={12} className="text-amber-300" />
              <span>{is4KQuality ? '4K Ultra-HD Active' : 'HD 1080p'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl backdrop-blur-sm transition-all"
              title="Minimize to Picture-in-Picture"
            >
              <Minimize2 size={18} />
            </button>
          </div>
        </div>

        {/* Call Center Stage */}
        <div className="relative flex-1 flex flex-col items-center justify-center p-6 overflow-hidden">
          {call.type === 'video' ? (
            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center">
              {/* Peer simulated main video */}
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={call.peer.avatar}
                  alt={call.peer.name}
                  className="w-full h-full object-cover filter brightness-75 scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40" />

                {/* Peer floating video overlay details */}
                <div className="absolute bottom-6 left-6 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-900/70 backdrop-blur-md border border-slate-700/60 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-sm font-semibold text-white">{call.peer.name}</span>
                    <span className="text-xs text-blue-300 font-mono">1080p 60fps</span>
                  </div>
                </div>

                {/* Simulated WebRTC Audio Indicator */}
                <div className="absolute bottom-6 right-6 flex items-center gap-1.5 p-2 bg-slate-900/70 backdrop-blur-md rounded-xl border border-slate-700/60">
                  <span className="w-1 h-3 bg-emerald-400 rounded-full animate-audio-bar" />
                  <span className="w-1 h-5 bg-emerald-400 rounded-full animate-audio-bar" style={{ animationDelay: '0.2s' }} />
                  <span className="w-1 h-2 bg-emerald-400 rounded-full animate-audio-bar" style={{ animationDelay: '0.4s' }} />
                  <span className="text-xs text-slate-300 ml-1">HD Voice</span>
                </div>
              </div>

              {/* Local user self-camera pip */}
              <div className="absolute top-20 right-6 w-32 h-44 sm:w-44 sm:h-56 bg-slate-900 rounded-2xl overflow-hidden border-2 border-blue-500/70 shadow-2xl z-10">
                {call.isVideoEnabled ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400 p-2 text-center">
                    <VideoOff size={24} className="mb-2 text-slate-500" />
                    <span className="text-xs">Camera is off</span>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 bg-slate-950/70 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-white font-medium">
                  You
                </div>
              </div>
            </div>
          ) : (
            /* Voice Call Screen */
            <div className="flex flex-col items-center justify-center text-center">
              {/* Outer pulsing radar rings */}
              <div className="relative flex items-center justify-center mb-6">
                <div className="absolute w-52 h-52 rounded-full bg-blue-600/10 animate-ping" />
                <div className="absolute w-44 h-44 rounded-full bg-blue-500/20 animate-pulse" />
                <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-blue-500 shadow-2xl shadow-blue-500/40">
                  <img
                    src={call.peer.avatar}
                    alt={call.peer.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1.5 tracking-tight flex items-center gap-2 justify-center">
                {call.peer.name}
                {call.peer.isGroup && <Users size={20} className="text-blue-400" />}
              </h2>

              <p className="text-sm font-medium text-slate-400 mb-4">
                {status === 'connected' ? (
                  <span className="flex items-center gap-2 justify-center text-emerald-400 font-mono text-base font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    {formatDuration(duration)}
                  </span>
                ) : status === 'calling' ? (
                  'Calling...'
                ) : (
                  'Ringing...'
                )}
              </p>

              {/* Encryption fingerprint summary */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 rounded-full text-xs text-slate-400 border border-slate-700">
                <ShieldCheck size={14} className="text-blue-400" />
                <span>Zero-Knowledge Voice Relay • SRTP-256</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Control Bar */}
        <div className="p-6 bg-slate-950/80 backdrop-blur-xl border-t border-slate-800/80 flex items-center justify-center gap-3 sm:gap-4 z-20">
          {/* Mute button */}
          <button
            onClick={onToggleMute}
            className={`p-3.5 sm:p-4 rounded-2xl font-medium transition-all ${
              call.isMuted
                ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
            }`}
            title={call.isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {call.isMuted ? <MicOff size={22} /> : <Mic size={22} />}
          </button>

          {/* Video Toggle */}
          <button
            onClick={onToggleVideo}
            className={`p-3.5 sm:p-4 rounded-2xl font-medium transition-all ${
              !call.isVideoEnabled
                ? 'bg-slate-800/60 text-slate-400 border border-slate-700'
                : 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500'
            }`}
            title={call.isVideoEnabled ? 'Turn camera off' : 'Turn camera on'}
          >
            {call.isVideoEnabled ? <Video size={22} /> : <VideoOff size={22} />}
          </button>

          {/* Screen Share */}
          <button
            onClick={onToggleScreenShare}
            className={`p-3.5 sm:p-4 rounded-2xl font-medium transition-all ${
              call.isScreenSharing
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
            }`}
            title={call.isScreenSharing ? 'Stop sharing screen' : 'Share your screen'}
          >
            <MonitorUp size={22} />
          </button>

          {/* Speaker Switch */}
          <button
            onClick={() => setSpeakerOn(!speakerOn)}
            className={`p-3.5 sm:p-4 rounded-2xl font-medium transition-all ${
              speakerOn
                ? 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
                : 'bg-slate-850 text-slate-500 border border-slate-800'
            }`}
            title={speakerOn ? 'Mute speaker' : 'Enable speaker'}
          >
            {speakerOn ? <Volume2 size={22} /> : <VolumeX size={22} />}
          </button>

          {/* End Call Button */}
          <button
            onClick={handleEnd}
            className="p-3.5 sm:p-4 px-6 sm:px-8 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-semibold rounded-2xl shadow-xl shadow-red-600/40 transition-all flex items-center gap-2"
            title="End call"
          >
            <PhoneOff size={22} />
            <span className="hidden sm:inline">End Call</span>
          </button>
        </div>
      </div>
    </div>
  );
};
