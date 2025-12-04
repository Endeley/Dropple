const formatOpacity = (value) => {
  if (value === undefined || value === null) return null;
  if (value > 1) return `opacity-[${value}]`;
  const pct = Math.round(value * 100);
  return `opacity-[${pct}%]`;
};

export function exportLayerToJSX(layer, allLayers = [], indent = 0, options = {}) {
  if (!layer) return "";
  const pad = "  ".repeat(indent);
  const classNames = [];

  const props = { ...(layer.props || {}), ...(layer.overrides || {}) };

  if (layer.width) classNames.push(`w-[${layer.width}px]`);
  if (layer.height) classNames.push(`h-[${layer.height}px]`);

  if (props.padding) classNames.push(`p-[${props.padding}px]`);
  if (props.gap) classNames.push(`gap-[${props.gap}px]`);

  const radius = props.radius ?? props.borderRadius;
  if (radius !== undefined) classNames.push(`rounded-[${radius}px]`);

  if (props.fill) classNames.push(`bg-[${props.fill}]`);
  if (props.shadow) classNames.push(`shadow-[${props.shadow}]`);

  const opacityClass = formatOpacity(props.opacity);
  if (opacityClass) classNames.push(opacityClass);

  if (layer.constraints?.horizontal === "left-right") {
    classNames.push("w-full");
  }
  if (layer.constraints?.vertical === "top-bottom") {
    classNames.push("h-full");
  }

  const themeToken = props.themeToken || (layer.styleId?.startsWith("theme-color-")
    ? layer.styleId.replace("theme-color-", "")
    : null);

  if (themeToken) {
    if (layer.type === "text") {
      classNames.push(`text-[var(--${themeToken})]`);
    } else {
      classNames.push(`bg-[var(--${themeToken})]`);
    }
  }

  if (layer.type === "frame" && layer.autoLayout?.enabled) {
    classNames.push("flex");
    classNames.push(
      layer.autoLayout.direction === "horizontal" ? "flex-row" : "flex-col",
    );
    if (layer.autoLayout.gap) {
      classNames.push(`gap-[${layer.autoLayout.gap}px]`);
    }
    if (layer.autoLayout.padding) {
      classNames.push(`p-[${layer.autoLayout.padding}px]`);
    }
    if (layer.autoLayout.align === "center") {
      classNames.push("items-center");
    }
    if (layer.autoLayout.align === "end") {
      classNames.push("items-end");
    }
  }

  const classString = classNames.join(" ").trim();

  const getChildren = () =>
    (layer.children || [])
      .map((id) => allLayers.find((l) => l.id === id))
      .filter(Boolean);

  if (layer.type === "text") {
    const text =
      layer.content || props.text || (typeof layer.content === "number" ? layer.content : "");
    const fontSize = props.fontSize || 16;
    const fontWeight = props.fontWeight || 400;
    const color = props.color || "#000";

    const classes = [`text-[${fontSize}px]`, `font-[${fontWeight}]`, `text-[${color}]`];
    if (classString) classes.push(classString);
    const merged = classes.join(" ").trim();

    let code = `${pad}<p`;
    if (merged) code += ` className="${merged}"`;
    code += `>`;
    code += `\n${pad}  ${text}\n${pad}</p>`;
    return code;
  }

  if (layer.type === "image") {
    const src = layer.url || props.src || "";
    let code = `${pad}<img src="${src}"`;
    if (classString) code += ` className="${classString}"`;
    code += " />";
    return code;
  }

  if (layer.type === "component-instance") {
    const componentName =
      layer.name ||
      options.components?.find((c) => c._id === layer.componentId)?.name ||
      "Component";
    return `${pad}<${componentName} />`;
  }

  const children = getChildren();
  let code = `${pad}<div`;
  if (classString) code += ` className="${classString}"`;
  code += ">";

  if (children.length) {
    code += "\n";
    children.forEach((child, idx) => {
      code += exportLayerToJSX(child, allLayers, indent + 1, options);
      if (idx < children.length - 1) code += "\n";
    });
    code += `\n${pad}</div>`;
  } else {
    code += `</div>`;
  }

  return code;
}
