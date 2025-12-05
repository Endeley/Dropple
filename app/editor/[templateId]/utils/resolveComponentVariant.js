export function resolveComponentVariant(component, node) {
  const variant = node.variant || component.defaultVariant || {};
  const overrides = node.overrides || {};

  const resolvedStyles = {
    ...(component.styles?.[variant.type] || {}),
    ...(component.styles?.[variant.size] || {}),
    ...(component.styles?.[variant.state] || {}),
    ...overrides,
  };

  return resolvedStyles;
}
