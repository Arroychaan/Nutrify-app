import React from 'react';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    noPadding?: boolean;
    hover?: boolean;
    glow?: boolean;
}

export const GlassCard = ({
    children,
    className = '',
    noPadding = false,
    hover = true,
    glow = false
}: GlassCardProps) => {
    return (
        <div
            className={`
                relative overflow-hidden
                bg-white/80 dark:bg-neutral-900/70
                backdrop-blur-xl backdrop-saturate-150
                border border-white/50 dark:border-neutral-700/50
                rounded-2xl
                shadow-card
                ${hover ? 'transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5' : ''}
                ${glow ? 'glow-celebration' : ''}
                ${noPadding ? '' : 'p-6'} 
                ${className}
            `}
        >
            {/* Subtle inner highlight */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none rounded-2xl" />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};
