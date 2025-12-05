export function applyAnimationsToStyle(node, progress = 1) {
  const style = {
    position: "absolute",
    left: node.x,
    top: node.y,
    width: node.width,
    height: node.height,
    transform: `rotate(${node.rotation || 0}deg)`,
    opacity: 1,
  };

  if (!node.animations || node.animations.length === 0) return style;

  node.animations.forEach((anim) => {
    const value = anim.from + (anim.to - anim.from) * progress;
    switch (anim.property) {
      case "opacity":
        style.opacity = value;
        break;
      case "x":
        style.left = node.x + value;
        break;
      case "y":
        style.top = node.y + value;
        break;
      case "scale":
        style.transform = `${style.transform} scale(${value})`;
        break;
      case "rotate":
        style.transform = `${style.transform} rotate(${value}deg)`;
        break;
      default:
        break;
    }
  });

  return style;
}
