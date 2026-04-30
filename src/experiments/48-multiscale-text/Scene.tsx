import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ScreenQuad } from '@react-three/drei'
import * as THREE from 'three'
import vertexShader from './shaders/main.vert'
import fragmentShader from './shaders/main.frag'

const ATLAS_CHARS = ['·', '.', '⁘', '⁙', '※', '∴', '∷', '◍']
const CHAR_SIZE = 64
const ATLAS_WIDTH = CHAR_SIZE * ATLAS_CHARS.length

function createFontAtlas(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = ATLAS_WIDTH
  canvas.height = CHAR_SIZE
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, ATLAS_WIDTH, CHAR_SIZE)
  ctx.fillStyle = 'white'
  ctx.font = `${CHAR_SIZE * 0.8}px monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (let i = 0; i < ATLAS_CHARS.length; i++) {
    ctx.fillText(ATLAS_CHARS[i], i * CHAR_SIZE + CHAR_SIZE / 2, CHAR_SIZE / 2)
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.minFilter = THREE.NearestFilter
  tex.magFilter = THREE.NearestFilter
  tex.needsUpdate = true
  return tex
}

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

function ShaderQuad() {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const { size } = useThree()
  const atlas = useMemo(() => createFontAtlas(), [])
  const textMask = useMemo(() => createTextMask(1024, 256), [])

  useEffect(() => {
    if (typeof document === 'undefined' || !document.fonts) return
    document.fonts.load('600 80px Fraunces').then(() => {
      const canvas = textMask.image as HTMLCanvasElement
      drawTextMask(canvas)
      textMask.needsUpdate = true
    }).catch(() => {})
  }, [textMask])

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(size.width, size.height) },
    uAtlas: { value: atlas },
    uAtlasReady: { value: 1.0 },
    uTextMask: { value: textMask },
  }), [atlas, textMask])

  useFrame(({ clock }) => {
    if (!materialRef.current) return
    const u = materialRef.current.uniforms
    u.uTime.value = clock.getElapsedTime()
    u.uResolution.value.set(size.width, size.height)
  })

  return (
    <ScreenQuad>
      <shaderMaterial ref={materialRef} vertexShader={vertexShader}
        fragmentShader={fragmentShader} uniforms={uniforms}
        transparent depthWrite={false} />
    </ScreenQuad>
  )
}

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

export default function Scene() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [email, setEmail] = useState('')
  return (
    <div ref={containerRef} className="relative w-full h-full bg-surface" style={THEME}>
      <Canvas className="!absolute inset-0"
        gl={{ alpha: true, premultipliedAlpha: false, antialias: false }}
        dpr={[1, 1]}>
        <ShaderQuad />
      </Canvas>
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
    </div>
  )
}
