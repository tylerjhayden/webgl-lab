import { useState } from 'react'
import { ShaderHero, useFontAtlas } from '../../components/ShaderHero'
import fragmentShader from './shaders/main.frag'

const ATLAS_CHARS = ['·', '─', '│', '┼', '╔', '╗', '╚', '╝']

export default function Scene() {
  const atlas = useFontAtlas(ATLAS_CHARS)
  const [email, setEmail] = useState('')

  return (
    <div className="relative w-full h-full bg-surface">
      <div className="absolute inset-0 flex">
        <ShaderHero
          fragmentShader={fragmentShader}
          uniforms={{ uAtlas: { value: atlas } }}
          className="relative w-1/2 h-full"
        >
          <></>
        </ShaderHero>
        <div className="w-1/2 h-full" />
      </div>
      <div className="relative z-[5] flex flex-col items-center justify-center h-full pt-16 px-4 pointer-events-none">
        <div className="max-w-2xl text-center space-y-6">
          <h1 className="font-mono text-5xl font-bold text-text-primary leading-tight tracking-tight">
            Tribal knowledge,<br />made portable.
          </h1>
          <p className="text-text-secondary text-lg leading-relaxed">
            A workspace for the architectural decisions your team has been keeping in their heads.
          </p>
          <div className="flex items-center justify-center gap-3 pointer-events-auto">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="bg-surface-raised/60 backdrop-blur-sm border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-muted text-sm w-64 focus:outline-none focus:border-accent transition-colors" />
            <button className="bg-accent hover:bg-accent-hover text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap">
              Open the workspace
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
