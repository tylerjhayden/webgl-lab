import { useState } from 'react'
import { ShaderHero, useFontAtlas } from '../../components/ShaderHero'
import fragmentShader from './shaders/topology.frag'

const ATLAS_CHARS = ['·', '.', '-', '+', '×', '#', '@', '█']

const THEME = {
  '--color-surface': '#e8dcc4',
  '--color-text-primary': '#382818',
  '--color-text-secondary': '#604a36',
  '--color-text-muted': '#8a7558',
  '--color-border-subtle': 'rgba(56, 40, 24, 0.22)',
} as React.CSSProperties

const PAPER_GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.22  0 0 0 0 0.16  0 0 0 0 0.10  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`,
)}")`

export default function Scene() {
  const atlas = useFontAtlas(ATLAS_CHARS)
  const [email, setEmail] = useState('')

  return (
    <ShaderHero
      fragmentShader={fragmentShader}
      uniforms={{ uAtlas: { value: atlas } }}
      theme={THEME}
    >
      {/* Paper grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: PAPER_GRAIN,
          opacity: 0.07,
          mixBlendMode: 'multiply',
          zIndex: 2,
        }}
      />

      <div className="relative z-[5] flex flex-col items-center justify-center h-full pt-16 px-4 pointer-events-none">
        <div
          className="relative max-w-2xl text-center space-y-6"
          style={{
            background: 'rgba(244, 236, 214, 0.88)',
            padding: '3rem 3.5rem',
            border: '1px solid rgba(184, 107, 66, 0.55)',
            outline: '1px solid rgba(184, 107, 66, 0.55)',
            outlineOffset: '5px',
          }}
        >
          {/* Cartographic registration ticks */}
          <span
            className="absolute select-none"
            style={{ top: '-12px', left: '-12px', color: '#b86b42', fontSize: '14px', lineHeight: 1 }}
          >
            +
          </span>
          <span
            className="absolute select-none"
            style={{ top: '-12px', right: '-12px', color: '#b86b42', fontSize: '14px', lineHeight: 1 }}
          >
            +
          </span>
          <span
            className="absolute select-none"
            style={{ bottom: '-12px', left: '-12px', color: '#b86b42', fontSize: '14px', lineHeight: 1 }}
          >
            +
          </span>
          <span
            className="absolute select-none"
            style={{ bottom: '-12px', right: '-12px', color: '#b86b42', fontSize: '14px', lineHeight: 1 }}
          >
            +
          </span>

          <h1
            className="text-5xl text-text-primary leading-tight tracking-tight"
            style={{
              fontFamily: "'Fraunces', 'Times New Roman', serif",
              fontStyle: 'italic',
              fontWeight: 600,
              fontVariationSettings: "'opsz' 96",
            }}
          >
            Where the
            <br />
            hot decisions live.
          </h1>

          <p
            className="text-text-secondary text-lg leading-relaxed"
            style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 400 }}
          >
            Trade-offs, captured before they cool.
          </p>

          <div className="flex items-center justify-center gap-3 pointer-events-auto pt-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="rounded-sm px-4 py-2.5 text-text-primary placeholder:text-text-muted text-sm w-64 focus:outline-none transition-colors"
              style={{
                background: 'rgba(255, 250, 238, 0.7)',
                border: '1px solid rgba(56, 40, 24, 0.3)',
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            />
            <button
              className="rounded-sm px-5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors"
              style={{
                background: '#382818',
                color: '#f0e8d8',
                fontFamily: "'Inter', system-ui, sans-serif",
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
