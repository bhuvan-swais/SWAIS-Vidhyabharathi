"use client";

import { useState, useEffect } from "react";
import { glNotifications } from "../../lib/api";
import EmptyState from "../../components/EmptyState";

const TYPE_LABELS = {
  request_approved: "Request Approved",
  request_rejected: "Request Rejected",
  report_resolved:  "Report Resolved",
};

export default function AdminNotifications() {
  const [notifs, setNotifs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    let cancelled = false;
    glNotifications.list("Admin")
      .then((ns) => { if (!cancelled) setNotifs(ns); })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  async function markRead(id) {
    try {
      await glNotifications.markRead("Admin", id);
      setNotifs((ns) => ns.map((n) => n.notification_id === id ? { ...n, is_read: true } : n));
    } catch { /* optimistic ignore */ }
  }

  async function markAllRead() {
    try {
      await glNotifications.markAllRead("Admin");
      setNotifs((ns) => ns.map((n) => ({ ...n, is_read: true })));
    } catch { /* optimistic ignore */ }
  }

  const unreadCount = notifs.filter((n) => !n.is_read).length;

  if (loading) return <div className="gl-loading">Loading notifications…</div>;
  if (error)   return <div className="gl-error">Could not load notifications: {error}</div>;

  return (
    <>
      <div className="gl-page-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 className="gl-page-title">Notifications</h1>
          {unreadCount > 0 && <p className="gl-page-sub">{unreadCount} unread</p>}
        </div>
        {unreadCount > 0 && (
          <button className="gl-btn gl-btn-ghost" onClick={markAllRead}>Mark all as read</button>
        )}
      </div>

      {notifs.length === 0 ? (
        <EmptyState icon="🔔" title="No notifications" message="You're all caught up!" />
      ) : (
        <div className="gl-notif-list">
          {notifs.map((n) => (
            <div key={n.notification_id} className={`gl-notif-item${!n.is_read ? " unread" : ""}`}>
              {!n.is_read && <span className="gl-notif-dot" aria-label="Unread" />}
              <div className="gl-notif-content">
                <div className="gl-notif-type">{TYPE_LABELS[n.type] || n.type}</div>
                <div className="gl-notif-msg">{n.message}</div>
                <div className="gl-notif-time">
                  {new Date(n.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </div>
              </div>
              {!n.is_read && (
                <button className="gl-btn gl-btn-ghost" style={{ fontSize: 12, flexShrink: 0 }} onClick={() => markRead(n.notification_id)}>
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
