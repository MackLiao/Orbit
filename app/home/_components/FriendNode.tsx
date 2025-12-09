import { FriendNodeProps } from '../_types';
import { CATEGORIES } from '../_types';
import { calculateDrift, getRandomPosition } from '../_utils';
import { useMemo } from 'react';

export const FriendNode: React.FC<FriendNodeProps> = ({ friend, onClick, center, referenceTime }) => {
    const cat = CATEGORIES[friend.category];
    const drift = calculateDrift(friend, referenceTime);
    
    const baseDistance = 90; 
    const maxSafeDistance = 280; 
    let visualDistance = baseDistance + (drift * (maxSafeDistance - baseDistance));
    visualDistance = Math.min(visualDistance, 450); 
  
    const pos = useMemo(() => getRandomPosition(visualDistance, friend.id), [friend.id, visualDistance]);
    const isOverdue = drift >= 1.0;
    
    // Generate deterministic animation delay based on friend.id
    const animDelay = useMemo(() => {
      let hash = 0;
      for (let i = 0; i < friend.id.length; i++) {
        hash = friend.id.charCodeAt(i) + ((hash << 5) - hash);
      }
      return (Math.abs(hash) % 50) / 10; // Returns 0-5 seconds
    }, [friend.id]);
  
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
  