import { Link } from 'react-router-dom'
import type { Experiment } from '../types/experiment'
import DifficultyDots from './DifficultyDots'

const gradients = [
  'from-indigo-500/20 to-purple-500/20',
  'from-cyan-500/20 to-blue-500/20',
  'from-emerald-500/20 to-teal-500/20',
  'from-orange-500/20 to-red-500/20',
  'from-pink-500/20 to-rose-500/20',
  'from-violet-500/20 to-fuchsia-500/20',
]

interface ExperimentCardProps {
  experiment: Experiment
  index: number
}

export default function ExperimentCard({ experiment, index }: ExperimentCardProps) {
  const gradient = gradients[index % gradients.length]

  return (
    <Link
      to={`/experiment/${experiment.slug}`}
      className="group block rounded-xl border border-border-subtle bg-surface-raised hover:border-accent/50 transition-all duration-200 overflow-hidden no-underline"
    >
      {/* Gradient header */}
      <div className={`h-32 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
        <span className="text-4xl opacity-50 group-hover:opacity-80 transition-opacity">
          {experiment.ownsCanvas ? '◆' : '▲'}
        </span>
      </div>

      {/* Card body */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-text-primary font-semibold text-sm group-hover:text-accent-hover transition-colors">
            {experiment.title}
          </h3>
          <DifficultyDots level={experiment.difficulty} />
        </div>
        <p className="text-text-muted text-xs leading-relaxed mb-3">
          {experiment.description}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {experiment.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-md bg-surface-overlay text-text-muted text-[10px] font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}
