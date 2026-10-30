/* StatCard — used on the admin statistics dashboard. */

export default function StatCard({ label, value, icon, accentColor }) {
  return (
    <div
      className="gl-stat-card"
      style={accentColor ? { borderTopColor: accentColor } : undefined}
    >
      {icon && <div className="gl-stat-icon">{icon}</div>}
      <div className="gl-stat-value">{value}</div>
      <div className="gl-stat-label">{label}</div>
    </div>
  );
}
