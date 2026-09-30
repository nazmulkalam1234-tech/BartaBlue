import React, { useState } from 'react';
import {
  Search,
  Plus,
  Users,
  MessageSquare,
  ShieldCheck,
  Settings,
  Pin,
  BellOff,
  Check,
  CheckCheck,
  Image as ImageIcon,
  Mic,
  FileText,
  Sparkles,
  Lock,
  Globe,
  Circle,
  BadgeCheck,
  Fingerprint,
} from 'lucide-react';
import { Chat, SupportedLanguage, User } from '../types';
import { getTranslation } from '../services/translations';

interface SidebarProps {
  chats: Chat[];
  activeChatId: string;
  onSelectChat: (chatId: string) => void;
  currentUser: User;
  onOpenSettings: () => void;
  onOpenNewGroup: () => void;
  onOpenUserProfile: () => void;
  onOpenPlusModal: () => void;
  onLockApp?: () => void;
  language: SupportedLanguage;
}

export const Sidebar: React.FC<SidebarProps> = ({
  chats,
  activeChatId,
  onSelectChat,
  currentUser,
  onOpenSettings,
  onOpenNewGroup,
  onOpenUserProfile,
  onOpenPlusModal,
  onLockApp,
  language,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'direct' | 'groups' | 'unread'>('all');

  const filteredChats = chats
    .filter((chat) => {
      // Filter tab
      if (activeFilter === 'direct' && chat.isGroup) return false;
      if (activeFilter === 'groups' && !chat.isGroup) return false;
      if (activeFilter === 'unread' && chat.unreadCount === 0) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = chat.name.toLowerCase().includes(query);
        const matchesLastMsg = chat.lastMessage?.text?.toLowerCase().includes(query);
        return matchesName || matchesLastMsg;
      }
      return true;
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });

  const renderStatusTicks = (status?: string) => {
    if (!status) return null;
    if (status === 'read') {
      return <CheckCheck size={14} className="text-blue-400 shrink-0 inline" />;
    }
    if (status === 'delivered') {
      return <CheckCheck size={14} className="text-slate-400 shrink-0 inline" />;
    }
    return <Check size={14} className="text-slate-400 shrink-0 inline" />;
  };

  const renderMessageIcon = (type?: string) => {
    if (type === 'image') return <ImageIcon size={13} className="text-blue-400 shrink-0 inline mr-1" />;
    if (type === 'audio') return <Mic size={13} className="text-teal-400 shrink-0 inline mr-1" />;
    if (type === 'document') return <FileText size={13} className="text-amber-400 shrink-0 inline mr-1" />;
    return null;
  };

  return (
    <aside className="w-full md:w-80 lg:w-96 h-full bg-slate-950/80 border-r border-slate-850 flex flex-col justify-between shrink-0 select-none">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-850 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-700 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-600/30 text-white font-extrabold text-lg">
              B
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white text-base tracking-tight">
                  {getTranslation(language, 'app_title')}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" title="Cross-platform sync connected" />
              </div>
              <div className="flex items-center gap-1 text-[10px] text-blue-400 font-medium">
                <Lock size={10} />
                <span>256-Bit E2EE Vault</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Plus shortcut button */}
            <button
              onClick={onOpenPlusModal}
              className="p-2 text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 rounded-xl transition-all"
              title="BartaBlue Plus"
            >
              <Sparkles size={18} />
            </button>

            {/* New Group button */}
            <button
              onClick={onOpenNewGroup}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
              title="Create New Group"
            >
              <Users size={18} />
            </button>

            {/* Biometric lock button */}
            {onLockApp && (
              <button
                onClick={onLockApp}
                className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-xl transition-all"
                title="Lock BartaBlue with Biometrics"
              >
                <Fingerprint size={18} />
              </button>
            )}

            {/* Settings button */}
            <button
              onClick={onOpenSettings}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
              title="Settings & Privacy"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>

        {/* BartaBlue Plus Mini Banner */}
        <div
          onClick={onOpenPlusModal}
          className="p-2.5 px-3 rounded-2xl bg-gradient-to-r from-blue-950/70 via-indigo-950/50 to-purple-950/60 border border-blue-500/30 hover:border-blue-500/60 cursor-pointer transition-all flex items-center justify-between shadow-md"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
              <Sparkles size={14} className="fill-current" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1">
                BartaBlue Plus
                <BadgeCheck size={12} className="fill-amber-400 text-slate-950" />
              </div>
              <div className="text-[10px] text-slate-400">4K Calls, 2GB Files & 100GB Vault</div>
            </div>
          </div>
          <span className="text-[10px] font-bold text-blue-400 px-2 py-0.5 rounded-lg bg-blue-500/10">
            {currentUser.isPremium ? 'VIP Active' : 'Explore'}
          </span>
        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder={getTranslation(language, 'search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800/80 focus:border-blue-500/70 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 pt-0.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: getTranslation(language, 'all_chats') },
            { id: 'direct', label: getTranslation(language, 'direct') },
            { id: 'groups', label: getTranslation(language, 'groups') },
            { id: 'unread', label: getTranslation(language, 'unread') },
          ].map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as typeof activeFilter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-900/40 p-2 space-y-1">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
            <MessageSquare size={36} className="mb-2 opacity-40" />
            <p className="text-xs">No conversations found</p>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const isSelected = chat.id === activeChatId;
            const peer = chat.members.find((m) => m.id !== currentUser.id) || chat.members[0];
            const isOnline = chat.isGroup ? false : peer?.isOnline;

            return (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center gap-3 relative group ${
                  isSelected
                    ? 'bg-blue-600/15 border border-blue-500/40 text-white shadow-lg shadow-blue-950/40'
                    : 'hover:bg-slate-900/60 text-slate-300'
                }`}
              >
                {/* Avatar with status indicator */}
                <div className="relative shrink-0">
                  <img
                    src={chat.avatar}
                    alt={chat.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-800"
                  />
                  {isOnline && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950" />
                  )}
                  {chat.isGroup && (
                    <span className="absolute -bottom-0.5 -right-0.5 p-0.5 rounded-md bg-blue-600 border border-slate-950 text-white">
                      <Users size={10} />
                    </span>
                  )}
                </div>

                {/* Chat info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-bold text-sm text-white truncate">{chat.name}</span>
                      {!chat.isGroup && peer?.isPremium && (
                        <span title="Verified Plus Badge" className="shrink-0 flex items-center text-amber-400">
                          <BadgeCheck size={14} className="fill-amber-400 text-slate-950" />
                        </span>
                      )}
                      {chat.isVerifiedE2EE && (
                        <span title="E2EE Verified" className="shrink-0 flex items-center">
                          <ShieldCheck size={14} className="text-emerald-400" />
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono shrink-0 ml-1">
                      {chat.lastMessage?.timestamp || ''}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="truncate flex items-center gap-1 max-w-[170px] sm:max-w-[190px]">
                      {chat.lastMessage?.senderId === currentUser.id &&
                        renderStatusTicks(chat.lastMessage?.status)}
                      {renderMessageIcon(chat.lastMessage?.type)}
                      <span className="truncate">{chat.lastMessage?.text || 'No messages yet'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-1">
                      {chat.notificationSettings.isMuted && (
                        <span title="Muted" className="flex items-center">
                          <BellOff size={13} className="text-slate-500" />
                        </span>
                      )}
                      {chat.isPinned && (
                        <span title="Pinned" className="flex items-center">
                          <Pin size={13} className="text-blue-400" />
                        </span>
                      )}
                      {chat.unreadCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center shadow-md shadow-blue-600/30">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* User Profile Mini Footer */}
      <div className="p-3 border-t border-slate-850 bg-slate-950/90">
        <div
          onClick={onOpenUserProfile}
          className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-900 cursor-pointer transition-colors"
          title="Click to customize profile picture and status update"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-blue-500/50"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-950" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white truncate max-w-[110px]">{currentUser.name}</span>
                {currentUser.isPremium && (
                  <span className="flex items-center text-amber-400">
                    <BadgeCheck size={14} className="fill-amber-400 text-slate-950" />
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 truncate max-w-[140px] flex items-center gap-1">
                <span>{currentUser.customStatusEmoji || '⚡'}</span>
                <span className="truncate">{currentUser.customStatus || currentUser.handle}</span>
              </div>
            </div>
          </div>

          <div
            onClick={(e) => {
              e.stopPropagation();
              onOpenSettings();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
            title="Settings"
          >
            <Settings size={18} />
          </div>
        </div>
      </div>
    </aside>
  );
};
