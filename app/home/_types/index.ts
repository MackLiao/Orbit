import { LucideIcon, Zap, MessageCircle, Phone, Utensils } from "lucide-react";

export type CategoryType = 'inner' | 'close' | 'casual' | 'distant';

export interface Friend {
  id: string;
  name: string;
  category: CategoryType;
  lastContacted: number;
  savedScore: number;
  createdAt: number;
}

export interface FriendModalProps {
    friend: Friend | null;
    onClose: () => void;
    onUpdate: (data: Partial<Friend>) => void;
    onDelete: (id: string) => void;
    onContact: (friend: Friend, newScore: number) => void;
    referenceTime: number;
}

export interface FriendNodeProps {
    friend: Friend;
    onClick: (friend: Friend) => void;
    center: { x: number; y: number };
    referenceTime: number;
}

export interface Category {
  id: string;
  label: string;
  days: number;
  color: string;
  glow: string;
  text: string;
}

// --- Constants & Styling ---
export const CATEGORIES: Record<CategoryType, Category> = {
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

export interface Interaction {
  id: string;
  label: string;
  icon: LucideIcon;
  weight: number;
  color: string;
}

export const INTERACTIONS: Interaction[] = [
  { id: 'tiktok', label: 'TikTok/Meme', icon: Zap, weight: 15, color: 'text-pink-400 bg-pink-500/10 border-pink-500/20 hover:bg-pink-500/20' },
  { id: 'text', label: 'Short Chat', icon: MessageCircle, weight: 25, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20' },
  { id: 'call', label: 'Phone Call', icon: Phone, weight: 60, color: 'text-violet-400 bg-violet-500/10 border-violet-500/20 hover:bg-violet-500/20' },
  { id: 'meal', label: 'Hangout/Meal', icon: Utensils, weight: 100, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20' },
];