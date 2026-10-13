import React, { useMemo } from 'react';

export const FloatingPetals: React.FC = () => {
  // Generate a fixed set of petals with distinct animation delays and sizes
  const petals = useMemo(() => {
    return Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: `${(i * 5.8 + 2) % 96}%`,
      delay: `${(i * 1.3) % 12}s`,
      duration: `${11 + (i % 6) * 1.5}s`,
      size: 14 + (i % 5) * 4,
      opacity: 0.35 + (i % 4) * 0.15,
    }));
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-20">
      {petals.map((p) => (
        <div
          key={p.id}
          className="absolute -top-8 animate-petal"
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
            opacity: p.opacity,
          }}
        >
          {/* SVG Rose Petal shape */}
          <svg
            width={p.size}
            height={p.size}
            viewBox="0 0 24 24"
            fill="none"
            className="transform -rotate-45 drop-shadow-sm"
          >
            <path
              d="M12 2C7 2 3 7 3 12C3 17 8 21 12 22C16 21 21 17 21 12C21 7 17 2 12 2Z"
              fill={p.id % 2 === 0 ? '#fbcfe8' : '#fed7aa'}
              fillOpacity={0.8}
            />
            <path
              d="M12 4C8.5 5 5 8.5 5 12C5 15.5 8.5 19 12 20C15.5 19 19 15.5 19 12C19 8.5 15.5 5 12 4Z"
              fill={p.id % 2 === 0 ? '#f472b6' : '#fb923c'}
              fillOpacity={0.4}
            />
          </svg>
        </div>
      ))}
    </div>
  );
};
