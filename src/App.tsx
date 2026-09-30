import React, { useState } from 'react';
import {
  ActiveCall,
  Chat,
  ChatNotificationSettings,
  CloudBackupState,
  LinkedDevice,
  Message,
  SupportedLanguage,
  User,
} from './types';
import {
  CURRENT_USER,
  INITIAL_BACKUP_STATE,
  INITIAL_CHATS,
  INITIAL_LINKED_DEVICES,
  INITIAL_MESSAGES,
} from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { CallModal } from './components/CallModal';
import { SecurityVerifyModal } from './components/SecurityVerifyModal';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import { GroupModal } from './components/GroupModal';
import { MediaViewerModal } from './components/MediaViewerModal';
import { SettingsModal } from './components/SettingsModal';
import { UserProfileModal } from './components/UserProfileModal';
import { BartaBluePlusModal } from './components/BartaBluePlusModal';
import { BiometricLockScreen } from './components/BiometricLockScreen';
import { soundEffects } from './services/soundEffects';

export default function App() {
  // Global App States
  const [currentUser, setCurrentUser] = useState<User>(CURRENT_USER);
  const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState<string>('chat_sophia');
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const [linkedDevices, setLinkedDevices] = useState<LinkedDevice[]>(INITIAL_LINKED_DEVICES);
  const [backupState, setBackupState] = useState<CloudBackupState>(INITIAL_BACKUP_STATE);
  const [language, setLanguage] = useState<SupportedLanguage>('en');

  // Security & Biometric Lock State
  const [isAppLocked, setIsAppLocked] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(true);
  const [autoLockDelay, setAutoLockDelay] = useState('immediate');

  // Modals
  const [showSettings, setShowSettings] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showPlusModal, setShowPlusModal] = useState(false);
  const [selectedProfileUser, setSelectedProfileUser] = useState<User | null>(null);
  const [activeMediaMessage, setActiveMediaMessage] = useState<Message | null>(null);

  // Active Calling State
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);

  // Mobile layout navigation: 'sidebar' | 'chat'
  const [mobileView, setMobileView] = useState<'sidebar' | 'chat'>('chat');

  // Activate BartaBlue Plus (Unlocks 4K Calling, 2GB Files, Voice Transcriptions, Verified Badge, 100GB Cloud Vault)
  const handleActivatePlus = () => {
    setCurrentUser((prev) => ({ ...prev, isPremium: true }));
    setBackupState((prev) => ({
      ...prev,
      storageLimitMb: 102400, // 100GB
    }));
  };

  // Active chat reference
  const currentChat = chats.find((c) => c.id === activeChatId) || chats[0];
  const currentMessages = messagesMap[currentChat?.id] || [];

  // All known contacts for group creations
  const availableContacts = chats
    .flatMap((c) => c.members)
    .filter(
      (user, index, self) =>
        user.id !== currentUser.id && index === self.findIndex((u) => u.id === user.id)
    );

  // Send a message
  const handleSendMessage = (
    text: string,
    type: 'text' | 'image' | 'video' | 'audio' | 'document' = 'text',
    mediaDetails?: { url?: string; name?: string; size?: string; duration?: number; isViewOnce?: boolean }
  ) => {
    if (!currentChat) return;

    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      chatId: currentChat.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'read',
      type,
      mediaUrl: mediaDetails?.url,
      mediaName: mediaDetails?.name,
      mediaSize: mediaDetails?.size,
      mediaDuration: mediaDetails?.duration,
      isEncrypted: true,
      isViewOnce: mediaDetails?.isViewOnce,
      viewOnceOpened: false,
      safetyHash: `sha256-${Math.random().toString(16).substring(2, 8)}`,
      senderKeyId: currentChat.isGroup ? `SK-${Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase()}` : undefined,
      senderChainIndex: currentChat.isGroup ? (messagesMap[currentChat.id]?.length || 0) + 1 : undefined,
    };

    setMessagesMap((prev) => ({
      ...prev,
      [currentChat.id]: [...(prev[currentChat.id] || []), newMessage],
    }));

    // Update last message in chat list
    setChats((prev) =>
      prev.map((c) =>
        c.id === currentChat.id
          ? {
              ...c,
              lastMessage: {
                text: mediaDetails?.isViewOnce ? 'View-once media' : type === 'audio' ? 'Voice Note' : text,
                timestamp: newMessage.timestamp,
                senderId: currentUser.id,
                status: 'read',
                type,
              },
            }
          : c
      )
    );
  };

  // Mark View-Once message as viewed and expired
  const handleViewOnceViewed = (messageId: string) => {
    setMessagesMap((prev) => {
      const chatMsgs = prev[activeChatId] || [];
      const updated = chatMsgs.map((m) =>
        m.id === messageId ? { ...m, viewOnceOpened: true } : m
      );
      return {
        ...prev,
        [activeChatId]: updated,
      };
    });
  };

  // Toggle reaction on a message
  const handleToggleReaction = (messageId: string, emoji: string) => {
    setMessagesMap((prev) => {
      const chatMsgs = prev[currentChat.id] || [];
      const updated = chatMsgs.map((m) => {
        if (m.id !== messageId) return m;
        const reactions = m.reactions ? [...m.reactions] : [];
        const existingIdx = reactions.findIndex((r) => r.emoji === emoji);

        if (existingIdx >= 0) {
          const rx = reactions[existingIdx];
          const hasReacted = rx.users.includes(currentUser.id);
          if (hasReacted) {
            // Remove user reaction
            const newUsers = rx.users.filter((u) => u !== currentUser.id);
            if (newUsers.length === 0) {
              reactions.splice(existingIdx, 1);
            } else {
              reactions[existingIdx] = { ...rx, count: rx.count - 1, users: newUsers };
            }
          } else {
            // Add user reaction
            reactions[existingIdx] = {
              ...rx,
              count: rx.count + 1,
              users: [...rx.users, currentUser.id],
            };
          }
        } else {
          // New emoji reaction
          reactions.push({ emoji, count: 1, users: [currentUser.id] });
        }

        return { ...m, reactions };
      });

      return {
        ...prev,
        [currentChat.id]: updated,
      };
    });
  };

  // Call handlers
  const handleStartCall = (type: 'voice' | 'video') => {
    if (!currentChat) return;
    const peer = currentChat.members.find((m) => m.id !== currentUser.id) || currentChat.members[0];

    setActiveCall({
      active: true,
      type,
      status: 'calling',
      peer: {
        id: currentChat.isGroup ? currentChat.id : peer.id,
        name: currentChat.name,
        avatar: currentChat.avatar,
        isGroup: currentChat.isGroup,
        groupMembers: currentChat.members.length,
      },
      duration: 0,
      isMuted: false,
      isVideoEnabled: type === 'video',
      isScreenSharing: false,
      isSpeakerOn: true,
    });
  };

  const handleEndCall = () => {
    setActiveCall(null);
  };

  // Save individual chat notification preferences
  const handleSaveChatNotification = (settings: ChatNotificationSettings) => {
    setChats((prev) =>
      prev.map((c) => (c.id === currentChat.id ? { ...c, notificationSettings: settings } : c))
    );
  };

  // Mark chat as verified E2EE
  const handleMarkVerifiedE2EE = (chatId: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, isVerifiedE2EE: !c.isVerifiedE2EE } : c))
    );
  };

  // Create new group chat
  const handleCreateGroup = (
    name: string,
    description: string,
    memberIds: string[],
    avatarUrl: string
  ) => {
    const groupMembers = [
      currentUser,
      ...availableContacts.filter((c) => memberIds.includes(c.id)),
    ];

    const newGroupChat: Chat = {
      id: `group_${Date.now()}`,
      type: 'group',
      name,
      avatar: avatarUrl,
      members: groupMembers,
      isGroup: true,
      adminIds: [currentUser.id],
      description,
      lastMessage: {
        text: 'Group created with end-to-end encryption.',
        timestamp: 'Just now',
        senderId: currentUser.id,
        status: 'read',
        type: 'text',
      },
      unreadCount: 0,
      isPinned: false,
      notificationSettings: {
        isMuted: false,
        showPreviews: true,
        vibrate: true,
      },
      disappearingMessagesTime: 0,
      encryptionSafetyCode: '82910 48291 03948 11928 47291 93847 18274 92837 46581 02938 47192 83746',
      isVerifiedE2EE: true,
    };

    setChats((prev) => [newGroupChat, ...prev]);
    setActiveChatId(newGroupChat.id);
    setMessagesMap((prev) => ({
      ...prev,
      [newGroupChat.id]: [
        {
          id: `sys_${Date.now()}`,
          chatId: newGroupChat.id,
          senderId: currentUser.id,
          senderName: currentUser.name,
          text: `You created group "${name}" with 256-bit E2EE encryption enabled.`,
          timestamp: 'Just now',
          status: 'read',
          type: 'text',
          isEncrypted: true,
        },
      ],
    }));
  };

  // Cloud backup trigger
  const handleTriggerBackup = () => {
    setBackupState((prev) => ({ ...prev, isBackingUp: true }));
    setTimeout(() => {
      setBackupState((prev) => ({
        ...prev,
        isBackingUp: false,
        lastBackupDate: 'Just now',
        totalSizeMb: prev.totalSizeMb + 1.4,
      }));
    }, 2000);
  };

  // Unlink device
  const handleUnlinkDevice = (deviceId: string) => {
    setLinkedDevices((prev) => prev.filter((d) => d.id !== deviceId));
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
      {/* Sidebar (Full screen on mobile when mobileView === 'sidebar') */}
      <div
        className={`${
          mobileView === 'sidebar' ? 'block' : 'hidden'
        } md:block h-full w-full md:w-auto shrink-0 z-10`}
      >
        <Sidebar
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={(id) => {
            setActiveChatId(id);
            setMobileView('chat');
          }}
          currentUser={currentUser}
          onOpenSettings={() => setShowSettings(true)}
          onOpenNewGroup={() => setShowGroupModal(true)}
          onOpenUserProfile={() => setSelectedProfileUser(currentUser)}
          onOpenPlusModal={() => setShowPlusModal(true)}
          onLockApp={() => setIsAppLocked(true)}
          language={language}
        />
      </div>

      {/* Main Chat Area */}
      <main
        className={`${
          mobileView === 'chat' ? 'flex' : 'hidden'
        } md:flex flex-1 flex-col h-full overflow-hidden`}
      >
        {currentChat ? (
          <ChatArea
            chat={currentChat}
            messages={currentMessages}
            currentUser={currentUser}
            onSendMessage={handleSendMessage}
            onStartCall={handleStartCall}
            onOpenSecurityModal={() => setShowSecurityModal(true)}
            onOpenNotificationModal={() => setShowNotificationModal(true)}
            onOpenGroupModal={() => setShowGroupModal(true)}
            onOpenMediaViewer={(msg) => setActiveMediaMessage(msg)}
            onToggleReaction={handleToggleReaction}
            language={language}
            onBackMobile={() => setMobileView('sidebar')}
            onOpenUserProfile={(u) => setSelectedProfileUser(u)}
            onOpenPlusModal={() => setShowPlusModal(true)}
            onViewOnceViewed={handleViewOnceViewed}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
            <p>Select a chat or start a new encrypted conversation</p>
          </div>
        )}
      </main>

      {/* Interactive Voice and Video Call Overlay */}
      {activeCall && (
        <CallModal
          call={activeCall}
          onEndCall={handleEndCall}
          onToggleMute={() =>
            setActiveCall((prev) => (prev ? { ...prev, isMuted: !prev.isMuted } : null))
          }
          onToggleVideo={() =>
            setActiveCall((prev) =>
              prev ? { ...prev, isVideoEnabled: !prev.isVideoEnabled } : null
            )
          }
          onToggleScreenShare={() =>
            setActiveCall((prev) =>
              prev ? { ...prev, isScreenSharing: !prev.isScreenSharing } : null
            )
          }
        />
      )}

      {/* Profile Customization / Contact Profile Viewer Modal */}
      {selectedProfileUser && (
        <UserProfileModal
          user={selectedProfileUser}
          isSelf={selectedProfileUser.id === currentUser.id}
          onUpdateProfile={(updated) => {
            setCurrentUser((prev) => ({ ...prev, ...updated }));
            setChats((prev) =>
              prev.map((c) => ({
                ...c,
                members: c.members.map((m) =>
                  m.id === currentUser.id ? { ...m, ...updated } : m
                ),
              }))
            );
          }}
          onStartCall={(type) => {
            handleStartCall(type);
            setSelectedProfileUser(null);
          }}
          onOpenPlusModal={() => {
            setSelectedProfileUser(null);
            setShowPlusModal(true);
          }}
          onClose={() => setSelectedProfileUser(null)}
        />
      )}

      {/* BartaBlue Plus Subscription Tier Modal */}
      {showPlusModal && (
        <BartaBluePlusModal
          isPremium={currentUser.isPremium ?? false}
          onActivatePlus={handleActivatePlus}
          onClose={() => setShowPlusModal(false)}
        />
      )}

      {/* E2EE Safety Number Verification Modal */}
      {showSecurityModal && currentChat && (
        <SecurityVerifyModal
          chat={currentChat}
          onClose={() => setShowSecurityModal(false)}
          onMarkVerified={handleMarkVerifiedE2EE}
        />
      )}

      {/* Individual Conversation Notification Settings Modal */}
      {showNotificationModal && currentChat && (
        <NotificationSettingsModal
          chat={currentChat}
          onClose={() => setShowNotificationModal(false)}
          onSave={handleSaveChatNotification}
        />
      )}

      {/* Group Create & Info Modal */}
      {showGroupModal && (
        <GroupModal
          chat={currentChat?.isGroup ? currentChat : undefined}
          availableContacts={availableContacts}
          currentUser={currentUser}
          onClose={() => setShowGroupModal(false)}
          onCreateGroup={handleCreateGroup}
          onLeaveGroup={(chatId) => {
            setChats((prev) => prev.filter((c) => c.id !== chatId));
            if (activeChatId === chatId) {
              setActiveChatId(chats[0]?.id || '');
            }
          }}
        />
      )}

      {/* Full Screen Media Viewer */}
      {activeMediaMessage && (
        <MediaViewerModal
          message={activeMediaMessage}
          onClose={() => setActiveMediaMessage(null)}
          onViewOnceViewed={handleViewOnceViewed}
        />
      )}

      {/* Comprehensive Multi-Tab Settings Modal */}
      {showSettings && (
        <SettingsModal
          currentUser={currentUser}
          onUpdateProfile={(updated) => setCurrentUser((prev) => ({ ...prev, ...updated }))}
          linkedDevices={linkedDevices}
          onUnlinkDevice={handleUnlinkDevice}
          backupState={backupState}
          onTriggerBackup={handleTriggerBackup}
          language={language}
          onChangeLanguage={(lang) => setLanguage(lang)}
          onClose={() => setShowSettings(false)}
          onLockApp={() => setIsAppLocked(true)}
          isBiometricEnabled={isBiometricEnabled}
          onToggleBiometric={(enabled) => setIsBiometricEnabled(enabled)}
          autoLockDelay={autoLockDelay}
          onChangeAutoLockDelay={(delay) => setAutoLockDelay(delay)}
          onActivatePlus={handleActivatePlus}
        />
      )}

      {/* Biometric Security Lock Screen */}
      {isAppLocked && (
        <BiometricLockScreen
          onUnlock={() => setIsAppLocked(false)}
          correctPin="1234"
        />
      )}
    </div>
  );
}
