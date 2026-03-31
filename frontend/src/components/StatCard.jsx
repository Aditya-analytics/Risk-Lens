export default function StatCard({ icon, label, value, color, bgColor }) {
  return (
    <div className="card stat-card">
      <div
        className="stat-icon"
        style={{
          background: bgColor || 'var(--accent-light)',
          color: color || 'var(--accent)',
        }}
      >
        {icon}
      </div>
      <div className="stat-value" style={{ color: color || 'var(--text-primary)' }}>
        {value}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  )
}
