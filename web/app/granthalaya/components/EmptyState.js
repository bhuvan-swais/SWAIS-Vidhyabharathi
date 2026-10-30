/* EmptyState — reused for empty lists, no-search-results, and error states. */

export default function EmptyState({ icon = "📚", title, message, action }) {
  return (
    <div className="gl-empty">
      <div className="gl-empty-icon">{icon}</div>
      <div className="gl-empty-title">{title}</div>
      {message && <p className="gl-empty-msg">{message}</p>}
      {action && (
        <button className="gl-btn gl-btn-primary" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
