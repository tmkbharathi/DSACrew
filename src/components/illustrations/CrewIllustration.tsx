import React from 'react';
import { useApp } from '../../context/AppContext';

export const CrewIllustration: React.FC<{ className?: string }> = ({ className = 'w-full h-auto' }) => {
  const { theme } = useApp();
  const isIllustrative = theme === 'illustrative';

  return (
    <div
      className={`relative select-none flex items-end justify-center transition-all duration-300 ${className}`}
    >
      <img
        src={isIllustrative ? '/illustrations/crew-sticker-light.png' : '/illustrations/crew-sticker-dark.png'}
        alt="LeetTracker Crew Solving Problems Together"
        className="w-full h-auto object-contain transition-transform duration-300 transform scale-100 hover:scale-105 origin-bottom drop-shadow-xl block -mb-2"
      />
    </div>
  );
};
