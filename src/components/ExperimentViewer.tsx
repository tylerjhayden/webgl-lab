import { Component, lazy, Suspense, type ComponentType, type LazyExoticComponent, type ReactNode } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getExperiment } from '../experiments'
import ExperimentWrapper from './ExperimentWrapper'

// Module-level cache: one stable lazy() wrapper per slug. Prevents the
// useMemo-recreates-lazy-every-render → suspend → resolve → re-render loop.
const lazyCache = new Map<string, LazyExoticComponent<ComponentType<unknown>>>()

function getLazyScene(slug: string, loader: () => Promise<{ default: ComponentType<unknown> }>) {
  let cached = lazyCache.get(slug)
  if (!cached) {
    cached = lazy(loader)
    lazyCache.set(slug, cached)
  }
  return cached
}

class SceneErrorBoundary extends Component<
  { resetKey: string; children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidUpdate(prev: { resetKey: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null })
    }
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    console.error('[ExperimentViewer] Scene render failed:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-start justify-start h-full p-8 gap-3 overflow-auto bg-red-950">
          <p className="text-red-300 font-mono font-bold text-base">
            Scene CRASHED: {this.props.resetKey}
          </p>
          <pre className="text-red-200 font-mono text-xs whitespace-pre-wrap leading-relaxed">
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

  if (!experiment) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-text-secondary text-lg">Experiment not found: {slug}</p>
        <Link to="/" className="text-accent hover:text-accent-hover transition-colors">
          Back to gallery
        </Link>
      </div>
    )
  }

  const LazyScene = getLazyScene(experiment.slug, experiment.Scene as () => Promise<{ default: ComponentType<unknown> }>)

  return (
    <div className="relative h-full">
      <SceneErrorBoundary resetKey={experiment.slug}>
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-full">
              <div className="text-text-muted animate-pulse">Loading {experiment.slug}…</div>
            </div>
          }
        >
          {experiment.ownsCanvas ? (
            <LazyScene key={experiment.slug} />
          ) : (
            <ExperimentWrapper>
              <LazyScene key={experiment.slug} />
            </ExperimentWrapper>
          )}
        </Suspense>
      </SceneErrorBoundary>
    </div>
  )
}
