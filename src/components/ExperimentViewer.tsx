import { lazy, Suspense, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getExperiment } from '../experiments'
import ExperimentWrapper from './ExperimentWrapper'

export default function ExperimentViewer() {
  const { slug } = useParams<{ slug: string }>()
  const experiment = slug ? getExperiment(slug) : undefined

  if (!experiment) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-text-secondary text-lg">Experiment not found</p>
        <Link to="/" className="text-accent hover:text-accent-hover transition-colors">
          Back to gallery
        </Link>
      </div>
    )
  }

  const LazyScene = useMemo(() => lazy(experiment.Scene), [experiment.Scene])

  return (
    <div className="relative h-full">
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
