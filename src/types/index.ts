export type UserStatus = 'online' | 'offline' | 'away' | 'busy';

export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  status: UserStatus;
  customStatus?: string;
  customStatusEmoji?: string;
  bio?: string;
  phone?: string;
  isOnline: boolean;
  lastSeen?: string;
  isPremium?: boolean;
}

export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'document' | 'system';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[]; // user IDs
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  status: MessageStatus;
  type: MessageType;
  mediaUrl?: string;
  mediaName?: string;
  mediaSize?: string;
  mediaDuration?: number; // for audio/video in seconds
  transcription?: string; // Voice-to-text transcription feature for BartaBlue Plus
  isViewOnce?: boolean; // Disappears permanently after viewing once
  viewOnceOpened?: boolean; // Whether the view-once media has already been viewed
  reactions?: MessageReaction[];
  isEncrypted: boolean;
  safetyHash?: string;
  senderKeyId?: string; // Sender Keys protocol identifier for group chats
  senderChainIndex?: number;
  translatedText?: string;
  replyTo?: {
    id: string;
    senderName: string;
    text: string;
  };
}

export interface ChatNotificationSettings {
  isMuted: boolean;
  muteUntil?: string; // '8h' | '1w' | 'always'
  customTone?: string;
  showPreviews: boolean;
  vibrate: boolean;
}

export interface Chat {
  id: string;
  type: 'direct' | 'group';
  name: string;
  avatar: string;
  members: User[];
  isGroup: boolean;
  adminIds?: string[];
  description?: string;
  lastMessage?: {
    text: string;
    timestamp: string;
    senderId: string;
    status: MessageStatus;
    type: MessageType;
  };
  unreadCount: number;
  isPinned: boolean;
  notificationSettings: ChatNotificationSettings;
  disappearingMessagesTime?: number; // in hours, 0 for off, 24, 168 (7d), 2160 (90d)
  encryptionSafetyCode?: string;
  isVerifiedE2EE?: boolean;
}

export interface LinkedDevice {
  id: string;
  name: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'browser';
  os: string;
  browser?: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
  ipAddress: string;
}

export interface CloudBackupState {
  lastBackupDate: string;
  totalSizeMb: number;
  chatsCount: number;
  mediaCount: number;
  storageLimitMb: number;
  provider: 'BartaCloud' | 'Google Drive' | 'iCloud';
  autoBackupFrequency: 'daily' | 'weekly' | 'manual';
  isBackingUp: boolean;
  includeVideos: boolean;
}

export type SupportedLanguage = 'en' | 'bn' | 'es' | 'hi' | 'fr' | 'de' | 'ar';

export interface ActiveCall {
  active: boolean;
  type: 'voice' | 'video';
  status: 'calling' | 'ringing' | 'connected' | 'ended';
  peer: {
    id: string;
    name: string;
    avatar: string;
    isGroup?: boolean;
    groupMembers?: number;
  };
  duration: number; // in seconds
  isMuted: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  isSpeakerOn: boolean;
  is4KQuality?: boolean;
}
