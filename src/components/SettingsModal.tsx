import React, { useState, useRef } from 'react';
import {
  User as UserIcon,
  Shield,
  Laptop,
  Cloud,
  Globe,
  Sparkles,
  Camera,
  Check,
  Smartphone,
  Lock,
  Trash2,
  RefreshCw,
  QrCode,
  HardDrive,
  CheckCircle2,
  Zap,
  ArrowRight,
  ShieldAlert,
  Sliders,
  Upload,
  Fingerprint,
  Eye,
  KeyRound,
  Users,
} from 'lucide-react';
import {
  CloudBackupState,
  LinkedDevice,
  SupportedLanguage,
  User,
} from '../types';
import { LANGUAGES, getTranslation } from '../services/translations';

interface SettingsModalProps {
  currentUser: User;
  onUpdateProfile: (updated: Partial<User>) => void;
  linkedDevices: LinkedDevice[];
  onUnlinkDevice: (deviceId: string) => void;
  backupState: CloudBackupState;
  onTriggerBackup: () => void;
  language: SupportedLanguage;
  onChangeLanguage: (lang: SupportedLanguage) => void;
  onClose: () => void;
  onLockApp?: () => void;
  isBiometricEnabled?: boolean;
  onToggleBiometric?: (enabled: boolean) => void;
  autoLockDelay?: string;
  onChangeAutoLockDelay?: (delay: string) => void;
  onActivatePlus?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  currentUser,
  onUpdateProfile,
  linkedDevices,
  onUnlinkDevice,
  backupState,
  onTriggerBackup,
  language,
  onChangeLanguage,
  onClose,
  onLockApp,
  isBiometricEnabled = true,
  onToggleBiometric,
  autoLockDelay = 'immediate',
  onChangeAutoLockDelay,
  onActivatePlus,
}) => {
  const [activeTab, setActiveTab] = useState<
    'profile' | 'privacy' | 'devices' | 'backup' | 'language' | 'plus'
  >('profile');

  // Profile edit states
  const [name, setName] = useState(currentUser.name);
  const [handle, setHandle] = useState(currentUser.handle);
  const [customStatus, setCustomStatus] = useState(currentUser.customStatus || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  // Privacy states
  const [readReceipts, setReadReceipts] = useState(true);
  const [disappearingDefault, setDisappearingDefault] = useState('0'); // 0, 24, 168
  const [plusActivatedFeedback, setPlusActivatedFeedback] = useState(false);

  // Link device simulator modal toggle
  const [showLinkQr, setShowLinkQr] = useState(false);

  // Save profile changes
  const handleSaveProfile = () => {
    onUpdateProfile({
      name,
      handle,
      customStatus,
      bio,
      avatar,
    });
  };

  const AVATAR_PRESETS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  ];

  const STATUS_PRESETS = [
    '⚡ Building next-gen encrypted communications',
    '🎧 Focused / Do not disturb',
    '🎨 Designing new features',
    '✈️ Traveling with limited internet',
    '💬 Quick messages only',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl h-[90vh] max-h-[740px] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
        {/* Navigation Tabs (Sidebar inside modal) */}
        <div className="w-full md:w-64 bg-slate-950/90 border-b md:border-b-0 md:border-r border-slate-800 p-4 flex flex-col justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2.5 px-3 py-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30 text-white font-bold">
                B
              </div>
              <span className="font-bold text-white text-base tracking-tight">Settings</span>
            </div>

            <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
              {[
                { id: 'profile', label: getTranslation(language, 'profile'), icon: UserIcon },
                { id: 'privacy', label: getTranslation(language, 'privacy_security'), icon: Shield },
                { id: 'devices', label: getTranslation(language, 'linked_devices'), icon: Laptop },
                { id: 'backup', label: getTranslation(language, 'backup_storage'), icon: Cloud },
                { id: 'language', label: getTranslation(language, 'language'), icon: Globe },
                { id: 'plus', label: getTranslation(language, 'bartablue_plus'), icon: Sparkles, badge: 'PRO' },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                    <span className="flex-1 text-left">{tab.label}</span>
                    {tab.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-extrabold bg-amber-400 text-slate-950 rounded-md">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="hidden md:block pt-4 border-t border-slate-850">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Lock size={12} className="text-emerald-400" />
              <span>BartaBlue v4.2.0 • 256-bit E2EE</span>
            </div>
          </div>
        </div>

        {/* Tab Content Panel */}
        <div className="flex-1 flex flex-col justify-between bg-slate-900 overflow-hidden">
          {/* Top header bar */}
          <div className="p-4 sm:p-6 pb-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-white capitalize">
              {activeTab === 'plus' ? 'BartaBlue Plus Subscription' : activeTab}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Main Content Body */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
            {/* TAB: PROFILE */}
            {activeTab === 'profile' && (
              <div className="space-y-6 max-w-xl">
                {/* Avatar change */}
                <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
                  <div className="relative group">
                    <img
                      src={avatar}
                      alt={currentUser.name}
                      className="w-20 h-20 rounded-full object-cover border-4 border-blue-500/60 shadow-xl"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 rounded-full bg-slate-950/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                      title="Upload custom profile photo"
                    >
                      <Camera size={22} />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-semibold text-white">Profile Photo</h4>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                      >
                        <Upload size={12} /> Upload File
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">Choose an avatar preset or upload any image from your device</p>

                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      {AVATAR_PRESETS.map((p, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setAvatar(p)}
                          className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all ${
                            avatar === p ? 'border-blue-500 scale-110 shadow-md shadow-blue-500/50' : 'border-slate-800 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={p} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Name & Handle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Public Handle
                    </label>
                    <input
                      type="text"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Status Message */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Custom Status Update
                  </label>
                  <input
                    type="text"
                    value={customStatus}
                    onChange={(e) => setCustomStatus(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition-all mb-2"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {STATUS_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCustomStatus(preset)}
                        className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs text-slate-300 transition-colors"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    About / Bio
                  </label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2 text-sm text-white outline-none transition-all resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
                  >
                    <Check size={16} /> Save Profile Changes
                  </button>
                </div>
              </div>
            )}

            {/* TAB: PRIVACY & SECURITY */}
            {activeTab === 'privacy' && (
              <div className="space-y-5 max-w-xl">
                <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl flex items-start gap-3">
                  <Lock size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">Signal Protocol E2EE Enabled</h4>
                    <p className="text-xs text-emerald-200/80 leading-relaxed">
                      Every message, photo, voice recording, and voice/video stream is encrypted on your local device before transmission. No outside person or messaging platform can access or read your messages.
                    </p>
                  </div>
                </div>

                {/* Disappearing Messages default */}
                <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white">Default Disappearing Messages Timer</h4>
                    <p className="text-xs text-slate-400">Automatically erase new messages across all chats</p>
                  </div>
                  <select
                    value={disappearingDefault}
                    onChange={(e) => setDisappearingDefault(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 outline-none"
                  >
                    <option value="0">Off</option>
                    <option value="24">24 Hours</option>
                    <option value="168">7 Days</option>
                    <option value="2160">90 Days</option>
                  </select>
                </div>

                {/* Biometric App Lock & Auto-Lock */}
                <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl">
                        <Fingerprint size={22} />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">Biometric Screen Lock</h4>
                        <p className="text-xs text-slate-400">Require Face ID, Touch ID, or 4-digit PIN to open BartaBlue</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isBiometricEnabled}
                        onChange={(e) => onToggleBiometric?.(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {isBiometricEnabled && (
                    <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Auto-Lock Timer:</span>
                        <select
                          value={autoLockDelay}
                          onChange={(e) => onChangeAutoLockDelay?.(e.target.value)}
                          className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 outline-none font-medium"
                        >
                          <option value="immediate">Immediately upon leave</option>
                          <option value="1m">After 1 minute</option>
                          <option value="5m">After 5 minutes</option>
                          <option value="15m">After 15 minutes</option>
                        </select>
                      </div>

                      {onLockApp && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onLockApp();
                          }}
                          className="px-3.5 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded-xl text-xs font-semibold border border-blue-500/30 transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto"
                        >
                          <Lock size={12} />
                          <span>Lock App Now</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Sender Keys Protocol for Group Chats */}
                <div className="p-4 bg-gradient-to-r from-blue-950/40 to-slate-950/60 rounded-2xl border border-blue-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
                    <KeyRound size={15} />
                    <span>Sender Keys Group Cryptography</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Group chats in BartaBlue are encrypted using the <strong>Sender Keys</strong> protocol.
                    Instead of maintaining complex N-to-N pairwise tunnels, each group participant derives an independent
                    32-byte <em>Sender Chain Key</em> with Curve25519 signature verification. Messages are ratcheted per-packet,
                    delivering instantaneous performance while preventing servers or eavesdroppers from inspecting group transmissions.
                  </p>
                </div>

                {/* View-Once & Ephemeral Media */}
                <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                    <Eye size={15} />
                    <span>View-Once Ephemeral Security</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Photos, videos, and documents sent with <strong>View-Once</strong> enabled are decrypted in volatile RAM
                    and immediately destroyed upon modal closure. They are blocked from saved galleries and downloads to guarantee privacy.
                  </p>
                </div>

                {/* Read Receipts */}
                <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white">Read Receipts (Blue Ticks)</h4>
                    <p className="text-xs text-slate-400">Show when you have read messages and see when others read yours</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={readReceipts}
                      onChange={(e) => setReadReceipts(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            )}

            {/* TAB: LINKED DEVICES & CROSS-PLATFORM SYNC */}
            {activeTab === 'devices' && (
              <div className="space-y-6 max-w-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-blue-950/30 border border-blue-500/20 rounded-2xl">
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">Cross-Platform Synchronization</h4>
                    <p className="text-xs text-blue-200/80">
                      Your end-to-end encrypted chats and media sync securely across mobile, desktop, and tablet.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowLinkQr(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/30 flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                  >
                    <QrCode size={16} /> Link New Device
                  </button>
                </div>

                {/* Device List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Connected Devices ({linkedDevices.length})
                  </h4>

                  {linkedDevices.map((dev) => (
                    <div
                      key={dev.id}
                      className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-slate-800 rounded-xl text-blue-400">
                          {dev.deviceType === 'desktop' ? (
                            <Laptop size={22} />
                          ) : (
                            <Smartphone size={22} />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white flex items-center gap-2">
                            {dev.name}
                            {dev.isCurrent && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                This Device
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {dev.os} • {dev.browser || dev.location}
                          </div>
                          <div className="text-[11px] text-blue-400 font-mono mt-0.5">
                            Last active: {dev.lastActive}
                          </div>
                        </div>
                      </div>

                      {!dev.isCurrent && (
                        <button
                          onClick={() => onUnlinkDevice(dev.id)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                          title="Log out of this device"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Link QR Code Modal */}
                {showLinkQr && (
                  <div className="p-6 bg-slate-950 border border-blue-500/40 rounded-3xl text-center space-y-4 animate-in fade-in">
                    <h4 className="text-base font-bold text-white">Scan to Link BartaBlue</h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Open BartaBlue on your phone or tablet, go to Settings &gt; Linked Devices, and scan this QR code to sync your encrypted chats.
                    </p>
                    <div className="p-4 bg-white rounded-2xl max-w-[180px] mx-auto shadow-xl">
                      <QrCode size={150} className="text-slate-950 mx-auto" />
                    </div>
                    <button
                      onClick={() => setShowLinkQr(false)}
                      className="px-5 py-2 text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white rounded-xl"
                    >
                      Done / Close
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB: CLOUD BACKUP & STORAGE */}
            {activeTab === 'backup' && (
              <div className="space-y-6 max-w-xl">
                {/* Backup status card */}
                <div className="p-5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-600/20 text-blue-400 rounded-2xl">
                        <HardDrive size={24} />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white">End-to-End Encrypted Backup</h4>
                        <p className="text-xs text-slate-400">Stored on {backupState.provider}</p>
                      </div>
                    </div>

                    <button
                      onClick={onTriggerBackup}
                      disabled={backupState.isBackingUp}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all"
                    >
                      <RefreshCw size={14} className={backupState.isBackingUp ? 'animate-spin' : ''} />
                      <span>{backupState.isBackingUp ? 'Backing up...' : 'Back Up Now'}</span>
                    </button>
                  </div>

                  {/* Storage breakdown bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-400">Storage Used</span>
                      <span className="font-semibold text-white">
                        {backupState.totalSizeMb.toFixed(1)} MB of {(backupState.storageLimitMb / 1024).toFixed(0)} GB
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                      <div style={{ width: '40%' }} className="bg-blue-500 h-full" title="Photos" />
                      <div style={{ width: '25%' }} className="bg-indigo-500 h-full" title="Videos" />
                      <div style={{ width: '15%' }} className="bg-teal-500 h-full" title="Voice Notes" />
                      <div style={{ width: '10%' }} className="bg-amber-500 h-full" title="Documents" />
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Photos</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500" /> Videos</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-500" /> Audio</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Docs</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                    <span>Last backup timestamp:</span>
                    <span className="text-white font-mono">{backupState.lastBackupDate}</span>
                  </div>
                </div>

                {/* Auto Backup Frequency */}
                <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white">Auto-Backup Frequency</h4>
                    <p className="text-xs text-slate-400">Schedule automatic cloud sync over Wi-Fi</p>
                  </div>
                  <select
                    defaultValue="daily"
                    className="bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 outline-none"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="manual">Manual Only</option>
                  </select>
                </div>
              </div>
            )}

            {/* TAB: LANGUAGE */}
            {activeTab === 'language' && (
              <div className="space-y-4 max-w-xl">
                <div className="p-4 bg-blue-950/30 border border-blue-500/20 rounded-2xl flex items-center gap-3">
                  <Globe size={22} className="text-blue-400" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Global Multi-Language Communication</h4>
                    <p className="text-xs text-blue-200/80">
                      Select your interface language and enable instant message translation across borders.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {LANGUAGES.map((lang) => {
                    const isSelected = language === lang.code;
                    return (
                      <button
                        key={lang.code}
                        onClick={() => onChangeLanguage(lang.code)}
                        className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-blue-600/15 border-blue-500 text-white shadow-md shadow-blue-500/10'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-850'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{lang.flag}</span>
                          <div>
                            <div className="text-sm font-bold">{lang.nativeName}</div>
                            <div className="text-xs text-slate-400">{lang.label}</div>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 size={18} className="text-blue-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: BARTABLUE PLUS (MONETIZATION) */}
            {activeTab === 'plus' && (
              <div className="space-y-6 max-w-xl">
                {/* Hero Banner */}
                <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 text-white shadow-2xl">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Sparkles size={160} />
                  </div>
                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold uppercase tracking-wider mb-3">
                      <Zap size={14} className="fill-current" /> BartaBlue Plus
                    </div>
                    <h3 className="text-2xl font-black mb-2">Unleash Full Superpowers</h3>
                    <p className="text-sm text-blue-100 max-w-md">
                      Support independent private communication and enjoy 4K calling, huge file uploads, voice transcriptions, and exclusive customization.
                    </p>
                  </div>
                </div>

                {/* Features comparison */}
                <div className="space-y-3">
                  {[
                    { title: '4K Ultra-HD Video & Lossless Audio Calling', desc: 'Crystal-clear screen sharing & conference calls' },
                    { title: '2 GB File & Document Sharing', desc: 'Share 4K video footage and high-res archives easily' },
                    { title: 'Instant Voice-to-Text Transcriptions', desc: 'Transcribe voice messages into text with one tap' },
                    { title: 'Exclusive Verified Plus Badge & Icons', desc: 'Distinguished profile aura and custom themes' },
                    { title: '100 GB Encrypted Cloud Vault', desc: 'Never worry about running out of backup space' },
                  ].map((feat, i) => (
                    <div key={i} className="flex items-start gap-3 p-3.5 bg-slate-950/60 rounded-xl border border-slate-850">
                      <div className="p-1 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0 mt-0.5">
                        <Check size={14} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{feat.title}</div>
                        <div className="text-[11px] text-slate-400">{feat.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing cards */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                    <div className="text-xs text-slate-400 font-semibold mb-1">Monthly Plan</div>
                    <div className="text-xl font-bold text-white">$3.99 <span className="text-xs text-slate-400 font-normal">/ mo</span></div>
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/40 text-center relative">
                    <span className="absolute -top-2.5 right-4 bg-emerald-500 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded-full">
                      SAVE 20%
                    </span>
                    <div className="text-xs text-blue-300 font-semibold mb-1">Annual Plan</div>
                    <div className="text-xl font-bold text-white">$39.99 <span className="text-xs text-slate-400 font-normal">/ yr</span></div>
                  </div>
                </div>

                {plusActivatedFeedback ? (
                  <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl text-center space-y-2 animate-in fade-in">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                      <CheckCircle2 size={24} />
                    </div>
                    <div className="text-sm font-bold text-white">BartaBlue Plus Activated!</div>
                    <p className="text-xs text-emerald-300/80">
                      Your account has been upgraded with 4K calling, 2GB uploads, verified badge, and 100GB cloud vault.
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onActivatePlus?.();
                      setPlusActivatedFeedback(true);
                      setTimeout(() => {
                        onClose();
                      }, 1500);
                    }}
                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-90 active:scale-[0.99] text-white font-bold rounded-2xl shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles size={18} />
                    <span>Start 14-Day Free Trial</span>
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
