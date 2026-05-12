import React from 'react';
import { 
  MessageSquare, 
  History, 
  Settings, 
  LogOut, 
  User, 
  Plus,
  Trash2,
  Menu,
  X
} from 'lucide-react';
import { Chat, UserProfile } from '../types';
import { cn } from '../lib/utils';
import { auth, signOut } from '../lib/firebase';
import { Logo } from './Logo';

interface SidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (chat: Chat) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  onOpenSettings: () => void;
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  chats, 
  activeChatId, 
  onSelectChat, 
  onNewChat,
  onDeleteChat,
  onOpenSettings,
  isOpen,
  onClose,
  user
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-black border-r border-white/5 flex flex-col transition-transform lg:relative lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-white/5 bg-zinc-900/10">
          <div className="flex items-center gap-2">
            <Logo className="w-8 h-8" />
            <div className="flex items-center gap-2">
              <span className="font-black text-white tracking-tight text-xl">MiniGPT</span>
              <span className="px-1.5 py-0.5 bg-indigo-500 text-[8px] font-black uppercase tracking-widest rounded-md text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]">Pro</span>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button 
            onClick={() => {
              onNewChat();
              onClose();
            }}
            aria-label="Start New Session"
            className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-zinc-100 text-black rounded-2xl font-black shadow-lg shadow-white/5 active:scale-[0.96] transition-all"
          >
            <Plus className="w-5 h-5 stroke-[4px]" />
            <span>New Session</span>
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1 py-4">
          <div className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2 mb-2">
            <History className="w-3 h-3" />
            History
          </div>
          {chats.length === 0 ? (
            <div className="px-3 py-10 text-center text-zinc-600 text-xs italic font-bold">
              No sessions yet
            </div>
          ) : (
            chats.map((chat) => (
              <div 
                key={chat.id}
                className={cn(
                  "group relative flex items-center w-full rounded-xl text-sm px-4 py-3.5 cursor-pointer transition-all duration-200",
                  activeChatId === chat.id 
                    ? "bg-zinc-900 text-white shadow-inner font-bold" 
                    : "text-zinc-400 hover:bg-zinc-900/50 hover:text-white"
                )}
                onClick={() => {
                  onSelectChat(chat);
                  onClose();
                }}
              >
                <MessageSquare className={cn("w-4 h-4 mr-3 transition-opacity", activeChatId === chat.id ? "opacity-100" : "opacity-40")} />
                <span className="flex-1 truncate uppercase tracking-wide text-[11px] font-black">{chat.title}</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                  aria-label={`Delete session ${chat.title}`}
                  className="absolute right-2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer / Profile */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <button 
            onClick={onOpenSettings}
            aria-label="Open Settings"
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest text-zinc-500 hover:bg-zinc-900 hover:text-white rounded-xl transition-all"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
          
          <div className="flex items-center justify-between pt-2 px-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-black text-xs font-black shadow-lg overflow-hidden shrink-0">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover grayscale" />
                ) : (
                  user?.displayName?.[0] || <User className="w-5 h-5" />
                )}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-sm font-black text-white truncate">{user?.displayName || 'Personal'}</span>
                <span className="text-[10px] font-bold text-zinc-600 truncate">{user?.grade || user?.email}</span>
                {user?.bio && (
                  <span className="text-[9px] font-medium text-zinc-500 truncate mt-0.5">{user.bio}</span>
                )}
              </div>
            </div>
            <button 
              onClick={() => signOut()}
              className="p-2.5 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-4 border-t border-white/5 flex flex-col items-center gap-1 opacity-40 hover:opacity-100 transition-opacity">
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-500">Mindset by</span>
            <span className="text-[10px] font-black text-white tracking-widest leading-none">BISHNU RAIDASH</span>
            <span className="text-[7px] text-indigo-500 font-black mt-1">WWW.BISHNUAI.MINIGPT</span>
          </div>
        </div>
      </aside>
    </>
  );
};
