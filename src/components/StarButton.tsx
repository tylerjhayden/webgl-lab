import { useState } from 'react'

interface StarButtonProps {
  slug: string
  starred: boolean
}

export default function StarButton({ slug, starred }: StarButtonProps) {
  const [busy, setBusy] = useState(false)

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (busy) return
    setBusy(true)
    try {
      await fetch(`/api/meta/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ starred: !starred }),
      })
    } catch {
      // Dev-only endpoint; in prod this 404s and we silently no-op.
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={starred ? 'Unstar' : 'Star'}
      className={`shrink-0 transition-colors ${
        starred
          ? 'text-accent hover:text-text-primary'
          : 'text-text-muted hover:text-text-primary'
      }`}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill={starred ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      >
        <polygon points="12,2 15,9 22,9.5 17,14.5 18.5,22 12,18 5.5,22 7,14.5 2,9.5 9,9" />
      </svg>
    </button>
  )
}
