import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc,
  updateDoc,
  writeBatch
} from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { Sidebar } from './components/Sidebar';
import { ChatPanel } from './components/ChatPanel';
import { AuthOverlay } from './components/AuthOverlay';
import { SettingsModal } from './components/SettingsModal';
import { LoadingScreen } from './components/LoadingScreen';
import { Chat, UserProfile } from './types';
import { Menu } from 'lucide-react';
import { cn } from './lib/utils';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Sync/fetch user profile
        const userRef = doc(db, 'users', u.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          const isBishnu = u.email === 'bishunrai.07@gmail.com';
          const newProfile: UserProfile = {
            uid: u.uid,
            email: u.email || '',
            displayName: u.displayName || (isBishnu ? 'Bishnu Raidash' : ''),
            photoURL: u.photoURL || '',
            bio: isBishnu ? 'Student at Class 9. Promoted every Baishak 15.' : '',
            grade: isBishnu ? 'Class 9' : '',
            location: isBishnu ? 'Bhat Bhateni, Ward No 18, Nepalgunj, Nepal' : '',
            settings: {
              theme: 'dark',
              language: 'English',
              voiceName: 'Kore',
              autoSpeak: isBishnu ? true : false,
            }
          };
          await setDoc(userRef, newProfile);
          setUserProfile(newProfile);
        } else {
          const existingProfile = userSnap.data() as UserProfile;
          const isBishnu = u.email === 'bishunrai.07@gmail.com';
          
          if (isBishnu && (!existingProfile.bio || !existingProfile.grade)) {
            const updates = {
              displayName: existingProfile.displayName || 'Bishnu Raidash',
              bio: existingProfile.bio || 'Student at Class 9. Promoted every Baishak 15.',
              grade: existingProfile.grade || 'Class 9',
              location: existingProfile.location || 'Bhat Bhateni, Ward No 18, Nepalgunj, Nepal'
            };
            await updateDoc(userRef, updates);
            setUserProfile({ ...existingProfile, ...updates });
          } else {
            setUserProfile(existingProfile);
          }
        }
      } else {
        setUserProfile(null);
        setChats([]);
        setActiveChatId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'chats'),
      where('userId', '==', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatList = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Chat));
      setChats(chatList);
    });

    return () => unsubscribe();
  }, [user]);

  // Apply theme
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.add('dark');
  }, []);

  const handleNewChat = async (): Promise<string | null> => {
    if (!user) return null;
    try {
      const docRef = await addDoc(collection(db, 'chats'), {
        userId: user.uid,
        title: 'New conversation',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setActiveChatId(docRef.id);
      return docRef.id;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const handleDeleteChat = async (id: string) => {
    if (!confirm("Are you sure you want to delete this chat?")) return;
    try {
      await deleteDoc(doc(db, 'chats', id));
      if (activeChatId === id) setActiveChatId(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearHistory = async () => {
    if (!user || chats.length === 0) return;
    if (!confirm("Are you sure you want to delete ALL your chat history? This cannot be undone.")) return;
    
    try {
      const batch = writeBatch(db);
      chats.forEach(chat => {
        batch.delete(doc(db, 'chats', chat.id));
      });
      await batch.commit();
      
      setActiveChatId(null);
      setIsSettingsOpen(false);
    } catch (e) {
      console.error("Error clearing history:", e);
      alert("Failed to clear history. Some chats may not have been deleted.");
    }
  };

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), updates);
      setUserProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (e) {
      console.error(e);
    }
  };


  if (!user) {
    return <AuthOverlay />;
  }

  const activeChat = chats.find(c => c.id === activeChatId) || null;

  return (
    <div className="flex h-screen w-screen bg-black overflow-hidden font-sans selection:bg-indigo-500/30">
      {/* Mobile Header Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-30 p-2 bg-black/80 backdrop-blur shadow-sm rounded-full border border-white/10 active:scale-90 transition-transform"
      >
        <Menu className="w-5 h-5 text-white" />
      </button>

      <Sidebar 
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={(chat) => setActiveChatId(chat.id)}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={userProfile}
      />

      <main className="flex-1 min-w-0 h-full relative">
        <ChatPanel 
          activeChat={activeChat}
          onNewChat={handleNewChat}
          userProfile={userProfile}
        />
      </main>

      {isSettingsOpen && (
        <SettingsModal 
          user={userProfile}
          onClose={() => setIsSettingsOpen(false)}
          onUpdateProfile={handleUpdateProfile}
          onClearHistory={handleClearHistory}
        />
      )}
    </div>
  );
}
