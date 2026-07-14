import { Clock, MapPin } from 'lucide-react'
import { RESTAURANT } from '../data/menuData'
import hero from '../assets/hero.png'

export function Header() {
  return (
    <header className="border-b border-gray-100 bg-white">
      <div
        className="relative overflow-hidden px-4 pb-4 pt-4"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(255,255,255,1)), url(${hero})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <h1 className="text-xl font-extrabold tracking-tight text-white drop-shadow">
          {RESTAURANT.name}
        </h1>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/90">
          <span className="inline-flex items-center gap-1 rounded-full bg-black/30 px-2 py-1">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-white/80" aria-hidden />
            {RESTAURANT.location}
          </span>
          {!RESTAURANT.isOpen && (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/30 px-2 py-1">
              <Clock className="h-3.5 w-3.5 text-white/80" aria-hidden />
              Closed • Opens {RESTAURANT.opensAt}
            </span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {RESTAURANT.cuisines.map((cuisine) => (
            <span
              key={cuisine}
              className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-gray-800"
            >
              {cuisine}
            </span>
          ))}
        </div>
      </div>
    </header>
  )
}
