interface TagFilterProps {
  tags: string[]
  activeTags: string[]
  onToggle: (tag: string) => void
}

export default function TagFilter({ tags, activeTags, onToggle }: TagFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const active = activeTags.includes(tag)
        return (
          <button
            key={tag}
            onClick={() => onToggle(tag)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
              active
                ? 'bg-accent text-white'
                : 'bg-surface-raised text-text-muted hover:text-text-secondary border border-border-subtle'
            }`}
          >
            {tag}
          </button>
        )
      })}
    </div>
  )
}
