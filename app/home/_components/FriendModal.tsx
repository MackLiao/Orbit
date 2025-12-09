import { CATEGORIES, FriendModalProps } from '../_types';
import { INTERACTIONS } from '../_types';
import { Loader2, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { CategoryType } from '../_types';
import { calculateScore, evaluateActivityWithGemini } from '../_utils';

export const FriendModal: React.FC<FriendModalProps> = ({ friend, onClose, onUpdate, onDelete, onContact, referenceTime }) => {
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
      // Use referenceTime instead of Date.now() for consistency
      const realScore = calculateScore(friend, referenceTime); 
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
  