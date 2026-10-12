import { useState } from "react";
import { BarChart2, PieChart as PieIcon, TrendingUp, X, Maximize2 } from "lucide-react";

const C = {
  green:       "#3a6b35",
  greenDim:    "#7aad72",
  greenBorder: "#b5ceaf",
  greenBg:     "#eaf2e8",
  amber:       "#a0622a",
  amberBorder: "#d4b08a",
  amberBg:     "#f5eddf",
  red:         "#b03a2e",
  redBorder:   "#d9a9a3",
  redBg:       "#f5e8e7",
  cardBg:      "#f4f7f3",
  cardBorder:  "#cad8c5",
  textPrimary: "#1e2d1a",
  textMuted:   "#7a9472",
};

const CLASS_CONFIG = [
  { key: "segar",  label: "Segar",  color: C.green,   bg: C.greenBg,  border: C.greenBorder },
  { key: "busuk",  label: "Busuk",  color: C.red,     bg: C.redBg,    border: C.redBorder },
  { key: "kering", label: "Kering", color: C.amber,   bg: C.amberBg,  border: C.amberBorder },
  { key: "jamur",  label: "Jamur",  color: "#7b3f9e", bg: "#f3eafc",  border: "#c9a8e2" },
];

// ─── Donut Chart (reusable, ukuran bisa dikonfigurasi) ─────
function DonutChart({ data, total, size = 140, stroke = 18 }) {
  const R = size / 2 - stroke;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * R;
  const gap = total > 0 ? 0.012 : 0;

  const segments = [];
  let offset = 0;
  data.forEach((item) => {
    const fraction = total > 0 ? item.value / total : 0;
    const dash = fraction * circumference * (1 - gap * data.length);
    const space = circumference - dash;
    segments.push({ ...item, dash, space, offset });
    offset += dash + circumference * gap;
  });

  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#dce8d8" strokeWidth={stroke} />
        {total === 0 ? (
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="#cad8c5" strokeWidth={stroke} />
        ) : (
          segments.map((seg) => (
            <circle
              key={seg.key}
              cx={cx} cy={cy} r={R}
              fill="none"
              stroke={seg.color}
              strokeWidth={stroke}
              strokeDasharray={`${seg.dash} ${seg.space}`}
              strokeDashoffset={-seg.offset + circumference * 0.25}
              strokeLinecap="round"
              style={{ transition: "stroke-dasharray 0.6s cubic-bezier(0.22,1,0.36,1)" }}
            />
          ))
        )}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: size > 160 ? "28px" : "22px", fontWeight: 700, color: C.textPrimary, lineHeight: 1 }}>
          {total}
        </span>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "8px", color: C.textMuted, letterSpacing: "0.8px", marginTop: "2px" }}>
          TOTAL
        </span>
      </div>
    </div>
  );
}

// ─── Bar Chart mini (panel utama) ──────────────────────────
function BarChartMini({ data, total }) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {data.map((item) => {
        const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
        const barWidth = total > 0 ? (item.value / maxVal) * 100 : 0;
        return (
          <div key={item.key}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", alignItems: "baseline" }}>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "9px", letterSpacing: "0.8px", color: item.color, fontWeight: 700 }}>
                {item.label.toUpperCase()}
              </span>
              <div style={{ display: "flex", gap: "8px", alignItems: "baseline" }}>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "14px", fontWeight: 700, color: item.color, lineHeight: 1 }}>
                  {item.value}
                </span>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "9px", color: C.textMuted }}>
                  {pct}%
                </span>
              </div>
            </div>
            <div style={{ height: "8px", background: item.bg, border: `1px solid ${item.border}`, borderRadius: "99px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${barWidth}%`, background: item.color, borderRadius: "99px", transition: "width 0.6s cubic-bezier(0.22,1,0.36,1)" }} />
            </div>
          </div>
        );
      })}
      <div style={{ marginTop: "4px", paddingTop: "12px", borderTop: `1px dashed ${C.cardBorder}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "9px", color: C.textMuted, letterSpacing: "1px" }}>TOTAL SAMPEL</span>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "18px", fontWeight: 700, color: C.textPrimary }}>{total}</span>
      </div>
    </div>
  );
}

// ─── Tren Waktu (Line chart SVG) ───────────────────────────
function TrendChart({ detections }) {
  if (!detections.length) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "160px", fontFamily: "'Space Mono', monospace", fontSize: "11px", color: C.textMuted }}>
        Belum ada data tren...
      </div>
    );
  }

  // Hanya tampilkan data 1 jam terakhir
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const sorted = [...detections]
    .filter((d) => d.timestamp && new Date(d.timestamp) >= oneHourAgo)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  if (!sorted.length) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "160px", fontFamily: "'Space Mono', monospace", fontSize: "11px", color: C.textMuted }}>
        Belum ada data dalam 1 jam terakhir...
      </div>
    );
  }

  const buckets = {};
  sorted.forEach((d) => {
    const ts = new Date(d.timestamp);
    const key = `${String(ts.getHours()).padStart(2, "0")}:${String(ts.getMinutes()).padStart(2, "0")}`;
    if (!buckets[key]) buckets[key] = { segar: 0, cacat: 0 };
    if (d.class === "segar") buckets[key].segar++;
    else buckets[key].cacat++;
  });

  const keys = Object.keys(buckets).slice(-60); // max 60 titik (1 jam)
  if (keys.length < 2) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "160px", fontFamily: "'Space Mono', monospace", fontSize: "11px", color: C.textMuted }}>
        Butuh lebih banyak data untuk tren...
      </div>
    );
  }

  const W = 520, H = 140, PAD = { top: 12, right: 16, bottom: 28, left: 32 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const maxY = Math.max(...keys.map((k) => buckets[k].segar + buckets[k].cacat), 1);
  const xStep = innerW / (keys.length - 1);

  const toX = (i) => PAD.left + i * xStep;
  const toY = (v) => PAD.top + innerH - (v / maxY) * innerH;

  const linePoints = (accessor) =>
    keys.map((k, i) => `${toX(i)},${toY(accessor(buckets[k]))}`).join(" ");

  const areaPoints = (accessor) => {
    const pts = keys.map((k, i) => `${toX(i)},${toY(accessor(buckets[k]))}`).join(" ");
    return `${PAD.left},${PAD.top + innerH} ${pts} ${toX(keys.length - 1)},${PAD.top + innerH}`;
  };

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      {/* Y gridlines */}
      {[0, 0.5, 1].map((f) => (
        <line
          key={f}
          x1={PAD.left} x2={W - PAD.right}
          y1={PAD.top + innerH * (1 - f)} y2={PAD.top + innerH * (1 - f)}
          stroke={C.cardBorder} strokeWidth="1" strokeDasharray="4 4"
        />
      ))}

      {/* Area segar */}
      <polygon points={areaPoints((b) => b.segar)} fill={C.green} opacity="0.08" />
      {/* Area cacat */}
      <polygon points={areaPoints((b) => b.cacat)} fill={C.red} opacity="0.08" />

      {/* Line segar */}
      <polyline points={linePoints((b) => b.segar)} fill="none" stroke={C.green} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {/* Line cacat */}
      <polyline points={linePoints((b) => b.cacat)} fill="none" stroke={C.red} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

      {/* Dots segar */}
      {keys.map((k, i) => (
        <circle key={`s${i}`} cx={toX(i)} cy={toY(buckets[k].segar)} r="3" fill={C.green} />
      ))}
      {/* Dots cacat */}
      {keys.map((k, i) => (
        <circle key={`c${i}`} cx={toX(i)} cy={toY(buckets[k].cacat)} r="3" fill={C.red} />
      ))}

      {/* X labels */}
      {keys.map((k, i) => (
        (i % Math.ceil(keys.length / 6) === 0 || i === keys.length - 1) && (
          <text
            key={`l${i}`}
            x={toX(i)} y={H - 4}
            textAnchor="middle"
            fontFamily="'Space Mono', monospace"
            fontSize="8"
            fill={C.textMuted}
          >
            {k}
          </text>
        )
      ))}

      {/* Y label max */}
      <text x={PAD.left - 4} y={PAD.top + 4} textAnchor="end" fontFamily="'Space Mono', monospace" fontSize="8" fill={C.textMuted}>{maxY}</text>
      <text x={PAD.left - 4} y={PAD.top + innerH + 4} textAnchor="end" fontFamily="'Space Mono', monospace" fontSize="8" fill={C.textMuted}>0</text>
    </svg>
  );
}

// ─── Stat Card kecil untuk modal ──────────────────────────
function MiniStat({ label, value, color, bg, border }) {
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: "10px", padding: "14px 16px" }}>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "8px", letterSpacing: "1px", color, marginBottom: "6px" }}>{label}</div>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "28px", fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
    </div>
  );
}

// ─── Modal Detail ──────────────────────────────────────────
function ModalDetail({ detections, chartData, total, onClose }) {
  const [tab, setTab] = useState("distribusi");

  const segar  = chartData.find((d) => d.key === "segar")?.value  || 0;
  const busuk  = chartData.find((d) => d.key === "busuk")?.value  || 0;
  const kering = chartData.find((d) => d.key === "kering")?.value || 0;
  const jamur  = chartData.find((d) => d.key === "jamur")?.value  || 0;
  const cacat  = busuk + kering + jamur;
  const qualityPct = total > 0 ? ((segar / total) * 100).toFixed(1) : "0.0";

  const tabs = [
    { key: "distribusi", label: "DISTRIBUSI" },
    { key: "tren",       label: "TREN WAKTU" },
    { key: "ringkasan",  label: "RINGKASAN" },
  ];

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(30,45,26,0.6)", backdropFilter: "blur(5px)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
      onClick={onClose}
    >
      <div
        style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: "18px", width: "100%", maxWidth: "860px", maxHeight: "85vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 80px rgba(0,0,0,0.22)", overflow: "hidden" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: "20px 24px 0", borderBottom: `1px solid ${C.cardBorder}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
            <div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", color: C.textMuted, letterSpacing: "1.5px", marginBottom: "4px" }}>ANALISIS GRAFIK</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "20px", color: C.textPrimary }}>Detail Statistik Deteksi</div>
            </div>
            <button
              onClick={onClose}
              style={{ background: C.greenBg, border: `1px solid ${C.greenBorder}`, borderRadius: "8px", padding: "6px 10px", cursor: "pointer", color: C.green, display: "flex", alignItems: "center" }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "2px" }}>
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  padding: "8px 18px",
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "10px",
                  letterSpacing: "0.8px",
                  cursor: "pointer",
                  border: "none",
                  borderBottom: tab === t.key ? `2px solid ${C.green}` : "2px solid transparent",
                  background: "transparent",
                  color: tab === t.key ? C.green : C.textMuted,
                  fontWeight: tab === t.key ? 700 : 400,
                  transition: "all 0.15s",
                  marginBottom: "-1px",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ overflowY: "auto", flex: 1, padding: "24px" }}>

          {/* ── TAB DISTRIBUSI ── */}
          {tab === "distribusi" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              {/* Bar chart besar */}
              <div style={{ background: "#f0f5ee", border: `1px solid ${C.cardBorder}`, borderRadius: "12px", padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "18px" }}>
                  <BarChart2 size={13} color={C.green} />
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", letterSpacing: "1.2px", color: C.textMuted, fontWeight: 700 }}>DISTRIBUSI KELAS</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {chartData.map((item) => {
                    const maxVal = Math.max(...chartData.map((d) => d.value), 1);
                    const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
                    const barWidth = total > 0 ? (item.value / maxVal) * 100 : 0;
                    return (
                      <div key={item.key}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", alignItems: "baseline" }}>
                          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", letterSpacing: "0.8px", color: item.color, fontWeight: 700 }}>{item.label.toUpperCase()}</span>
                          <div style={{ display: "flex", gap: "10px", alignItems: "baseline" }}>
                            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "18px", fontWeight: 700, color: item.color, lineHeight: 1 }}>{item.value}</span>
                            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", color: C.textMuted }}>{pct}%</span>
                          </div>
                        </div>
                        <div style={{ height: "10px", background: item.bg, border: `1px solid ${item.border}`, borderRadius: "99px", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${barWidth}%`, background: item.color, borderRadius: "99px", transition: "width 0.6s cubic-bezier(0.22,1,0.36,1)" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Donut besar + legend */}
              <div style={{ background: "#f0f5ee", border: `1px solid ${C.cardBorder}`, borderRadius: "12px", padding: "20px", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "18px" }}>
                  <PieIcon size={13} color={C.green} />
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", letterSpacing: "1.2px", color: C.textMuted, fontWeight: 700 }}>PROPORSI KELAS</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "24px", flex: 1 }}>
                  <DonutChart data={chartData} total={total} size={180} stroke={22} />
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
                    {chartData.map((item) => {
                      const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0.0";
                      return (
                        <div key={item.key} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "12px", height: "12px", borderRadius: "4px", background: item.color, flexShrink: 0 }} />
                          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", color: C.textMuted, flex: 1, letterSpacing: "0.5px" }}>{item.label.toUpperCase()}</span>
                          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "13px", fontWeight: 700, color: item.color }}>{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB TREN WAKTU ── */}
          {tab === "tren" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ background: "#f0f5ee", border: `1px solid ${C.cardBorder}`, borderRadius: "12px", padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "16px" }}>
                  <TrendingUp size={13} color={C.green} />
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", letterSpacing: "1.2px", color: C.textMuted, fontWeight: 700 }}>TREN DETEKSI — 1 JAM TERAKHIR</span>
                </div>
                {/* Legend */}
                <div style={{ display: "flex", gap: "16px", marginBottom: "12px" }}>
                  {[{ color: C.green, label: "Segar" }, { color: C.red, label: "Cacat" }].map((l) => (
                    <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ width: "20px", height: "2px", background: l.color, borderRadius: "99px" }} />
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "9px", color: C.textMuted }}>{l.label.toUpperCase()}</span>
                    </div>
                  ))}
                </div>
                <TrendChart detections={detections} />
              </div>
            </div>
          )}

          {/* ── TAB RINGKASAN ── */}
          {tab === "ringkasan" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Stat grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                <MiniStat label="TOTAL DETEKSI" value={total}        color={C.textPrimary} bg={C.cardBg}   border={C.cardBorder} />
                <MiniStat label="SEGAR"         value={segar}        color={C.green}       bg={C.greenBg}  border={C.greenBorder} />
                <MiniStat label="TOTAL CACAT"   value={cacat}        color={C.red}         bg={C.redBg}    border={C.redBorder} />
                <MiniStat label="BUSUK"         value={busuk}        color={C.red}         bg={C.redBg}    border={C.redBorder} />
                <MiniStat label="KERING"        value={kering}       color={C.amber}       bg={C.amberBg}  border={C.amberBorder} />
                <MiniStat label="JAMUR"         value={jamur}        color="#7b3f9e"       bg="#f3eafc"    border="#c9a8e2" />
              </div>

              {/* Skor kualitas */}
              <div style={{ background: C.greenBg, border: `1px solid ${C.greenBorder}`, borderRadius: "12px", padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", color: C.textMuted, letterSpacing: "1px" }}>RASIO BUAH SEGAR</span>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "32px", fontWeight: 700, color: C.green, lineHeight: 1 }}>{qualityPct}%</span>
                </div>
                <div style={{ height: "10px", background: "#cad8c5", borderRadius: "99px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${qualityPct}%`, background: C.green, borderRadius: "99px", transition: "width 0.8s cubic-bezier(0.22,1,0.36,1)" }} />
                </div>
                <div style={{ marginTop: "8px", fontFamily: "'Space Mono', monospace", fontSize: "9px", color: C.textMuted }}>
                  {segar} segar dari {total} total deteksi
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Komponen Utama ────────────────────────────────────────
export default function DeteksiChart({ detections }) {
  const [showModal, setShowModal] = useState(false);
  const total = detections.length;

  const chartData = CLASS_CONFIG.map((cfg) => ({
    ...cfg,
    value: detections.filter((d) => d.class === cfg.key).length,
  }));

  return (
    <>
      <div
        style={{
          background: C.cardBg,
          border: `1px solid ${C.cardBorder}`,
          borderRadius: "12px",
          padding: "18px 20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Header dengan tombol detail */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <BarChart2 size={13} color={C.green} />
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", letterSpacing: "1.2px", color: C.textMuted, fontWeight: 700 }}>
              DISTRIBUSI KELAS
            </span>
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{
              display: "flex", alignItems: "center", gap: "5px",
              background: C.greenBg, border: `1px solid ${C.greenBorder}`,
              borderRadius: "7px", padding: "5px 11px", cursor: "pointer",
              fontFamily: "'Space Mono', monospace", fontSize: "10px",
              color: C.green, fontWeight: 700, letterSpacing: "0.5px",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#daecd5")}
            onMouseLeave={(e) => (e.currentTarget.style.background = C.greenBg)}
          >
            <Maximize2 size={11} />
            DETAIL
          </button>
        </div>

        {/* Bar Chart */}
        <div style={{ flex: 1 }}>
          <BarChartMini data={chartData} total={total} />
        </div>

        {/* Divider */}
        <div style={{ borderTop: `1px dashed ${C.cardBorder}`, margin: "16px 0" }} />

        {/* Donut Chart */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "14px" }}>
            <PieIcon size={13} color={C.green} />
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", letterSpacing: "1.2px", color: C.textMuted, fontWeight: 700 }}>PROPORSI KELAS</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <DonutChart data={chartData} total={total} size={140} stroke={18} />
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
              {chartData.map((item) => {
                const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0.0";
                return (
                  <div key={item.key} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "3px", background: item.color, flexShrink: 0 }} />
                    <div style={{ flex: 1, fontFamily: "'Space Mono', monospace", fontSize: "9px", color: C.textMuted, letterSpacing: "0.5px" }}>{item.label.toUpperCase()}</div>
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "11px", fontWeight: 700, color: item.color, minWidth: "32px", textAlign: "right" }}>{pct}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <ModalDetail
          detections={detections}
          chartData={chartData}
          total={total}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}