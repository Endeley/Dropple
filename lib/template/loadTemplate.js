import createTemplate from "./createTemplate";

// Placeholder: replace with real Convex/DB fetch.
export default async function loadTemplate(templateId) {
  return {
    ...createTemplate(),
    id: templateId,
    name: "Loaded Template",
  };
}
