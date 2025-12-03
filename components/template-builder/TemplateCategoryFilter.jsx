"use client";

export default function TemplateCategoryFilter() {
  return (
    <div className="flex gap-2 p-4 bg-white border-b">
      <input 
        className="flex-1 border p-2 rounded"
        placeholder="Search templates..." 
      />
      <select className="border p-2 rounded">
        <option>All Categories</option>
        <option>UI/UX</option>
        <option>Social Media</option>
      </select>
    </div>
  );
}
