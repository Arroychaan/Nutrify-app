import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    shimmer?: boolean;
}

function Skeleton({
    className,
    shimmer = true,
    ...props
}: SkeletonProps) {
    return (
        <div
            className={cn(
                "rounded-xl",
                shimmer
                    ? "skeleton-shimmer"
                    : "animate-pulse bg-neutral-200 dark:bg-neutral-700",
                className
            )}
            {...props}
        />
    )
}

export { Skeleton }
