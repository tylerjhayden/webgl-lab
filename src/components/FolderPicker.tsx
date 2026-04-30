import { useEffect, useRef, useState } from 'react'

interface FolderPickerProps {
  slug: string
  current: string | undefined
  folders: string[]
}

export default function FolderPicker({ slug, current, folders }: FolderPickerProps) {
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [draft, setDraft] = useState('')
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false)
        setCreating(false)
        setDraft('')
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  const post = async (folder: string | null) => {
    try {
      await fetch(`/api/meta/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder }),
      })
    } catch {
      // Dev-only endpoint.
    }
    setOpen(false)
    setCreating(false)
    setDraft('')
  }

  const onToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setOpen((v) => !v)
  }

  const submitDraft = () => {
    const name = draft.trim()
    if (!name) return
    void post(name)
  }

  return (
    <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={onToggle}
        aria-label="Folder"
        className={`transition-colors ${
          current
            ? 'text-text-primary hover:text-accent'
            : 'text-text-muted hover:text-text-primary'
        }`}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={current ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        >
          <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
        </svg>
      </button>

      {open && (
        <div
          ref={popoverRef}
          className="absolute left-0 top-5 z-20 w-44 rounded-md border border-border-subtle bg-surface shadow-lg py-1 text-xs"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {folders.length > 0 && (
            <div className="py-1">
              {folders.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    void post(name)
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-text-secondary hover:bg-surface-overlay hover:text-text-primary"
                >
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${current === name ? 'bg-accent' : 'bg-transparent border border-border-subtle'}`} />
                  <span className="truncate">{name}</span>
                </button>
              ))}
              <div className="my-1 border-t border-border-subtle" />
            </div>
          )}

          {creating ? (
            <div className="px-2 py-1">
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  e.stopPropagation()
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    submitDraft()
                  } else if (e.key === 'Escape') {
                    e.preventDefault()
                    setCreating(false)
                    setDraft('')
                  }
                }}
                maxLength={64}
                placeholder="Folder name"
                className="w-full rounded border border-border-subtle bg-surface-overlay px-2 py-1 text-text-primary outline-none focus:border-accent"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setCreating(true)
              }}
              className="block w-full px-3 py-1.5 text-left text-text-secondary hover:bg-surface-overlay hover:text-text-primary"
            >
              + New folder…
            </button>
          )}

          {current && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                void post(null)
              }}
              className="block w-full px-3 py-1.5 text-left text-text-muted hover:bg-surface-overlay hover:text-text-primary"
            >
              ✕ Remove from folder
            </button>
          )}
        </div>
      )}
    </div>
  )
}
