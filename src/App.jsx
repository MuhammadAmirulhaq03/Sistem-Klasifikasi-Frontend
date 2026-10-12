import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import LaporanDeteksi from "./components/LaporanDeteksi";
import DeteksiTable from "./components/DeteksiTable";
import DeteksiChart from "./components/DeteksiChart";
import { io } from "socket.io-client";
import {
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Activity,
  FileText,
} from "lucide-react";
import "./App.css";

const C = {
  green: "#3a6b35",
  greenDim: "#7aad72",
  greenBorder: "#b5ceaf",
  greenBg: "#eaf2e8",
  amber: "#a0622a",
  amberBorder: "#d4b08a",
  amberBg: "#f5eddf",
  red: "#b03a2e",
  redBorder: "#d9a9a3",
  redBg: "#f5e8e7",
  cardBg: "#f4f7f3",
  cardBorder: "#cad8c5",
  pageBg: "#e4ece1",
  textPrimary: "#1e2d1a",
  textMuted: "#7a9472",
};

export default function App() {
  const [detections, setDetections] = useState([]);
  const [stream, setStream] = useState(null);
  const [showLaporan, setShowLaporan] = useState(false);

  const apiUrl = "http://localhost:8080/api/detections";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(apiUrl);
        if (!res.ok) return;
        const data = await res.json();
        setDetections(data);
      } catch {
        setDetections([]);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const socket = io("http://localhost:8080");
    socket.on("stream", (data) => setStream(data));
    return () => socket.disconnect();
  }, []);

  const totalLF = detections.length;
  const ripeCount = detections.filter((d) => d.class === "segar").length;
  const defectCount = detections.filter((d) => d.class !== "segar").length;

  const avgQuality = detections.length
    ? ((ripeCount / detections.length) * 100).toFixed(1)
    : 0;

  const defects = {
    rotten: detections.filter((d) => d.class === "busuk").length,
    dry: detections.filter((d) => d.class === "kering").length,
    moldy: detections.filter((d) => d.class === "jamur").length,
  };

  return (
    <div
      style={{
        background: C.pageBg,
        minHeight: "100vh",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <Navbar
        fps={stream?.fps || 0}
        latency={stream?.latency || 0}
        cameraStatus={stream ? "OK" : "OFF"}
      />

      {/* SECTION ATAS: Stream + Panel Kanan */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          padding: "16px",
          paddingTop: "84px",
          height: "calc(100vh - 67px)",
          minHeight: "420px",
          boxSizing: "border-box",
        }}
      >
        {/* STREAM */}
        <div
          style={{
            flex: "1.6 1 0",
            minWidth: 0,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <StreamPanel stream={stream} />
        </div>

        {/* PANEL KANAN */}
        <div
          style={{
            flex: "1 1 0",
            minWidth: "280px",
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            overflowY: "auto",
          }}
        >
          {/* Total Brondolan */}
          <StatCard icon={<TrendingUp size={13} />} label="TOTAL BRONDOLAN">
            <BigNumber value={totalLF} color={C.textPrimary} />
          </StatCard>

          {/* Batch Saat Ini */}
          <Card>
            <CardLabel icon={null} text="BATCH SAAT INI" />
            <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
              <HalfCard
                bg={C.greenBg}
                border={C.greenBorder}
                icon={<CheckCircle size={12} />}
                label="SEGAR"
                labelColor={C.green}
                value={ripeCount}
                valueColor={C.green}
              />
              <HalfCard
                bg={C.amberBg}
                border={C.amberBorder}
                icon={<AlertTriangle size={12} />}
                label="CACAT"
                labelColor={C.amber}
                value={defectCount}
                valueColor={C.amber}
              />
            </div>
          </Card>

          {/* Rasio Buah Segar */}
          <Card>
            <CardLabel icon={<Activity size={13} />} text="RASIO BUAH SEGAR" />
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "4px",
                marginTop: "4px",
              }}
            >
              <BigNumber value={avgQuality} color={C.green} />
              <span
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "18px",
                  color: C.green,
                  fontWeight: 700,
                }}
              >
                %
              </span>
            </div>
            <div
              style={{
                fontSize: "11px",
                color: C.textMuted,
                marginTop: "2px",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {ripeCount} segar dari {totalLF} buah
            </div>
            <div
              style={{
                height: "6px",
                background: "#cad8c5",
                borderRadius: "99px",
                overflow: "hidden",
                marginTop: "10px",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${avgQuality}%`,
                  background: C.green,
                  borderRadius: "99px",
                  transition: "width 0.6s ease",
                }}
              />
            </div>
          </Card>

          {/* Cacat Terdeteksi */}
          <Card>
            <CardLabel
              icon={<AlertCircle size={13} color={C.red} />}
              text="CACAT TERDETEKSI"
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: "8px",
                marginTop: "10px",
              }}
            >
              <DefectCell label="BUSUK" value={defects.rotten} />
              <DefectCell label="KERING" value={defects.dry} />
              <DefectCell label="JAMUR" value={defects.moldy} />
            </div>
          </Card>

          {/* Tombol Aksi */}
          <ActionButton
            variant="primary"
            icon={<FileText size={14} />}
            label="Laporan Deteksi"
            onClick={() => setShowLaporan(true)}
          />
        </div>
      </div>

      {/* SECTION BAWAH: Tabel + Grafik */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "62% 38%",
          gap: "16px",
          padding: "0 16px 24px",
          boxSizing: "border-box",
        }}
      >
        <DeteksiTable detections={detections} />
        <DeteksiChart detections={detections} />
      </div>

      {showLaporan && (
        <LaporanDeteksi
          detections={detections}
          onClose={() => setShowLaporan(false)}
        />
      )}
    </div>
  );
}

function StreamPanel({ stream }) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "100%",
        maxHeight: "100%",
        aspectRatio: "4 / 3",
        background: "#dce8d8",
        border: `1px solid ${C.cardBorder}`,
        borderRadius: "12px",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "auto",
      }}
    >
      {/* Grid overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.06,
          backgroundImage:
            "linear-gradient(#3a6b35 1px, transparent 1px), linear-gradient(90deg, #3a6b35 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          pointerEvents: "none",
        }}
      />

      {["tl", "tr", "bl", "br"].map((pos) => (
        <CornerBracket key={pos} pos={pos} />
      ))}

      {stream?.image ? (
        <img
          src={`data:image/jpeg;base64,${stream.image}`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            background: "#dce8d8",
            display: "block",
          }}
          alt="stream deteksi brondolan"
        />
      ) : (
        <div
          style={{
            color: C.textMuted,
            fontFamily: "'Space Mono', monospace",
            fontSize: "12px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "12px", marginBottom: "8px", opacity: 0.5 }}>
            [ KAMERA ]
          </div>
          Menunggu stream kamera...
        </div>
      )}

      {/* Badge LIVE */}
      <div
        style={{
          position: "absolute",
          top: "12px",
          left: "12px",
          background: "#f4f7f3",
          border: `1px solid ${C.greenBorder}`,
          borderRadius: "8px",
          padding: "5px 12px",
          display: "flex",
          alignItems: "center",
          gap: "7px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        }}
      >
        <LiveDot />
        <span
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: "11px",
            color: C.green,
            fontWeight: 700,
            letterSpacing: "1px",
          }}
        >
          LIVE
        </span>
      </div>

      {stream && (
        <div
          style={{
            position: "absolute",
            bottom: "12px",
            left: "12px",
            display: "flex",
            gap: "8px",
          }}
        >
          <StreamBadge
            value={`${stream.fps} FPS`}
            color={C.green}
            borderColor={C.greenBorder}
          />
          <StreamBadge
            value={`${stream.latency} ms`}
            color={C.amber}
            borderColor={C.amberBorder}
          />
        </div>
      )}
    </div>
  );
}

function LiveDot() {
  return (
    <div style={{ position: "relative", width: "8px", height: "8px", flexShrink: 0 }}>
      <span
        className="animate-ping"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: C.green,
          opacity: 0.5,
        }}
      />
      <span
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: C.green,
        }}
      />
    </div>
  );
}

function StreamBadge({ value, color, borderColor }) {
  return (
    <div
      style={{
        background: "#f4f7f3",
        border: `1px solid ${borderColor}`,
        borderRadius: "6px",
        padding: "4px 10px",
        fontFamily: "'Space Mono', monospace",
        fontSize: "11px",
        color,
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      {value}
    </div>
  );
}

function CornerBracket({ pos }) {
  const isTop = pos.startsWith("t");
  const isLeft = pos.endsWith("l");

  return (
    <div
      style={{
        position: "absolute",
        width: "16px",
        height: "16px",
        top: isTop ? "12px" : "auto",
        bottom: !isTop ? "12px" : "auto",
        left: isLeft ? "12px" : "auto",
        right: !isLeft ? "12px" : "auto",
        borderColor: C.green,
        borderStyle: "solid",
        opacity: 0.4,
        borderWidth: `${isTop ? "2px" : "0"} ${!isLeft ? "2px" : "0"} ${!isTop ? "2px" : "0"} ${isLeft ? "2px" : "0"}`,
        pointerEvents: "none",
      }}
    />
  );
}

function Card({ children, style = {} }) {
  return (
    <div
      style={{
        background: C.cardBg,
        border: `1px solid ${C.cardBorder}`,
        borderRadius: "12px",
        padding: "14px 16px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        boxSizing: "border-box",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function StatCard({ icon, label, children }) {
  return (
    <Card>
      <CardLabel icon={icon} text={label} />
      <div style={{ marginTop: "4px" }}>{children}</div>
    </Card>
  );
}

function CardLabel({ icon, text }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        fontFamily: "'Space Mono', monospace",
        fontSize: "10px",
        color: C.textMuted,
        letterSpacing: "0.7px",
        marginBottom: "2px",
      }}
    >
      {icon && <span style={{ color: C.textMuted, display: "inline-flex" }}>{icon}</span>}
      {text}
    </div>
  );
}

function BigNumber({ value, color }) {
  return (
    <div
      style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: "40px",
        fontWeight: 700,
        color,
        lineHeight: 1,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {value}
    </div>
  );
}

function HalfCard({ bg, border, icon, label, labelColor, value, valueColor }) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: "10px",
        padding: "10px 12px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          fontFamily: "'Space Mono', monospace",
          fontSize: "9px",
          color: labelColor,
          letterSpacing: "0.7px",
          marginBottom: "4px",
          whiteSpace: "nowrap",
        }}
      >
        {icon}
        {label}
      </div>
      <div
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: "30px",
          fontWeight: 700,
          color: valueColor,
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function DefectCell({ label, value }) {
  return (
    <div
      style={{
        minWidth: 0,
        background: C.redBg,
        border: `1px solid ${C.redBorder}`,
        borderRadius: "8px",
        padding: "9px 10px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: "9px",
          color: "#c4827a",
          letterSpacing: "0.6px",
          marginBottom: "2px",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: "24px",
          fontWeight: 700,
          color: C.red,
          lineHeight: 1.1,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ActionButton({ variant, icon, label, onClick }) {
  const isPrimary = variant === "primary";

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: "0 0 auto",
        alignSelf: "stretch",
        minHeight: "40px",
        boxSizing: "border-box",
        borderRadius: "8px",
        padding: "10px 12px",
        fontSize: "12px",
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        cursor: "pointer",
        border: isPrimary ? "none" : `1px solid ${C.cardBorder}`,
        background: isPrimary ? C.green : "#f4f7f3",
        color: isPrimary ? "#f4f7f3" : C.textPrimary,
        fontFamily: "'DM Sans', sans-serif",
        boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
        transition: "filter 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.filter = "brightness(1.05)";
        e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.filter = "brightness(1)";
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.07)";
      }}
    >
      {icon}
      {label}
    </button>
  );
}
