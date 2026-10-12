import React, { useEffect, useState } from "react";
import {
  Wifi, Camera, Zap, Clock, Activity, CalendarClock,
} from "lucide-react";

const N = {
  bg:           "#4a7c45",
  border:       "#3a6335",
  liveBg:       "#3a6335",
  liveBorder:   "#2d4f29",
  green:        "#c8f0bc",
  amber:        "#f5d08a",
  red:          "#f5a59a",
  labelColor:   "#a8cca3",
  hoverBg:      "#3d6e38",
  hoverBorder:  "#2d4f29",
  divider:      "#3a6335",
  brandPrimary: "#f0f8ee",
  brandSub:     "#a8cca3",
};

export default function Navbar({
  fps = 0,
  latency = 0,
  cameraStatus = "OFF",
}) {
  const [connection, setConnection] = useState("CHECKING");
  const [uptime, setUptime] = useState(() => {
    const saved = localStorage.getItem("uptime");
    return saved ? parseInt(saved) : 0;
  });
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const update = () => setConnection(navigator.onLine ? "CONNECTED" : "DISCONNECTED");
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    update();
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setUptime((prev) => {
        const u = prev + 1;
        localStorage.setItem("uptime", u);
        return u;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatUptime = () => {
    const h = Math.floor(uptime / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const getLatencyColor = (ms) => {
    if (ms > 80) return N.red;
    if (ms > 40) return N.amber;
    return N.green;
  };

  return (
    <div
      style={{
        fontFamily: "'DM Sans', sans-serif",
        background: N.bg,
        borderBottom: `1px solid ${N.border}`,
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 100,
        height: "68px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: "28px",
        paddingRight: "16px",
      }}
    >
      {/* ── LEFT: Brand ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        {/* LIVE badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", borderRadius: "8px", padding: "6px 12px", background: N.liveBg, border: `1px solid ${N.liveBorder}` }}>
          <div style={{ position: "relative", width: "8px", height: "8px" }}>
            <span className="animate-ping" style={{ position: "absolute", inset: 0, borderRadius: "50%", background: N.green, opacity: 0.5 }} />
            <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: N.green }} />
          </div>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "11px", color: N.green, letterSpacing: "1px", fontWeight: 700 }}>LIVE</span>
        </div>

        <div style={{ height: "28px", width: "1px", background: N.divider }} />

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "14px", fontWeight: 600, color: N.brandPrimary, letterSpacing: "0.3px" }}>SISTEM KLASIFIKASI</span>
          <span style={{ fontSize: "11px", color: N.brandSub, letterSpacing: "0.5px" }}>Kualitas Brondolan Sawit</span>
        </div>
      </div>

      {/* ── RIGHT: Status ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <StatusCard icon={<Wifi size={14} />}          label="CONNECTION" value={connection}             valueColor={connection === "CONNECTED" ? N.green : connection === "CHECKING" ? N.amber : N.red} />
        <Separator />
        <StatusCard icon={<Camera size={14} />}        label="CAMERA"     value={cameraStatus}           valueColor={cameraStatus === "OK" ? N.green : cameraStatus === "CHECKING" ? N.amber : N.red} />
        <Separator />
        <StatusCard icon={<Zap size={14} />}           label="FPS"        value={`${fps} FPS`}           valueColor={N.green} />
        <Separator />
        <StatusCard icon={<Clock size={14} />}         label="LATENCY"    value={`${latency} ms`}        valueColor={getLatencyColor(latency)} />
        <Separator />
        <StatusCard icon={<Activity size={14} />}      label="UPTIME"     value={formatUptime()}         valueColor={N.green} />
        <Separator />
        <StatusCard icon={<CalendarClock size={14} />} label="TIME"       value={time.toLocaleTimeString()} valueColor={N.brandPrimary} />
      </div>
    </div>
  );
}

function StatusCard({ icon, label, value, valueColor }) {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", padding: "6px 12px", borderRadius: "8px", minWidth: "72px", cursor: "default", border: "1px solid transparent", transition: "all 0.15s ease" }}
      onMouseEnter={(e) => { e.currentTarget.style.background = N.hoverBg; e.currentTarget.style.borderColor = N.hoverBorder; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; }}
    >
      <span style={{ color: N.labelColor, display: "flex" }}>{icon}</span>
      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "9px", color: N.labelColor, letterSpacing: "0.8px", lineHeight: 1 }}>{label}</span>
      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "12px", fontWeight: 700, color: valueColor, lineHeight: 1 }}>{value}</span>
    </div>
  );
}

function Separator() {
  return <div style={{ height: "32px", width: "1px", background: "#cad8c5", margin: "0 2px" }} />;
}