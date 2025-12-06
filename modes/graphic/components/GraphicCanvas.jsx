"use client";

export default function GraphicCanvas() {
  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <div
        className="shadow-xl"
        style={{
          width: "800px",
          height: "600px",
          backgroundColor: "#ffffff",
          backgroundImage:
            "linear-gradient(45deg, #eee 25%, transparent 25%), linear-gradient(-45deg, #eee 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #eee 75%), linear-gradient(-45deg, transparent 75%, #eee 75%)",
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0",
        }}
      >
        {/* Canvas layers will go here */}
      </div>
    </div>
  );
}
