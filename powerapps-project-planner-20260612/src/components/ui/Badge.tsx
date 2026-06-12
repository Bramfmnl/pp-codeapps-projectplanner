interface BadgeProps {
  label: string
  color: string
  dot?: boolean
}

export function Badge({ label, color, dot = true }: BadgeProps) {
  return (
    <span
      className="badge"
      style={{
        color,
        background: `${color}18`,
        border: `1px solid ${color}35`,
      }}
    >
      {dot && <span className="badge-dot" style={{ background: color }} />}
      {label}
    </span>
  )
}
