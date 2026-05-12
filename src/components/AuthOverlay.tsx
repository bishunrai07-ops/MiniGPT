import React from 'react';
import { Logo } from './Logo';
import { signInWithGoogle } from '../lib/firebase';
import { Chrome, Mail, Lock, ArrowRight, Zap, Image as ImageIcon, Volume2, Globe } from 'lucide-react';

export const AuthOverlay = () => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black px-4 overflow-y-auto py-10">
      <div className="w-full max-w-4xl flex flex-col md:flex-row items-center gap-12 lg:gap-20">
        
        {/* Left Side: Features & Branding */}
        <div className="flex-1 text-left hidden md:block">
          <Logo className="w-16 h-16 mb-8" />
          <h1 className="text-6xl font-black text-white mb-6 tracking-tighter leading-none">
            MiniGPT<br/><span className="text-zinc-500">Premium AI</span>
          </h1>
          
          <div className="grid grid-cols-2 gap-6 mt-12">
            <div className="space-y-2">
              <div className="p-2 bg-indigo-500/10 rounded-lg w-fit">
                <ImageIcon className="w-5 h-5 text-indigo-500" />
              </div>
              <h3 className="text-sm font-bold text-white">4K Image Generation</h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Generate high-quality visuals instantly</p>
            </div>
            <div className="space-y-2">
              <div className="p-2 bg-emerald-500/10 rounded-lg w-fit">
                <Volume2 className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-sm font-bold text-white">Advanced TTS</h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Voice support for accessibility</p>
            </div>
            <div className="space-y-2">
              <div className="p-2 bg-amber-500/10 rounded-lg w-fit">
                <Globe className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="text-sm font-bold text-white">Real-time Search</h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Browse the web for latest data</p>
            </div>
            <div className="space-y-2">
              <div className="p-2 bg-blue-500/10 rounded-lg w-fit">
                <Zap className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-sm font-bold text-white">Fast Response</h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Lowest latency intelligence</p>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Box */}
        <div className="w-full max-w-sm flex flex-col items-center text-center">
          <div className="md:hidden">
            <Logo className="w-20 h-20 mb-8" />
            <h1 className="text-5xl font-black text-white mb-3 tracking-tighter">MiniGPT</h1>
          </div>
          
          <p className="text-zinc-500 mb-12 font-bold leading-tight md:text-left md:mb-8">
            Experience the ultimate AI intelligence created by <span className="text-white">Bishnu Raidash</span>. 
            Sign in to start your premium experience.
          </p>

          <div className="w-full space-y-4">
            <button 
              onClick={() => signInWithGoogle()}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-white rounded-2xl font-black text-black shadow-lg shadow-white/5 hover:scale-[1.02] transition-all active:scale-[0.98]"
            >
              <Chrome className="w-5 h-5" />
              Continue with Google
            </button>
            
            <div className="flex items-center gap-4 py-4">
              <div className="flex-1 h-px bg-zinc-900" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Secure Access</span>
              <div className="flex-1 h-px bg-zinc-900" />
            </div>

            <div className="space-y-3">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-white transition-colors" />
                <input 
                  type="email" 
                  placeholder="Email address"
                  className="w-full bg-zinc-900 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all text-white font-black"
                />
              </div>
              <div className="relative group text-left">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-white transition-colors" />
                <input 
                  type="password" 
                  placeholder="Password"
                  className="w-full bg-zinc-900 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all text-white font-black"
                />
              </div>
              <button className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-zinc-800 text-white rounded-2xl font-black shadow-xl active:scale-[0.98] transition-all border border-white/5">
                Sign In
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <p className="text-xs text-zinc-400 mt-10">
            MiniGPT by <span className="text-white font-black uppercase tracking-tighter">Bishnu Raidash</span>
          </p>
        </div>
      </div>
    </div>
  );
};
