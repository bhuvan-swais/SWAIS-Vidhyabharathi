"use client";

import { useState, useEffect } from "react";
import { glStats, glBooks, glRequests } from "../lib/api";
import StatCard from "../components/StatCard";

export default function AdminDashboard() {
  const [stats, setStats]     = useState(null);
  const [recentBooks, setRecentBooks]     = useState([]);
  const [pendingReqs, setPendingReqs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [st, bks, reqs] = await Promise.all([
          glStats.get("Admin"),
          glBooks.list("Admin", { include_inactive: false }),
          glRequests.all("Admin"),
        ]);
        if (cancelled) return;
        setStats(st);
        setRecentBooks([...bks].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5));
        setPendingReqs(reqs.filter((r) => r.status === "pending").slice(0, 5));
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="gl-loading">Loading dashboard…</div>;
  if (error)   return <div className="gl-error">Could not load dashboard: {error}</div>;

  const statCards = [
    { label: "Active Books",        value: stats.total_books,        icon: "📚", color: "#D97706" },
    { label: "Pending Requests",    value: stats.pending_requests,   icon: "📋", color: "#F59E0B" },
    { label: "Open Reports",        value: stats.open_reports,       icon: "🚩", color: "#EF4444" },
    { label: "Total Views",         value: stats.total_views,        icon: "👁",  color: "#7C3AED" },
    { label: "Total Downloads",     value: stats.total_downloads,    icon: "⬇",  color: "#059669" },
  ];

  return (
    <>
      <div className="gl-page-header">
        <h1 className="gl-page-title">Library Dashboard</h1>
        <p className="gl-page-sub">Overview of Granthalaya activity</p>
      </div>

      <div className="gl-stats-grid" style={{ marginBottom: 36 }}>
        {statCards.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} accentColor={s.color} />
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div className="gl-card">
          <h2 className="gl-card-title">Recent Books</h2>
          {recentBooks.length === 0 ? (
            <p style={{ color: "var(--gl-muted)", fontSize: 14 }}>No books yet.</p>
          ) : (
            <div className="gl-table-wrap">
              <table className="gl-table">
                <thead><tr><th>Title</th><th>Author</th><th>Views</th></tr></thead>
                <tbody>
                  {recentBooks.map((b) => (
                    <tr key={b.book_id}>
                      <td>{b.title}</td>
                      <td style={{ color: "var(--gl-muted)" }}>{b.author}</td>
                      <td>{b.view_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="gl-card">
          <h2 className="gl-card-title">Pending Requests</h2>
          {pendingReqs.length === 0 ? (
            <p style={{ color: "var(--gl-muted)", fontSize: 14 }}>No pending requests.</p>
          ) : (
            <div className="gl-table-wrap">
              <table className="gl-table">
                <thead><tr><th>Title</th><th>Requested By</th></tr></thead>
                <tbody>
                  {pendingReqs.map((r) => (
                    <tr key={r.request_id}>
                      <td>{r.title}</td>
                      <td style={{ color: "var(--gl-muted)" }}>{r.teacher_name || `User #${r.requested_by}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
