export function applyAutoLayout(parentNode, children) {
  if (!parentNode?.layout?.enabled || !children?.length) return;

  const { padding = 0, gap = 0, direction = "vertical", alignment = "start" } = parentNode.layout;
  let currentOffset = padding;

  children.forEach((child) => {
    if (direction === "vertical") {
      child.y = parentNode.y + currentOffset;
      child.x = computeAlignment(parentNode, child, alignment);
      currentOffset += child.height + gap;
    } else if (direction === "horizontal") {
      child.x = parentNode.x + currentOffset;
      child.y = computeAlignment(parentNode, child, alignment);
      currentOffset += child.width + gap;
    }
  });
}

function computeAlignment(parent, child, alignment) {
  const pad = parent.layout?.padding ?? 0;
  if (alignment === "start") {
    return parent.x + pad;
  }
  if (alignment === "center") {
    return parent.x + (parent.width - child.width) / 2;
  }
  if (alignment === "end") {
    return parent.x + parent.width - child.width - pad;
  }
  if (alignment === "stretch") {
    child.width = parent.width - pad * 2;
    return parent.x + pad;
  }
  return parent.x;
}
