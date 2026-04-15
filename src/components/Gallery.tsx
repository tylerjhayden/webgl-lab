import { useState, useCallback } from 'react'
import { useExperiments } from '../hooks/useExperiments'
import ExperimentCard from './ExperimentCard'
import TagFilter from './TagFilter'

export default function Gallery() {
  const [activeTags, setActiveTags] = useState<string[]>([])
  const { experiments, allTags } = useExperiments(activeTags)

  const toggleTag = useCallback((tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary mb-1">Experiments</h1>
        <p className="text-text-secondary text-sm mb-4">
          {experiments.length} experiment{experiments.length !== 1 ? 's' : ''} — click to explore
        </p>
        <TagFilter tags={allTags} activeTags={activeTags} onToggle={toggleTag} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {experiments.map((experiment, i) => (
          <ExperimentCard key={experiment.slug} experiment={experiment} index={i} />
        ))}
      </div>

      {experiments.length === 0 && (
        <div className="text-center py-16">
          <p className="text-text-muted">No experiments match those tags</p>
          <button
            onClick={() => setActiveTags([])}
            className="text-accent text-sm mt-2 hover:text-accent-hover cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}
