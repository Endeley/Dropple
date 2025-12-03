"use client";

export default function CanvasLayer({ layer }) {
  const style = {
    position: "absolute",
    left: layer.x,
    top: layer.y,
    width: layer.width,
    height: layer.height,
    borderRadius: layer.props?.borderRadius || 0,
    overflow: "hidden",
    color: layer.props?.color,
    background: layer.props?.fill,
  };

  return (
    <div style={style} className="select-none">
      {layer.type === "text" && (
        <div
          className="w-full h-full"
          style={{
            fontSize: layer.props?.fontSize,
            fontWeight: layer.props?.fontWeight,
            color: layer.props?.color,
          }}
        >
          {layer.content}
        </div>
      )}

      {layer.type === "rect" && <div className="w-full h-full" />}

      {layer.type === "image" && (
        <img
          src={layer.url}
          alt="Layer"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}
    </div>
  );
}
