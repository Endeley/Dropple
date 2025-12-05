export default function ColorPicker({ value, onChange }) {
  return (
    <input
      type="color"
      value={value}
      className="w-full h-8 p-0 border rounded"
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
