import { Flag } from 'lucide-react'

const PRIORITY_CONFIG: Record<number, { label: string; color: string }> = {
  100000003: { label: 'Critical', color: '#ef4444' },
  100000002: { label: 'High', color: '#f97316' },
  100000001: { label: 'Medium', color: '#10b981' },
  100000000: { label: 'Low', color: '#94a3b8' },
}

interface PriorityFlagProps {
  priority: number | undefined
}

export function PriorityFlag({ priority }: PriorityFlagProps) {
  const cfg = priority != null ? (PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG[100000001]) : PRIORITY_CONFIG[100000001]
  const isLow = priority === 100000000
  return (
    <span className="priority-flag" style={{ color: cfg.color }}>
      <Flag size={12} fill={cfg.color} />
      {!isLow && <span>{cfg.label}</span>}
    </span>
  )
}
