interface ProgressBarProps {
  value: number
  color?: string
}

export function ProgressBar({ value, color }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div className="progress-bar-track">
      <div
        className="progress-bar-fill"
        style={{
          width: `${clamped}%`,
          background: color ?? 'var(--c-accent)',
        }}
      />
    </div>
  )
}
