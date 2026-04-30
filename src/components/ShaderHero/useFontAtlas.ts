import { useMemo } from 'react'
import * as THREE from 'three'

export type FontAtlasOptions = {
  fontStack?: string
  cellSize?: number
  bold?: boolean
  fontScale?: number
}

export function useFontAtlas(
  chars: string[],
  options?: FontAtlasOptions,
): THREE.CanvasTexture {
  const {
    fontStack = 'monospace',
    cellSize = 64,
    bold = false,
    fontScale = 0.8,
  } = options ?? {}
  const charsKey = chars.join(' ')

  const texture = useMemo(() => {
    const width = cellSize * chars.length
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = cellSize
    const ctx = canvas.getContext('2d')!

    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, width, cellSize)

    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    const maxWidth = cellSize * 0.92
    const weight = bold ? 'bold ' : ''

    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i]
      let fontSize = cellSize * fontScale
      ctx.font = `${weight}${fontSize}px ${fontStack}`
      while (ctx.measureText(ch).width > maxWidth && fontSize > 6) {
        fontSize -= 1
        ctx.font = `${weight}${fontSize}px ${fontStack}`
      }
      ctx.fillText(ch, i * cellSize + cellSize / 2, cellSize / 2)
    }

    const tex = new THREE.CanvasTexture(canvas)
    tex.minFilter = THREE.NearestFilter
    tex.magFilter = THREE.NearestFilter
    tex.needsUpdate = true
    return tex
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charsKey, fontStack, cellSize, bold, fontScale])

  // Intentionally not disposing in a useEffect cleanup: under React StrictMode,
  // the simulated unmount disposes the texture while useMemo's cache still
  // references it, leaving the consumer holding a disposed texture on remount.
  // Deps here are stable for a component's lifetime; the texture is reclaimed
  // when the host <Canvas> unmounts and the GL context is released.

  return texture
}
