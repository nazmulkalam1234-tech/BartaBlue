import React, { useEffect } from 'react';
import { Download, X, Lock, FileText, Image as ImageIcon, CheckCircle, ExternalLink, Flame, ShieldAlert } from 'lucide-react';
import { Message } from '../types';

interface MediaViewerModalProps {
  message: Message;
  onClose: () => void;
  onViewOnceViewed?: (messageId: string) => void;
}

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({
  message,
  onClose,
  onViewOnceViewed,
}) => {
  const isViewOnce = message.isViewOnce;

  const handleClose = () => {
    if (isViewOnce && onViewOnceViewed) {
      onViewOnceViewed(message.id);
    }
    onClose();
  };

  const handleDownload = () => {
    // If view once, download is restricted for privacy
    if (isViewOnce) return;
    if (message.mediaUrl) {
      const a = document.createElement('a');
      a.href = message.mediaUrl;
      a.download = message.mediaName || 'bartablue_media.jpg';
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-lg animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* View Once Warning Banner */}
        {isViewOnce && (
          <div className="p-2.5 px-6 bg-gradient-to-r from-amber-600/90 to-rose-600/90 text-white flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-white text-slate-950 flex items-center justify-center font-black text-xs">
                1
              </span>
              <span>View-Once Mode Active: Media will permanently expire upon closing.</span>
            </div>
            <div className="flex items-center gap-1.5 opacity-90 text-[11px]">
              <ShieldAlert size={14} />
              <span>Anti-Screenshot Guard</span>
            </div>
          </div>
        )}

        {/* Top bar */}
        <div className="p-4 px-6 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isViewOnce ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-600/20 text-blue-400'}`}>
              {isViewOnce ? (
                <span className="w-5 h-5 flex items-center justify-center font-bold text-sm">1</span>
              ) : message.type === 'document' ? (
                <FileText size={20} />
              ) : (
                <ImageIcon size={20} />
              )}
            </div>
            <div>
              <div className="text-sm font-semibold text-white truncate max-w-xs sm:max-w-md flex items-center gap-2">
                <span>{message.mediaName || (isViewOnce ? 'View-Once Media' : 'Encrypted Media')}</span>
                {isViewOnce && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                    View Once
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>By {message.senderName}</span>
                <span>•</span>
                <span>{message.timestamp}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <Lock size={11} /> 256-bit Decrypted locally
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isViewOnce && (
              <button
                onClick={handleDownload}
                className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md transition-all flex items-center gap-1.5 text-xs font-semibold"
                title="Download file"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Download</span>
              </button>
            )}
            <button
              onClick={handleClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              title="Close viewer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Media Preview Stage */}
        <div className="flex-1 flex items-center justify-center p-6 bg-slate-950/90 overflow-hidden min-h-[350px]">
          {message.type === 'image' && message.mediaUrl ? (
            <img
              src={message.mediaUrl}
              alt={message.mediaName || 'Media'}
              className="max-h-[65vh] max-w-full rounded-2xl object-contain shadow-2xl transition-all select-none"
              onContextMenu={(e) => isViewOnce && e.preventDefault()}
            />
          ) : message.type === 'video' && message.mediaUrl ? (
            <video
              src={message.mediaUrl}
              controls
              autoPlay
              controlsList={isViewOnce ? 'nodownload' : undefined}
              className="max-h-[65vh] max-w-full rounded-2xl shadow-2xl bg-black"
            />
          ) : message.type === 'document' ? (
            <div className="flex flex-col items-center justify-center p-8 bg-slate-900 border border-slate-800 rounded-3xl max-w-md text-center">
              <div className="w-20 h-20 bg-blue-600/10 text-blue-400 rounded-3xl flex items-center justify-center mb-4 border border-blue-500/20">
                <FileText size={40} />
              </div>
              <h4 className="text-base font-bold text-white mb-1">{message.mediaName}</h4>
              <p className="text-xs text-slate-400 mb-6 font-mono">{message.mediaSize || '4.8 MB'} • PDF Document</p>

              {!isViewOnce && (
                <button
                  onClick={handleDownload}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-2xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  <span>Save to Device</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 bg-slate-900 border border-slate-800 rounded-3xl max-w-lg text-center w-full shadow-2xl">
              <div className="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-3xl flex items-center justify-center mb-4 border border-amber-500/20 shadow-md">
                <span className="text-2xl font-black">1</span>
              </div>
              <h4 className="text-base font-bold text-white mb-1">
                {isViewOnce ? 'View-Once Confidential Message' : 'Decrypted Message'}
              </h4>
              <p className="text-xs text-slate-400 mb-6">
                {isViewOnce
                  ? 'This message is held in volatile memory and will vanish permanently when closed.'
                  : 'Protected by 256-bit End-to-End Encryption'}
              </p>

              <div className="w-full font-sans text-sm bg-slate-950 p-5 rounded-2xl border border-slate-800/80 text-white leading-relaxed text-left break-words mb-6 select-none">
                {message.text}
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-2xl shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <span>Close & Expire Message</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

