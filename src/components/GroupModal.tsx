import React, { useState } from 'react';
import { Users, Shield, Plus, Check, UserMinus, Image as ImageIcon, Camera, KeyRound } from 'lucide-react';
import { Chat, User } from '../types';

interface GroupModalProps {
  chat?: Chat; // if editing/viewing existing group
  availableContacts: User[];
  currentUser: User;
  onClose: () => void;
  onCreateGroup?: (name: string, description: string, memberIds: string[], avatarUrl: string) => void;
  onLeaveGroup?: (chatId: string) => void;
}

export const GroupModal: React.FC<GroupModalProps> = ({
  chat,
  availableContacts,
  currentUser,
  onClose,
  onCreateGroup,
  onLeaveGroup,
}) => {
  const isEditing = !!chat;
  const [groupName, setGroupName] = useState(chat ? chat.name : '');
  const [description, setDescription] = useState(chat?.description || '');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(
    chat ? chat.members.map((m) => m.id) : [currentUser.id]
  );
  const [avatarUrl, setAvatarUrl] = useState(
    chat?.avatar ||
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80'
  );

  const toggleMember = (userId: string) => {
    if (userId === currentUser.id) return; // Cannot remove self when creating
    if (selectedMemberIds.includes(userId)) {
      setSelectedMemberIds(selectedMemberIds.filter((id) => id !== userId));
    } else {
      setSelectedMemberIds([...selectedMemberIds, userId]);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    if (onCreateGroup) {
      onCreateGroup(groupName.trim(), description.trim(), selectedMemberIds, avatarUrl);
    }
    onClose();
  };

  const GROUP_AVATAR_PRESETS = [
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=150&auto=format&fit=crop&q=80',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-2xl border border-blue-500/30">
              <Users size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {isEditing ? 'Group Details & Members' : 'Create New Group'}
              </h3>
              <p className="text-xs text-slate-400">
                {isEditing ? `${chat.members.length} Participants` : 'Connect multiple friends at once'}
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

        {/* Content */}
        <form onSubmit={handleCreate} className="p-6 space-y-5 overflow-y-auto max-h-[72vh]">
          {/* Avatar and Name */}
          <div className="flex items-center gap-4">
            <div className="relative group shrink-0">
              <img
                src={avatarUrl}
                alt="Group avatar"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-500/40"
              />
              <div className="absolute inset-0 bg-slate-950/50 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                <Camera size={20} className="text-white" />
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Group Name
              </label>
              <input
                type="text"
                required
                disabled={isEditing}
                placeholder="e.g. Project Apollo 🚀"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Avatar Presets (if creating) */}
          {!isEditing && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Choose Group Icon
              </label>
              <div className="flex gap-2.5">
                {GROUP_AVATAR_PRESETS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAvatarUrl(url)}
                    className={`w-11 h-11 rounded-xl overflow-hidden border-2 transition-all ${
                      avatarUrl === url ? 'border-blue-500 scale-105 shadow-md shadow-blue-500/40' : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Description / Topic
            </label>
            <textarea
              rows={2}
              disabled={isEditing}
              placeholder="What is this group about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 outline-none transition-all resize-none"
            />
          </div>

          {/* Members list */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {isEditing ? 'Members' : 'Select Members'} ({selectedMemberIds.length})
              </label>
              <span className="text-[11px] text-blue-400">All members protected with E2EE</span>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {/* Current user */}
              <div className="flex items-center justify-between p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-9 h-9 rounded-full object-cover" />
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      {currentUser.name}
                      <span className="text-[10px] px-1.5 py-0.2 bg-blue-500/20 text-blue-400 rounded-md font-semibold">
                        You (Admin)
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">{currentUser.handle}</div>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center text-white text-xs">
                  <Check size={14} />
                </div>
              </div>

              {/* Other contacts */}
              {availableContacts.map((contact) => {
                const isSelected = selectedMemberIds.includes(contact.id);
                const isAdmin = chat?.adminIds?.includes(contact.id);

                return (
                  <div
                    key={contact.id}
                    onClick={() => !isEditing && toggleMember(contact.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      isEditing
                        ? 'bg-slate-950/50 border-slate-800/80'
                        : isSelected
                        ? 'bg-blue-600/10 border-blue-500/40 cursor-pointer'
                        : 'bg-slate-950/30 border-slate-800/60 hover:bg-slate-850 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img src={contact.avatar} alt={contact.name} className="w-9 h-9 rounded-full object-cover" />
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          {contact.name}
                          {isAdmin && (
                            <span className="text-[10px] px-1.5 py-0.2 bg-purple-500/20 text-purple-400 rounded-md font-semibold">
                              Admin
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">{contact.handle}</div>
                      </div>
                    </div>

                    {!isEditing && (
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center text-xs transition-colors ${
                          isSelected ? 'bg-blue-600 text-white' : 'border border-slate-700 bg-slate-800'
                        }`}
                      >
                        {isSelected && <Check size={14} />}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sender Keys Protocol Status Card for Groups */}
          {isEditing && (
            <div className="p-3.5 bg-blue-950/40 border border-blue-500/30 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-300 font-bold text-xs">
                  <KeyRound size={14} className="text-blue-400" />
                  <span>Sender Keys Protocol Active</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
                  E2EE Verified
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Messages in this group are securely managed via <strong>Sender Keys</strong>. Each member encrypts broadcast messages using an individual 32-byte Sender Chain Key distributed through 1-on-1 pairwise sessions.
              </p>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            {isEditing && onLeaveGroup ? (
              <button
                type="button"
                onClick={() => {
                  onLeaveGroup(chat.id);
                  onClose();
                }}
                className="px-4 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
              >
                Leave Group
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            )}

            {!isEditing && (
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all"
              >
                Create Group
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
