import { useEffect } from "react";

export default function Toast({ message, duration = 1000, onClose }: { message: string; duration?: number; onClose?: ()=>void }) {
  useEffect(() => {
    const t = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  return (
    <div style={{
      position: "fixed",
      top: 16,
      right: 16,
      padding: "10px 14px",
      borderRadius: 8,
      background: "rgba(0,0,0,0.8)",
      color: "#fff",
      zIndex: 9999,
      fontSize: 14
    }}>
      {message}
    </div>
  );
}