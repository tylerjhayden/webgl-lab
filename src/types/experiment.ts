import type { ComponentType } from 'react'

export interface ExperimentMeta {
  title: string
  description: string
  tags: string[]
  mode: 'r3f' | 'raw'
  difficulty: 1 | 2 | 3
  date: string
}

export interface Experiment extends ExperimentMeta {
  slug: string
  Scene: () => Promise<{ default: ComponentType<any> }>
}
