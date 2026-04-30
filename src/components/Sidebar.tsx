import { NavLink } from 'react-router-dom'
import { experiments } from '../experiments'
import DifficultyDots from './DifficultyDots'

export default function Sidebar() {
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
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium truncate">
                {experiment.title}
              </span>
              <DifficultyDots level={experiment.difficulty} size="xs" />
            </div>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
