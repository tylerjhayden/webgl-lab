import { useEffect, useRef } from 'react'

interface RawCanvasWrapperProps {
  setup: (container: HTMLDivElement) => (() => void) | void
}

export default function RawCanvasWrapper({ setup }: RawCanvasWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const cleanup = setup(containerRef.current)
    return () => {
      if (typeof cleanup === 'function') cleanup()
    }
  }, [setup])

  return <div ref={containerRef} className="absolute inset-0" />
}
