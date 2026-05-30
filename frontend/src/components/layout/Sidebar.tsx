import {
  BookOpen,
  Calendar,
  ChartNoAxesColumnIncreasing,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  UserRound,
  UsersRound,
} from 'lucide-react'
import type { NavItem } from '../../types'

const navigation: NavItem[] = [
  {
    label: 'Seminar',
    icon: Calendar,
    active: true,
    expanded: true,
    children: ['Danh sách seminar', 'Lịch seminar', 'Tạo seminar mới'],
  },
  { label: 'Booking', icon: ClipboardList, expanded: false },
  { label: 'Chuyên gia', icon: UserRound },
  { label: 'Nhân sự', icon: UsersRound },
  { label: 'Báo cáo', icon: ChartNoAxesColumnIncreasing },
]

export function Sidebar() {
  return (
    <aside className="bg-[#093C5D] text-white shadow-2xl lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:w-[270px]">
      <div className="flex h-22 items-center gap-4 border-b border-white/15 px-7">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#B8FFF1] text-[#093C5D] shadow-lg shadow-cyan-950/20">
          <BookOpen className="h-8 w-8" strokeWidth={2.3} />
        </div>
        <div>
          <p className="text-base font-bold tracking-wide">SEMINAR LOGISTICS</p>
          <p className="text-xs font-semibold tracking-[0.12em] text-white/75">
            MANAGEMENT SYSTEM
          </p>
        </div>
      </div>

      <nav className="space-y-4 px-4 py-14">
        {navigation.map((item) => {
          const Icon = item.icon
          const Chevron = item.expanded ? ChevronUp : ChevronDown

          return (
            <div key={item.label}>
              <div
                className={`flex items-center gap-4 rounded-xl px-4 py-4 text-[15px] transition ${
                  item.active
                    ? 'border-l-4 border-[#36F1D1] bg-[#0D5A84]/80 text-[#4EF7DC] shadow-lg shadow-cyan-950/20'
                    : 'text-white/90 hover:bg-white/10'
                }`}
              >
                <Icon className="h-6 w-6 shrink-0" />
                <span className="font-semibold">{item.label}</span>
                {(item.children || item.label === 'Booking') && (
                  <Chevron className="ml-auto h-4 w-4" />
                )}
              </div>

              {item.children && (
                <div className="mt-3 space-y-2 pl-8">
                  {item.children.map((child) => (
                    <div
                      key={child}
                      className={`flex items-center gap-5 rounded-xl px-3 py-3 text-sm ${
                        child === 'Tạo seminar mới'
                          ? 'bg-[#0D5A84] text-[#4EF7DC]'
                          : 'text-white/90'
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      <span>{child}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
