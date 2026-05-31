import { Plus, Search } from 'lucide-react'

type MasterDataSearchHeaderProps = {
  title: string
  visibleStart: number
  visibleEnd: number
  totalItems: number
  searchLabel: string
  searchPlaceholder: string
  searchTerm: string
  createLabel: string
  onSearchChange: (value: string) => void
  onCreate: () => void
}

export function MasterDataSearchHeader({
  title,
  visibleStart,
  visibleEnd,
  totalItems,
  searchLabel,
  searchPlaceholder,
  searchTerm,
  createLabel,
  onSearchChange,
  onCreate,
}: MasterDataSearchHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h2 className="text-lg font-extrabold text-[#092F5A]">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">
          Hiển thị {visibleStart} đến {visibleEnd} trong {totalItems} kết quả
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative block">
          <span className="sr-only">{searchLabel}</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-semibold text-[#18395F] outline-none transition placeholder:text-slate-400 focus:border-[#5DF8D8] focus:ring-4 focus:ring-[#5DF8D8]/20 sm:w-72"
          />
        </label>
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#5DF8D8] px-4 text-sm font-extrabold text-[#093C5D] shadow-md shadow-teal-200/60 transition hover:bg-[#4eeac9]"
        >
          <Plus className="h-4 w-4" />
          {createLabel}
        </button>
      </div>
    </div>
  )
}

