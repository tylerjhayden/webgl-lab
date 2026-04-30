import { Component, lazy, Suspense, useMemo, type ReactNode } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getExperiment } from '../experiments'
import ExperimentWrapper from './ExperimentWrapper'

class SceneErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    console.error('[ExperimentViewer] Scene render failed:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-start justify-start h-full p-8 gap-3 overflow-auto bg-surface-raised">
          <p className="text-text-primary font-mono font-bold text-base">
            Scene crashed
          </p>
          <pre className="text-text-secondary font-mono text-xs whitespace-pre-wrap leading-relaxed">
            {this.state.error.message}
            {'\n\n'}
            {this.state.error.stack}
          </pre>
          <Link to="/" className="text-accent hover:text-accent-hover transition-colors text-sm">
            Back to gallery
          </Link>
        </div>
      )
    }
    return this.props.children
  }
}

export default function ExperimentViewer() {
  const { slug } = useParams<{ slug: string }>()
  const experiment = slug ? getExperiment(slug) : undefined

  const LazyScene = useMemo(
    () => (experiment ? lazy(experiment.Scene) : null),
    [experiment],
  )

  if (!experiment || !LazyScene) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-text-secondary text-lg">Experiment not found: {slug}</p>
        <Link to="/" className="text-accent hover:text-accent-hover transition-colors">
          Back to gallery
        </Link>
      </div>
    )
  }

  return (
    <div className="relative h-full">
      <SceneErrorBoundary key={experiment.slug}>
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-full">
              <div className="text-text-muted animate-pulse">Loading experiment...</div>
            </div>
          }
        >
          {experiment.ownsCanvas ? (
            <LazyScene />
          ) : (
            <ExperimentWrapper>
              <LazyScene />
            </ExperimentWrapper>
          )}
        </Suspense>
      </SceneErrorBoundary>
    </div>
  )
}
