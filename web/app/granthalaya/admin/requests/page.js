"use client";

import { useState, useEffect } from "react";
import { glRequests } from "../../lib/api";
import StatusBadge from "../../components/StatusBadge";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import EmptyState from "../../components/EmptyState";

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [confirm, setConfirm]   = useState(null);
  const [toast, setToast]       = useState(null);
  const [filter, setFilter]     = useState("all");
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  function showToast(msg, type = "success") { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); }

  useEffect(() => {
    let cancelled = false;
    glRequests.all("Admin")
      .then((rs) => { if (!cancelled) setRequests(rs); })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  async function handleDecide() {
    const { request, decision } = confirm;
    setConfirm(null);
    try {
      const updated = await glRequests.decide("Admin", request.request_id, decision);
      setRequests((rs) => rs.map((r) => r.request_id === updated.request_id ? updated : r));
      showToast(`Request ${updated.status}.`);
    } catch (e) {
      showToast(e.message, "info");
    }
  }

  const filtered = requests.filter((r) => filter === "all" || r.status === filter);

  if (loading) return <div className="gl-loading">Loading requests…</div>;
  if (error)   return <div className="gl-error">Could not load requests: {error}</div>;

  return (
    <>
      <div className="gl-page-header">
        <h1 className="gl-page-title">Book Requests</h1>
        <p className="gl-page-sub">{requests.filter((r) => r.status === "pending").length} pending review</p>
      </div>

      {toast && <div className={`gl-alert-${toast.type}`} style={{ marginBottom: 16 }}>{toast.msg}</div>}

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["all", "pending", "approved", "rejected"].map((s) => (
          <button key={s} className={`gl-btn ${filter === s ? "gl-btn-primary" : "gl-btn-ghost"}`} style={{ fontSize: 13, textTransform: "capitalize" }} onClick={() => setFilter(s)}>
            {s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="📋" title="No requests" message={`No ${filter === "all" ? "" : filter} requests found.`} />
      ) : (
        <div className="gl-table-wrap">
          <table className="gl-table">
            <thead>
              <tr><th>Book Title</th><th>Author</th><th>Requested By</th><th>Reason</th><th>Date</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.request_id}>
                  <td style={{ fontWeight: 500 }}>{r.title}</td>
                  <td>{r.author || "—"}</td>
                  <td>{r.teacher_name || `User #${r.requested_by}`}</td>
                  <td style={{ maxWidth: 200, whiteSpace: "normal" }}>{r.reason || "—"}</td>
                  <td>{new Date(r.created_at).toLocaleDateString("en-IN")}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td>
                    {r.status === "pending" ? (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="gl-btn gl-btn-outline" style={{ fontSize: 12 }} onClick={() => setConfirm({ request: r, decision: "approve" })}>Approve</button>
                        <button className="gl-btn gl-btn-danger"  style={{ fontSize: 12 }} onClick={() => setConfirm({ request: r, decision: "reject"  })}>Reject</button>
                      </div>
                    ) : (
                      <span style={{ color: "var(--gl-muted)", fontSize: 13 }}>
                        {r.reviewed_at ? new Date(r.reviewed_at).toLocaleDateString("en-IN") : "—"}
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
        open={!!confirm}
        title={confirm?.decision === "approve" ? "Approve Request" : "Reject Request"}
        message={
          confirm?.decision === "approve"
            ? `Approve the request for "${confirm?.request?.title}"? The teacher will be notified.`
            : `Reject the request for "${confirm?.request?.title}"? The teacher will be notified.`
        }
        confirmLabel={confirm?.decision === "approve" ? "Approve" : "Reject"}
        variant={confirm?.decision === "approve" ? "primary" : "danger"}
        onConfirm={handleDecide}
        onCancel={() => setConfirm(null)}
      />
    </>
  );
}
