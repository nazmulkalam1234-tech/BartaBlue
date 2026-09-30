import React, { useState } from 'react';
import {
  Sparkles,
  Check,
  Video,
  FileUp,
  FileText,
  BadgeCheck,
  Cloud,
  X,
  Zap,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

interface BartaBluePlusModalProps {
  isPremium: boolean;
  onActivatePlus: () => void;
  onClose: () => void;
}

export const BartaBluePlusModal: React.FC<BartaBluePlusModalProps> = ({
  isPremium,
  onActivatePlus,
  onClose,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  const PLUS_FEATURES = [
    {
      icon: Video,
      title: '4K Ultra-HD Calling',
      desc: 'Crystal-clear 60fps 4K video calls and lossless spatial audio with hardware acceleration.',
      color: 'from-blue-500 to-cyan-400',
    },
    {
      icon: FileUp,
      title: '2GB Large File Sharing',
      desc: 'Send uncompressed RAW photos, 4K video files, and huge documents up to 2GB per upload.',
      color: 'from-indigo-500 to-blue-500',
    },
    {
      icon: FileText,
      title: 'Voice-to-Text Transcriptions',
      desc: 'Transcribe incoming & outgoing voice notes instantly into text with private on-device AI.',
      color: 'from-teal-500 to-emerald-400',
    },
    {
      icon: BadgeCheck,
      title: 'Verified Plus Badges',
      desc: 'Distinguished radiant badge next to your profile photo and username in all chats.',
      color: 'from-amber-400 to-yellow-500',
    },
    {
      icon: Cloud,
      title: '100GB Encrypted Cloud Vault',
      desc: 'Zero-knowledge encrypted cloud storage to back up entire chat histories, photos, and media.',
      color: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-blue-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="p-6 bg-gradient-to-r from-blue-950/80 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <Sparkles size={22} className="fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white tracking-tight">BartaBlue Plus</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-400 text-slate-950 flex items-center gap-1">
                  <BadgeCheck size={11} className="fill-slate-950 text-amber-400" /> VIP
                </span>
              </div>
              <p className="text-xs text-blue-200/80">Next-generation superpowers for secure communications</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 relative z-10">
          {/* Features Grid */}
          <div className="space-y-3">
            {PLUS_FEATURES.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-blue-500/40 transition-all group"
                >
                  <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${feat.color} text-white shadow-md shrink-0`}>
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                        {feat.title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Billing Switcher */}
          <div className="flex items-center justify-center p-1 bg-slate-950 rounded-2xl border border-slate-800 max-w-xs mx-auto">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly ($3.99)
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all relative ${
                billingCycle === 'yearly'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Yearly ($39.99)
              <span className="ml-1 text-[9px] px-1.5 py-0.2 bg-emerald-400 text-slate-950 rounded-full font-black">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
          <div className="text-center sm:text-left">
            <div className="text-sm font-bold text-white">
              {billingCycle === 'yearly' ? '$39.99 / year' : '$3.99 / month'}
            </div>
            <div className="text-[11px] text-slate-400">Cancel anytime • 14-day money-back guarantee</div>
          </div>

          <button
            type="button"
            onClick={() => {
              onActivatePlus();
              onClose();
            }}
            className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:opacity-95 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Sparkles size={16} />
            <span>{isPremium ? 'Plus Active (Renew Plan)' : 'Start 14-Day Free Trial'}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
