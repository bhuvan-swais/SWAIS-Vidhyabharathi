/* StatusBadge — reused across requests, reports, and book status indicators. */

const STATUS_CONFIG = {
  pending:  { label: "Pending",  cls: "gl-badge gl-badge-pending"  },
  approved: { label: "Approved", cls: "gl-badge gl-badge-approved" },
  rejected: { label: "Rejected", cls: "gl-badge gl-badge-rejected" },
  open:     { label: "Open",     cls: "gl-badge gl-badge-open"     },
  resolved: { label: "Resolved", cls: "gl-badge gl-badge-resolved" },
  Active:   { label: "Active",   cls: "gl-badge gl-badge-Active"   },
  Inactive: { label: "Inactive", cls: "gl-badge gl-badge-Inactive" },
};

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, cls: "gl-badge gl-badge-Inactive" };
  return <span className={cfg.cls}>{cfg.label}</span>;
}
