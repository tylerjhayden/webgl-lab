import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { ShaderHero, useFontAtlas } from '../../components/ShaderHero'
import fragmentShader from './shaders/topology.frag'

const ATLAS_CHARS = ['·', '.', '-', '+', '×', '#', '@', '█']
const LIFE_WIDTH = 120
const LIFE_HEIGHT = 50

const THEME = {
  '--color-surface': '#040804',
  '--color-text-primary': '#c8ffb0',
  '--color-text-secondary': '#7aa56a',
  '--color-text-muted': '#4a6840',
  '--brutalist-border': '#5a6b2a',
  '--brutalist-accent': '#63ff0d',
} as React.CSSProperties

function conwayStep(grid: Uint8Array): Uint8Array<ArrayBuffer> {
  const next = new Uint8Array(grid.length) as Uint8Array<ArrayBuffer>
  for (let y = 0; y < LIFE_HEIGHT; y++) {
    for (let x = 0; x < LIFE_WIDTH; x++) {
      const idx = y * LIFE_WIDTH + x
      let neighbors = 0
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue
          const nx = (x + dx + LIFE_WIDTH) % LIFE_WIDTH
          const ny = (y + dy + LIFE_HEIGHT) % LIFE_HEIGHT
          neighbors += grid[ny * LIFE_WIDTH + nx]
        }
      }
      const alive = grid[idx]
      // B3/S23
      next[idx] = alive ? (neighbors === 2 || neighbors === 3 ? 1 : 0) : neighbors === 3 ? 1 : 0
    }
  }
  return next
}

export default function Scene() {
  const atlas = useFontAtlas(ATLAS_CHARS)
  const [email, setEmail] = useState('')

  const lifeGridRef = useRef<Uint8Array<ArrayBuffer>>(null!)
  if (lifeGridRef.current === null) {
    const grid = new Uint8Array(LIFE_WIDTH * LIFE_HEIGHT) as Uint8Array<ArrayBuffer>
    for (let i = 0; i < grid.length; i++) grid[i] = Math.random() > 0.75 ? 1 : 0
    lifeGridRef.current = grid
  }

  const lifeTexture = useMemo(
    () =>
      new THREE.DataTexture(
        lifeGridRef.current,
        LIFE_WIDTH,
        LIFE_HEIGHT,
        THREE.RedFormat,
        THREE.UnsignedByteType,
      ),
    [],
  )

  useEffect(() => () => lifeTexture.dispose(), [lifeTexture])

  // Step the simulation every ~4 RAF ticks (mirrors original cadence).
  useEffect(() => {
    let raf = 0
    let frame = 0
    const tick = () => {
      frame++
      if (frame % 4 === 0) {
        const next = conwayStep(lifeGridRef.current)
        lifeGridRef.current = next
        ;(lifeTexture.image.data as Uint8Array).set(next)
        lifeTexture.needsUpdate = true
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [lifeTexture])

  return (
    <ShaderHero
      fragmentShader={fragmentShader}
      uniforms={{ uAtlas: { value: atlas }, uLifeState: { value: lifeTexture } }}
      theme={THEME}
    >
      <div className="relative z-[5] flex flex-col items-center justify-center h-full pt-16 px-4 pointer-events-none">
        <div className="max-w-2xl text-center space-y-6">
          <div
            className="inline-block px-6 py-4"
            style={{ border: '2px solid var(--brutalist-border)' }}
          >
            <h1
              className="font-mono text-5xl text-text-primary leading-tight tracking-tight uppercase"
              style={{ fontWeight: 900 }}
            >
              Decisions
              <br />
              that compound.
            </h1>
          </div>

          <p
            className="text-text-secondary text-lg leading-relaxed tracking-wide"
            style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontWeight: 400 }}
          >
            A living protocol for engineering teams.
          </p>

          <div className="flex items-center justify-center gap-3 pointer-events-auto pt-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="rounded-none px-4 py-2.5 text-text-primary placeholder:text-text-muted text-sm w-64 focus:outline-none transition-colors"
              style={{
                background: 'rgba(4, 8, 4, 0.7)',
                border: '2px solid var(--brutalist-border)',
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
              }}
            />
            <button
              className="rounded-none px-5 py-2.5 text-sm font-bold uppercase tracking-tight whitespace-nowrap transition-colors"
              style={{
                background: 'var(--brutalist-accent)',
                color: '#040804',
                border: '2px solid var(--brutalist-border)',
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
              }}
            >
              Get early access
            </button>
          </div>
        </div>
      </div>
    </ShaderHero>
  )
}
