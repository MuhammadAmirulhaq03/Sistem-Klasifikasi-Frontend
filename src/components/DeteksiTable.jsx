import { useState } from "react";
import { Eye, X, ChevronRight, Leaf, Clock } from "lucide-react";

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
  pageBg:      "#e4ece1",
  textPrimary: "#1e2d1a",
  textMuted:   "#7a9472",
};

function classStyle(cls) {
  if (cls === "segar")  return { bg: C.greenBg,  border: C.greenBorder,  color: C.green,  label: "SEGAR" };
  if (cls === "busuk")  return { bg: C.redBg,    border: C.redBorder,    color: C.red,    label: "BUSUK" };
  if (cls === "kering") return { bg: C.amberBg,  border: C.amberBorder,  color: C.amber,  label: "KERING" };
  if (cls === "jamur")  return { bg: C.redBg,    border: C.redBorder,    color: C.red,    label: "JAMUR" };
  return { bg: C.cardBg, border: C.cardBorder, color: C.textMuted, label: cls?.toUpperCase() || "—" };
}

function Badge({ cls }) {
  const s = classStyle(cls);
  return (
    <span style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color, borderRadius: "6px", padding: "3px 10px", fontFamily: "'Space Mono', monospace", fontSize: "10px", fontWeight: 700, letterSpacing: "0.8px", whiteSpace: "nowrap" }}>
      {s.label}
    </span>
  );
}

function formatTs(ts) {
  if (!ts) return "—";
  try {
    return new Date(ts).toLocaleString("id-ID", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
  } catch { return ts; }
}

const COLS = [
  { label: "NO",        key: "_no" },
  { label: "TIMESTAMP", key: "timestamp" },
  { label: "KELAS",     key: "class" },
];

const thStyle = {
  padding: "9px 14px",
  textAlign: "left",
  fontFamily: "'Space Mono', monospace",
  fontSize: "9px",
  letterSpacing: "1px",
  color: C.textMuted,
  fontWeight: 700,
  borderBottom: `1px solid ${C.cardBorder}`,
  whiteSpace: "nowrap",
};

// ─── Helper shift ──────────────────────────────────────────
// Shift 1: 06:00–13:59 | Shift 2: 14:00–21:59 | Shift 3: 22:00–05:59
const getShift = (ts) => {
  if (!ts) return null;
  const h = new Date(ts).getHours();
  if (h >= 6  && h < 14) return "shift1";
  if (h >= 14 && h < 22) return "shift2";
  return "shift3";
};

const SHIFTS = [
  { key: "all",    label: "SEMUA",       sub: "" },
  { key: "shift1", label: "SHIFT 1",     sub: "06:00–14:00" },
  { key: "shift2", label: "SHIFT 2",     sub: "14:00–22:00" },
  { key: "shift3", label: "SHIFT 3",     sub: "22:00–06:00" },
];

// ─── Baris tabel ──────────────────────────────────────────
function TableRow({ d, rowNum, isEven }) {
  return (
    <tr
      style={{ borderBottom: `1px solid ${C.cardBorder}`, background: isEven ? C.cardBg : "#f0f5ee", transition: "background 0.15s" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = C.greenBg)}
      onMouseLeave={(e) => (e.currentTarget.style.background = isEven ? C.cardBg : "#f0f5ee")}
    >
      <td style={{ padding: "10px 14px", fontFamily: "'Space Mono', monospace", fontSize: "11px", color: C.textMuted }}>{rowNum}</td>
      <td style={{ padding: "10px 14px", fontFamily: "'Space Mono', monospace", fontSize: "10px", color: C.textMuted, whiteSpace: "nowrap" }}>{formatTs(d.timestamp)}</td>
      <td style={{ padding: "10px 14px" }}><Badge cls={d.class} /></td>
    </tr>
  );
}

// ─── Modal Semua Data ──────────────────────────────────────
function ModalAllData({ detections, onClose }) {
  const [classFilter, setClassFilter] = useState("all");
  const [shiftFilter, setShiftFilter] = useState("all");
  const [page, setPage]               = useState(1);
  const PAGE_SIZE = 20;

  const classes = ["all", "segar", "busuk", "kering", "jamur"];

  // terapkan filter shift dulu, lalu filter kelas
  const afterShift = shiftFilter === "all"
    ? detections
    : detections.filter((d) => getShift(d.timestamp) === shiftFilter);

  const filtered = classFilter === "all"
    ? afterShift
    : afterShift.filter((d) => d.class === classFilter);

  // Sort ascending by timestamp, newest last → reverse to show newest first
  const sorted = [...filtered].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const resetPage = () => setPage(1);

  // hitung count per shift dari seluruh data (tanpa class filter)
  const shiftCount = (key) => key === "all"
    ? detections.length
    : detections.filter((d) => getShift(d.timestamp) === key).length;

  // hitung count kelas dari data setelah shift filter
  const classCount = (c) => c === "all"
    ? afterShift.length
    : afterShift.filter((d) => d.class === c).length;

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(30,45,26,0.55)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
      onClick={onClose}
    >
      <div
        style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: "16px", width: "100%", maxWidth: "960px", maxHeight: "82vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", overflow: "hidden" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${C.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "11px", color: C.textMuted, letterSpacing: "1.5px", marginBottom: "2px" }}>SEMUA DATA DETEKSI</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "18px", color: C.textPrimary }}>{detections.length} total rekaman</div>
          </div>
          <button onClick={onClose} style={{ background: C.greenBg, border: `1px solid ${C.greenBorder}`, borderRadius: "8px", padding: "6px 10px", cursor: "pointer", color: C.green, display: "flex", alignItems: "center" }}>
            <X size={16} />
          </button>
        </div>

        {/* ── Filter Shift ── */}
        <div style={{ padding: "12px 24px 0", borderBottom: `1px solid ${C.cardBorder}` }}>
          {/* Label */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
            <Clock size={11} color={C.textMuted} />
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "9px", letterSpacing: "1px", color: C.textMuted, fontWeight: 700 }}>FILTER SHIFT (8 JAM)</span>
          </div>
          {/* Shift buttons */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "12px", flexWrap: "wrap" }}>
            {SHIFTS.map((s) => {
              const active = shiftFilter === s.key;
              const count  = shiftCount(s.key);
              return (
                <button
                  key={s.key}
                  onClick={() => { setShiftFilter(s.key); setClassFilter("all"); resetPage(); }}
                  style={{
                    borderRadius: "8px",
                    padding: "7px 14px",
                    cursor: "pointer",
                    border: active ? "none" : `1px solid ${C.cardBorder}`,
                    background: active ? C.green : "#f4f7f3",
                    color: active ? "#f4f7f3" : C.textMuted,
                    transition: "all 0.15s",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: "1px",
                    minWidth: "96px",
                  }}
                >
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "9px", fontWeight: 700, letterSpacing: "0.8px", color: active ? "#f4f7f3" : C.textPrimary }}>
                    {s.label}
                  </span>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "8px", color: active ? "rgba(255,255,255,0.7)" : C.textMuted }}>
                    {s.sub || `${count} data`}
                    {s.sub ? ` · ${count}` : ""}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Filter Kelas ── */}
        <div style={{ display: "flex", gap: "6px", padding: "10px 24px", borderBottom: `1px solid ${C.cardBorder}`, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "9px", color: C.textMuted, letterSpacing: "0.8px", marginRight: "4px" }}>KELAS:</span>
          {classes.map((c) => {
            const active = classFilter === c;
            const count  = classCount(c);
            return (
              <button
                key={c}
                onClick={() => { setClassFilter(c); resetPage(); }}
                style={{
                  borderRadius: "7px", padding: "5px 12px",
                  fontFamily: "'Space Mono', monospace", fontSize: "10px",
                  letterSpacing: "0.8px", cursor: "pointer",
                  border: active ? "none" : `1px solid ${C.cardBorder}`,
                  background: active ? C.green : "#f4f7f3",
                  color: active ? "#f4f7f3" : C.textMuted,
                  fontWeight: active ? 700 : 400, transition: "all 0.15s",
                }}
              >
                {c.toUpperCase()} ({count})
              </button>
            );
          })}
          <span style={{ marginLeft: "auto", fontFamily: "'Space Mono', monospace", fontSize: "9px", color: C.textMuted }}>
            {sorted.length} hasil · hal {safePage}/{totalPages}
          </span>
        </div>

        {/* Table */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#eef3ec", position: "sticky", top: 0, zIndex: 1 }}>
                {COLS.map((col) => (
                  <th key={col.key} style={thStyle}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((d, i) => (
                <TableRow
                  key={d.id ?? i}
                  d={d}
                  rowNum={(safePage - 1) * PAGE_SIZE + i + 1}
                  isEven={i % 2 === 0}
                />
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ padding: "32px", textAlign: "center", fontFamily: "'Space Mono', monospace", fontSize: "11px", color: C.textMuted }}>
                    Tidak ada data untuk filter ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div style={{ padding: "12px 24px", borderTop: `1px solid ${C.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: "#eef3ec" }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              style={{ display: "flex", alignItems: "center", gap: "5px", padding: "6px 14px", borderRadius: "7px", border: `1px solid ${C.cardBorder}`, background: safePage === 1 ? "#f0f5ee" : C.cardBg, color: safePage === 1 ? C.textMuted : C.green, fontFamily: "'Space Mono', monospace", fontSize: "10px", fontWeight: 700, cursor: safePage === 1 ? "not-allowed" : "pointer", transition: "all 0.15s" }}
            >
              ← PREV
            </button>
            <div style={{ display: "flex", gap: "4px" }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 2)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === "..." ? (
                    <span key={`ellipsis-${idx}`} style={{ padding: "6px 4px", fontFamily: "'Space Mono', monospace", fontSize: "10px", color: C.textMuted }}>…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      style={{ width: "30px", height: "30px", borderRadius: "6px", border: p === safePage ? "none" : `1px solid ${C.cardBorder}`, background: p === safePage ? C.green : C.cardBg, color: p === safePage ? "#fff" : C.textMuted, fontFamily: "'Space Mono', monospace", fontSize: "10px", fontWeight: p === safePage ? 700 : 400, cursor: "pointer", transition: "all 0.15s" }}
                    >
                      {p}
                    </button>
                  )
                )
              }
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              style={{ display: "flex", alignItems: "center", gap: "5px", padding: "6px 14px", borderRadius: "7px", border: `1px solid ${C.cardBorder}`, background: safePage === totalPages ? "#f0f5ee" : C.cardBg, color: safePage === totalPages ? C.textMuted : C.green, fontFamily: "'Space Mono', monospace", fontSize: "10px", fontWeight: 700, cursor: safePage === totalPages ? "not-allowed" : "pointer", transition: "all 0.15s" }}
            >
              NEXT →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Komponen Utama ────────────────────────────────────────
export default function DeteksiTable({ detections }) {
  const [showAll, setShowAll] = useState(false);

  // Sort by timestamp descending → ambil 10 terbaru sesuai jam
  const latest10 = [...detections]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10);

  return (
    <>
      <div style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        {/* Header bar */}
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Leaf size={13} color={C.green} />
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", letterSpacing: "1.2px", color: C.textMuted, fontWeight: 700 }}>10 DETEKSI TERBARU</span>
          </div>
          <button
            onClick={() => setShowAll(true)}
            style={{ display: "flex", alignItems: "center", gap: "5px", background: C.greenBg, border: `1px solid ${C.greenBorder}`, borderRadius: "7px", padding: "5px 12px", cursor: "pointer", fontFamily: "'Space Mono', monospace", fontSize: "10px", color: C.green, fontWeight: 700, letterSpacing: "0.5px", transition: "all 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#daecd5")}
            onMouseLeave={(e) => (e.currentTarget.style.background = C.greenBg)}
          >
            <Eye size={12} />
            VIEW ALL ({detections.length})
            <ChevronRight size={11} />
          </button>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#eef3ec" }}>
                {COLS.map((col) => (<th key={col.key} style={thStyle}>{col.label}</th>))}
              </tr>
            </thead>
            <tbody>
              {latest10.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ padding: "28px", textAlign: "center", fontFamily: "'Space Mono', monospace", fontSize: "11px", color: C.textMuted }}>
                    Belum ada data deteksi...
                  </td>
                </tr>
              )}
              {latest10.map((d, i) => (
                <TableRow key={d.id ?? i} d={d} rowNum={detections.length - i} isEven={i % 2 === 0} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAll && <ModalAllData detections={detections} onClose={() => setShowAll(false)} />}
    </>
  );
} 