import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ScreenQuad } from '@react-three/drei'
import * as THREE from 'three'

const DEFAULT_VERTEX_SHADER = `varying vec2 vUv;

void main() {
  // ScreenQuad has no uv attribute — derive from clip-space position
  vUv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

export type ShaderHeroProps = {
  fragmentShader: string
  vertexShader?: string
  uniforms?: Record<string, THREE.IUniform>
  interactive?: boolean
  theme?: React.CSSProperties
  className?: string
  dpr?: [number, number]
  children: React.ReactNode
}

type ShaderQuadProps = Pick<
  ShaderHeroProps,
  'fragmentShader' | 'vertexShader' | 'uniforms' | 'interactive'
> & {
  pointerUvRef: React.RefObject<THREE.Vector2>
}

function ShaderQuad({
  fragmentShader,
  vertexShader,
  uniforms: extra,
  interactive,
  pointerUvRef,
}: ShaderQuadProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const mouseRef = useRef(new THREE.Vector2(0.5, 0.5))
  const { size } = useThree()

  // Build the full uniform layout once. Keys must be present at material
  // creation; values are synced every frame from the latest `extra` prop.
  const uniforms = useMemo(() => {
    const base: Record<string, THREE.IUniform> = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uAtlasReady: { value: 1.0 },
    }
    if (interactive) {
      base.uMouse = { value: new THREE.Vector2(0.5, 0.5) }
    }
    if (extra) {
      for (const key of Object.keys(extra)) {
        base[key] = { value: extra[key].value }
      }
    }
    return base
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactive])

  useFrame(({ clock }) => {
    const m = materialRef.current
    if (!m) return
    const u = m.uniforms
    u.uTime.value = clock.getElapsedTime()
    u.uResolution.value.set(size.width, size.height)
    if (interactive && u.uMouse) {
      const target = pointerUvRef.current
      mouseRef.current.x += (target.x - mouseRef.current.x) * 0.08
      mouseRef.current.y += (target.y - mouseRef.current.y) * 0.08
      u.uMouse.value.copy(mouseRef.current)
    }
    if (extra) {
      for (const key in extra) {
        if (u[key]) u[key].value = extra[key].value
      }
    }
  })

  return (
    <ScreenQuad>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader ?? DEFAULT_VERTEX_SHADER}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </ScreenQuad>
  )
}

export function ShaderHero({
  fragmentShader,
  vertexShader,
  uniforms,
  interactive = false,
  theme,
  className = 'relative w-full h-full bg-surface',
  dpr = [1, 1],
  children,
}: ShaderHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const pointerUvRef = useRef(new THREE.Vector2(0.5, 0.5))

  useEffect(() => {
    if (!interactive) return
    const el = containerRef.current
    if (!el) return
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = 1 - (e.clientY - rect.top) / rect.height
      pointerUvRef.current.set(x, y)
    }
    el.addEventListener('pointermove', onMove)
    return () => el.removeEventListener('pointermove', onMove)
  }, [interactive])

  return (
    <div ref={containerRef} className={className} style={theme}>
      <Canvas
        className="!absolute inset-0"
        gl={{ alpha: true, premultipliedAlpha: false, antialias: false }}
        dpr={dpr}
      >
        <ShaderQuad
          fragmentShader={fragmentShader}
          vertexShader={vertexShader}
          uniforms={uniforms}
          interactive={interactive}
          pointerUvRef={pointerUvRef}
        />
      </Canvas>
      {children}
    </div>
  )
}
