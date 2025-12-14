import React from 'react';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    noPadding?: boolean;
}

export const GlassCard = ({ children, className = '', noPadding = false }: GlassCardProps) => {
    return (
        <div
            className={`
        relative overflow-hidden
        bg-white/80 dark:bg-slate-800/80 
        backdrop-blur-md 
        border border-white/60 dark:border-slate-700/60
        rounded-[24px] 
        shadow-glass-sm hover:shadow-glass-md
        transition-all duration-300
        ${noPadding ? '' : 'p-6'} 
        ${className}
      `}
        >
            {/* Optional: Subtle gradient overlay for extra "glass" feel logic can go here if needed */}
            {children}
        </div>
    );
};
