import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { ScreenQuad } from '@react-three/drei'
import * as THREE from 'three'
import passthrough from './shaders/passthrough.vert'

interface ShaderQuadProps {
  fragmentShader: string
  pointerUvRef: React.RefObject<THREE.Vector2>
}

export default function ShaderQuad({ fragmentShader, pointerUvRef }: ShaderQuadProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const mouseRef = useRef(new THREE.Vector2(0.5, 0.5))
  const { size } = useThree()

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
    }),
    [],
  )

  useFrame(({ clock }) => {
    if (!materialRef.current) return
    const u = materialRef.current.uniforms

    u.uTime.value = clock.getElapsedTime()
    u.uResolution.value.set(size.width, size.height)

    const target = pointerUvRef.current
    mouseRef.current.x += (target.x - mouseRef.current.x) * 0.06
    mouseRef.current.y += (target.y - mouseRef.current.y) * 0.06
    u.uMouse.value.copy(mouseRef.current)
  })

  return (
    <ScreenQuad>
      <shaderMaterial
        ref={materialRef}
        vertexShader={passthrough}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </ScreenQuad>
  )
}
