import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ─── Split Reveal Animation ────────────────────────────────
// Each character slides up from below with stagger
interface SplitRevealProps {
    text: string;
    className?: string;
    as?: React.ElementType;
    delay?: number;
    duration?: number;
    stagger?: number;
    scrollTrigger?: boolean;
}

export const SplitReveal: React.FC<SplitRevealProps> = ({
    text,
    className = '',
    as: Tag = 'h1',
    delay = 0,
    duration = 0.8,
    stagger = 0.03,
    scrollTrigger = false,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const chars = el.querySelectorAll('.gsap-char');

        const animConfig: gsap.TweenVars = {
            y: 80,
            opacity: 0,
            rotateX: -90,
            transformOrigin: 'top center',
        };

        const toConfig: gsap.TweenVars = {
            y: 0,
            opacity: 1,
            rotateX: 0,
            duration,
            stagger,
            delay,
            ease: 'power4.out',
        };

        if (scrollTrigger) {
            gsap.fromTo(chars, animConfig, {
                ...toConfig,
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    once: true,
                },
            });
        } else {
            gsap.fromTo(chars, animConfig, toConfig);
        }

        return () => {
            ScrollTrigger.getAll().forEach(t => {
                if (t.trigger === el) t.kill();
            });
        };
    }, [text, delay, duration, stagger, scrollTrigger]);

    const words = text.split(' ');

    return (
        <div className={className} ref={containerRef} style={{ perspective: '600px' }}>
            {words.map((word, wi) => (
                <span key={wi} style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
                    {word.split('').map((char, ci) => (
                        <span
                            key={ci}
                            className="gsap-char"
                            style={{
                                display: 'inline-block',
                                willChange: 'transform, opacity',
                            }}
                        >
                            {char}
                        </span>
                    ))}
                    {wi < words.length - 1 && (
                        <span style={{ display: 'inline-block' }}>&nbsp;</span>
                    )}
                </span>
            ))}
        </div>
    );
};


// ─── Slide Up Animation ────────────────────────────────────
// Whole element slides up with fade
interface SlideUpProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    duration?: number;
    distance?: number;
    scrollTrigger?: boolean;
}

export const SlideUp: React.FC<SlideUpProps> = ({
    children,
    className = '',
    delay = 0,
    duration = 1,
    distance = 60,
    scrollTrigger = false,
}) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const fromVars: gsap.TweenVars = {
            y: distance,
            opacity: 0,
        };

        const toVars: gsap.TweenVars = {
            y: 0,
            opacity: 1,
            duration,
            delay,
            ease: 'power3.out',
        };

        if (scrollTrigger) {
            gsap.fromTo(el, fromVars, {
                ...toVars,
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    once: true,
                },
            });
        } else {
            gsap.fromTo(el, fromVars, toVars);
        }

        return () => {
            ScrollTrigger.getAll().forEach(t => {
                if (t.trigger === el) t.kill();
            });
        };
    }, [delay, duration, distance, scrollTrigger]);

    return (
        <div ref={ref} className={className}>
            {children}
        </div>
    );
};


// ─── Word Reveal Animation ─────────────────────────────────
// Words appear one by one with blur effect
interface WordRevealProps {
    text: string;
    className?: string;
    as?: React.ElementType;
    delay?: number;
    duration?: number;
    stagger?: number;
    scrollTrigger?: boolean;
}

export const WordReveal: React.FC<WordRevealProps> = ({
    text,
    className = '',
    as: Tag = 'p',
    delay = 0,
    duration = 0.6,
    stagger = 0.08,
    scrollTrigger = false,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const words = el.querySelectorAll('.gsap-word');

        const fromVars: gsap.TweenVars = {
            opacity: 0,
            y: 20,
            filter: 'blur(8px)',
        };

        const toVars: gsap.TweenVars = {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration,
            stagger,
            delay,
            ease: 'power2.out',
        };

        if (scrollTrigger) {
            gsap.fromTo(words, fromVars, {
                ...toVars,
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    once: true,
                },
            });
        } else {
            gsap.fromTo(words, fromVars, toVars);
        }

        return () => {
            ScrollTrigger.getAll().forEach(t => {
                if (t.trigger === el) t.kill();
            });
        };
    }, [text, delay, duration, stagger, scrollTrigger]);

    const words = text.split(' ');

    return (
        <div className={className} ref={containerRef}>
            {words.map((word, i) => (
                <span
                    key={i}
                    className="gsap-word"
                    style={{
                        display: 'inline-block',
                        marginRight: '0.3em',
                        willChange: 'transform, opacity, filter',
                    }}
                >
                    {word}
                </span>
            ))}
        </div>
    );
};


// ─── Counter Animation ──────────────────────────────────────
// Numbers count up from 0
interface CountUpProps {
    end: number;
    prefix?: string;
    suffix?: string;
    className?: string;
    duration?: number;
    decimals?: number;
    scrollTrigger?: boolean;
}

export const CountUp: React.FC<CountUpProps> = ({
    end,
    prefix = '',
    suffix = '',
    className = '',
    duration = 2,
    decimals = 0,
    scrollTrigger = true,
}) => {
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const obj = { value: 0 };

        const animConfig: gsap.TweenVars = {
            value: end,
            duration,
            ease: 'power2.out',
            onUpdate: () => {
                el.textContent = `${prefix}${obj.value.toFixed(decimals)}${suffix}`;
            },
        };

        if (scrollTrigger) {
            gsap.to(obj, {
                ...animConfig,
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    once: true,
                },
            });
        } else {
            gsap.to(obj, animConfig);
        }

        return () => {
            ScrollTrigger.getAll().forEach(t => {
                if (t.trigger === el) t.kill();
            });
        };
    }, [end, prefix, suffix, duration, decimals, scrollTrigger]);

    return (
        <span ref={ref} className={className}>
            {prefix}0{suffix}
        </span>
    );
};


// ─── Line Reveal Animation ─────────────────────────────────
// Text reveals from behind a sliding mask
interface LineRevealProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    duration?: number;
    scrollTrigger?: boolean;
}

export const LineReveal: React.FC<LineRevealProps> = ({
    children,
    className = '',
    delay = 0,
    duration = 1.2,
    scrollTrigger = false,
}) => {
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = wrapperRef.current;
        if (!el) return;

        const mask = el.querySelector('.gsap-mask') as HTMLElement;
        const content = el.querySelector('.gsap-content') as HTMLElement;

        if (!mask || !content) return;

        const tl = gsap.timeline({
            delay,
            ...(scrollTrigger
                ? {
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 85%',
                        once: true,
                    },
                }
                : {}),
        });

        tl.fromTo(
            mask,
            { scaleX: 0 },
            { scaleX: 1, duration: duration * 0.5, ease: 'power3.inOut', transformOrigin: 'left center' }
        )
            .set(content, { opacity: 1 })
            .to(mask, { scaleX: 0, duration: duration * 0.5, ease: 'power3.inOut', transformOrigin: 'right center' });

        return () => {
            tl.kill();
            ScrollTrigger.getAll().forEach(t => {
                if (t.trigger === el) t.kill();
            });
        };
    }, [delay, duration, scrollTrigger]);

    return (
        <div ref={wrapperRef} className={`relative inline-block ${className}`}>
            <div className="gsap-content" style={{ opacity: 0 }}>
                {children}
            </div>
            <div
                className="gsap-mask absolute inset-0"
                style={{
                    background: 'linear-gradient(135deg, #B8860B, #FFD700)',
                    transformOrigin: 'left center',
                    transform: 'scaleX(0)',
                }}
            />
        </div>
    );
};
