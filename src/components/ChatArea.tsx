import React, { useState, useRef, useEffect } from 'react';
import {
  Phone,
  Video,
  ShieldCheck,
  Lock,
  MoreVertical,
  Paperclip,
  Smile,
  Send,
  Mic,
  Image as ImageIcon,
  FileText,
  Check,
  CheckCheck,
  BellOff,
  Bell,
  Clock,
  Sparkles,
  Languages,
  ChevronLeft,
  Users,
  Eye,
  Info,
  BadgeCheck,
  Upload,
  Film,
} from 'lucide-react';
import { Chat, Message, SupportedLanguage, User } from '../types';
import { VoicePlayer } from './VoicePlayer';
import { VoiceRecorder } from './VoiceRecorder';
import { simulateTranslate, getTranslation } from '../services/translations';
import { soundEffects } from '../services/soundEffects';

interface ChatAreaProps {
  chat: Chat;
  messages: Message[];
  currentUser: User;
  onSendMessage: (text: string, type?: 'text' | 'image' | 'video' | 'audio' | 'document', mediaDetails?: { url?: string; name?: string; size?: string; duration?: number; isViewOnce?: boolean }) => void;
  onStartCall: (type: 'voice' | 'video') => void;
  onOpenSecurityModal: () => void;
  onOpenNotificationModal: () => void;
  onOpenGroupModal: () => void;
  onOpenMediaViewer: (msg: Message) => void;
  onToggleReaction: (messageId: string, emoji: string) => void;
  language: SupportedLanguage;
  onBackMobile?: () => void;
  onOpenUserProfile?: (user: User) => void;
  onOpenPlusModal?: () => void;
  onViewOnceViewed?: (messageId: string) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  chat,
  messages,
  currentUser,
  onSendMessage,
  onStartCall,
  onOpenSecurityModal,
  onOpenNotificationModal,
  onOpenGroupModal,
  onOpenMediaViewer,
  onToggleReaction,
  language,
  onBackMobile,
  onOpenUserProfile,
  onOpenPlusModal,
  onViewOnceViewed,
}) => {
  const [inputText, setInputText] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [isViewOnceMode, setIsViewOnceMode] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const [translatedMessages, setTranslatedMessages] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const docInputRef = useRef<HTMLInputElement | null>(null);

  // Peer user info if direct chat
  const peer = chat.members.find((m) => m.id !== currentUser.id) || chat.members[0];

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPeerTyping]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    soundEffects.playSendSound();
    onSendMessage(inputText.trim(), 'text', { isViewOnce: isViewOnceMode });
    setInputText('');
    setIsViewOnceMode(false);

    // Simulate smart interactive reply with typing indicator after 2 seconds
    setTimeout(() => {
      setIsPeerTyping(true);
      setTimeout(() => {
        setIsPeerTyping(false);
        soundEffects.playIncomingChime();
        const peerResponses = [
          'Got it! Encrypted channel is working seamlessly 🚀',
          'That sounds great. Let me check the details right away.',
          'Everything verified on my end too. Thanks for the quick update!',
          'Let’s hop on a quick BartaBlue HD voice call when you are free.',
        ];
        const randomResp = peerResponses[Math.floor(Math.random() * peerResponses.length)];
        onSendMessage(randomResp, 'text');
      }, 2400);
    }, 1200);
  };

  const handleSendVoiceNote = (duration: number) => {
    soundEffects.playSendSound();
    onSendMessage('Voice Note', 'audio', {
      duration,
      url: 'simulated_audio_note',
      isViewOnce: isViewOnceMode,
    });
    setIsRecordingVoice(false);
    setIsViewOnceMode(false);
  };

  const handleRealPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVideo = file.type.startsWith('video/');
      const fileUrl = URL.createObjectURL(file);
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      soundEffects.playSendSound();
      onSendMessage(isVideo ? 'Shared a video' : 'Shared a photo', isVideo ? 'video' : 'image', {
        url: fileUrl,
        name: file.name,
        size: `${sizeMb} MB`,
        isViewOnce: isViewOnceMode,
      });
      setShowAttachMenu(false);
      setIsViewOnceMode(false);
    }
  };

  const handleRealDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      soundEffects.playSendSound();
      onSendMessage('Shared a document', 'document', {
        url: fileUrl,
        name: file.name,
        size: `${sizeMb} MB`,
        isViewOnce: isViewOnceMode,
      });
      setShowAttachMenu(false);
      setIsViewOnceMode(false);
    }
  };

  const handleSimulateAttachment = (type: 'image' | 'document') => {
    setShowAttachMenu(false);
    soundEffects.playSendSound();
    if (type === 'image') {
      onSendMessage('Shared a photo', 'image', {
        url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
        name: 'Design_System_Spec.png',
        size: '1.8 MB',
        isViewOnce: isViewOnceMode,
      });
    } else {
      onSendMessage('Shared a document', 'document', {
        name: 'BartaBlue_Protocol_Whitepaper_v2.pdf',
        size: '3.6 MB',
        isViewOnce: isViewOnceMode,
      });
    }
    setIsViewOnceMode(false);
  };

  const handleToggleTranslate = (msg: Message) => {
    if (translatedMessages[msg.id]) {
      // Toggle off
      const next = { ...translatedMessages };
      delete next[msg.id];
      setTranslatedMessages(next);
    } else {
      // Translate to current language
      const translated = simulateTranslate(msg.text, language);
      setTranslatedMessages({
        ...translatedMessages,
        [msg.id]: translated,
      });
    }
  };

  const QUICK_EMOJIS = ['👍', '❤️', '🔥', '😂', '👏', '🎉', '🔐', '🚀'];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900/60 overflow-hidden relative">
      {/* Hidden File Inputs for real seamless uploads */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleRealPhotoUpload}
        className="hidden"
      />
      <input
        ref={docInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.zip,.txt,.xlsx,.json"
        onChange={handleRealDocUpload}
        className="hidden"
      />

      {/* Top Chat Header */}
      <div className="p-3 sm:p-4 px-4 sm:px-6 bg-slate-950/85 border-b border-slate-850 flex items-center justify-between backdrop-blur-md z-20">
        <div className="flex items-center gap-3 min-w-0">
          {onBackMobile && (
            <button
              onClick={onBackMobile}
              className="p-1.5 -ml-1 text-slate-400 hover:text-white md:hidden"
            >
              <ChevronLeft size={22} />
            </button>
          )}

          {/* Avatar with click to open profile/info */}
          <div
            onClick={() => {
              if (chat.isGroup) {
                onOpenGroupModal();
              } else if (onOpenUserProfile && peer) {
                onOpenUserProfile(peer);
              } else {
                onOpenSecurityModal();
              }
            }}
            className="relative cursor-pointer group shrink-0"
            title="View profile and status"
          >
            <img
              src={chat.avatar}
              alt={chat.name}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl object-cover border border-slate-800 group-hover:border-blue-500 transition-colors"
            />
            {!chat.isGroup && peer?.isOnline && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
            )}
            {chat.isGroup && (
              <span className="absolute -bottom-0.5 -right-0.5 p-0.5 rounded-md bg-blue-600 border border-slate-950 text-white">
                <Users size={10} />
              </span>
            )}
          </div>

          {/* Name & status */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2
                onClick={() => {
                  if (chat.isGroup) {
                    onOpenGroupModal();
                  } else if (onOpenUserProfile && peer) {
                    onOpenUserProfile(peer);
                  } else {
                    onOpenSecurityModal();
                  }
                }}
                className="font-bold text-sm sm:text-base text-white truncate cursor-pointer hover:text-blue-400 transition-colors"
              >
                {chat.name}
              </h2>

              {/* Verified Plus Badge */}
              {!chat.isGroup && peer?.isPremium && (
                <span title="Verified BartaBlue Plus Member" className="flex items-center text-amber-400 shrink-0">
                  <BadgeCheck size={16} className="fill-amber-400 text-slate-950" />
                </span>
              )}

              {/* End to End Encryption verified badge */}
              <button
                onClick={onOpenSecurityModal}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-400 font-semibold hover:bg-emerald-500/20 transition-all shrink-0 ml-1"
                title={chat.isGroup ? "Sender Keys Protocol Active - Click to inspect group keys" : "Tap to verify 60-digit E2EE safety numbers"}
              >
                <Lock size={10} />
                <span className="hidden sm:inline">
                  {chat.isGroup ? 'Sender Keys E2EE' : 'E2EE Verified'}
                </span>
              </button>
            </div>

            <div className="text-xs text-slate-400 flex items-center gap-2 truncate">
              {isPeerTyping ? (
                <span className="text-blue-400 font-medium animate-pulse flex items-center gap-1">
                  <span>{chat.isGroup ? 'Someone' : peer.name} is typing</span>
                  <span className="flex gap-0.5">
                    <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" />
                    <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </span>
                </span>
              ) : chat.isGroup ? (
                <span>{chat.members.length} members</span>
              ) : peer.isOnline ? (
                <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                  <span>{getTranslation(language, 'online')}</span>
                  {peer.customStatus && (
                    <span className="text-slate-400 text-[11px] truncate max-w-[200px]">
                      • {peer.customStatusEmoji || '⚡'} {peer.customStatus}
                    </span>
                  )}
                </span>
              ) : (
                <span>{peer.lastSeen ? `${getTranslation(language, 'last_seen')} ${peer.lastSeen}` : 'Offline'}</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Free Voice Call button */}
          <button
            onClick={() => onStartCall('voice')}
            className="p-2 sm:p-2.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
            title="Start Free HD Voice Call"
          >
            <Phone size={19} />
          </button>

          {/* Free Video Call button */}
          <button
            onClick={() => onStartCall('video')}
            className="p-2 sm:p-2.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
            title="Start Free 4K HD Video Call"
          >
            <Video size={19} />
          </button>

          {/* Individual notification settings */}
          <button
            onClick={onOpenNotificationModal}
            className={`p-2 sm:p-2.5 rounded-xl transition-all ${
              chat.notificationSettings.isMuted
                ? 'text-amber-400 hover:bg-amber-500/10'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Notification Settings"
          >
            {chat.notificationSettings.isMuted ? <BellOff size={19} /> : <Bell size={19} />}
          </button>

          {/* Group details or security */}
          <button
            onClick={() => {
              if (chat.isGroup) {
                onOpenGroupModal();
              } else if (onOpenUserProfile && peer) {
                onOpenUserProfile(peer);
              } else {
                onOpenSecurityModal();
              }
            }}
            className="p-2 sm:p-2.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
            title="Details & Profile"
          >
            <Info size={19} />
          </button>
        </div>
      </div>

      {/* Disappearing Messages Notice Banner if configured */}
      {chat.disappearingMessagesTime && chat.disappearingMessagesTime > 0 && (
        <div className="bg-blue-950/40 border-b border-blue-500/20 px-4 py-1.5 flex items-center justify-center gap-2 text-[11px] text-blue-300">
          <Clock size={12} className="text-blue-400" />
          <span>Disappearing messages enabled ({chat.disappearingMessagesTime}h timer)</span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {/* End to End Encryption Security Seal Banner */}
        <div className="max-w-md mx-auto my-3 p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-2xl text-center shadow-lg">
          <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto mb-2 border border-blue-500/30">
            <Lock size={15} />
          </div>
          <p className="text-xs text-slate-300 font-semibold mb-1">
            {chat.isGroup ? 'Sender Keys Protocol Active' : 'End-to-End Encrypted'}
          </p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {chat.isGroup ? (
              <>
                Messages in this group are securely managed with <strong>Sender Keys</strong> (AES-256 & Curve25519 signatures). No outside server can inspect group payloads.{' '}
                <button
                  onClick={onOpenSecurityModal}
                  className="text-blue-400 hover:underline font-medium inline-block ml-0.5"
                >
                  View Sender Key Registry
                </button>
              </>
            ) : (
              <>
                Messages and calls are secured with 256-bit AES encryption. No one outside of this chat, not even BartaBlue, can read or listen to them.{' '}
                <button
                  onClick={onOpenSecurityModal}
                  className="text-blue-400 hover:underline font-medium inline-block ml-0.5"
                >
                  Verify safety numbers
                </button>
              </>
            )}
          </p>
        </div>

        {/* Message Bubbles */}
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          const isTranslated = !!translatedMessages[msg.id];

          return (
            <div
              key={msg.id}
              className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}
            >
              {/* Group sender name if incoming */}
              {!isMe && chat.isGroup && (
                <span className="text-[11px] font-bold text-blue-400 mb-1 ml-2">
                  {msg.senderName}
                </span>
              )}

              {/* Bubble Container */}
              <div className="relative max-w-[85%] sm:max-w-[70%]">
                <div
                  className={`p-3 sm:p-3.5 rounded-2xl transition-all shadow-md ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-br-sm shadow-blue-900/20'
                      : 'bg-slate-800 text-slate-100 rounded-bl-sm border border-slate-700/60 shadow-slate-950/40'
                  }`}
                >
                  {/* View-Once Content Renderer */}
                  {msg.isViewOnce ? (
                    msg.viewOnceOpened ? (
                      <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-950/40 border border-slate-700/50 text-slate-400 select-none">
                        <div className="w-6 h-6 rounded-full border border-dashed border-slate-500 flex items-center justify-center font-bold text-xs">
                          1
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-300">Opened</div>
                          <div className="text-[10px] text-slate-500 font-mono">View-once message expired</div>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => onOpenMediaViewer(msg)}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 cursor-pointer hover:bg-amber-500/30 transition-all shadow-md group/vo"
                      >
                        <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
                          1
                        </div>
                        <div>
                          <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                            <span>View-Once {msg.type === 'video' ? 'Video' : msg.type === 'document' ? 'Document' : msg.type === 'audio' ? 'Voice Note' : 'Photo'}</span>
                            <Sparkles size={11} className="text-amber-400 animate-pulse" />
                          </div>
                          <div className="text-[10px] text-amber-200/80">Tap to open • Vanishes after viewing</div>
                        </div>
                      </div>
                    )
                  ) : (
                    <>
                      {/* Media Content: Image */}
                      {msg.type === 'image' && msg.mediaUrl && (
                        <div
                          onClick={() => onOpenMediaViewer(msg)}
                          className="cursor-pointer mb-2 rounded-xl overflow-hidden group/img relative"
                        >
                          <img
                            src={msg.mediaUrl}
                            alt="Shared image"
                            className="max-h-72 w-full object-cover rounded-xl group-hover/img:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="px-3 py-1 bg-slate-900/80 backdrop-blur-md rounded-lg text-xs font-semibold text-white flex items-center gap-1.5">
                              <Eye size={13} /> View full image
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Media Content: Video */}
                      {msg.type === 'video' && msg.mediaUrl && (
                        <div className="mb-2 rounded-xl overflow-hidden bg-black/40">
                          <video
                            src={msg.mediaUrl}
                            controls
                            className="max-h-72 w-full rounded-xl object-contain bg-black"
                          />
                        </div>
                      )}

                      {/* Media Content: Document */}
                      {msg.type === 'document' && (
                        <div
                          onClick={() => onOpenMediaViewer(msg)}
                          className="cursor-pointer flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/40 border border-slate-700/60 mb-2 hover:bg-slate-950/60 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-blue-300 flex items-center justify-center shrink-0">
                            <FileText size={20} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold truncate text-white">
                              {msg.mediaName || 'Document.pdf'}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {msg.mediaSize || '2.4 MB'} • Encrypted Document
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Media Content: Voice Note */}
                      {msg.type === 'audio' && (
                        <VoicePlayer
                          duration={msg.mediaDuration || 24}
                          isCurrentUser={isMe}
                          transcription={msg.transcription}
                          onOpenPlusModal={onOpenPlusModal}
                          isPlusUser={currentUser.isPremium}
                        />
                      )}

                      {/* Text Payload */}
                      {msg.text && msg.type !== 'audio' && (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {isTranslated ? translatedMessages[msg.id] : msg.text}
                        </p>
                      )}
                    </>
                  )}

                  {/* Translation footnote badge */}
                  {isTranslated && (
                    <div className="mt-1 pt-1 border-t border-white/20 text-[10px] opacity-80 flex items-center gap-1 font-sans">
                      <Languages size={10} />
                      <span>{getTranslation(language, 'translated_from')} auto</span>
                    </div>
                  )}

                  {/* Metadata: Time, Status Ticks, E2EE Lock, Sender Key Tag */}
                  <div className="flex items-center justify-end gap-1.5 mt-1.5 text-[10px] opacity-80 font-mono">
                    {chat.isGroup && (
                      <span
                        className="px-1 py-0.2 rounded bg-blue-500/25 text-blue-200 border border-blue-400/30 text-[9px] font-bold"
                        title={`Sender Keys Protocol: ${msg.senderKeyId || 'SK-70B42'} • Chain Index #${msg.senderChainIndex || 1}`}
                      >
                        {msg.senderKeyId || 'SK'}
                      </span>
                    )}
                    <span title={chat.isGroup ? `Sender Keys End-to-End Encrypted (${msg.senderKeyId || 'SK-70B42'})` : "256-bit encrypted message payload"}>
                      <Lock size={9} />
                    </span>
                    <span>{msg.timestamp}</span>

                    {/* Delivery checkmarks for user's messages */}
                    {isMe && (
                      <span className="ml-0.5">
                        {msg.status === 'read' ? (
                          <span title="Read">
                            <CheckCheck size={13} className="text-cyan-300" />
                          </span>
                        ) : msg.status === 'delivered' ? (
                          <span title="Delivered">
                            <CheckCheck size={13} className="opacity-80" />
                          </span>
                        ) : (
                          <span title="Sent">
                            <Check size={13} className="opacity-70" />
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Floating Quick Action Bar on Hover (Translate + Reactions) */}
                <div
                  className={`absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 z-10 ${
                    isMe ? '-left-24 -translate-x-1' : '-right-24 translate-x-1'
                  }`}
                >
                  {/* Translate button */}
                  {msg.text && (
                    <button
                      onClick={() => handleToggleTranslate(msg)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 text-xs shadow-md"
                      title={isTranslated ? 'Show original' : `Translate message`}
                    >
                      <Languages size={14} />
                    </button>
                  )}

                  {/* Quick Reaction Heart */}
                  <button
                    onClick={() => onToggleReaction(msg.id, '❤️')}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 text-xs shadow-md"
                    title="React with heart"
                  >
                    ❤️
                  </button>
                  <button
                    onClick={() => onToggleReaction(msg.id, '👍')}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 text-xs shadow-md"
                    title="React with thumbs up"
                  >
                    👍
                  </button>
                </div>

                {/* Reaction Badges on bottom */}
                {msg.reactions && msg.reactions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1 -mb-1">
                    {msg.reactions.map((r, idx) => (
                      <button
                        key={idx}
                        onClick={() => onToggleReaction(msg.id, r.emoji)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border transition-all ${
                          r.users.includes(currentUser.id)
                            ? 'bg-blue-600/30 border-blue-500 text-blue-200'
                            : 'bg-slate-800 border-slate-700 text-slate-300'
                        }`}
                      >
                        <span>{r.emoji}</span>
                        <span className="text-[10px] font-mono">{r.count}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Live typing indicator bubble */}
        {isPeerTyping && (
          <div className="flex items-center gap-2 text-slate-400 text-xs py-1">
            <div className="px-3.5 py-2.5 bg-slate-800/80 rounded-2xl rounded-bl-sm border border-slate-700 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Stage */}
      <div className="p-3 sm:p-4 bg-slate-950/80 border-t border-slate-850 backdrop-blur-md relative">
        {/* Attachment Popup Menu */}
        {showAttachMenu && (
          <div className="absolute bottom-20 left-4 bg-slate-900 border border-slate-800 rounded-3xl p-2.5 shadow-2xl z-30 flex flex-col gap-1.5 w-64 animate-in fade-in slide-in-from-bottom-2 duration-150">
            {/* Real device upload button for photos & videos */}
            <button
              onClick={() => photoInputRef.current?.click()}
              className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-800 text-slate-200 text-xs font-semibold transition-colors text-left"
            >
              <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl">
                <Upload size={16} />
              </div>
              <div>
                <div>Upload Photo or Video</div>
                <div className="text-[10px] text-slate-400 font-normal">From your device (up to 2GB)</div>
              </div>
            </button>

            {/* Real device upload button for documents */}
            <button
              onClick={() => docInputRef.current?.click()}
              className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-800 text-slate-200 text-xs font-semibold transition-colors text-left"
            >
              <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
                <FileText size={16} />
              </div>
              <div>
                <div>Upload Document / PDF</div>
                <div className="text-[10px] text-slate-400 font-normal">PDF, Zip, Doc (up to 2GB)</div>
              </div>
            </button>

            <div className="h-px bg-slate-800 my-0.5" />

            {/* Quick Presets */}
            <button
              onClick={() => handleSimulateAttachment('image')}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs transition-colors"
            >
              <ImageIcon size={14} className="text-purple-400" />
              <span>Sample Design Mockup</span>
            </button>
            <button
              onClick={() => handleSimulateAttachment('document')}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs transition-colors"
            >
              <FileText size={14} className="text-blue-400" />
              <span>Sample Zero-Knowledge Whitepaper</span>
            </button>

            {/* Plus Feature Callout */}
            <div className="mt-1 p-2 rounded-xl bg-blue-950/40 border border-blue-500/30 text-[10px] text-blue-300 flex items-center gap-1.5">
              <Sparkles size={12} className="text-amber-300 shrink-0" />
              <span>2GB File Sharing enabled with BartaBlue Plus</span>
            </div>
          </div>
        )}

        {/* Quick Emoji Bar */}
        {showEmojiPicker && (
          <div className="absolute bottom-20 left-12 bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-2xl z-30 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  setInputText((prev) => prev + emoji);
                  setShowEmojiPicker(false);
                }}
                className="text-xl p-1.5 hover:scale-125 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Voice Recorder Overlay or Text Input Bar */}
        {isRecordingVoice ? (
          <VoiceRecorder
            onSendVoice={handleSendVoiceNote}
            onCancel={() => setIsRecordingVoice(false)}
          />
        ) : (
          <form onSubmit={handleSend} className="flex items-center gap-2">
            {/* Attachment Button */}
            <button
              type="button"
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-2xl transition-all"
              title="Attach photos, videos, or documents (up to 2GB)"
            >
              <Paperclip size={20} />
            </button>

            {/* Emoji Picker toggle */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-2xl transition-all hidden sm:block"
              title="Emoji reaction"
            >
              <Smile size={20} />
            </button>

            {/* Main Text Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={getTranslation(language, 'type_message')}
                className="w-full bg-slate-900 border border-slate-800/90 focus:border-blue-500 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all shadow-inner"
              />
            </div>

            {/* View-Once Toggle (1) Button */}
            <button
              type="button"
              onClick={() => setIsViewOnceMode(!isViewOnceMode)}
              className={`p-2.5 rounded-2xl transition-all flex items-center justify-center shrink-0 ${
                isViewOnceMode
                  ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30 ring-2 ring-amber-400 scale-105'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title={
                isViewOnceMode
                  ? 'View-Once mode active: Message will vanish after recipient views it once'
                  : 'Enable View-Once (disappears permanently after viewing)'
              }
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-black leading-none ${
                  isViewOnceMode ? 'border-slate-950 text-slate-950' : 'border-current'
                }`}
              >
                1
              </div>
            </button>

            {/* Send or Voice Note Button */}
            {inputText.trim() ? (
              <button
                type="submit"
                className="p-3 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-2xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center shrink-0"
                title="Send encrypted message"
              >
                <Send size={18} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsRecordingVoice(true)}
                className="p-3 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white active:scale-95 rounded-2xl transition-all flex items-center justify-center shrink-0 shadow-md"
                title="Hold or click to record voice note"
              >
                <Mic size={18} />
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
