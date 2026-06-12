const PALETTE = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#10b981', '#06b6d4',
  '#3b82f6', '#84cc16',
]

function hashName(name: string): number {
  let h = 0
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

interface AvatarProps {
  name: string
}

export function Avatar({ name }: AvatarProps) {
  const bg = PALETTE[hashName(name) % PALETTE.length]
  return (
    <span className="avatar" style={{ background: bg }} title={name}>
      {initials(name)}
    </span>
  )
}
