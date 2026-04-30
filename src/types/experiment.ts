import type { ComponentType } from 'react'

export interface ExperimentMeta {
  title: string
  description: string
  ownsCanvas: boolean
  difficulty: 1 | 2 | 3
  date: string
  starred?: boolean
  folder?: string
}

export interface Experiment extends ExperimentMeta {
  slug: string
  Scene: () => Promise<{ default: ComponentType<any> }>
}
