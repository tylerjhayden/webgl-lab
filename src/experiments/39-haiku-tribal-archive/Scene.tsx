import { useState } from 'react'
import { ShaderHero, useFontAtlas } from '../../components/ShaderHero'
import fragmentShader from './shaders/topology.frag'

const ATLAS_CHARS = ['∑', '∫', '√', 'λ', '∞', 'π', 'μ', 'Δ']

const THEME = {
  '--color-accent': '#6E4E2C',
  '--color-accent-hover': '#5A3F23',
} as React.CSSProperties

export default function Scene() {
  const atlas = useFontAtlas(ATLAS_CHARS)
  const [email, setEmail] = useState('')

  return (
    <ShaderHero fragmentShader={fragmentShader} uniforms={{ uAtlas: { value: atlas } }} theme={THEME}>
      <div className="relative z-[5] flex flex-col items-center justify-center h-full pt-16 px-4 pointer-events-none">
        <div className="max-w-2xl text-center space-y-6">
          <h1 className="font-serif text-5xl font-bold text-text-primary leading-tight tracking-tight">
            Archive
            <br />
            the why.
          </h1>

          <p className="text-text-secondary text-lg leading-relaxed">
            Decision records, preserved as protocol.
          </p>

          <div className="flex items-center justify-center gap-3 pointer-events-auto pt-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="bg-surface-raised/60 backdrop-blur-sm border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-muted text-sm w-64 focus:outline-none focus:border-accent transition-colors"
            />
            <button className="bg-accent hover:bg-accent-hover text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap">
              Get early access
            </button>
          </div>
        </div>
      </div>

      {/* Handwritten overlay with Caveat font */}
      <div className="absolute top-1/4 left-1/3 font-['Caveat',cursive] opacity-15 text-xl pointer-events-none">
        why
      </div>
      <div className="absolute top-1/3 right-1/4 font-['Caveat',cursive] opacity-15 text-xl pointer-events-none">
        trade-off
      </div>
      <div className="absolute bottom-1/3 left-1/4 font-['Caveat',cursive] opacity-15 text-xl pointer-events-none">
        choice
      </div>
      <div className="absolute bottom-1/4 right-1/3 font-['Caveat',cursive] opacity-15 text-xl pointer-events-none">
        protocol
      </div>
    </ShaderHero>
  )
}
