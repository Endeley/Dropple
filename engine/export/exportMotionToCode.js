const camelCase = (str = "") =>
  str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
    .replace(/^(.)/, (m) => m.toLowerCase());

const typeMap = {
  text: "motion.p",
  frame: "motion.div",
  group: "motion.div",
  rect: "motion.div",
  image: "motion.img",
  default: "motion.div",
};

const safeName = (id = "node") => camelCase(id.replace(/[^a-zA-Z0-9]/g, "_")) || "node";

const stringify = (obj) => JSON.stringify(obj, null, 2);

const buildVariantsConst = (layer) => {
  const anim = layer.animations?.[0];
  if (!anim?.variants && !anim?.states) return null;
  const variants = anim.variants || anim.states || {};
  const name = `${safeName(layer.id)}Variants`;
  return `const ${name} = ${stringify(variants)};`;
};

const buildScrollHooks = (layer) => {
  const anim = layer.animations?.[0];
  if (!anim?.scroll) return null;
  const scroll = anim.scroll;
  const id = safeName(layer.id);
  const lines = [];
  lines.push(`const { scrollYProgress: scroll_${id} } = useScroll();`);
  Object.entries(scroll.outputRange || {}).forEach(([prop, values]) => {
    const arr = Array.isArray(values) ? values : [];
    lines.push(`const ${id}_${prop} = useTransform(scroll_${id}, ${stringify(scroll.inputRange || [0,1])}, ${stringify(arr)});`);
  });
  return lines.join("\n");
};

const buildTimelineAnimate = (layer) => {
  const anim = layer.animations?.[0];
  if (!anim?.tracks?.length) return null;
  const animate = {};
  const transition = { duration: 1, times: [] };
  anim.tracks.forEach((track) => {
    const vals = [];
    const times = [];
    (track.keyframes || []).forEach((kf) => {
      vals.push(kf.value);
      times.push((kf.time || 0) / 1000);
    });
    animate[track.property] = vals;
    transition.times = times;
    if (track.keyframes?.[track.keyframes.length - 1]?.duration) {
      transition.duration = track.keyframes[track.keyframes.length - 1].duration / 1000;
    }
  });
  return { animate, transition };
};

const collectLayers = (layer, allLayers, list = []) => {
  list.push(layer);
  (layer.children || [])
    .map((id) => allLayers.find((l) => l.id === id))
    .filter(Boolean)
    .forEach((child) => collectLayers(child, allLayers, list));
  return list;
};

const buildJSX = (layer, allLayers, variantMap, indent = 2, scrollMap = {}) => {
  const pad = "  ".repeat(indent);
  const tag = typeMap[layer.type] || typeMap.default;
  const anim = layer.animations?.[0];
  const hasVariants = Boolean(anim?.variants || anim?.states);
  const hasTracks = anim?.tracks?.length;
  const motionProps = [];
  if (hasVariants) {
    const vName = variantMap[layer.id];
    motionProps.push(`variants={${vName}}`);
    if (anim?.triggers?.includes("onHover") || anim?.variants?.hover || anim?.states?.hover) {
      motionProps.push(`whileHover="hover"`);
    }
    if (anim?.triggers?.includes("onClick") || anim?.variants?.tap || anim?.states?.tap) {
      motionProps.push(`whileTap="tap"`);
    }
    motionProps.push(`initial="initial"`);
    motionProps.push(`animate="animate"`);
    if (anim?.variants?.exit || anim?.states?.exit) motionProps.push(`exit="exit"`);
  } else if (hasTracks) {
    const t = buildTimelineAnimate(layer);
    if (t) {
      motionProps.push(`animate={${stringify(t.animate)}}`);
      motionProps.push(`transition={${stringify(t.transition)}}`);
    }
  }

  const scrollStyles = scrollMap[layer.id];
  const styleParts = [];
  if (layer.width) styleParts.push(`width: ${layer.width}`);
  if (layer.height) styleParts.push(`height: ${layer.height}`);
  if (scrollStyles) {
    Object.entries(scrollStyles).forEach(([k, v]) => styleParts.push(`${k}: ${v}`));
  }
  const styleProp = styleParts.length ? ` style={{ ${styleParts.join(", ")} }}` : "";

  const children = (layer.children || [])
    .map((id) => allLayers.find((l) => l.id === id))
    .filter(Boolean);

  if (layer.type === "text") {
    const content = layer.content || layer.props?.text || "Text";
    return `${pad}<${tag} ${motionProps.join(" ")} ${styleProp}>${content}</${tag}>`;
  }
  if (layer.type === "image") {
    const src = layer.url || layer.props?.src || "";
    return `${pad}<${tag} src="${src}" ${motionProps.join(" ")} ${styleProp} />`;
  }

  if (!children.length) {
    return `${pad}<${tag} ${motionProps.join(" ")} ${styleProp} />`;
  }

  let code = `${pad}<${tag} ${motionProps.join(" ")} ${styleProp}>\n`;
  children.forEach((c) => {
    code += buildJSX(c, allLayers, variantMap, indent + 1, scrollMap) + "\n";
  });
  code += `${pad}</${tag}>`;
  return code;
};

export function exportMotionComponent(layer, allLayers = []) {
  if (!layer) return "";
  const tree = collectLayers(layer, allLayers, []);
  const variantMap = {};
  const variantConsts = [];
  const scrollHooks = [];

  tree.forEach((lyr) => {
    const vConst = buildVariantsConst(lyr);
    if (vConst) {
      const name = vConst.match(/const\s+([a-zA-Z0-9_]+)/)?.[1];
      if (name) variantMap[lyr.id] = name;
      variantConsts.push(vConst);
    }
    const scrollLines = buildScrollHooks(lyr);
    if (scrollLines) {
      scrollHooks.push(scrollLines);
    }
  });

  const scrollMap = {};
  tree.forEach((lyr) => {
    const anim = lyr.animations?.[0];
    if (!anim?.scroll) return;
    const id = safeName(lyr.id);
    const style = {};
    Object.keys(anim.scroll.outputRange || {}).forEach((prop) => {
      style[prop] = `${id}_${prop}`;
    });
    scrollMap[lyr.id] = style;
  });

  const imports = [`import { motion, useScroll, useTransform } from "framer-motion";`];

  const body = [];
  if (variantConsts.length) body.push(variantConsts.join("\n\n"));

  body.push(`export function DroppleMotionComponent() {`);
  if (scrollHooks.length) {
    body.push(scrollHooks.join("\n"));
    body.push("");
  }
  body.push("  return (");
  body.push(buildJSX(layer, allLayers, variantMap, 2, scrollMap));
  body.push("  );");
  body.push("}");

  return `${imports.join("\n")}\n\n${body.join("\n")}`;
}
