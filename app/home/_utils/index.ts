import { CATEGORIES, Friend } from '../_types';
import { API_KEY, MS_PER_DAY } from '../_constants';

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
  
export { calculateScore, calculateDrift, getRandomPosition, evaluateActivityWithGemini };