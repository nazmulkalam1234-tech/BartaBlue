import React, { useState, useRef } from 'react';
import {
  User as UserIcon,
  Camera,
  Check,
  BadgeCheck,
  Sparkles,
  Phone,
  Video,
  Lock,
  Smile,
  X,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import { User } from '../types';

interface UserProfileModalProps {
  user: User;
  isSelf: boolean;
  onUpdateProfile?: (updated: Partial<User>) => void;
  onStartCall?: (type: 'voice' | 'video') => void;
  onOpenPlusModal?: () => void;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  isSelf,
  onUpdateProfile,
  onStartCall,
  onOpenPlusModal,
  onClose,
}) => {
  const [name, setName] = useState(user.name);
  const [handle, setHandle] = useState(user.handle);
  const [customStatus, setCustomStatus] = useState(user.customStatus || '');
  const [customStatusEmoji, setCustomStatusEmoji] = useState(user.customStatusEmoji || '⚡');
  const [bio, setBio] = useState(user.bio || '');
  const [avatar, setAvatar] = useState(user.avatar);
  const [statusPresence, setStatusPresence] = useState(user.status);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const STATUS_EMOJIS = ['⚡', '🎨', '🎧', '🚀', '☕', '🌴', '💻', '🔐', '🏃', '✨'];

  const STATUS_PRESETS = [
    { emoji: '⚡', text: 'Building next-gen encrypted communications' },
    { emoji: '🎧', text: 'In the zone / Do not disturb' },
    { emoji: '🎨', text: 'Refining new design tokens' },
    { emoji: '🌴', text: 'Traveling with limited internet' },
    { emoji: '☕', text: 'Taking a quick coffee break' },
  ];

  const AVATAR_PRESETS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (onUpdateProfile) {
      onUpdateProfile({
        name,
        handle,
        customStatus,
        customStatusEmoji,
        bio,
        avatar,
        status: statusPresence,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="relative h-28 bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-600 flex items-start justify-between p-4">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/40 backdrop-blur-md text-white text-xs font-semibold">
            <Lock size={12} className="text-emerald-400" />
            <span>256-bit Encrypted Identity</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-950/40 text-white/80 hover:text-white hover:bg-slate-950/70 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Avatar & Profile Identity */}
        <div className="px-6 -mt-14 pb-4 border-b border-slate-800 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
            <div className="relative group">
              <img
                src={isSelf ? avatar : user.avatar}
                alt={user.name}
                className="w-24 h-24 rounded-3xl object-cover border-4 border-slate-900 shadow-2xl"
              />
              {isSelf && (
                <>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 rounded-3xl bg-slate-950/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white cursor-pointer"
                    title="Upload profile picture"
                  >
                    <Camera size={22} />
                    <span className="text-[10px] font-semibold mt-1">Change</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </>
              )}
            </div>

            <div>
              <div className="flex items-center justify-center sm:justify-start gap-1.5">
                <h3 className="text-xl font-bold text-white tracking-tight">{isSelf ? name : user.name}</h3>
                {(user.isPremium || (isSelf && user.isPremium)) && (
                  <span
                    title="Verified BartaBlue Plus User"
                    className="flex items-center text-amber-400"
                  >
                    <BadgeCheck size={18} className="fill-amber-400 text-slate-900" />
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-400 font-mono mt-0.5">{isSelf ? handle : user.handle}</p>
            </div>
          </div>

          {!isSelf && onStartCall && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onStartCall('voice');
                  onClose();
                }}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl transition-all"
                title="Voice Call"
              >
                <Phone size={18} />
              </button>
              <button
                onClick={() => {
                  onStartCall('video');
                  onClose();
                }}
                className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md shadow-blue-600/30 transition-all"
                title="Video Call"
              >
                <Video size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Status Update Banner */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Status Update
            </span>
            {isSelf ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 p-2 bg-slate-900 border border-slate-800 rounded-xl">
                    <span className="text-lg">{customStatusEmoji}</span>
                  </div>
                  <input
                    type="text"
                    value={customStatus}
                    onChange={(e) => setCustomStatus(e.target.value)}
                    placeholder="Set custom status update..."
                    className="flex-1 bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all"
                  />
                </div>

                {/* Emoji choices */}
                <div className="flex flex-wrap gap-1.5">
                  {STATUS_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setCustomStatusEmoji(emoji)}
                      className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all ${
                        customStatusEmoji === emoji ? 'bg-blue-600 scale-110' : 'bg-slate-900 hover:bg-slate-800'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                {/* Preset status updates */}
                <div className="space-y-1">
                  {STATUS_PRESETS.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setCustomStatusEmoji(p.emoji);
                        setCustomStatus(p.text);
                      }}
                      className="w-full text-left p-1.5 px-2.5 rounded-lg text-xs text-slate-300 hover:bg-slate-900 flex items-center gap-2 transition-colors"
                    >
                      <span>{p.emoji}</span>
                      <span className="truncate">{p.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-slate-200">
                <span className="text-lg">{user.customStatusEmoji || '💬'}</span>
                <span>{user.customStatus || 'Available'}</span>
              </div>
            )}
          </div>

          {/* Profile Picture Presets (If editing self) */}
          {isSelf && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Choose Profile Picture Preset
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                >
                  <Upload size={13} /> Upload Photo
                </button>
              </div>
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {AVATAR_PRESETS.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAvatar(p)}
                    className={`w-11 h-11 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                      avatar === p
                        ? 'border-blue-500 scale-105 shadow-md shadow-blue-500/50'
                        : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={p} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bio / About */}
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              About / Bio
            </span>
            {isSelf ? (
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write a brief bio..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all resize-none"
              />
            ) : (
              <p className="text-xs text-slate-300 bg-slate-950/50 p-3 rounded-xl border border-slate-800 leading-relaxed">
                {user.bio || 'No bio provided.'}
              </p>
            )}
          </div>

          {/* Plus Subscription Banner */}
          {onOpenPlusModal && (
            <div
              onClick={onOpenPlusModal}
              className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 to-purple-950/40 border border-blue-500/30 flex items-center justify-between cursor-pointer hover:border-blue-500/60 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-400/20 text-amber-400">
                  <BadgeCheck size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    BartaBlue Plus Member
                    {user.isPremium && <Check size={14} className="text-emerald-400" />}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    4K Calling • 2GB File Sharing • Voice Transcriptions • 100GB Cloud
                  </div>
                </div>
              </div>

              <span className="text-xs text-blue-400 font-bold hover:underline">
                {user.isPremium ? 'Manage' : 'Upgrade'}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        {isSelf && (
          <div className="p-4 px-6 bg-slate-950/80 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center gap-1.5"
            >
              <Check size={14} /> Save Profile Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
