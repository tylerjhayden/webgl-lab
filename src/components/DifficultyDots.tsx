interface DifficultyDotsProps {
  level: number
  size?: 'xs' | 'sm'
}

export default function DifficultyDots({ level, size = 'sm' }: DifficultyDotsProps) {
  const dotSize = size === 'xs' ? 'w-1 h-1' : 'w-1.5 h-1.5'
  return (
    <div className="flex gap-0.5 shrink-0">
      {Array.from({ length: 3 }, (_, i) => (
        <div
          key={i}
          className={`${dotSize} rounded-full ${
            i < level ? 'bg-accent' : 'bg-border-subtle'
          }`}
        />
      ))}
    </div>
  )
}
