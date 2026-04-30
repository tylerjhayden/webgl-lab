import { useState } from 'react'
import { ShaderHero, useFontAtlas } from '../../components/ShaderHero'
import fragmentShader from './shaders/topology.frag'

const ATLAS_CHARS = ['·', '.', '-', '+', '×', '#', '@', '█']

const THEME = {
  '--color-surface': '#f0e8d8',
  '--color-text-primary': '#2e231e',
  '--color-text-secondary': '#5c4838',
  '--color-text-muted': '#8a7460',
  '--color-border-subtle': 'rgba(46, 35, 30, 0.20)',
} as React.CSSProperties

const PAPER_GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.18  0 0 0 0 0.14  0 0 0 0 0.12  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`,
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
          opacity: 0.09,
          mixBlendMode: 'multiply',
          zIndex: 2,
        }}
      />

      {/* Marginal stamps — carbon-copy palimpsest */}
      <div
        className="absolute top-10 right-12 pointer-events-none"
        style={{
          fontFamily: "'Caveat', cursive",
          fontSize: '2rem',
          color: '#8c4d33',
          opacity: 0.35,
          transform: 'rotate(-8deg)',
          zIndex: 3,
        }}
      >
        DRAFT
      </div>
      <div
        className="absolute bottom-12 left-14 pointer-events-none"
        style={{
          fontFamily: "'Caveat', cursive",
          fontSize: '1.5rem',
          color: '#8c4d33',
          opacity: 0.35,
          transform: 'rotate(4deg)',
          zIndex: 3,
        }}
      >
        v.0
      </div>

      <div className="relative z-[5] flex flex-col items-center justify-center h-full pt-16 px-4 pointer-events-none">
        <div className="relative max-w-2xl">
          {/* Carbon-copy duplicate — offset registration */}
          <div
            className="absolute inset-0"
            style={{
              background: 'rgba(140, 77, 51, 0.18)',
              transform: 'translate(5px, 5px)',
            }}
          />
          <div
            className="relative text-center space-y-6"
            style={{
              background: 'rgba(248, 240, 222, 0.92)',
              padding: '3rem 3.5rem',
              border: '1px solid rgba(46, 35, 30, 0.4)',
            }}
          >
            <h1
              className="text-5xl text-text-primary leading-tight tracking-tight"
              style={{
                fontFamily: "'Space Mono', ui-monospace, monospace",
                fontWeight: 700,
              }}
            >
              The why
              <br />
              hides in the noise.
            </h1>

            <p
              className="text-text-secondary text-lg leading-relaxed"
              style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 400 }}
            >
              Surface the trade-offs your codebase can't tell you.
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
                  border: '1px solid rgba(46, 35, 30, 0.3)',
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}
              />
              <button
                className="rounded-sm px-5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors"
                style={{
                  background: '#2e231e',
                  color: '#f0e8d8',
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}
              >
                Get early access
              </button>
            </div>
          </div>
        </div>
      </div>
    </ShaderHero>
  )
}
