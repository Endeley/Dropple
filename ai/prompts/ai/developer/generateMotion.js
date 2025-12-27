export function generateMotionVariants(timeline = { duration: 0.6, easing: "easeOut" }) {
  const duration = timeline.duration || 0.6;
  const easing = timeline.easing || "easeOut";
  return `
export const variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: ${duration}, ease: "${easing}" }
  }
};
`;
}
