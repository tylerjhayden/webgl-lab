import { useState } from 'react'
import { ShaderHero, useFontAtlas } from '../../components/ShaderHero'
import fragmentShader from './shaders/main.frag'

const ATLAS_CHARS = ['·', '.', '-', '+', '×', '#', '@', '█']

const THEME = {
  '--color-accent': '#2D8A4D',
  '--color-accent-hover': '#236E3C',
} as React.CSSProperties

export default function Scene() {
  const atlas = useFontAtlas(ATLAS_CHARS)
  const [email, setEmail] = useState('')

  return (
    <ShaderHero fragmentShader={fragmentShader} uniforms={{ uAtlas: { value: atlas } }} theme={THEME}>
      <div className="relative z-[5] flex flex-col items-center justify-center h-full pt-16 px-4 pointer-events-none">
        <div className="max-w-2xl text-center space-y-6">
          <h1 className="font-mono text-5xl font-bold text-text-primary leading-tight tracking-tight">
            Coding agents are only as good<br />as their context.
          </h1>
          <p className="text-text-secondary text-lg leading-relaxed">
            Feed them the design history that engineers usually keep in their heads.
          </p>
          <div className="flex items-center justify-center gap-3 pointer-events-auto">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="bg-surface-raised/60 backdrop-blur-sm border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-muted text-sm w-64 focus:outline-none focus:border-accent transition-colors" />
            <button className="bg-accent hover:bg-accent-hover text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap">
              Equip your agents
            </button>
          </div>
        </div>
      </div>
    </ShaderHero>
  )
}
