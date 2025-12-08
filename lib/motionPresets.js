export const motionPresets = [
  {
    id: "fadeUp",
    name: "Fade Up",
    category: "reveal",
    variants: {
      initial: { opacity: 0, y: 24 },
      animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
      exit: { opacity: 0, y: -12, transition: { duration: 0.4 } },
    },
    triggers: ["onLoad", "onView"],
  },
  {
    id: "fadeIn",
    name: "Fade In",
    category: "reveal",
    variants: {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: 0.45, ease: "easeOut" } },
      exit: { opacity: 0, transition: { duration: 0.3 } },
    },
    triggers: ["onLoad", "onView"],
  },
  {
    id: "slideLeft",
    name: "Slide Left",
    category: "slide",
    variants: {
      initial: { opacity: 0, x: 48 },
      animate: { opacity: 1, x: 0, transition: { duration: 0.55, ease: "easeOut" } },
      exit: { opacity: 0, x: -32, transition: { duration: 0.4 } },
    },
    triggers: ["onLoad", "onView"],
  },
  {
    id: "float3d",
    name: "Floating 3D",
    category: "loop",
    variants: {
      initial: { rotateX: 0, rotateY: 0, y: 0 },
      animate: {
        rotateX: 10,
        rotateY: -8,
        y: -6,
        transition: { duration: 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
      },
    },
    triggers: ["onLoad"],
  },
  {
    id: "parallaxSlow",
    name: "Parallax Slow",
    category: "scroll",
    variants: {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
    },
    scroll: {
      inputRange: [0, 400],
      outputRange: { y: [0, -40], opacity: [1, 0.9] },
    },
    triggers: ["onScroll"],
  },
];

export const motionPresetMap = motionPresets.reduce((acc, p) => {
  acc[p.id] = p;
  return acc;
}, {});

export function getMotionPreset(id) {
  return motionPresetMap[id] || null;
}
