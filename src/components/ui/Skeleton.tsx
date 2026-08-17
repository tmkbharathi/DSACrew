import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'rectangular' }) => {
  const variantClass = variant === 'circular' ? 'rounded-full' : variant === 'text' ? 'rounded' : 'rounded-xl';

  return (
    <div
      className={`animate-pulse bg-[#1c2024]/80 border border-[#3d4a3e]/40 ${variantClass} ${className}`}
    />
  );
};

export const ProblemHeroSkeleton: React.FC = () => {
  return (
    <div className="bg-[#1c2024] border border-[#3d4a3e] rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="w-24 h-6" />
        <Skeleton className="w-16 h-6" />
      </div>
      <Skeleton className="w-3/4 h-8" />
      <div className="flex gap-2">
        <Skeleton className="w-20 h-6" />
        <Skeleton className="w-20 h-6" />
        <Skeleton className="w-20 h-6" />
      </div>
      <div className="pt-4 border-t border-[#3d4a3e] flex justify-between items-center">
        <Skeleton className="w-32 h-6" />
        <Skeleton className="w-28 h-9" />
      </div>
    </div>
  );
};

export const StatsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-[#1c2024] rounded-xl p-3.5 border border-[#3d4a3e] flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="w-12 h-3" />
            <Skeleton className="w-20 h-5" />
          </div>
        </div>
      ))}
    </div>
  );
};
