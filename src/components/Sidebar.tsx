import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useExperiments } from '../hooks/useExperiments'
import TagFilter from './TagFilter'
import DifficultyDots from './DifficultyDots'

export default function Sidebar() {
  const [activeTags, setActiveTags] = useState<string[]>([])
  const { experiments, allTags } = useExperiments(activeTags)

  const toggleTag = (tag: string) =>
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )

  return (
    <aside className="w-72 shrink-0 h-full overflow-y-auto border-r border-border-subtle bg-surface">
      <div className="sticky top-0 z-10 bg-surface px-4 py-4 border-b border-border-subtle">
        <h2 className="text-sm font-semibold text-text-primary mb-1">
          Experiments
        </h2>
        <p className="text-text-muted text-xs mb-3">
          {experiments.length} item{experiments.length !== 1 ? 's' : ''}
        </p>
        <TagFilter tags={allTags} activeTags={activeTags} onToggle={toggleTag} />
      </div>

      <nav className="py-2">
        {experiments.map((experiment) => (
          <NavLink
            key={experiment.slug}
            to={`/experiment/${experiment.slug}`}
            className={({ isActive }) =>
              `block px-4 py-2.5 no-underline transition-colors border-l-2 ${
                isActive
                  ? 'bg-surface-overlay border-accent text-text-primary'
                  : 'border-transparent text-text-secondary hover:bg-surface-overlay/50 hover:text-text-primary'
              }`
            }
          >
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <span className="text-sm font-medium truncate">
                {experiment.title}
              </span>
              <DifficultyDots level={experiment.difficulty} size="xs" />
            </div>
            <div className="text-text-muted text-[10px] truncate">
              {experiment.tags.map((t) => `#${t}`).join(' ')}
            </div>
          </NavLink>
        ))}

        {experiments.length === 0 && (
          <div className="px-4 py-6 text-center">
            <p className="text-text-muted text-xs mb-2">No matches</p>
            <button
              onClick={() => setActiveTags([])}
              className="text-accent text-xs hover:text-accent-hover cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        )}
      </nav>
    </aside>
  )
}
