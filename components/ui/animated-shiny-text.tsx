import * as React from "react";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedTextProps extends React.HTMLAttributes<HTMLDivElement> {
    text: string;
    gradientColors?: string;
    gradientAnimationDuration?: number;
    hoverEffect?: boolean;
    className?: string;
    textClassName?: string;
}

const AnimatedText = React.forwardRef<HTMLDivElement, AnimatedTextProps>(
    (
        {
            text,
            gradientColors = "linear-gradient(90deg, #FFD700, #FDB931, #FFF, #FDB931, #FFD700)", // Default to Gold for Al-Baith
            gradientAnimationDuration = 2,
            hoverEffect = false,
            className,
            textClassName,
            ...props
        },
        ref
    ) => {
        const [isHovered, setIsHovered] = React.useState(false);

        const shimmerTime = 3; // Fast shimmer pass duration
        const cycleTime = Math.max(gradientAnimationDuration, shimmerTime);

        const textVariants: Variants = {
            initial: {
                backgroundPosition: "0 0",
            },
            animate: {
                backgroundPosition: "200% 0",
                transition: {
                    duration: shimmerTime,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatDelay: cycleTime - shimmerTime,
                },
            },
        };

        return (
            <div
                ref={ref}
                className={cn("flex justify-center items-center py-2", className)} // Reduced padding from 8 to 2 for navbar usage
                {...props}
            >
                <motion.span // Changed from h1 to span for versatility (usage in Link)
                    className={cn("text-[2.5rem] font-bold leading-normal text-transparent bg-clip-text", textClassName)}
                    style={{
                        backgroundImage: gradientColors,
                        backgroundSize: "200% auto",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        textShadow: isHovered ? "0 0 15px rgba(253, 185, 49, 0.5)" : "none", // Gold shadow
                    }}
                    variants={textVariants}
                    initial="initial"
                    animate="animate"
                    onHoverStart={() => hoverEffect && setIsHovered(true)}
                    onHoverEnd={() => hoverEffect && setIsHovered(false)}
                >
                    {text}
                </motion.span>
            </div>
        );
    }
);

AnimatedText.displayName = "AnimatedText";

export { AnimatedText };
