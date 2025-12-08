export const motionThemes = [
  {
    id: "smoothModern",
    label: "Smooth Modern",
    durationScale: 1.15,
    distanceScale: 0.7,
    ease: "easeOutCubic",
    hoverScale: 1.04,
    tapScale: 0.97,
    parallaxIntensity: 0.5,
    stagger: 0.08,
    pageTransition: "slide",
  },
  {
    id: "playfulBounce",
    label: "Playful Bounce",
    durationScale: 0.9,
    distanceScale: 1.1,
    ease: "easeOutBack",
    hoverScale: 1.08,
    tapScale: 0.94,
    parallaxIntensity: 0.7,
    stagger: 0.12,
    pageTransition: "bounceSlide",
  },
  {
    id: "cinematic",
    label: "Cinematic",
    durationScale: 1.35,
    distanceScale: 1.2,
    ease: "easeInOutCubic",
    hoverScale: 1.02,
    tapScale: 0.98,
    parallaxIntensity: 0.9,
    stagger: 0.14,
    pageTransition: "fade",
  },
];

export const motionThemeMap = motionThemes.reduce((acc, t) => {
  acc[t.id] = t;
  return acc;
}, {});

export function getMotionTheme(themeId) {
  return motionThemeMap[themeId] || null;
}
