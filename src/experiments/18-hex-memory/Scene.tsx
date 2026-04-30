import { useState } from 'react'
import { ShaderHero, useFontAtlas } from '../../components/ShaderHero'
import fragmentShader from './shaders/memdump.frag'

const ATLAS_CHARS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f']

const GUTTER_ADDRESSES = [
  '0x00',
  '0x10',
  '0x20',
  '0x30',
  '0x40',
  '0x50',
  '0x60',
  '0x70',
]

export default function Scene() {
  const atlas = useFontAtlas(ATLAS_CHARS, { fontScale: 0.78 })
  const [email, setEmail] = useState('')

  return (
    <ShaderHero fragmentShader={fragmentShader} uniforms={{ uAtlas: { value: atlas } }}>
      <div className="relative z-[5] flex items-center justify-center h-full pt-16 px-4 pointer-events-none">
        <div className="flex items-start gap-6">
          {/* Line-numbered gutter */}
          <div className="font-mono text-xs text-text-muted/40 flex flex-col gap-1 pr-4 pt-2 border-r border-border-subtle/30">
            {GUTTER_ADDRESSES.map((addr) => (
              <span key={addr}>{addr}</span>
            ))}
          </div>

          {/* Headline + subtitle */}
          <div className="max-w-xl space-y-5">
            <h1 className="font-mono text-4xl md:text-5xl font-bold text-text-primary leading-tight tracking-tight">
              0x7F4A2B0::knowledge
            </h1>
            <p className="text-text-secondary text-lg leading-relaxed">
              Address the unwritten rules in your codebase.
            </p>
            <div className="flex items-center gap-3 pointer-events-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="0x..@email.com"
                className="font-mono bg-surface-raised/60 backdrop-blur-sm border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-muted text-sm w-64 focus:outline-none focus:border-accent transition-colors"
              />
              <button className="font-mono bg-surface-raised/60 backdrop-blur-sm border border-border-subtle text-text-primary hover:border-accent hover:text-accent px-5 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap">
                Read the address
              </button>
            </div>
          </div>
        </div>
      </div>
    </ShaderHero>
  )
}
