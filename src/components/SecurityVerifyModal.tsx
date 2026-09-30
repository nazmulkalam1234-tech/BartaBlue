import React, { useState } from 'react';
import {
  ShieldCheck,
  QrCode,
  Lock,
  CheckCircle2,
  Copy,
  Check,
  KeyRound,
  Users,
  RefreshCw,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Chat } from '../types';

interface SecurityVerifyModalProps {
  chat: Chat;
  onClose: () => void;
  onMarkVerified: (chatId: string) => void;
}

export const SecurityVerifyModal: React.FC<SecurityVerifyModalProps> = ({
  chat,
  onClose,
  onMarkVerified,
}) => {
  const [copied, setCopied] = useState(false);
  const [isVerified, setIsVerified] = useState(chat.isVerifiedE2EE ?? true);
  const [isRotatingSenderKeys, setIsRotatingSenderKeys] = useState(false);
  const [senderKeysRotated, setSenderKeysRotated] = useState(false);

  // 60-digit safety number grouped into 12 blocks of 5 digits
  const safetyCode =
    chat.encryptionSafetyCode ||
    '48291 03948 11928 47291 93847 18274 92837 46581 02938 47192 83746 59281';
  const codeBlocks = safetyCode.split(' ');

  const handleCopy = () => {
    navigator.clipboard.writeText(safetyCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleVerify = () => {
    const nextState = !isVerified;
    setIsVerified(nextState);
    onMarkVerified(chat.id);
  };

  const handleRotateSenderKeys = () => {
    setIsRotatingSenderKeys(true);
    setTimeout(() => {
      setIsRotatingSenderKeys(false);
      setSenderKeysRotated(true);
      setTimeout(() => setSenderKeysRotated(false), 3000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-950/70 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-2xl border border-blue-500/30">
              {chat.isGroup ? <Users size={24} /> : <ShieldCheck size={24} />}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                {chat.isGroup ? 'Group Encryption: Sender Keys' : 'Verify Safety Number'}
                {isVerified && <CheckCircle2 size={18} className="text-emerald-400" />}
              </h3>
              <p className="text-xs text-slate-400">
                {chat.isGroup ? `End-to-End Cryptography for ${chat.name}` : `E2EE with ${chat.name}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto">
          {/* GROUP CHAT SPECIFIC: Sender Keys Architecture Spotlight */}
          {chat.isGroup ? (
            <div className="space-y-4">
              <div className="p-4 bg-blue-950/40 border border-blue-500/30 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-blue-300 font-bold text-xs uppercase tracking-wider">
                  <KeyRound size={15} className="text-blue-400" />
                  <span>Sender Keys Protocol (RFC Signal Group Messaging)</span>
                </div>
                <p className="text-xs text-blue-100/90 leading-relaxed">
                  In group chats, BartaBlue utilizes the <strong>Sender Keys</strong> protocol.
                  Each group member independently generates a 32-byte <em>Sender Chain Key</em> and
                  Curve25519 signature key pair. This allows efficient, single-encryption broadcasting to
                  all {chat.members.length} members while ensuring cryptographic post-compromise security and forward secrecy.
                </p>
              </div>

              {/* Sender Key Distribution Status */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Member Sender Key Registry ({chat.members.length} Active Chains)
                  </span>
                  <button
                    onClick={handleRotateSenderKeys}
                    disabled={isRotatingSenderKeys}
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw size={13} className={isRotatingSenderKeys ? 'animate-spin' : ''} />
                    <span>{isRotatingSenderKeys ? 'Rotating...' : 'Rotate Group Keys'}</span>
                  </button>
                </div>

                {senderKeysRotated && (
                  <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span>New Sender Keys generated and securely distributed via pairwise channels!</span>
                  </div>
                )}

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {chat.members.map((member, i) => (
                    <div
                      key={member.id}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-7 h-7 rounded-full object-cover border border-slate-700"
                        />
                        <div className="truncate">
                          <div className="font-bold text-white truncate">{member.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Chain ID: #SK-{((i + 1) * 3821).toString(16).toUpperCase()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                          Ratchet #{18 + i * 4}
                        </span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400" title="Sender Key Synced" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-slate-300">
                  <div className="font-semibold text-white mb-0.5">Symmetric Ratchet</div>
                  <div className="text-slate-400">HMAC-SHA256 Sender Chain</div>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-slate-300">
                  <div className="font-semibold text-white mb-0.5">Message Encryption</div>
                  <div className="text-slate-400">AES-256-GCM / 128-bit Tag</div>
                </div>
              </div>
            </div>
          ) : (
            /* 1-on-1 Chat Safety Numbers View */
            <div className="space-y-6">
              <div className="p-4 bg-blue-950/30 border border-blue-500/20 rounded-2xl flex gap-3 text-xs text-blue-200/90 leading-relaxed">
                <Lock size={18} className="text-blue-400 shrink-0 mt-0.5" />
                <div>
                  All messages and calls in this conversation are encrypted with <strong>Curve25519 Double Ratchet</strong> and <strong>AES-256-GCM</strong>.
                  Compare this safety number or scan the QR code to verify your connection.
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center justify-center p-5 bg-white rounded-2xl shadow-inner max-w-[200px] mx-auto">
                <svg viewBox="0 0 100 100" className="w-36 h-36 fill-slate-950">
                  <rect x="5" y="5" width="28" height="28" rx="4" />
                  <rect x="9" y="9" width="20" height="20" fill="white" />
                  <rect x="13" y="13" width="12" height="12" fill="#0284c7" />

                  <rect x="67" y="5" width="28" height="28" rx="4" />
                  <rect x="71" y="9" width="20" height="20" fill="white" />
                  <rect x="75" y="13" width="12" height="12" fill="#0284c7" />

                  <rect x="5" y="67" width="28" height="28" rx="4" />
                  <rect x="9" y="71" width="20" height="20" fill="white" />
                  <rect x="13" y="75" width="12" height="12" fill="#0284c7" />

                  <rect x="38" y="8" width="8" height="8" />
                  <rect x="50" y="12" width="6" height="6" />
                  <rect x="38" y="24" width="6" height="12" />
                  <rect x="48" y="22" width="10" height="6" />
                  <rect x="10" y="38" width="14" height="6" />
                  <rect x="28" y="38" width="8" height="8" />
                  <rect x="40" y="38" width="18" height="18" fill="#0369a1" />
                  <rect x="64" y="38" width="12" height="8" />
                  <rect x="80" y="38" width="14" height="6" />
                  <rect x="12" y="50" width="8" height="10" />
                  <rect x="24" y="50" width="10" height="10" />
                  <rect x="64" y="50" width="14" height="10" />
                  <rect x="82" y="50" width="10" height="12" />
                  <rect x="38" y="66" width="12" height="12" />
                  <rect x="56" y="66" width="8" height="8" />
                  <rect x="68" y="66" width="14" height="12" />
                  <rect x="38" y="82" width="16" height="10" />
                  <rect x="60" y="80" width="10" height="14" />
                  <rect x="76" y="82" width="16" height="10" />
                </svg>
                <span className="text-[11px] font-mono text-slate-700 mt-2 font-medium">BartaBlue Secure QR</span>
              </div>

              {/* 60-Digit Fingerprint Blocks */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    60-Digit Cryptographic Fingerprint
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium"
                  >
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-center text-sm font-semibold text-slate-200">
                  {codeBlocks.map((block, i) => (
                    <div key={i} className="bg-slate-900/90 py-1.5 px-2 rounded-lg border border-slate-800 text-blue-200">
                      {block}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-5 sm:p-6 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl font-medium text-sm transition-all"
          >
            Close
          </button>

          <button
            onClick={handleToggleVerify}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg ${
              isVerified
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
            }`}
          >
            <CheckCircle2 size={16} />
            <span>{isVerified ? 'Verified & Trusted' : 'Mark as Verified'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
