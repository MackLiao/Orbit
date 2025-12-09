import { useMemo } from "react";

// Seeded random number generator for deterministic stars
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export const StarField = () => {
    const stars = useMemo(() => {
      return Array.from({ length: 70 }).map((_, i) => ({
        id: i,
        x: seededRandom(i * 1) * 100,
        y: seededRandom(i * 2) * 100,
        size: seededRandom(i * 3) * 2 + 1,
        opacity: seededRandom(i * 4) * 0.5 + 0.1,
        animDelay: seededRandom(i * 5) * 5
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
  