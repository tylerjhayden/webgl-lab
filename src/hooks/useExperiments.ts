import { useMemo } from 'react'
import { experiments, allTags } from '../experiments'

export function useExperiments(activeTags: string[] = []) {
  const filtered = useMemo(() => {
    if (activeTags.length === 0) return experiments
    return experiments.filter((e) =>
      activeTags.some((tag) => e.tags.includes(tag)),
    )
  }, [activeTags])

  return { experiments: filtered, allTags }
}
