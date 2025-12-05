// Lightweight local component library. In a real setup this can be fetched from Convex or Marketplace.
export const componentLibrary = [
  {
    id: "button",
    name: "Button",
    category: "buttons",
    preview: "/components/buttons/primary.png",
    variants: {
      type: ["primary", "secondary", "outline", "ghost"],
      size: ["sm", "md", "lg"],
      state: ["default", "hover", "pressed", "disabled"],
    },
    styles: {
      primary: { background: "#4f46e5", color: "#ffffff" },
      secondary: { background: "#e5e7eb", color: "#111827" },
      outline: { background: "transparent", color: "#4f46e5", borderWidth: 1, borderColor: "#4f46e5" },
      ghost: { background: "transparent", color: "#111827" },

      sm: { height: 32, fontSize: 12, paddingX: 12, radius: 6 },
      md: { height: 40, fontSize: 14, paddingX: 16, radius: 8 },
      lg: { height: 48, fontSize: 16, paddingX: 20, radius: 10 },

      default: { opacity: 1 },
      hover: { opacity: 0.9 },
      pressed: { opacity: 0.8, scale: 0.98 },
      disabled: { opacity: 0.5 },
    },
    defaultVariant: {
      type: "primary",
      size: "md",
      state: "default",
    },
    props: {
      text: "Button",
    },
    width: 140,
    height: 44,
  },
];
