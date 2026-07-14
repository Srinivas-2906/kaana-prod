import { UtensilsCrossed, X } from 'lucide-react'
import type { MenuSection } from '../types/menu'

interface MenuModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectSection: (sectionId: string) => void
  sections: MenuSection[]
}

export function MenuModal({ isOpen, onClose, onSelectSection, sections }: MenuModalProps) {
  if (!isOpen) return null

  const handleSelect = (sectionId: string) => {
    onSelectSection(sectionId)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        onClick={onClose}
        aria-label="Close menu"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="menu-modal-title"
        className="relative z-10 max-h-[70vh] w-full max-w-lg overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h2 id="menu-modal-title" className="text-base font-bold text-gray-900">
            Menu
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <ul className="max-h-[calc(70vh-52px)] overflow-y-auto py-2">
          {sections.map((section) => (
            <li key={section.id}>
              <button
                type="button"
                onClick={() => handleSelect(section.id)}
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-orange-50 hover:text-[#FC8019]"
              >
                <span>{section.title}</span>
                <span className="text-xs text-gray-400">{section.items.length}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

interface FloatingMenuButtonProps {
  onClick: () => void
}

export function FloatingMenuButton({ onClick }: FloatingMenuButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-[max(5.5rem,calc(5rem+env(safe-area-inset-bottom)))] left-1/2 z-30 inline-flex -translate-x-1/2 items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-800 shadow-lg transition hover:shadow-xl active:scale-95"
    >
      <UtensilsCrossed className="h-4 w-4 text-[#FC8019]" aria-hidden />
      Menu
    </button>
  )
}
