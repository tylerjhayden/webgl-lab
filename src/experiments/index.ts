import type { Experiment, ExperimentMeta } from '../types/experiment'

// Eager: load all metadata at startup (tiny objects, no code splitting needed)
const metaModules = import.meta.glob<{ meta: ExperimentMeta }>('./**/meta.ts', { eager: true })

// Lazy: code-split scene components, loaded on navigation
const sceneModules = import.meta.glob<{ default: React.ComponentType<any> }>('./**/Scene.tsx')

function extractSlug(path: string): string {
  // './01-hello-r3f/meta.ts' → '01-hello-r3f'
  const match = path.match(/^\.\/(.+?)\//)
  return match ? match[1] : path
}

export const experiments: Experiment[] = Object.entries(metaModules)
  .map(([path, mod]) => {
    const slug = extractSlug(path)
    const scenePath = `./${slug}/Scene.tsx`
    return {
      slug,
      ...mod.meta,
      Scene: sceneModules[scenePath] as () => Promise<{ default: React.ComponentType<any> }>,
    }
  })
  .filter((e) => e.Scene) // only include experiments with a matching Scene
  .sort((a, b) => a.slug.localeCompare(b.slug))

export const allTags: string[] = [...new Set(experiments.flatMap((e) => e.tags))].sort()

export function getExperiment(slug: string): Experiment | undefined {
  return experiments.find((e) => e.slug === slug)
}
