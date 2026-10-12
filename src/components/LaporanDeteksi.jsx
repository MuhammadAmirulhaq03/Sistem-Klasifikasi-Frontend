import { useState } from "react";
import { X, Download, FileText } from "lucide-react";

// ─── Warna tema hijau tumbuhan (selaras App.jsx & Navbar.jsx) ─
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

export default function LaporanDeteksi({ detections, onClose }) {
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const totalLF     = detections.length;
  const ripeCount   = detections.filter((d) => d.class === "segar").length;
  const defectCount = detections.filter((d) => d.class !== "segar").length;
  const avgQuality  = totalLF
    ? ((ripeCount / totalLF) * 100).toFixed(1)
    : 0;

  const totalPages  = Math.max(1, Math.ceil(totalLF / PAGE_SIZE));
  const safePage    = Math.min(Math.max(1, page), totalPages);
  const paginated   = detections.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const now = new Date().toLocaleString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });

  // ── Export CSV ──────────────────────────────────────────
  const exportCSV = () => {
    const header = ["Timestamp", "Kelas"];
    const rows = detections.map((d) => [
      d.timestamp, d.class,
    ]);

    const summary = [
      [],
      ["RINGKASAN LAPORAN DETEKSI"],
      ["Total Brondolan", totalLF],
      ["Segar", ripeCount],
      ["Cacat", defectCount],
      ["Rasio Buah Segar (%)", avgQuality],
      ["Digenerate", now],
      [],
      ["DETAIL DETEKSI"],
      header,
      ...rows,
    ];

    const csvContent = summary
      .map((row) => row.map((cell) => `"${cell ?? ""}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `laporan-deteksi-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // ── Export PDF ──────────────────────────────────────────
  const exportPDF = () => {
    const printWindow = window.open("", "_blank");
    const tableRows = detections
      .map(
        (d) => `
        <tr>
          <td>${d.timestamp ?? "-"}</td>
          <td><span class="badge badge-${d.class}">${d.class?.toUpperCase()}</span></td>
        </tr>`
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Laporan Deteksi — Monitoring Deteksi Brondolan</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Courier New', monospace; background: #fff; color: #1e2d1a; padding: 32px; }
          .header { border-bottom: 2px solid #3a6b35; padding-bottom: 16px; margin-bottom: 24px; }
          .header h1 { font-size: 18px; letter-spacing: 2px; color: #1e2d1a; }
          .header p { font-size: 11px; color: #7a9472; margin-top: 4px; }
          .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 28px; }
          .sum-box { border: 1px solid #cad8c5; border-radius: 6px; padding: 12px; background: #f4f7f3; }
          .sum-label { font-size: 9px; color: #7a9472; letter-spacing: 1px; margin-bottom: 4px; }
          .sum-val { font-size: 24px; font-weight: 700; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th { background: #e4ece1; padding: 8px 10px; text-align: left; border-bottom: 2px solid #cad8c5; font-size: 9px; letter-spacing: 1px; color: #7a9472; }
          td { padding: 7px 10px; border-bottom: 1px solid #e4ece1; color: #1e2d1a; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 3px; font-size: 9px; font-weight: 700; }
          .badge-segar  { background: #eaf2e8; color: #3a6b35; border: 1px solid #b5ceaf; }
          .badge-busuk  { background: #f5e8e7; color: #b03a2e; border: 1px solid #d9a9a3; }
          .badge-kering { background: #f5eddf; color: #a0622a; border: 1px solid #d4b08a; }
          .badge-jamur  { background: #f5eddf; color: #a0622a; border: 1px solid #d4b08a; }
          .section-title { font-size: 11px; letter-spacing: 1px; color: #7a9472; margin-bottom: 10px; }
          @media print { body { padding: 16px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>LAPORAN DETEKSI — Monitoring Deteksi Brondolan</h1>
          <p>Digenerate: ${now}</p>
        </div>
        <div class="summary">
          <div class="sum-box">
            <div class="sum-label">TOTAL BRONDOLAN</div>
            <div class="sum-val" style="color:#1e2d1a">${totalLF}</div>
          </div>
          <div class="sum-box">
            <div class="sum-label">SEGAR</div>
            <div class="sum-val" style="color:#3a6b35">${ripeCount}</div>
          </div>
          <div class="sum-box">
            <div class="sum-label">CACAT</div>
            <div class="sum-val" style="color:#a0622a">${defectCount}</div>
          </div>
          <div class="sum-box">
            <div class="sum-label">RASIO BUAH SEGAR</div>
            <div class="sum-val" style="color:#3a6b35">${avgQuality}%</div>
          </div>
        </div>
        <p class="section-title">DETAIL DETEKSI (${totalLF} data)</p>
        <table>
          <thead>
            <tr>
              <th>TIMESTAMP</th><th>KELAS</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  // ── Render ──────────────────────────────────────────────
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(30,45,26,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "20px",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: C.cardBg,
          border: `1px solid ${C.cardBorder}`,
          borderRadius: "16px",
          width: "100%",
          maxWidth: "700px",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'DM Sans', sans-serif",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(30,45,26,0.18)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px 16px",
            borderBottom: `1px solid ${C.cardBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: C.pageBg,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: "13px",
                color: C.green,
                letterSpacing: "1px",
                fontWeight: 700,
              }}
            >
              LAPORAN HASIL DETEKSI
            </div>
            <div
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: "10px",
                color: C.textMuted,
                marginTop: "3px",
              }}
            >
              Digenerate: {now}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: C.cardBg,
              border: `1px solid ${C.cardBorder}`,
              borderRadius: "8px",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: C.textMuted,
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>

          {/* Ringkasan */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            <SumCard label="TOTAL BRONDOLAN" value={totalLF}           color={C.textPrimary} bg={C.pageBg}   border={C.cardBorder} />
            <SumCard label="SEGAR"           value={ripeCount}         color={C.green}       bg={C.greenBg}  border={C.greenBorder} />
            <SumCard label="CACAT"           value={defectCount}       color={C.amber}       bg={C.amberBg}  border={C.amberBorder} />
            <SumCard label="RASIO BUAH SEGAR" value={`${avgQuality}%`}  color={C.green}       bg={C.greenBg}  border={C.greenBorder} />
          </div>

          {/* Tabel Detail */}
          <div
            style={{
              border: `1px solid ${C.cardBorder}`,
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            <div style={{ overflowX: "auto", maxHeight: "320px", overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr style={{ background: C.pageBg, position: "sticky", top: 0 }}>
                    {["TIMESTAMP", "KELAS"].map((h) => (
                      <th
                        key={h}
                        style={{
                          fontFamily: "'Space Mono', monospace",
                          fontSize: "9px",
                          color: C.textMuted,
                          letterSpacing: "0.8px",
                          padding: "10px 12px",
                          textAlign: "left",
                          borderBottom: `1px solid ${C.cardBorder}`,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {detections.length === 0 ? (
                    <tr>
                      <td
                        colSpan={2}
                        style={{
                          padding: "24px",
                          textAlign: "center",
                          color: C.textMuted,
                          fontFamily: "'Space Mono', monospace",
                          fontSize: "11px",
                        }}
                      >
                        Belum ada data deteksi
                      </td>
                    </tr>
                  ) : (
                    paginated.map((d, i) => (
                      <tr
                        key={d.id ?? (safePage - 1) * PAGE_SIZE + i}
                        style={{ borderBottom: `1px solid ${C.cardBorder}` }}
                      >
                        <td style={{ padding: "9px 12px", color: C.textPrimary, whiteSpace: "nowrap" }}>{d.timestamp ?? "-"}</td>
                        <td style={{ padding: "9px 12px" }}>
                          <ClassBadge kelas={d.class} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div
                style={{
                  padding: "10px 16px",
                  borderTop: `1px solid ${C.cardBorder}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: C.pageBg,
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", color: C.textMuted }}>
                  Halaman {safePage} dari {totalPages} ({totalLF} data)
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "5px 12px",
                      borderRadius: "6px",
                      border: `1px solid ${C.cardBorder}`,
                      background: safePage === 1 ? "#f0f5ee" : C.cardBg,
                      color: safePage === 1 ? C.textMuted : C.green,
                      fontFamily: "'Space Mono', monospace",
                      fontSize: "10px",
                      fontWeight: 700,
                      cursor: safePage === 1 ? "not-allowed" : "pointer",
                      transition: "all 0.15s",
                    }}
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
                          <span
                            key={`ellipsis-${idx}`}
                            style={{
                              padding: "5px 4px",
                              fontFamily: "'Space Mono', monospace",
                              fontSize: "10px",
                              color: C.textMuted,
                            }}
                          >
                            …
                          </span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => setPage(p)}
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "6px",
                              border: p === safePage ? "none" : `1px solid ${C.cardBorder}`,
                              background: p === safePage ? C.green : C.cardBg,
                              color: p === safePage ? "#fff" : C.textMuted,
                              fontFamily: "'Space Mono', monospace",
                              fontSize: "10px",
                              fontWeight: p === safePage ? 700 : 400,
                              cursor: "pointer",
                              transition: "all 0.15s",
                            }}
                          >
                            {p}
                          </button>
                        )
                      )}
                  </div>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "5px 12px",
                      borderRadius: "6px",
                      border: `1px solid ${C.cardBorder}`,
                      background: safePage === totalPages ? "#f0f5ee" : C.cardBg,
                      color: safePage === totalPages ? C.textMuted : C.green,
                      fontFamily: "'Space Mono', monospace",
                      fontSize: "10px",
                      fontWeight: 700,
                      cursor: safePage === totalPages ? "not-allowed" : "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    NEXT →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: `1px solid ${C.cardBorder}`,
            display: "flex",
            gap: "10px",
            justifyContent: "flex-end",
            background: C.pageBg,
          }}
        >
          <button
            onClick={exportCSV}
            style={{
              padding: "9px 18px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              background: C.cardBg,
              border: `1px solid ${C.greenBorder}`,
              color: C.green,
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            onClick={exportPDF}
            style={{
              padding: "9px 18px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              background: C.green,
              border: "none",
              color: "#f0f8ee",
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <FileText size={14} /> Export PDF
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────

function SumCard({ label, value, color, bg, border }) {
  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: "10px",
        padding: "12px 14px",
      }}
    >
      <div
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: "9px",
          color: C.textMuted,
          letterSpacing: "0.8px",
          marginBottom: "4px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: "22px",
          fontWeight: 700,
          color,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ClassBadge({ kelas }) {
  const map = {
    segar:  { bg: "#eaf2e8", border: "#b5ceaf", color: "#3a6b35" },
    busuk:  { bg: "#f5e8e7", border: "#d9a9a3", color: "#b03a2e" },
    kering: { bg: "#f5eddf", border: "#d4b08a", color: "#a0622a" },
    jamur:  { bg: "#f5eddf", border: "#d4b08a", color: "#a0622a" },
  };
  const s = map[kelas] ?? { bg: "#f4f7f3", border: "#cad8c5", color: "#7a9472" };

  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: "4px",
        background: s.bg,
        border: `1px solid ${s.border}`,
        color: s.color,
        fontFamily: "'Space Mono', monospace",
        fontSize: "9px",
        fontWeight: 700,
        letterSpacing: "0.5px",
      }}
    >
      {kelas?.toUpperCase() ?? "-"}
    </span>
  );
}