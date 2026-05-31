import { Bell, ChevronDown, HelpCircle, Menu, User } from 'lucide-react'

export function TopNavbar() {
  return (
    <header className="sticky top-0 z-20 flex h-22 items-center bg-gradient-to-r from-[#093C5D] to-[#3B7597] px-9 text-white shadow-lg shadow-slate-900/15">
      <button
        type="button"
        aria-label="Mở menu"
        className="grid h-11 w-11 place-items-center rounded-lg text-white transition hover:bg-white/10"
      >
        <Menu className="h-8 w-8" />
      </button>

      <div className="ml-auto flex items-center gap-5">
        <button
          type="button"
          aria-label="Thông báo"
          className="relative grid h-11 w-11 place-items-center rounded-full transition hover:bg-white/10"
        >
          <Bell className="h-7 w-7" />
          <span className="absolute -right-0.5 -top-0.5 grid h-6 w-6 place-items-center rounded-full bg-[#39E8CF] text-xs font-bold text-[#093C5D]">
            3
          </span>
        </button>
        <button
          type="button"
          aria-label="Trợ giúp"
          className="grid h-11 w-11 place-items-center rounded-full transition hover:bg-white/10"
        >
          <HelpCircle className="h-8 w-8" />
        </button>
        <div className="flex items-center gap-3 pl-2">
          <div className="grid h-13 w-13 place-items-center rounded-full border-2 border-[#38D9CD] bg-white text-[#1C6692]">
            <User className="h-9 w-9 fill-[#D8F8F3] stroke-[#1C6692]" />
          </div>
          <div className="hidden leading-tight sm:block">
            <div className="flex items-center gap-1.5 text-sm font-bold">
              Nguyễn Văn A
              <ChevronDown className="h-4 w-4" />
            </div>
            <p className="mt-1 text-sm text-white/75">Admin</p>
          </div>
        </div>
      </div>
    </header>
  )
}
