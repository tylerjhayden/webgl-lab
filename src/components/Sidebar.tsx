import { useCallback, useEffect, useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { experiments } from '../experiments'
import type { Experiment } from '../types/experiment'
import DifficultyDots from './DifficultyDots'
import StarButton from './StarButton'
import FolderPicker from './FolderPicker'

const COLLAPSE_KEY = 'sidebar-collapsed-sections'

function loadCollapsed(): Set<string> {
  try {
    const raw = localStorage.getItem(COLLAPSE_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw)
    return new Set(Array.isArray(parsed) ? parsed : [])
  } catch {
    return new Set()
  }
}

function saveCollapsed(set: Set<string>): void {
  try {
    localStorage.setItem(COLLAPSE_KEY, JSON.stringify([...set]))
  } catch {
    // localStorage unavailable; preference simply won't persist.
  }
}

interface RowProps {
  experiment: Experiment
  folders: string[]
}

function Row({ experiment, folders }: RowProps) {
  const number = experiment.slug.match(/^\d+/)?.[0] ?? ''
  return (
    <NavLink
      to={`/experiment/${experiment.slug}`}
      className={({ isActive }) =>
        `block px-4 py-2 no-underline transition-colors border-l-2 ${
          isActive
            ? 'bg-surface-overlay border-accent text-text-primary'
            : 'border-transparent text-text-secondary hover:bg-surface-overlay/50 hover:text-text-primary'
        }`
      }
    >
      <div className="flex items-center gap-2">
        <StarButton slug={experiment.slug} starred={!!experiment.starred} />
        <FolderPicker slug={experiment.slug} current={experiment.folder} folders={folders} />
        <span className="text-text-muted font-mono text-xs tabular-nums w-6 shrink-0">
          {number}
        </span>
        <span className="text-sm font-medium truncate flex-1">
          {experiment.title}
        </span>
        <DifficultyDots level={experiment.difficulty} size="xs" />
      </div>
    </NavLink>
  )
}

interface SectionProps {
  id: string
  label: string
  count: number
  collapsed: boolean
  onToggle: (id: string) => void
  children: React.ReactNode
}

function Section({ id, label, count, collapsed, onToggle, children }: SectionProps) {
  return (
    <div>
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="flex w-full items-center gap-1.5 px-4 pt-3 pb-1 text-[10px] uppercase tracking-wider font-semibold text-text-muted border-t border-border-subtle hover:text-text-primary transition-colors"
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 transition-transform ${collapsed ? '-rotate-90' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
        <span className="flex-1 text-left">{label}</span>
        <span className="text-text-muted/70 font-mono normal-case tracking-normal">
          {count}
        </span>
      </button>
      {!collapsed && children}
    </div>
  )
}

export default function Sidebar() {
  const folders = useMemo(() => {
    const set = new Set<string>()
    for (const e of experiments) if (e.folder) set.add(e.folder)
    return [...set].sort((a, b) => a.localeCompare(b))
  }, [])

  const starred = useMemo(
    () => experiments.filter((e) => e.starred),
    [],
  )

  const byFolder = useMemo(() => {
    const map = new Map<string, Experiment[]>()
    for (const f of folders) map.set(f, [])
    for (const e of experiments) {
      if (e.folder && map.has(e.folder)) map.get(e.folder)!.push(e)
    }
    return map
  }, [folders])

  const other = useMemo(
    () => experiments.filter((e) => !e.folder),
    [],
  )

  const [collapsed, setCollapsed] = useState<Set<string>>(() => loadCollapsed())

  useEffect(() => {
    saveCollapsed(collapsed)
  }, [collapsed])

  const toggle = useCallback((id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const hasSections = starred.length > 0 || folders.length > 0

  return (
    <aside className="w-72 shrink-0 h-full overflow-y-auto border-r border-border-subtle bg-surface">
      <div className="sticky top-0 z-10 bg-surface px-4 py-4 border-b border-border-subtle">
        <h2 className="text-sm font-semibold text-text-primary mb-1">
          Experiments
        </h2>
        <p className="text-text-muted text-xs">
          {experiments.length} item{experiments.length !== 1 ? 's' : ''}
        </p>
      </div>

      <nav className="py-1">
        {starred.length > 0 && (
          <Section
            id="__starred"
            label="★ Starred"
            count={starred.length}
            collapsed={collapsed.has('__starred')}
            onToggle={toggle}
          >
            {starred.map((e) => (
              <Row key={`starred-${e.slug}`} experiment={e} folders={folders} />
            ))}
          </Section>
        )}

        {folders.map((name) => {
          const items = byFolder.get(name) ?? []
          if (items.length === 0) return null
          const id = `folder:${name}`
          return (
            <Section
              key={id}
              id={id}
              label={name}
              count={items.length}
              collapsed={collapsed.has(id)}
              onToggle={toggle}
            >
              {items.map((e) => (
                <Row key={`${name}-${e.slug}`} experiment={e} folders={folders} />
              ))}
            </Section>
          )
        })}

        {other.length > 0 && hasSections && (
          <Section
            id="__other"
            label="Other"
            count={other.length}
            collapsed={collapsed.has('__other')}
            onToggle={toggle}
          >
            {other.map((e) => (
              <Row key={`other-${e.slug}`} experiment={e} folders={folders} />
            ))}
          </Section>
        )}

        {!hasSections && other.length > 0 && (
          <>
            {other.map((e) => (
              <Row key={`flat-${e.slug}`} experiment={e} folders={folders} />
            ))}
          </>
        )}
      </nav>
    </aside>
  )
}
