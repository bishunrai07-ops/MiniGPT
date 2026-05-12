import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  doc, 
  updateDoc 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Message, Chat, UserProfile } from '../types';
import { cn } from '../lib/utils';
import { 
  Send, 
  Plus, 
  Image as ImageIcon, 
  Mic, 
  Volume2, 
  Github, 
  Search,
  MapPin,
  Loader2,
  Sparkles,
  ArrowDown,
  Copy,
  Check,
  Terminal,
  Keyboard
} from 'lucide-react';
import { chatWithGemini, generateTTS, analyzeImage, generateTitle, generateImage } from '../lib/gemini';
import { motion, AnimatePresence } from 'motion/react';

import { Logo } from './Logo';

interface ChatPanelProps {
  activeChat: Chat | null;
  onNewChat: () => Promise<string | null>;
  userProfile: UserProfile | null;
}

const SUGGESTIONS = [
  { icon: '🎬', text: 'Write a viral hook & script for a 60-second YouTube Short/Reel' },
  { icon: '📈', text: 'What are the top trending content niches on TikTok right now?' },
  { icon: '🎨', text: 'Create a hyper-realistic thumbnail for a high-tech review' },
  { icon: '💡', text: '5 viral video ideas to grow my social media brand fast' },
];

const CodeBlock = ({ children, language }: { children: string, language?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group/code my-4 rounded-xl overflow-hidden border border-white/5 bg-black/50">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-800/50 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{language || 'code'}</span>
        </div>
        <button 
          onClick={handleCopy}
          className="p-1 hover:bg-white/10 rounded transition-all"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-zinc-500" />}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-800">
        <code className="text-xs font-mono text-zinc-300">{children}</code>
      </pre>
    </div>
  );
};

export const ChatPanel: React.FC<ChatPanelProps> = ({ activeChat, onNewChat, userProfile }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!activeChat || !auth.currentUser) {
      setMessages([]);
      return;
    }

    const q = query(
      collection(db, `chats/${activeChat.id}/messages`),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Message));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [activeChat]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'model' && userProfile?.settings?.autoSpeak && !isSpeaking) {
      handleVoice(lastMessage.content);
    }
  }, [messages.length]);

  // Keyboard Shortcuts (ChatGPT & Claude Style)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K for New Chat
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onNewChat();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [onNewChat]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = document.getElementById('chat-input') as HTMLTextAreaElement;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 300);
  };

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  };

  const handleSend = async (image?: string, mimeType?: string, overrideText?: string) => {
    const textToSend = overrideText || input;
    if ((!textToSend.trim() && !image) || !auth.currentUser || isLoading) return;

    let currentChatId = activeChat?.id;
    
    // If no active chat, create one automatically
    if (!currentChatId) {
      setIsLoading(true);
      const newId = await onNewChat();
      if (!newId) {
        setIsLoading(false);
        return;
      }
      currentChatId = newId;
    }

    setInput('');
    setIsLoading(true);

    try {
      // Add user message
      await addDoc(collection(db, `chats/${currentChatId}/messages`), {
        role: 'user',
        content: textToSend,
        timestamp: serverTimestamp(),
        attachments: image ? [{ type: 'image', url: image, mimeType }] : []
      });

      // Automatically rename the conversation if it's the first message
      // Note: We check if it's a new chat by the absence of messages or if we just created it
      if (textToSend) {
        try {
          const newTitle = await generateTitle(textToSend, userProfile?.settings?.customApiKey);
          if (newTitle) {
            await updateDoc(doc(db, 'chats', currentChatId), { title: newTitle });
          }
        } catch (e) {
          console.error("Title generation failed:", e);
        }
      }

      // Update chat last message and time
      await updateDoc(doc(db, 'chats', currentChatId), {
        lastMessage: textToSend || 'Image',
        updatedAt: serverTimestamp()
      });

      let aiResponseText = "";
      let generatedImageUrl = "";
      
      if (image && mimeType) {
        aiResponseText = await analyzeImage(image, mimeType, textToSend || "What is in this image?");
      } else {
        // Build context from last few messages
        const context = messages.slice(-5).map(m => ({ role: m.role, content: m.content }));
        context.push({ role: 'user', content: textToSend });
        
        const langInstruction = userProfile?.settings?.language && userProfile.settings.language !== 'English' 
          ? ` IMPORTANT: Always respond in ${userProfile.settings.language}.`
          : "";

        const result = await chatWithGemini(context, {
          systemInstruction: "You are MiniGPT, a premium AI assistant created by Bishnu Raidash. You have a friendly, helpful personality. You can browse the web, use maps, and generate high-quality images. When generating images, use the generate_image tool with detailed prompts. Always be concise and professional. Do not reveal internal API key details." + langInstruction
        }, userProfile?.settings?.customApiKey);
        
        // Handle function calls (image generation)
        const functionCalls = result.functionCalls;
        if (functionCalls && functionCalls.length > 0) {
          const call = functionCalls[0];
          if (call.name === 'generate_image') {
            const { prompt, aspectRatio } = call.args as any;
            generatedImageUrl = await generateImage(prompt, aspectRatio) || "";
            aiResponseText = generatedImageUrl ? `I've generated this image for you: "${prompt}"` : "I tried to generate an image but something went wrong.";
          }
        } else {
          aiResponseText = result.text || "I couldn't generate a response.";
        }
      }

      // Add AI message
      await addDoc(collection(db, `chats/${currentChatId}/messages`), {
        role: 'model',
        content: aiResponseText,
        timestamp: serverTimestamp(),
        attachments: generatedImageUrl ? [{ type: 'image', url: generatedImageUrl, mimeType: 'image/png' }] : []
      });

    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoice = async (text: string) => {
    if (isSpeaking) return;
    
    // Create ctx immediately in the user gesture
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    setIsSpeaking(true);

    try {
      // Clean text of markdown for better speech
      const cleanText = text.replace(/[*#`_]/g, '').replace(/\[.*?\]\(.*?\)/g, '');
      const pcmData = await generateTTS(cleanText);
      if (!pcmData) {
        setIsSpeaking(false);
        return;
      }

      const buffer = ctx.createBuffer(1, pcmData.length / 2, 24000);
      const channelData = buffer.getChannelData(0);
      
      // Convert PCM16 to Float32 explicitly (little-endian)
      for (let i = 0; i < pcmData.length / 2; i++) {
        const index = i * 2;
        const low = pcmData[index];
        const high = pcmData[index + 1];
        let s = (high << 8) | low;
        if (s & 0x8000) s -= 0x10000;
        channelData[i] = s / 32768.0;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.onended = () => {
        setIsSpeaking(false);
      };
      source.start();
    } catch (e) {
      console.error("TTS Error:", e);
      setIsSpeaking(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      handleSend(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-black relative overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-white/5 flex items-center justify-between px-4 z-10 bg-black/95 backdrop-blur-xl">
        <div className="flex items-center gap-3 pl-10 lg:pl-0">
          <Logo className="w-8 h-8" />
          <div className="flex flex-col">
            <span className="font-extrabold text-white tracking-tight truncate max-w-[150px] sm:max-w-none leading-none">
              {activeChat?.title || "MiniGPT"}
            </span>
            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500 mt-1 flex items-center gap-2">
              <span>Intelligence Core</span>
              <span className="opacity-30">|</span>
              <span className="text-zinc-500">BISHNUAI.MINIGPT</span>
            </span>
          </div>
          <div className="flex gap-1.5 items-center ml-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
          </div>
        </div>
        <button 
          onClick={onNewChat}
          aria-label="New Session"
          className="p-2 hover:bg-zinc-900 rounded-full transition-all active:scale-90"
        >
          <Plus className="w-5 h-5 text-zinc-300" />
        </button>
      </header>

      {/* Messages */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scroll-smooth scrollbar-none"
      >
        {!activeChat ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 rounded-3xl bg-zinc-900 flex items-center justify-center mb-6 border border-white/5 shadow-2xl"
            >
              <Logo className="w-12 h-12" />
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-4xl font-black text-white tracking-tighter mb-3">MiniGPT Mindset</h2>
              <p className="text-zinc-500 max-w-sm font-bold text-lg leading-tight mb-8">Ready to assist with your most complex queries.</p>
            </motion.div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl"
            >
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(undefined, undefined, s.text)}
                  className="p-4 bg-zinc-900/50 border border-white/5 rounded-2xl text-left hover:bg-zinc-900 hover:border-white/10 transition-all group active:scale-[0.98]"
                >
                  <span className="text-xl mb-2 block">{s.icon}</span>
                  <p className="text-zinc-400 font-bold text-sm group-hover:text-white transition-colors">{s.text}</p>
                </button>
              ))}
            </motion.div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((m, index) => (
              <motion.div 
                key={m.id || index}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={cn(
                  "flex flex-col max-w-[85%]",
                  m.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div className={cn(
                  "px-5 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm font-semibold",
                  m.role === 'user' 
                    ? "bg-indigo-600 text-white rounded-tr-none shadow-indigo-500/20" 
                    : "bg-zinc-900 text-white rounded-tl-none border border-white/5"
                )}>
                  {m.attachments?.map((a, i) => (
                    <img key={i} src={a.url} alt="Content" referrerPolicy="no-referrer" className="max-w-full rounded-lg mb-2 shadow-lg" />
                  ))}
                  <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed">
                    <ReactMarkdown
                      components={{
                        code({ node, inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline ? (
                            <CodeBlock language={match ? match[1] : undefined}>
                              {String(children).replace(/\n$/, '')}
                            </CodeBlock>
                          ) : (
                            <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-xs font-mono text-indigo-400" {...props}>
                              {children}
                            </code>
                          );
                        }
                      }}
                    >
                      {m.content}
                    </ReactMarkdown>
                  </div>
                  {m.role === 'model' && (
                    <button 
                      onClick={() => handleVoice(m.content)}
                      aria-label="Listen to message"
                      className="mt-3 flex items-center gap-1.5 opacity-40 hover:opacity-100 transition-opacity text-[10px] uppercase font-black tracking-[0.2em]"
                    >
                      <Volume2 className={cn("w-3.5 h-3.5", isSpeaking && "text-indigo-500 animate-pulse")} />
                      <span>Intelligence Voice</span>
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Floating Scroll Down */}
      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={scrollToBottom}
            className="absolute bottom-32 right-8 p-3 bg-white text-black rounded-full shadow-2xl z-20 active:scale-90 transition-transform"
          >
            <ArrowDown className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="p-4 bg-black border-t border-white/5 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="max-w-3xl mx-auto relative group">
          <textarea 
            id="chat-input"
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              // Send on Enter (but not Shift+Enter)
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your message... (⌘+Enter to send)"
            className="w-full bg-zinc-900 border border-white/10 rounded-2xl pl-4 pr-32 py-5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all resize-none max-h-48 text-white placeholder-zinc-700 font-bold font-sans text-sm"
          />
          <div className="absolute right-2 bottom-3 flex items-center gap-1">
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-zinc-800 rounded text-[9px] font-black text-zinc-500 mr-2 border border-white/5">
              <Keyboard className="w-3 h-3" />
              <span>⌘ ENT</span>
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              aria-label="Upload Image"
              className="p-2.5 text-zinc-600 hover:text-white transition-colors"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload} 
            />
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              aria-label="Send Message"
              className={cn(
                "p-2.5 rounded-xl transition-all",
                input.trim() 
                  ? "bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 active:scale-95" 
                  : "text-zinc-800"
              )}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
        <p className="text-[10px] text-center text-zinc-600 mt-2 font-black uppercase tracking-widest">
          Quantum verification recommended for critical intelligence
        </p>
      </div>
    </div>
  );
};
