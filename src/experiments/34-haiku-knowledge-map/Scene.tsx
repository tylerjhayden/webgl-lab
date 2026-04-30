import { useState } from 'react'
import { ShaderHero, useFontAtlas } from '../../components/ShaderHero'
import fragmentShader from './shaders/topology.frag'

const ATLAS_CHARS = ['÷', '×', '±', '≈', '∞', '+', '=', '-']

const THEME = {
  '--color-surface': '#ede4cf',
  '--color-text-primary': '#2a2620',
  '--color-text-secondary': '#5a544a',
  '--color-text-muted': '#8a8478',
  '--color-border-subtle': 'rgba(42, 38, 32, 0.20)',
} as React.CSSProperties

const PAPER_GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.20  0 0 0 0 0.18  0 0 0 0 0.12  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`,
)}")`

const QUAD_RULE = `repeating-linear-gradient(
    0deg,
    transparent 0,
    transparent 23px,
    rgba(42, 38, 32, 0.05) 23px,
    rgba(42, 38, 32, 0.05) 24px
  ),
  repeating-linear-gradient(
    90deg,
    transparent 0,
    transparent 23px,
    rgba(42, 38, 32, 0.05) 23px,
    rgba(42, 38, 32, 0.05) 24px
  )`

export default function Scene() {
  const atlas = useFontAtlas(ATLAS_CHARS)
  const [email, setEmail] = useState('')

  return (
    <ShaderHero
      fragmentShader={fragmentShader}
      uniforms={{ uAtlas: { value: atlas } }}
      theme={THEME}
    >
      {/* Quad-rule grid — engineer's notebook */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: QUAD_RULE,
          zIndex: 1,
        }}
      />

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

      {/* Marginal annotation */}
      <div
        className="absolute bottom-8 right-10 pointer-events-none"
        style={{
          fontFamily: "'Caveat', cursive",
          fontSize: '1.4rem',
          color: '#5c4230',
          opacity: 0.55,
          transform: 'rotate(-3deg)',
          zIndex: 3,
        }}
      >
        fig. 1
      </div>

      <div className="relative z-[5] flex flex-col items-center justify-center h-full pt-16 px-4 pointer-events-none">
        <div
          className="relative max-w-2xl text-center space-y-6"
          style={{
            background: 'rgba(247, 239, 217, 0.94)',
            padding: '3rem 3.5rem',
            borderRadius: '4px',
            boxShadow:
              '0 8px 28px rgba(42, 38, 32, 0.10), 0 2px 6px rgba(42, 38, 32, 0.06)',
          }}
        >
          {/* Washi tape — pinned-in specimen card */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: '-10px',
              left: '36px',
              width: '88px',
              height: '20px',
              background: 'rgba(107, 117, 79, 0.32)',
              transform: 'rotate(-4deg)',
            }}
          />
          <div
            className="absolute pointer-events-none"
            style={{
              top: '-10px',
              right: '36px',
              width: '88px',
              height: '20px',
              background: 'rgba(107, 117, 79, 0.32)',
              transform: 'rotate(4deg)',
            }}
          />

          <h1
            className="text-5xl text-text-primary leading-tight tracking-tight"
            style={{
              fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
              fontStyle: 'italic',
              fontWeight: 600,
            }}
          >
            Every decision.
            <br />
            Fully connected.
          </h1>

          <p
            className="text-text-secondary text-lg leading-relaxed"
            style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 400 }}
          >
            Map the why across your stack.
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
                border: '1px solid rgba(42, 38, 32, 0.3)',
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            />
            <button
              className="rounded-sm px-5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors"
              style={{
                background: '#2a2620',
                color: '#ede4cf',
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
