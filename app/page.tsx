'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  MessageCircle, 
  X, 
  User, 
  List, 
  Activity, 
  Search,
  CheckCircle2,
  Utensils,
  Phone,
  Sparkles,
  Loader2,
  Clock,
  RotateCcw,
  Zap,
  Save
} from 'lucide-react';

// --- Types ---
type CategoryType = 'inner' | 'close' | 'casual' | 'distant';

interface Friend {
  id: string;
  name: string;
  category: CategoryType;
  lastContacted: number;
  savedScore: number;
  createdAt: number;
}

// --- Constants & Styling ---
const CATEGORIES: Record<CategoryType, { id: string; label: string; days: number; color: string; glow: string; text: string }> = {
  inner: { 
    id: 'inner', 
    label: 'Inner Circle', 
    days: 2, 
    color: 'bg-rose-500', 
    glow: 'shadow-[0_0_20px_rgba(244,63,94,0.6)]',
    text: 'text-rose-400'
  },
  close: { 
    id: 'close', 
    label: 'Close Friends', 
    days: 7, 
    color: 'bg-indigo-500', 
    glow: 'shadow-[0_0_20px_rgba(99,102,241,0.6)]',
    text: 'text-indigo-400'
  },
  casual: { 
    id: 'casual', 
    label: 'Casual', 
    days: 30, 
    color: 'bg-emerald-500', 
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.6)]',
    text: 'text-emerald-400'
  },
  distant: { 
    id: 'distant', 
    label: 'Long Term', 
    days: 90, 
    color: 'bg-slate-500', 
    glow: 'shadow-[0_0_20px_rgba(100,116,139,0.6)]',
    text: 'text-slate-400'
  }
};

const INTERACTIONS = [
  { id: 'tiktok', label: 'TikTok/Meme', icon: Zap, weight: 15, color: 'text-pink-400 bg-pink-500/10 border-pink-500/20 hover:bg-pink-500/20' },
  { id: 'text', label: 'Short Chat', icon: MessageCircle, weight: 25, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20' },
  { id: 'call', label: 'Phone Call', icon: Phone, weight: 60, color: 'text-violet-400 bg-violet-500/10 border-violet-500/20 hover:bg-violet-500/20' },
  { id: 'meal', label: 'Hangout/Meal', icon: Utensils, weight: 100, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20' },
];

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const API_KEY = ""; // Insert your Gemini API Key here for analysis features

// --- Logic ---

const calculateScore = (friend: Friend, referenceTime = Date.now()) => {
  if (!friend) return 100;
  const cat = CATEGORIES[friend.category];
  if (!cat) return 100;

  const catDays = cat.days;
  const decayRate = 100 / catDays; 
  
  const lastTime = friend.lastContacted || referenceTime; 
  const savedScore = friend.savedScore !== undefined ? friend.savedScore : 100; 
  
  const daysSince = (referenceTime - lastTime) / MS_PER_DAY;
  const effectiveDaysSince = Math.max(0, daysSince);

  const score = savedScore - (effectiveDaysSince * decayRate);
  return Math.min(100, Math.max(-50, score));
};

const calculateDrift = (friend: Friend, referenceTime = Date.now()) => {
  const score = calculateScore(friend, referenceTime);
  return (100 - score) / 100;
};

const getRandomPosition = (radius: number, seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const angle = Math.abs(hash % 360) * (Math.PI / 180);
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius
  };
};

// Client-side call for demo purposes. In production Next.js, move this to a Server Action.
const evaluateActivityWithGemini = async (activity: string) => {
  if (!API_KEY) {
    console.warn("No API Key provided. Mocking response.");
    return 50; 
  }
  try {
    const prompt = `Evaluate the social connection weight of this activity: "${activity}". 
    Return ONLY a JSON object with a single property "weight" which is a number between 1 and 100.
    1 = trivial interaction. 100 = deep life-changing.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      }
    );

    if (!response.ok) throw new Error('Gemini API Error');
    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const result = JSON.parse(resultText);
    return result.weight || 50;
  } catch (error) {
    console.error("Gemini Error:", error);
    return 50;
  }
};

// --- Visual Components ---

const StarField = () => {
  const stars = useMemo(() => {
    return Array.from({ length: 70 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.1,
      animDelay: Math.random() * 5
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute bg-white rounded-full animate-pulse"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDelay: `${star.animDelay}s`,
            animationDuration: '4s'
          }}
        />
      ))}
    </div>
  );
};

interface FriendModalProps {
  friend: Friend | null;
  onClose: () => void;
  onUpdate: (data: Partial<Friend>) => void;
  onDelete: (id: string) => void;
  onContact: (friend: Friend, newScore: number) => void;
  referenceTime: number;
}

const FriendModal: React.FC<FriendModalProps> = ({ friend, onClose, onUpdate, onDelete, onContact, referenceTime }) => {
  const [name, setName] = useState(friend?.name || '');
  const [category, setCategory] = useState<CategoryType>(friend?.category || 'close');
  const [customActivity, setCustomActivity] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const isEditing = !!friend;
  const currentScore = friend ? calculateScore(friend, referenceTime) : 100;
  const healthPercent = Math.max(0, currentScore); 

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ 
      name, 
      category, 
      lastContacted: friend?.lastContacted || Date.now(),
      savedScore: friend?.savedScore !== undefined ? friend.savedScore : 100,
      createdAt: friend?.createdAt || Date.now()
    });
    onClose();
  };

  const handleInteraction = (weight: number) => {
    if (!friend) return;
    const realScore = calculateScore(friend, Date.now()); 
    const newScore = Math.min(100, realScore + weight);
    onContact(friend, newScore);
    onClose();
  };

  const handleCustomAnalysis = async () => {
    if (!customActivity.trim()) return;
    setAnalyzing(true);
    const weight = await evaluateActivityWithGemini(customActivity);
    setAnalyzing(false);
    if (friend) {
      handleInteraction(weight);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-[#0f172a]/90 border border-slate-700 backdrop-blur-md rounded-3xl shadow-2xl shadow-black/50 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div className="p-6 overflow-y-auto custom-scrollbar text-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white tracking-wide">
              {isEditing ? 'Friendship Details' : 'New Orbit'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {isEditing && friend && (
            <div className="mb-8">
              {/* Header Profile */}
              <div className="flex items-center gap-5 mb-8">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg ring-4 ring-black/30 ${CATEGORIES[friend.category].color} ${CATEGORIES[friend.category].glow}`}>
                  {friend.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                   <h3 className="text-2xl font-bold text-white">{friend.name}</h3>
                   <div className="flex items-center gap-3 mt-2">
                     <div className="h-2 w-full bg-slate-700/50 rounded-full overflow-hidden backdrop-blur-sm">
                       <div 
                        className={`h-full transition-all duration-500 shadow-[0_0_10px_currentColor] ${healthPercent > 50 ? 'bg-emerald-400 text-emerald-400' : 'bg-rose-400 text-rose-400'}`} 
                        style={{ width: `${healthPercent}%` }}
                       />
                     </div>
                     <span className="text-xs text-slate-400 font-mono">{Math.round(healthPercent)}%</span>
                   </div>
                </div>
              </div>

              {/* Interaction Menu */}
              <div className="space-y-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Connect</p>
                <div className="grid grid-cols-2 gap-3">
                  {INTERACTIONS.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleInteraction(action.weight)}
                      className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95 border ${action.color}`}
                    >
                      <action.icon size={20} />
                      <span className="font-semibold text-xs">{action.label}</span>
                    </button>
                  ))}
                </div>

                {/* AI Input */}
                <div className="relative mt-2">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Custom activity..." 
                      className="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      value={customActivity}
                      onChange={(e) => setCustomActivity(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCustomAnalysis()}
                    />
                    <button 
                      onClick={handleCustomAnalysis}
                      disabled={analyzing || !customActivity}
                      className="bg-indigo-600 text-white px-4 rounded-xl disabled:opacity-50 hover:bg-indigo-500 transition-colors flex items-center justify-center shadow-lg shadow-indigo-900/50"
                    >
                      {analyzing ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 pt-6 border-t border-slate-800">
            {!isEditing && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all"
                  placeholder="e.g., Sarah"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Orbit Type</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.values(CATEGORIES).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id as CategoryType)}
                    className={`p-3 rounded-xl text-left border transition-all ${
                      category === cat.id 
                        ? `border-${cat.color.split('-')[1]}-500 bg-${cat.color.split('-')[1]}-500/20 text-white shadow-lg shadow-${cat.color.split('-')[1]}-900/20` 
                        : 'border-slate-800 bg-slate-900/30 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-sm">{cat.label}</div>
                    <div className="text-[10px] mt-1 opacity-70">
                      Every {cat.days} days
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              {isEditing && friend && (
                <button
                  type="button"
                  onClick={() => {
                    if(confirm('Delete this friend?')) {
                      onDelete(friend.id);
                      onClose();
                    }
                  }}
                  className="flex-1 py-3 text-rose-400 font-medium hover:bg-rose-500/10 rounded-xl transition-colors border border-transparent hover:border-rose-500/20"
                >
                  Delete
                </button>
              )}
              <button
                type="submit"
                className={`flex-1 bg-white text-slate-950 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)] ${isEditing ? '' : 'w-full'}`}
              >
                {isEditing ? 'Save Changes' : 'Launch Orbit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

interface FriendNodeProps {
  friend: Friend;
  onClick: (friend: Friend) => void;
  center: { x: number; y: number };
  referenceTime: number;
}

const FriendNode: React.FC<FriendNodeProps> = ({ friend, onClick, center, referenceTime }) => {
  const cat = CATEGORIES[friend.category];
  const drift = calculateDrift(friend, referenceTime);
  
  const baseDistance = 90; 
  const maxSafeDistance = 280; 
  let visualDistance = baseDistance + (drift * (maxSafeDistance - baseDistance));
  visualDistance = Math.min(visualDistance, 450); 

  const pos = useMemo(() => getRandomPosition(visualDistance, friend.id), [friend.id, visualDistance]);
  const isOverdue = drift >= 1.0;
  const animDelay = useMemo(() => Math.random() * 5, []);

  return (
    <div 
      className="absolute transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1) cursor-pointer group"
      style={{ 
        transform: `translate(${center.x + pos.x}px, ${center.y + pos.y}px)`,
        zIndex: isOverdue ? 10 : 20 
      }}
      onClick={() => onClick(friend)}
    >
      <div 
        className="relative -translate-x-1/2 -translate-y-1/2"
        style={{
          animation: `float 6s ease-in-out infinite`,
          animationDelay: `${animDelay}s`
        }}
      >
        {isOverdue && (
          <div className="absolute inset-0 rounded-full animate-ping bg-rose-500/50 scale-150 duration-1000"></div>
        )}
        
        {/* Node */}
        <div className={`
          flex items-center justify-center rounded-full transition-all duration-300 group-hover:scale-110 group-active:scale-95
          ${cat.color} text-white font-bold ${cat.glow}
          ${isOverdue ? 'w-10 h-10 text-xs opacity-70 grayscale-[0.5]' : 'w-14 h-14 text-lg border-2 border-white/20'}
        `}>
          {friend.name.charAt(0).toUpperCase()}
        </div>

        {/* Label */}
        <div className={`
          absolute top-full left-1/2 -translate-x-1/2 mt-3 whitespace-nowrap 
          bg-slate-900/80 backdrop-blur-md border border-slate-700 px-3 py-1 rounded-full 
          text-xs font-bold text-slate-200 shadow-xl pointer-events-none transition-all duration-300
          ${isOverdue ? 'opacity-100 scale-100' : 'opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100'}
        `}>
          {friend.name}
        </div>
      </div>
      <style>{`
        @keyframes float {
          0% { transform: translate(-50%, -50%) translateY(0px); }
          50% { transform: translate(-50%, -50%) translateY(-8px); }
          100% { transform: translate(-50%, -50%) translateY(0px); }
        }
      `}</style>
    </div>
  );
};

export default function Home() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [viewMode, setViewMode] = useState<'orbit' | 'list'>('orbit'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [simulationDays, setSimulationDays] = useState(0);
  const [dimensions, setDimensions] = useState({ w: 1000, h: 800 }); // Default defaults

  const simulatedTime = useMemo(() => Date.now() + (simulationDays * MS_PER_DAY), [simulationDays]);

  // --- Local Storage Persistence ---
  useEffect(() => {
    // Client-side window check
    setDimensions({ w: window.innerWidth, h: window.innerHeight });
    
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