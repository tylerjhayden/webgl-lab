import { useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { experiments } from '../experiments'
import type { Experiment } from '../types/experiment'
import DifficultyDots from './DifficultyDots'
import StarButton from './StarButton'
import FolderPicker from './FolderPicker'

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

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="px-4 pt-3 pb-1 text-[10px] uppercase tracking-wider font-semibold text-text-muted border-t border-border-subtle">
      {label}
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
          <>
            <SectionHeader label="★ Starred" />
            {starred.map((e) => (
              <Row key={`starred-${e.slug}`} experiment={e} folders={folders} />
            ))}
          </>
        )}

        {folders.map((name) => {
          const items = byFolder.get(name) ?? []
          if (items.length === 0) return null
          return (
            <div key={`folder-${name}`}>
              <SectionHeader label={name} />
              {items.map((e) => (
                <Row key={`${name}-${e.slug}`} experiment={e} folders={folders} />
              ))}
            </div>
          )
        })}

        {other.length > 0 && folders.length > 0 && (
          <>
            <SectionHeader label="Other" />
            {other.map((e) => (
              <Row key={`other-${e.slug}`} experiment={e} folders={folders} />
            ))}
          </>
        )}

        {folders.length === 0 && other.length > 0 && (
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
