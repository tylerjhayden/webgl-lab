import { useState } from 'react'
import { ShaderHero, useFontAtlas } from '../../components/ShaderHero'
import fragmentShader from './shaders/runic.frag'

const RUNE_CHARS = ['ᛁ', 'ᛚ', 'ᚲ', 'ᚱ', 'ᚦ', 'ᛟ', 'ᛒ', 'ᛞ']
const WISDOM_TOKENS = ['TODO', 'FIXME', 'WTF', 'OLD', 'WIP', 'ASK BOB', 'RTFM', 'RIP']
const FONT_STACK = 'Menlo, Monaco, "Courier New", monospace'

export default function Scene() {
  const runeAtlas = useFontAtlas(RUNE_CHARS, { fontStack: FONT_STACK })
  const wisdomAtlas = useFontAtlas(WISDOM_TOKENS, { fontStack: FONT_STACK, bold: true, fontScale: 0.55 })
  const [email, setEmail] = useState('')

  return (
    <ShaderHero
      fragmentShader={fragmentShader}
      interactive
      uniforms={{
        uAtlas: { value: runeAtlas },
        uAtlasWisdom: { value: wisdomAtlas },
      }}
    >
      <div className="relative z-[5] flex flex-col items-center justify-center h-full pt-16 px-4 pointer-events-none">
        <div className="max-w-2xl text-center space-y-6">
          <h1 className="font-mono text-5xl font-bold text-text-primary leading-tight tracking-tight">
            // Lore that survives the resignation
          </h1>

          <p className="text-text-secondary text-lg leading-relaxed">
            Knowledge graphs from your codebase, not your wiki.
          </p>

          <div className="flex items-center justify-center gap-3 pointer-events-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="bg-surface-raised/60 backdrop-blur-sm border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-muted text-sm w-64 focus:outline-none focus:border-accent transition-colors"
            />
            <button className="bg-accent hover:bg-accent-hover text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap">
              Inherit the wisdom
            </button>
          </div>
        </div>
      </div>
    </ShaderHero>
  )
}
