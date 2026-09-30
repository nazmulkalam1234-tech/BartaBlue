import React, { useState } from 'react';
import { Bell, BellOff, Volume2, Eye, EyeOff, Smartphone, Check } from 'lucide-react';
import { Chat, ChatNotificationSettings } from '../types';
import { soundEffects } from '../services/soundEffects';

interface NotificationSettingsModalProps {
  chat: Chat;
  onClose: () => void;
  onSave: (settings: ChatNotificationSettings) => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  chat,
  onClose,
  onSave,
}) => {
  const [isMuted, setIsMuted] = useState(chat.notificationSettings.isMuted);
  const [muteUntil, setMuteUntil] = useState<string>(chat.notificationSettings.muteUntil || 'always');
  const [selectedTone, setSelectedTone] = useState<string>(chat.notificationSettings.customTone || 'Barta Blue Echo');
  const [showPreviews, setShowPreviews] = useState<boolean>(chat.notificationSettings.showPreviews);
  const [vibrate, setVibrate] = useState<boolean>(chat.notificationSettings.vibrate);

  const TONES = [
    { id: 'Barta Blue Echo', label: 'Barta Blue Echo (Default)' },
    { id: 'Crystal Echo', label: 'Crystal Echo (Crisp bell)' },
    { id: 'Pulse Chime', label: 'Pulse Chime (Modern)' },
    { id: 'Minimal Ping', label: 'Minimal Ping (Subtle)' },
  ];

  const handleTestSound = (tone: string) => {
    setSelectedTone(tone);
    soundEffects.playIncomingChime();
  };

  const handleSave = () => {
    onSave({
      isMuted,
      muteUntil: isMuted ? muteUntil : undefined,
      customTone: selectedTone,
      showPreviews,
      vibrate,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-2xl border border-blue-500/30">
              <Bell size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Notification Settings</h3>
              <p className="text-xs text-slate-400">Tailor alerts for {chat.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          {/* Mute Toggle */}
          <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isMuted ? (
                  <BellOff size={18} className="text-amber-400" />
                ) : (
                  <Bell size={18} className="text-blue-400" />
                )}
                <div>
                  <div className="text-sm font-semibold text-white">Mute Conversation</div>
                  <div className="text-xs text-slate-400">Silence ringtones and vibration</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isMuted}
                  onChange={(e) => setIsMuted(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Mute duration options if muted */}
            {isMuted && (
              <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center gap-2">
                {[
                  { id: '8h', label: '8 Hours' },
                  { id: '1w', label: '1 Week' },
                  { id: 'always', label: 'Always' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setMuteUntil(opt.id)}
                    className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                      muteUntil === opt.id
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Custom Notification Tone */}
          <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <Volume2 size={16} className="text-blue-400" />
              <span className="text-sm font-semibold text-white">Custom Ringtone</span>
            </div>

            <div className="space-y-2">
              {TONES.map((tone) => (
                <div
                  key={tone.id}
                  onClick={() => handleTestSound(tone.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border ${
                    selectedTone === tone.id
                      ? 'bg-blue-600/10 border-blue-500/40 text-blue-200'
                      : 'bg-slate-900 border-slate-800/80 text-slate-300 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-medium">{tone.label}</span>
                  </div>
                  {selectedTone === tone.id && (
                    <span className="text-xs font-semibold text-blue-400 flex items-center gap-1">
                      <Check size={14} /> Active
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Message Previews */}
          <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {showPreviews ? (
                <Eye size={18} className="text-emerald-400" />
              ) : (
                <EyeOff size={18} className="text-slate-400" />
              )}
              <div>
                <div className="text-sm font-semibold text-white">Message Previews</div>
                <div className="text-xs text-slate-400">Show message text in push banners</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showPreviews}
                onChange={(e) => setShowPreviews(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Vibrate */}
          <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone size={18} className="text-blue-400" />
              <div>
                <div className="text-sm font-semibold text-white">Haptic Vibration</div>
                <div className="text-xs text-slate-400">Vibrate device on incoming message</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={vibrate}
                onChange={(e) => setVibrate(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-950/60 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl font-medium text-sm transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
