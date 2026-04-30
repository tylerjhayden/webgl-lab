import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { ShaderHero, useFontAtlas } from '../../components/ShaderHero'
import fragmentShader from './shaders/main.frag'

const ATLAS_CHARS = ['·', '.', '⁘', '⁙', '※', '∴', '∷', '◍']

const THEME = {
  '--color-surface': '#F4F1E8',
  '--color-surface-raised': '#E8E4D6',
  '--color-surface-overlay': '#DDD8C6',
  '--color-border-subtle': '#C9C4B2',
  '--color-accent': '#5A7A4A',
  '--color-accent-hover': '#6E8E5C',
  '--color-text-primary': '#2A2D24',
  '--color-text-secondary': '#5C5F50',
  '--color-text-muted': '#8a8a78',
} as React.CSSProperties

function drawTextMask(canvas: HTMLCanvasElement) {
  const w = canvas.width
  const h = canvas.height
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = 'white'
  const lines = ['A new protocol for how', 'engineering teams remember.']
  const maxWidth = w * 0.88
  let fontSize = Math.floor(w * 0.14)
  for (; fontSize > 8; fontSize--) {
    ctx.font = `600 ${fontSize}px "Fraunces", Georgia, serif`
    if (lines.every(l => ctx.measureText(l).width <= maxWidth)) break
  }
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(lines[0], w / 2, h * 0.42)
  ctx.fillText(lines[1], w / 2, h * 0.58)
}

function createTextMask(w: number, h: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  drawTextMask(canvas)
  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

export default function Scene() {
  const atlas = useFontAtlas(ATLAS_CHARS)
  const textMask = useMemo(() => createTextMask(1024, 256), [])
  useEffect(() => () => textMask.dispose(), [textMask])

  // Re-rasterize the text mask once Fraunces actually finishes loading.
  useEffect(() => {
    if (typeof document === 'undefined' || !document.fonts) return
    document.fonts
      .load('600 80px Fraunces')
      .then(() => {
        drawTextMask(textMask.image as HTMLCanvasElement)
        textMask.needsUpdate = true
      })
      .catch(() => {})
  }, [textMask])

  const [email, setEmail] = useState('')

  return (
    <ShaderHero
      fragmentShader={fragmentShader}
      uniforms={{ uAtlas: { value: atlas }, uTextMask: { value: textMask } }}
      theme={THEME}
    >
      <div className="relative z-[5] flex flex-col items-center justify-end h-full pb-20 px-4 pointer-events-none">
        <div className="max-w-xl bg-surface/85 backdrop-blur-md rounded-2xl px-8 py-7 border border-border-subtle text-center space-y-5 pointer-events-auto shadow-[0_4px_24px_rgba(42,45,36,0.06)]">
          <p className="font-serif text-text-secondary text-base leading-relaxed italic">
            Decision artifacts, indexed and addressable — for humans, agents, and the next pull request.
          </p>
          <div className="flex items-center justify-center gap-3">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="bg-surface-raised border border-border-subtle rounded-md px-4 py-2.5 text-text-primary placeholder:text-text-muted text-sm w-60 focus:outline-none focus:border-accent transition-colors" />
            <button className="bg-accent hover:bg-accent-hover text-[#F4F1E8] font-medium px-5 py-2.5 rounded-md text-sm transition-colors whitespace-nowrap shadow-sm">
              Read the protocol
            </button>
          </div>
        </div>
      </div>
    </ShaderHero>
  )
}
