import { useEffect, useState } from 'react'
import { ShaderHero, useFontAtlas } from '../../components/ShaderHero'
import fragmentShader from './shaders/constellation.frag'

const ATLAS_CHARS = ['·', '.', '-', '+', '×', '#', '@', '█']

const AUTHORS = ['@minerva', '@cortana', '@noble-six', '@chief', '@arbiter', '@johnson', '@keyes']
const AGES = [
  '2 days ago',
  '4 days ago',
  '6 days ago',
  'last week',
  '3 commits ago',
  '12 commits ago',
  'yesterday',
  'an hour ago',
]
const HASH_ALPHABET = '0123456789abcdef'
const ROTATE_INTERVAL_MS = 5000

function randomHash(): string {
  let s = ''
  for (let i = 0; i < 7; i++) {
    s += HASH_ALPHABET[Math.floor(Math.random() * HASH_ALPHABET.length)]
  }
  return s
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function buildSubtitle(): string {
  return `${randomHash()} · ${pick(AUTHORS)} · ${pick(AGES)}`
}

export default function Scene() {
  const atlas = useFontAtlas(ATLAS_CHARS)
  const [subtitle, setSubtitle] = useState('f3a2b91 · @minerva · 2 days ago')
  const [email, setEmail] = useState('')

  useEffect(() => {
    const id = setInterval(() => {
      setSubtitle(buildSubtitle())
    }, ROTATE_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  return (
    <ShaderHero
      fragmentShader={fragmentShader}
      uniforms={{ uAtlas: { value: atlas } }}
      className="relative w-full h-full bg-[#0d0816]"
    >
      {/* Ambient warm-glow halo behind the hero */}
      <div
        aria-hidden
        className="absolute inset-0 z-[4] pointer-events-none bg-[radial-gradient(circle_at_center,rgba(242,114,136,0.08)_0%,transparent_60%)]"
      />

      <div className="relative z-[5] flex flex-col items-center justify-center h-full pt-16 px-4 pointer-events-none">
        <div className="max-w-2xl text-center space-y-6">
          <h1
            className="text-6xl font-light text-text-primary leading-tight tracking-tight"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
          >
            // What got us here.
          </h1>

          <p className="font-mono text-base tracking-tight tabular-nums text-[#ffc78c]/70">
            {subtitle}
          </p>

          <div className="flex items-center justify-center gap-3 pointer-events-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="bg-surface-raised/60 backdrop-blur-sm border border-[#3d2840] rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-muted text-sm w-64 focus:outline-none focus:border-[#f27288] transition-colors"
            />
            <button
              className="bg-[#f27288] hover:bg-[#ff8aa0] text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap shadow-[0_0_20px_rgba(242,114,136,0.4)]"
            >
              Trace the lineage
            </button>
          </div>
        </div>
      </div>
    </ShaderHero>
  )
}
