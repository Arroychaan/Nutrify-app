import React from 'react';

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    icon?: React.ElementType; // Icon component type
    variant?: 'primary' | 'accent' | 'fire' | 'glass';
    isLoading?: boolean;
}

export const GradientButton = ({
    children,
    className = '',
    icon: Icon,
    variant = 'primary',
    isLoading = false,
    disabled,
    ...props
}: GradientButtonProps) => {

    const getGradient = () => {
        switch (variant) {
            case 'accent': return 'bg-gradient-accent shadow-indigo-500/30';
            case 'fire': return 'bg-gradient-fire shadow-orange-500/30';
            case 'glass': return 'bg-white/20 backdrop-blur-md border border-white/30 text-primary-600 hover:bg-white/30';
            case 'primary':
            default: return 'bg-gradient-primary shadow-emerald-500/30';
        }
    };

    return (
        <button
            disabled={disabled || isLoading}
            className={`
        relative group
        flex items-center justify-center gap-2
        px-6 py-3.5
        rounded-xl
        font-display font-semibold text-white
        transition-all duration-300
        hover:-translate-y-0.5 hover:shadow-lg
        active:translate-y-0 active:scale-95
        disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none
        ${getGradient()}
        ${className}
      `}
            {...props}
        >
            {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (
                <>
                    {children}
                    {Icon && <Icon className="w-5 h-5 transition-transform group-hover:translate-x-1" />}
                </>
            )}
        </button>
    );
};
