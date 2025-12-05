import { templateToComponent } from "./templateToComponent";

export function generateReactComponent(name, layer) {
  return `
import React from "react";
import { motion } from "framer-motion";

export default function ${name}() {
  return (
    ${templateToComponent(layer)}
  );
}
`;
}
