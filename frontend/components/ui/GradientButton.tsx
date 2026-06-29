import React from 'react';

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    icon?: React.ElementType;
    variant?: 'primary' | 'secondary' | 'accent' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export const GradientButton = ({
    children,
    className = '',
    icon: Icon,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled,
    ...props
}: GradientButtonProps) => {

    const getVariantClasses = () => {
        switch (variant) {
            case 'secondary':
                return 'bg-secondary text-white hover:bg-secondary-600 shadow-warm-sm hover:shadow-warm-md';
            case 'accent':
                return 'bg-accent text-white hover:bg-accent-600 shadow-warm-sm hover:shadow-glow-accent';
            case 'ghost':
                return 'bg-transparent text-text-secondary hover:bg-background-300/30 hover:text-primary-dark shadow-none';
            case 'primary':
            default:
                return 'bg-primary-action text-white hover:bg-primary-action-600 shadow-warm-sm hover:shadow-glow-action';
        }
    };

    const getSizeClasses = () => {
        switch (size) {
            case 'sm': return 'px-4 py-2 text-sm';
            case 'lg': return 'px-8 py-4 text-lg';
            case 'md':
            default: return 'px-6 py-3 text-base';
        }
    };

    return (
        <button
            disabled={disabled || isLoading}
            className={`
                relative group overflow-hidden
                flex items-center justify-center gap-2
                ${getSizeClasses()}
                rounded-button
                font-sans font-semibold
                transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1)
                hover:-translate-y-1 hover:scale-[1.03]
                active:translate-y-0 active:scale-[0.98]
                disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
                ${getVariantClasses()}
                ${className}
            `}
            {...props}
        >
            {/* Shine effect on hover - omitted for ghost */}
            {variant !== 'ghost' && (
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full"
                    style={{ transition: 'transform 0.6s ease-out, opacity 0.3s ease' }} />
            )}

            {isLoading ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (
                <span className="relative z-10 flex items-center gap-2">
                    {children}
                    {Icon && <Icon className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5" />}
                </span>
            )}
        </button>
    );
};
