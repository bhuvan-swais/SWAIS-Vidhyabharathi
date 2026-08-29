"use client";
/* ConfirmationDialog — modal for destructive/irreversible admin actions. */

export default function ConfirmationDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  variant = "primary",   // "primary" | "danger"
  onConfirm,
  onCancel,
}) {
  if (!open) return null;
  return (
    <>
      <div className="gl-overlay" onClick={onCancel} />
      <div className="gl-dialog" role="dialog" aria-modal="true" aria-labelledby="gl-dialog-title">
        <div className="gl-dialog-header">
          <h3 className="gl-dialog-title" id="gl-dialog-title">{title}</h3>
          <button className="gl-dialog-close" onClick={onCancel} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="gl-dialog-body">{message}</p>
        <div className="gl-dialog-actions">
          <button className="gl-btn gl-btn-ghost" onClick={onCancel}>Cancel</button>
          <button
            className={`gl-btn ${variant === "danger" ? "gl-btn-danger" : "gl-btn-primary"}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}
