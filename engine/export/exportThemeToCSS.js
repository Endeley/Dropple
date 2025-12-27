export function exportThemeToCSS(theme) {
  if (!theme?.tokens?.colors) return "";
  let css = ":root {\n";
  Object.entries(theme.tokens.colors).forEach(([key, value]) => {
    css += `  --${key}: ${value};\n`;
  });
  css += "}\n";
  return css;
}
