'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  User, 
  List, 
  Activity, 
  Search,
  CheckCircle2,
  Loader2,
  Clock,
  RotateCcw,
} from 'lucide-react';

import { Friend, CATEGORIES } from './_types';
import { MS_PER_DAY } from './_constants';
import { StarField } from './_components/StarField';
import { FriendModal } from './_components/FriendModal';
import { FriendNode } from './_components/FriendNode';
import { calculateScore } from './_utils';


export default function Home() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [viewMode, setViewMode] = useState<'orbit' | 'list'>('orbit'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [simulationDays, setSimulationDays] = useState(0);
  // Initialize dimensions with a function to avoid SSR issues
  const [dimensions, setDimensions] = useState(() => {
    if (typeof window !== 'undefined') {
      return { w: window.innerWidth, h: window.innerHeight };
    }
    return { w: 1000, h: 800 }; // SSR fallback
  });
  // Store the base time when component mounts to avoid impure Date.now() in useMemo
  const [baseTime] = useState(() => Date.now());

  const simulatedTime = useMemo(() => baseTime + (simulationDays * MS_PER_DAY), [baseTime, simulationDays]);

  // --- Local Storage Persistence ---
  useEffect(() => {
    // Set up resize listener only
    
    const handleResize = () => setDimensions({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);

    // Load from LocalStorage
    const saved = localStorage.getItem('orbit_friends');
    if (saved) {
      setFriends(JSON.parse(saved));
    } else {
      // Seed data if empty
      const initial: Friend[] = [{
        id: 'seed-1',
        name: 'Demo Friend',
        category: 'close',
        lastContacted: Date.now() - (MS_PER_DAY * 3), // 3 days ago
        savedScore: 80,
        createdAt: Date.now()
      }];
      setFriends(initial);
      localStorage.setItem('orbit_friends', JSON.stringify(initial));
    }
    setLoading(false);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const saveToStorage = (newFriends: Friend[]) => {
    setFriends(newFriends);
    localStorage.setItem('orbit_friends', JSON.stringify(newFriends));
  };

  // --- Actions ---

  const handleAddFriend = (data: Partial<Friend>) => {
    const newFriend: Friend = {
      id: crypto.randomUUID(),
      name: data.name || 'Unknown',
      category: data.category || 'close',
      lastContacted: Date.now(),
      savedScore: 100,
      createdAt: Date.now()
    };
    saveToStorage([...friends, newFriend]);
  };

  const handleUpdateFriend = (data: Partial<Friend>) => {
    if (!selectedFriend) return;
    const updated = friends.map(f => f.id === selectedFriend.id ? { ...f, ...data } : f);
    saveToStorage(updated);
  };

  const handleDeleteFriend = (id: string) => {
    const updated = friends.filter(f => f.id !== id);
    saveToStorage(updated);
  };

  const handleContact = (friend: Friend, newScore: number) => {
    const updated = friends.map(f => 
      f.id === friend.id 
      ? { ...f, lastContacted: Date.now(), savedScore: newScore }
      : f
    );
    saveToStorage(updated);
    setSimulationDays(0);
  };

  const filteredFriends = friends.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
  
  const sortedFriends = [...filteredFriends].sort((a, b) => {
    const scoreA = calculateScore(a, simulatedTime);
    const scoreB = calculateScore(b, simulatedTime);
    return scoreA - scoreB;
  });

  const center = { x: dimensions.w / 2, y: dimensions.h / 2 };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950 text-slate-400">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <main className="h-screen w-full bg-slate-950 text-slate-200 overflow-hidden relative font-sans selection:bg-indigo-500/30">
      
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-950 to-black z-0" />
      <StarField />

      {/* --- Top Bar --- */}
      <div className="absolute top-0 left-0 right-0 p-6 z-40 flex justify-between items-start pointer-events-none">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 pointer-events-auto drop-shadow-lg">Orbit</h1>
        </div>
        
        <div className="flex gap-3 pointer-events-auto">
          <button 
            onClick={() => setViewMode(viewMode === 'orbit' ? 'list' : 'orbit')}
            className="p-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-white/20 transition-all active:scale-95"
          >
            {viewMode === 'orbit' ? <List size={20} /> : <Activity size={20} />}
          </button>
        </div>
      </div>

      {/* --- Main Content Area --- */}
      
      {viewMode === 'orbit' && (
        <div className="absolute inset-0 z-0 overflow-hidden touch-none">
           {/* Orbital Rings */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] border border-white/5 rounded-full pointer-events-none" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-white/5 rounded-full pointer-events-none" />

           {/* Central User Node (The Sun) */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
             <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-slate-900 shadow-[0_0_50px_rgba(255,255,255,0.4)] animate-pulse-slow relative">
               <div className="absolute inset-0 bg-white blur-xl opacity-30 rounded-full"></div>
               <User size={28} className="relative z-10" />
             </div>
           </div>

           {/* Friend Nodes */}
           {filteredFriends.map(friend => (
             <FriendNode 
                key={friend.id} 
                friend={friend} 
                center={center}
                referenceTime={simulatedTime}
                onClick={(f) => {
                  setSelectedFriend(f);
                  setModalOpen(true);
                }} 
              />
           ))}

           {friends.length === 0 && (
             <div className="absolute top-2/3 left-0 right-0 text-center text-slate-500 p-8">
               <p className="text-lg">Your universe is quiet.</p>
               <p className="text-sm opacity-60">Add a friend to begin.</p>
             </div>
           )}
        </div>
      )}

      {viewMode === 'list' && (
        <div className="absolute inset-0 pt-24 px-4 pb-36 overflow-y-auto z-10 custom-scrollbar">
          <div className="max-w-md mx-auto space-y-4">
             {/* Search Bar */}
             <div className="relative mb-6">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search cosmos..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-4 bg-slate-900/50 backdrop-blur-md border border-slate-700 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 placeholder-slate-500"
                />
             </div>

             {sortedFriends.map(friend => {
               const cat = CATEGORIES[friend.category];
               const score = calculateScore(friend, simulatedTime);
               const daysSince = Math.floor((simulatedTime - friend.lastContacted) / MS_PER_DAY);
               
               return (
                 <div 
                  key={friend.id}
                  onClick={() => {
                    setSelectedFriend(friend);
                    setModalOpen(true);
                  }}
                  className="bg-slate-900/50 backdrop-blur-sm p-4 rounded-2xl border border-white/5 flex items-center gap-4 hover:bg-slate-800/50 transition-all cursor-pointer group"
                 >
                   <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shrink-0 ${cat.color} ${cat.glow}`}>
                     {friend.name.charAt(0).toUpperCase()}
                   </div>
                   <div className="flex-1 min-w-0">
                     <div className="flex justify-between items-start">
                       <h3 className="font-bold text-slate-200 truncate group-hover:text-white transition-colors">{friend.name}</h3>
                       {score < 0 && (
                         <span className="text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full">
                           Drifting
                         </span>
                       )}
                     </div>
                     <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span className="text-slate-400">{cat.label}</span>
                        <span className="opacity-30">•</span>
                        <span>{daysSince === 0 ? 'Today' : `${daysSince}d ago`}</span>
                        <span className="opacity-30">•</span>
                        <span className={`${score < 50 ? "text-rose-400" : "text-emerald-400"} font-mono`}>
                          {Math.max(0, Math.round(score))}%
                        </span>
                     </div>
                   </div>
                   <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContact(friend, 100); 
                    }}
                    className="p-3 text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-full transition-colors"
                   >
                     <CheckCircle2 size={20} />
                   </button>
                 </div>
               );
             })}
          </div>
        </div>
      )}

      {/* --- Simulation Slider & FAB Area --- */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pb-8 z-50 flex flex-col items-center bg-gradient-to-t from-black via-slate-950/90 to-transparent">
        
        {/* Simulation Controls */}
        <div className="w-full max-w-sm bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-2xl mb-4 flex flex-col gap-3 transition-all hover:bg-white/10">
           <div className="flex justify-between items-center text-sm font-semibold text-slate-300">
             <div className="flex items-center gap-2">
                <Clock size={16} className="text-indigo-400" />
                <span className="tracking-wide text-xs uppercase text-slate-400 font-bold">Time Warp</span>
             </div>
             <div className={`px-2 py-0.5 rounded text-xs font-mono ${simulationDays > 0 ? 'bg-indigo-500 text-white' : 'bg-white/10 text-slate-400'}`}>
               {simulationDays === 0 ? 'NOW' : `+${simulationDays} DAYS`}
             </div>
           </div>
           
           <div className="flex items-center gap-4">
             <input 
               type="range" 
               min="0" 
               max="90" 
               value={simulationDays} 
               onChange={(e) => setSimulationDays(parseInt(e.target.value))}
               className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
             />
             {simulationDays > 0 && (
               <button 
                 onClick={() => setSimulationDays(0)}
                 className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
                 title="Reset to Now"
               >
                 <RotateCcw size={16} />
               </button>
             )}
           </div>
        </div>

        {/* FAB */}
        <div className="flex justify-end w-full max-w-sm">
          <button 
            onClick={() => {
              setSelectedFriend(null);
              setModalOpen(true);
            }}
            className="group relative bg-white text-black p-4 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-transform active:scale-90 flex items-center justify-center hover:scale-105"
          >
            <div className="absolute inset-0 bg-white blur-lg opacity-40 rounded-full group-hover:opacity-60 transition-opacity"></div>
            <Plus size={24} className="relative z-10" />
          </button>
        </div>
      </div>

      {/* --- Modals --- */}
      {modalOpen && (
        <FriendModal 
          friend={selectedFriend}
          referenceTime={simulatedTime}
          onClose={() => setModalOpen(false)}
          onUpdate={selectedFriend ? handleUpdateFriend : handleAddFriend}
          onDelete={handleDeleteFriend}
          onContact={handleContact}
        />
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        .animate-pulse-slow {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>

    </main>
  );
}