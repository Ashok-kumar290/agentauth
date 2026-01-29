/**
 * Animation System - Apple/Stripe-level smoothness
 * 
 * Principles:
 * - Spring-based physics for natural feel
 * - Subtle, purposeful motion
 * - Staggered reveals for hierarchy
 * - Reduced motion support
 */

// Easing curves - Apple-style
export const easing = {
  // Default smooth - like iOS animations
  smooth: [0.25, 0.1, 0.25, 1],
  // Emphasized entrance
  enter: [0.0, 0.0, 0.2, 1],
  // Quick exit
  exit: [0.4, 0.0, 1, 1],
  // Gentle spring feel
  gentle: [0.4, 0.0, 0.2, 1],
  // Crisp, responsive
  crisp: [0.16, 1, 0.3, 1],
} as const;

// Duration presets
export const duration = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.4,
  slow: 0.6,
  slower: 0.8,
  slowest: 1.2,
} as const;

// Spring configurations
export const spring = {
  // Gentle, smooth spring
  gentle: { type: "spring", stiffness: 100, damping: 20, mass: 1 },
  // Snappy, responsive
  snappy: { type: "spring", stiffness: 400, damping: 30, mass: 1 },
  // Bouncy entrance
  bouncy: { type: "spring", stiffness: 300, damping: 15, mass: 0.8 },
  // Smooth scroll-triggered
  smooth: { type: "spring", stiffness: 80, damping: 25, mass: 1.2 },
} as const;

// Variant factories
export const fadeIn = (delay: number = 0, useSpring: boolean = false) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: useSpring 
      ? { ...spring.gentle, delay }
      : { duration: duration.normal, delay, ease: easing.smooth }
  }
});

export const fadeUp = (delay: number = 0, distance: number = 24) => ({
  hidden: { opacity: 0, y: distance },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: duration.slow, 
      delay, 
      ease: easing.enter 
    }
  }
});

export const fadeDown = (delay: number = 0, distance: number = 24) => ({
  hidden: { opacity: 0, y: -distance },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: duration.slow, 
      delay, 
      ease: easing.enter 
    }
  }
});

export const fadeLeft = (delay: number = 0, distance: number = 40) => ({
  hidden: { opacity: 0, x: distance },
  visible: {
    opacity: 1,
    x: 0,
    transition: { 
      duration: duration.slower, 
      delay, 
      ease: easing.enter 
    }
  }
});

export const fadeRight = (delay: number = 0, distance: number = 40) => ({
  hidden: { opacity: 0, x: -distance },
  visible: {
    opacity: 1,
    x: 0,
    transition: { 
      duration: duration.slower, 
      delay, 
      ease: easing.enter 
    }
  }
});

export const scaleIn = (delay: number = 0) => ({
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { 
      duration: duration.slow, 
      delay, 
      ease: easing.gentle 
    }
  }
});

export const blur = (delay: number = 0) => ({
  hidden: { opacity: 0, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    transition: { 
      duration: duration.slower, 
      delay, 
      ease: easing.smooth 
    }
  }
});

// Stagger container
export const staggerContainer = (staggerDelay: number = 0.1, delay: number = 0) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: delay,
    }
  }
});

// Stagger item
export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: duration.slow, 
      ease: easing.enter 
    }
  }
};

// Line draw animation
export const drawLine = (delay: number = 0) => ({
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { 
      pathLength: { duration: duration.slowest, delay, ease: easing.smooth },
      opacity: { duration: duration.fast, delay }
    }
  }
});

// Viewport trigger options
export const viewportOnce = { once: true, margin: "-100px" };
export const viewportRepeat = { once: false, margin: "-50px" };

// Hover/tap interactions
export const hoverScale = {
  scale: 1.02,
  transition: { duration: duration.fast, ease: easing.crisp }
};

export const tapScale = {
  scale: 0.98,
  transition: { duration: duration.instant, ease: easing.crisp }
};

export const hoverGlow = {
  boxShadow: "0 0 20px rgba(255,255,255,0.1)",
  transition: { duration: duration.normal, ease: easing.smooth }
};
