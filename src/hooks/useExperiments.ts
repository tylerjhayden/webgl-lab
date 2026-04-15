import { useMemo } from 'react'
import { experiments } from '../experiments'

export function useExperiments(activeTags: string[] = []) {
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    experiments.forEach((e) => e.tags.forEach((t) => tagSet.add(t)))
    return Array.from(tagSet).sort()
  }, [])

  const filtered = useMemo(() => {
    if (activeTags.length === 0) return experiments
    return experiments.filter((e) =>
      activeTags.some((tag) => e.tags.includes(tag)),
    )
  }, [activeTags])

  return { experiments: filtered, allTags }
}
