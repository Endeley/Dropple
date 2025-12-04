"use client";

export default function TemplatePreviewCard({ template = {} }) {
  const category = template.category || template.mode || "UI/UX";
  const priceValue =
    typeof template.price === "number"
      ? template.price
      : Number.isNaN(Number(template.price))
        ? 0
        : Number(template.price);
  const priceLabel = priceValue > 0 ? `$${priceValue.toFixed(2)}` : "Free";

  return (
    <div className="w-full border rounded-lg overflow-hidden bg-white shadow hover:shadow-md transition">
      <div className="w-full h-40 bg-gray-100 overflow-hidden">
        {template.thumbnail ? (
          <img
            src={template.thumbnail}
            alt="Template preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
      </div>
      <div className="p-4">
        <p className="font-medium">{template.name || "Template Name"}</p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{category}</span>
          <span className="font-medium text-gray-700">{priceLabel}</span>
        </div>
      </div>
    </div>
  );
}
