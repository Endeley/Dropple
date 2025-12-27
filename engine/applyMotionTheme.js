const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

const adjustTransition = (transition = {}, theme) => {
  const next = { ...transition };
  if (theme.durationScale && next.duration !== undefined) {
    next.duration = next.duration * theme.durationScale;
  }
  if (theme.durationScale && next.delay !== undefined) {
    next.delay = next.delay * theme.durationScale;
  }
  if (theme.ease) {
    next.ease = theme.ease;
  }
  return next;
};

const scaleDistance = (val, theme) => {
  if (typeof val !== "number") return val;
  return val * (theme.distanceScale || 1);
};

const adjustVariant = (variant = {}, theme) => {
  const next = { ...variant };
  if (next.x !== undefined) next.x = scaleDistance(next.x, theme);
  if (next.y !== undefined) next.y = scaleDistance(next.y, theme);
  if (next.rotateX !== undefined) next.rotateX = next.rotateX * (theme.tiltScale || 1);
  if (next.rotateY !== undefined) next.rotateY = next.rotateY * (theme.tiltScale || 1);
  if (next.scale === undefined && theme.hoverScale && next === variant.hover) {
    next.scale = theme.hoverScale;
  }
  if (next.transition) {
    next.transition = adjustTransition(next.transition, theme);
  }
  return next;
};

const adjustScroll = (scroll = {}, theme) => {
  if (!scroll.outputRange) return scroll;
  const next = { ...scroll, outputRange: { ...(scroll.outputRange || {}) } };
  ["x", "y"].forEach((axis) => {
    if (Array.isArray(next.outputRange[axis])) {
      next.outputRange[axis] = next.outputRange[axis].map((v) => scaleDistance(v, theme));
    }
  });
  return next;
};

const adjustTracks = (tracks = [], theme) => {
  return tracks.map((t) => ({
    ...t,
    keyframes: (t.keyframes || []).map((kf) => ({
      ...kf,
      time: kf.time !== undefined ? kf.time * (theme.durationScale || 1) : kf.time,
      duration: kf.duration !== undefined ? kf.duration * (theme.durationScale || 1) : kf.duration,
      value: typeof kf.value === "number" && (t.property === "x" || t.property === "y")
        ? scaleDistance(kf.value, theme)
        : kf.value,
      easing: theme.ease || kf.easing,
    })),
  }));
};

const adjustAnimation = (anim = {}, theme) => {
  const variants = anim.variants || anim.states || {};
  const nextVariants = {};
  Object.entries(variants).forEach(([key, val]) => {
    nextVariants[key] = adjustVariant(val, theme);
  });

  if (nextVariants.hover && theme.hoverScale) {
    nextVariants.hover = { ...nextVariants.hover, scale: theme.hoverScale };
  }
  if (nextVariants.tap && theme.tapScale) {
    nextVariants.tap = { ...nextVariants.tap, scale: theme.tapScale };
  }

  const nextScroll = anim.scroll ? adjustScroll(anim.scroll, theme) : anim.scroll;
  const nextTracks = adjustTracks(anim.tracks || [], theme);

  return {
    ...anim,
    variants: nextVariants,
    triggers: anim.triggers || [],
    scroll: nextScroll,
    tracks: nextTracks,
  };
};

const applyThemeToLayer = (layer, theme) => {
  if (!layer.animations?.length) return layer;
  const animations = layer.animations.map((a) => adjustAnimation(a, theme));
  return { ...layer, animations };
};

export function applyMotionThemeToLayers(layers = [], theme, targetIds = null) {
  if (!theme) return layers;
  const targetSet = targetIds ? new Set(targetIds) : null;
  return layers.map((l) => {
    const shouldUpdate = !targetSet || targetSet.has(l.id);
    if (!shouldUpdate) return l;
    return applyThemeToLayer(l, theme);
  });
}
