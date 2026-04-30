import { useMemo, useRef } from 'react'
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
>

function ShaderQuad({
  fragmentShader,
  vertexShader,
  uniforms: extra,
  interactive,
}: ShaderQuadProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const mouseRef = useRef(new THREE.Vector2(0.5, 0.5))
  const { size } = useThree()

  // Captured once: extras' IUniform refs are stable across renders in this
  // codebase (atlases come from useFontAtlas / useMemo). Re-creating the
  // merged uniforms object every render would replace IUniforms mid-flight
  // and flash uTime back to zero on unrelated state changes.
  const uniforms = useMemo(() => {
    const base: Record<string, THREE.IUniform> = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uAtlasReady: { value: 1.0 },
    }
    if (interactive) {
      base.uMouse = { value: new THREE.Vector2(0.5, 0.5) }
    }
    return { ...base, ...(extra ?? {}) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactive])

  useFrame(({ clock, pointer }) => {
    const m = materialRef.current
    if (!m) return
    const u = m.uniforms
    u.uTime.value = clock.getElapsedTime()
    u.uResolution.value.set(size.width, size.height)
    if (interactive && u.uMouse) {
      const targetX = (pointer.x + 1) * 0.5
      const targetY = (pointer.y + 1) * 0.5
      mouseRef.current.x += (targetX - mouseRef.current.x) * 0.08
      mouseRef.current.y += (targetY - mouseRef.current.y) * 0.08
      u.uMouse.value.copy(mouseRef.current)
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

  return (
    <div ref={containerRef} className={className} style={theme}>
      <Canvas
        className="!absolute inset-0"
        gl={{ alpha: true, premultipliedAlpha: false, antialias: false }}
        dpr={dpr}
        {...(interactive
          ? {
              eventSource: containerRef as React.RefObject<HTMLElement>,
              eventPrefix: 'client' as const,
            }
          : {})}
      >
        <ShaderQuad
          fragmentShader={fragmentShader}
          vertexShader={vertexShader}
          uniforms={uniforms}
          interactive={interactive}
        />
      </Canvas>
      {children}
    </div>
  )
}
