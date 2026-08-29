"use client";

import { useState, useEffect } from "react";
import { glReports } from "../../lib/api";
import StatusBadge from "../../components/StatusBadge";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import EmptyState from "../../components/EmptyState";

export default function AdminReports() {
  const [reports, setReports]       = useState([]);
  const [resolveTarget, setResolveTarget] = useState(null);
  const [toast, setToast]           = useState(null);
  const [filter, setFilter]         = useState("all");
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 3000); }

  useEffect(() => {
    let cancelled = false;
    glReports.all("Admin")
      .then((rs) => { if (!cancelled) setReports(rs); })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  async function handleResolve() {
    const target = resolveTarget;
    setResolveTarget(null);
    try {
      const updated = await glReports.resolve("Admin", target.report_id);
      setReports((rs) => rs.map((r) => r.report_id === updated.report_id ? updated : r));
      showToast("Report marked as resolved.");
    } catch (e) {
      showToast(e.message);
    }
  }

  const filtered = reports.filter((r) => filter === "all" || r.status === filter);

  if (loading) return <div className="gl-loading">Loading reports…</div>;
  if (error)   return <div className="gl-error">Could not load reports: {error}</div>;

  return (
    <>
      <div className="gl-page-header">
        <h1 className="gl-page-title">Content Reports</h1>
        <p className="gl-page-sub">{reports.filter((r) => r.status === "open").length} open reports</p>
      </div>

      {toast && <div className="gl-alert-success" style={{ marginBottom: 16 }}>{toast}</div>}

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["all", "open", "resolved"].map((s) => (
          <button key={s} className={`gl-btn ${filter === s ? "gl-btn-primary" : "gl-btn-ghost"}`} style={{ fontSize: 13, textTransform: "capitalize" }} onClick={() => setFilter(s)}>
            {s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="🚩" title="No reports" message={`No ${filter === "all" ? "" : filter} reports.`} />
      ) : (
        <div className="gl-table-wrap">
          <table className="gl-table">
            <thead>
              <tr><th>Book</th><th>Reported By</th><th>Reason</th><th>Date</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.report_id}>
                  <td style={{ fontWeight: 500 }}>{r.book_title || `Book #${r.book_id}`}</td>
                  <td>{r.reporter_name || `User #${r.reported_by}`}</td>
                  <td>{r.reason_category || "—"}</td>
                  <td>{new Date(r.created_at).toLocaleDateString("en-IN")}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td>
                    {r.status === "open" ? (
                      <button className="gl-btn gl-btn-outline" style={{ fontSize: 12 }} onClick={() => setResolveTarget(r)}>Resolve</button>
                    ) : (
                      <span style={{ color: "var(--gl-muted)", fontSize: 13 }}>
                        {r.resolved_at ? new Date(r.resolved_at).toLocaleDateString("en-IN") : "—"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmationDialog
        open={!!resolveTarget}
        title="Resolve Report"
        message={`Mark the report on "${resolveTarget?.book_title || "this book"}" as resolved? The reporter will be notified.`}
        confirmLabel="Resolve"
        variant="primary"
        onConfirm={handleResolve}
        onCancel={() => setResolveTarget(null)}
      />
    </>
  );
}
