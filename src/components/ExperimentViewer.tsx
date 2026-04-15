import { lazy, Suspense, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getExperiment } from '../experiments'
import ExperimentWrapper from './ExperimentWrapper'

export default function ExperimentViewer() {
  const { slug } = useParams<{ slug: string }>()
  const experiment = slug ? getExperiment(slug) : undefined

  if (!experiment) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
        <p className="text-text-secondary text-lg">Experiment not found</p>
        <Link to="/" className="text-accent hover:text-accent-hover transition-colors">
          Back to gallery
        </Link>
      </div>
    )
  }

  const LazyScene = useMemo(() => lazy(experiment.Scene), [experiment.Scene])

  return (
    <div className="relative h-[calc(100vh-57px)]">
      {/* Overlay chrome */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
        <Link
          to="/"
          className="bg-surface-overlay/80 backdrop-blur-sm text-text-secondary hover:text-text-primary px-3 py-1.5 rounded-lg text-sm transition-colors border border-border-subtle"
        >
          &larr; Back
        </Link>
        <div className="bg-surface-overlay/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-border-subtle">
          <span className="text-text-primary text-sm font-medium">{experiment.title}</span>
          <span className="text-text-muted text-xs ml-2">
            {experiment.tags.map((t) => `#${t}`).join(' ')}
          </span>
        </div>
      </div>

      {/* Scene */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-full">
            <div className="text-text-muted animate-pulse">Loading experiment...</div>
          </div>
        }
      >
        {experiment.mode === 'r3f' ? (
          <ExperimentWrapper>
            <LazyScene />
          </ExperimentWrapper>
        ) : (
          <LazyScene />
        )}
      </Suspense>
    </div>
  )
}
