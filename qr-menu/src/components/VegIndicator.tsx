interface VegIndicatorProps {
  isVeg: boolean
  size?: 'sm' | 'md'
}

export function VegIndicator({ isVeg, size = 'md' }: VegIndicatorProps) {
  const boxSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
  const dotSize = size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2'

  if (isVeg) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-sm border-2 border-green-600 ${boxSize}`}
        aria-label="Vegetarian"
        title="Vegetarian"
      >
        <span className={`rounded-full bg-green-600 ${dotSize}`} />
      </span>
    )
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-sm border-2 border-[#8B4513] ${boxSize}`}
      aria-label="Non-vegetarian"
      title="Non-vegetarian"
    >
      <span
        className="h-0 w-0 border-x-[3px] border-b-[5px] border-x-transparent border-b-[#8B4513]"
        aria-hidden
      />
    </span>
  )
}
