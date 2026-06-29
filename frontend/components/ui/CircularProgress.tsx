'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CircularProgressProps {
    value: number;
    max: number;
    size?: number;
    strokeWidth?: number;
    showValue?: boolean;
    label?: string;
    color?: 'primary' | 'secondary' | 'accent' | 'success';
    animate?: boolean;
    className?: string;
    children?: React.ReactNode;
}

export const CircularProgress = ({
    value,
    max,
    size = 200,
    strokeWidth = 12,
    showValue = true,
    label,
    color = 'primary',
    animate = true,
    className = '',
    children,
}: CircularProgressProps) => {
    const percentage = Math.min((value / max) * 100, 100);
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const getColorClasses = () => {
        switch (color) {
            case 'secondary':
                return {
                    stroke: 'stroke-amber-500',
                    text: 'text-amber-500',
                    glow: 'drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]',
                };
            case 'accent':
                return {
                    stroke: 'stroke-violet-500',
                    text: 'text-violet-500',
                    glow: 'drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]',
                };
            case 'success':
                return {
                    stroke: 'stroke-emerald-400',
                    text: 'text-emerald-400',
                    glow: 'drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]',
                };
            case 'primary':
            default:
                return {
                    stroke: 'stroke-emerald-500',
                    text: 'text-emerald-500',
                    glow: 'drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]',
                };
        }
    };

    const colors = getColorClasses();
    const isComplete = percentage >= 100;

    return (
        <div className={`relative inline-flex items-center justify-center ${className}`}>
            <svg
                width={size}
                height={size}
                className={`transform -rotate-90 ${isComplete ? 'animate-glow' : ''}`}
            >
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-neutral-200 dark:text-neutral-700"
                />

                {/* Progress circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    className={`${colors.stroke} ${isComplete ? colors.glow : ''}`}
                    initial={animate ? { strokeDashoffset: circumference } : false}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    style={{
                        strokeDasharray: circumference,
                    }}
                />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                {children ? (
                    children
                ) : (
                    <>
                        {showValue && (
                            <motion.span
                                className={`text-3xl font-bold font-display ${colors.text}`}
                                initial={animate ? { opacity: 0, scale: 0.5 } : false}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5, duration: 0.3 }}
                            >
                                {Math.round(percentage)}%
                            </motion.span>
                        )}
                        {label && (
                            <span className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                                {label}
                            </span>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

interface MultiRingProgressProps {
    rings: {
        value: number;
        max: number;
        label: string;
        color: 'primary' | 'secondary' | 'accent' | 'success';
    }[];
    size?: number;
    gap?: number;
    strokeWidth?: number;
    className?: string;
}

export const MultiRingProgress = ({
    rings,
    size = 200,
    gap = 8,
    strokeWidth = 10,
    className = '',
}: MultiRingProgressProps) => {
    const getColorClass = (color: string) => {
        switch (color) {
            case 'secondary': return 'stroke-amber-500';
            case 'accent': return 'stroke-violet-500';
            case 'success': return 'stroke-teal-500';
            case 'primary':
            default: return 'stroke-emerald-500';
        }
    };

    return (
        <div className={`relative inline-flex items-center justify-center ${className}`}>
            <svg width={size} height={size} className="transform -rotate-90">
                {rings.map((ring, index) => {
                    const radius = (size / 2) - (strokeWidth / 2) - (index * (strokeWidth + gap));
                    const circumference = radius * 2 * Math.PI;
                    const percentage = Math.min((ring.value / ring.max) * 100, 100);
                    const strokeDashoffset = circumference - (percentage / 100) * circumference;

                    return (
                        <React.Fragment key={index}>
                            {/* Background */}
                            <circle
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                fill="none"
                                strokeWidth={strokeWidth}
                                className="stroke-neutral-200 dark:stroke-neutral-700"
                            />
                            {/* Progress */}
                            <motion.circle
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                fill="none"
                                strokeWidth={strokeWidth}
                                strokeLinecap="round"
                                className={getColorClass(ring.color)}
                                initial={{ strokeDashoffset: circumference }}
                                animate={{ strokeDashoffset }}
                                transition={{ duration: 1, delay: index * 0.1, ease: 'easeOut' }}
                                style={{ strokeDasharray: circumference }}
                            />
                        </React.Fragment>
                    );
                })}
            </svg>
        </div>
    );
};
