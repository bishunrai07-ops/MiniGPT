import React, { useState } from 'react';
import { X, Moon, Sun, Monitor, Languages, Volume2, Key, Eye, EyeOff, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { UserProfile } from '../types';

interface SettingsModalProps {
  user: UserProfile | null;
  onClose: () => void;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onClearHistory: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  user, 
  onClose, 
  onUpdateProfile,
  onClearHistory
}) => {
  const [showKey, setShowKey] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [grade, setGrade] = useState(user?.grade || '');
  const [location, setLocation] = useState(user?.location || '');
  const [settings, setSettings] = useState(user?.settings || {
    theme: 'dark' as const,
    language: 'English',
    voiceName: 'Kore',
    autoSpeak: false,
    customApiKey: ''
  });

  const voiceOptions = [
    { label: 'Kore (Soft Female)', value: 'Kore' },
    { label: 'Zephyr (Deep Female)', value: 'Zephyr' },
    { label: 'Fenrir (Deep Male)', value: 'Fenrir' },
    { label: 'Puck (Cheerful)', value: 'Puck' },
    { label: 'Charon (Formal)', value: 'Charon' },
  ];

  const handleSave = () => {
    onUpdateProfile({
      displayName,
      bio,
      grade,
      location,
      settings
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-black rounded-3xl shadow-2xl border border-white/10 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-zinc-900/30">
          <h2 className="text-2xl font-black text-white tracking-tight">Settings</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-900 rounded-full transition-colors">
            <X className="w-6 h-6 text-zinc-500" />
          </button>
        </div>

        <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
          {/* Profile Section */}
          <div className="space-y-6">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-indigo-500" />
              User Identity
            </label>
            
            <div className="space-y-4">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Display Name"
                className="w-full bg-zinc-900 border border-white/5 p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 text-white outline-none"
              />
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Bio (e.g. Student at Class 9)"
                rows={3}
                className="w-full bg-zinc-900 border border-white/5 p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 text-white outline-none resize-none"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="Grade/Class"
                  className="w-full bg-zinc-900 border border-white/5 p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 text-white outline-none"
                />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location"
                  className="w-full bg-zinc-900 border border-white/5 p-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 text-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* API Key Center */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-indigo-500" />
              API Key Cloud Registry
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={settings.customApiKey || ''}
                onChange={(e) => setSettings({ ...settings, customApiKey: e.target.value })}
                placeholder="Enter your Gemini API Key"
                className="w-full bg-zinc-900 border border-white/5 p-4 pr-12 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 text-white outline-none"
              />
              <button 
                onClick={() => setShowKey(!showKey)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-zinc-600 hover:text-white transition-colors"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-3">
              <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
              Intelligence Voice & Speech
            </label>
            
            <div className="flex items-center justify-between p-4 bg-zinc-900 border border-white/5 rounded-2xl">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">Auto-read Responses</span>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Perfect for blind/hands-free use</span>
              </div>
              <button 
                onClick={() => setSettings({...settings, autoSpeak: !settings.autoSpeak})}
                aria-label={settings.autoSpeak ? "Disable auto-read" : "Enable auto-read"}
                className={cn(
                  "w-12 h-6 rounded-full transition-all relative p-1",
                  settings.autoSpeak ? "bg-indigo-600" : "bg-zinc-800"
                )}
              >
                <div className={cn(
                  "w-4 h-4 rounded-full bg-white transition-all transform",
                  settings.autoSpeak ? "translate-x-6" : "translate-x-0"
                )} />
              </button>
            </div>

            <select
              value={settings.voiceName}
              onChange={(e) => setSettings({ ...settings, voiceName: e.target.value })}
              aria-label="Select AI Voice"
              className="w-full bg-zinc-900 border border-white/5 p-4 rounded-2xl text-sm font-black text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {voiceOptions.map(v => (
                <option key={v.value} value={v.value} className="bg-black">{v.label}</option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-3">
              <Languages className="w-3.5 h-3.5 text-indigo-500" />
              Core Interface Language
            </label>
            <select
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              className="w-full bg-zinc-900 border border-white/5 p-4 rounded-2xl text-sm font-black text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option className="bg-black">English</option>
              <option className="bg-black">Nepali</option>
              <option className="bg-black">Hindi</option>
              <option className="bg-black">Spanish</option>
              <option className="bg-black">French</option>
              <option className="bg-black">German</option>
            </select>
          </div>

          {/* Danger Zone */}
          <div className="pt-6 border-t border-white/5 space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 flex items-center gap-3">
              Memory Management
            </label>
            <button 
              onClick={onClearHistory}
              className="w-full flex items-center justify-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-all group"
            >
              <Trash2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              Clear Total History
            </button>
          </div>
        </div>

        <div className="px-6 py-4 bg-zinc-900/20 text-center border-t border-white/5">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600">
            System developed by <span className="text-white">Bishnu Raidash</span>
          </p>
        </div>

        <div className="p-6 bg-zinc-900/50 flex justify-end gap-4 border-t border-white/5">
          <button onClick={onClose} className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Abort</button>
          <button 
            onClick={handleSave}
            className="px-8 py-3 bg-white text-black rounded-2xl text-sm font-black shadow-xl shadow-white/5 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Synchronize
          </button>
        </div>
      </div>
    </div>
  );
};
