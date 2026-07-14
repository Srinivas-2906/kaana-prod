interface DietToggleProps {
  type: 'veg' | 'non-veg'
  active: boolean
  onToggle: () => void
}

function ToggleIcon({ type }: { type: 'veg' | 'non-veg' }) {
  if (type === 'veg') {
    return (
      <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-[3px] border-[1.5px] border-[#00882B]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#00882B]" />
      </span>
    )
  }

  return (
    <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-[3px] border-[1.5px] border-[#E43B4F]">
      <span className="h-0 w-0 border-x-[3px] border-b-[5px] border-x-transparent border-b-[#E43B4F]" />
    </span>
  )
}

export function DietToggle({ type, active, onToggle }: DietToggleProps) {
  const isVeg = type === 'veg'

  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={isVeg ? 'Vegetarian filter' : 'Non-vegetarian filter'}
      onClick={onToggle}
      className={`relative h-7 w-[46px] shrink-0 rounded-full border transition-all duration-200 ease-out ${
        active
          ? isVeg
            ? 'border-[#00882B]/40 bg-[#E8F5E9]'
            : 'border-[#E43B4F]/40 bg-[#FFEBEE]'
          : 'border-gray-200 bg-[#F3F0F8]'
      }`}
    >
      <span
        className={`absolute top-0.5 flex h-6 w-6 items-center justify-center rounded-md bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12)] transition-transform duration-200 ease-out ${
          active ? 'translate-x-[18px]' : 'translate-x-0.5'
        }`}
      >
        <ToggleIcon type={type} />
      </span>
    </button>
  )
}
