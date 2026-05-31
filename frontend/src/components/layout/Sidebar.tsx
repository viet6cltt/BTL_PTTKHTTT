import {
  BookOpen,
  Calendar,
  ClipboardList,
  LogOut,
  Plane,
  Truck,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { TabType } from '../../App'

type SidebarProps = {
  activeChild: string
  currentTab: TabType
  onChangeTab: (tab: TabType) => void
}

export function Sidebar({ currentTab, onChangeTab }: SidebarProps) {
  const { user, logout } = useAuth()

  if (!user) return null

  // Determine available sidebar items based on role
  const isBooking = user.role === 'BOOKING_STAFF' || user.role === 'ADMIN'
  const isCoordinator = user.role === 'LOGISTICS_COORDINATOR' || user.role === 'ADMIN'
  const isConsultant = user.role === 'CONSULTANT'
  const isMaterials = user.role === 'MATERIALS_STAFF' || user.role === 'ADMIN'

  return (
    <aside className="bg-[#093C5D] text-white shadow-2xl lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:w-[270px] flex flex-col justify-between">
      <div>
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

        <nav className="space-y-4 px-4 py-8">
          {/* Section: Overview */}
          <div className="space-y-1">
            <p className="px-4 text-[10px] font-black uppercase tracking-wider text-white/40 mb-2">Seminar Booking</p>
            <button
              type="button"
              onClick={() => onChangeTab('LIST')}
              className={`flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-[15px] transition text-left ${
                currentTab === 'LIST' || currentTab === 'DETAIL'
                  ? 'border-l-4 border-[#5DF8D8] bg-[#0D5A84]/80 text-[#5DF8D8] shadow-lg shadow-cyan-950/20 font-bold'
                  : 'text-white/90 hover:bg-white/10 font-semibold'
              }`}
            >
              <Calendar className="h-5.5 w-5.5 shrink-0" />
              <span>Danh sách seminar</span>
            </button>

            {isBooking && (
              <button
                type="button"
                onClick={() => onChangeTab('CREATE')}
                className={`flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-[15px] transition text-left ${
                  currentTab === 'CREATE'
                    ? 'border-l-4 border-[#5DF8D8] bg-[#0D5A84]/80 text-[#5DF8D8] shadow-lg shadow-cyan-950/20 font-bold'
                    : 'text-white/90 hover:bg-white/10 font-semibold'
                }`}
              >
                <ClipboardList className="h-5.5 w-5.5 shrink-0" />
                <span>Tạo seminar mới</span>
              </button>
            )}
          </div>

          {/* Section: Consultant Travel */}
          {isConsultant && (
            <div className="space-y-1 pt-4 border-t border-white/10">
              <p className="px-4 text-[10px] font-black uppercase tracking-wider text-white/40 mb-2">Chuyên gia đào tạo</p>
              <button
                type="button"
                onClick={() => onChangeTab('MY_TRAVEL')}
                className={`flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-[15px] transition text-left ${
                  currentTab === 'MY_TRAVEL'
                    ? 'border-l-4 border-[#5DF8D8] bg-[#0D5A84]/80 text-[#5DF8D8] shadow-lg shadow-cyan-950/20 font-bold'
                    : 'text-white/90 hover:bg-white/10 font-semibold'
                }`}
              >
                <Plane className="h-5.5 w-5.5 shrink-0" />
                <span>Lịch trình của tôi</span>
              </button>
            </div>
          )}

          {/* Section: Logistics Fulfillment */}
          {(isMaterials || isCoordinator) && (
            <div className="space-y-1 pt-4 border-t border-white/10">
              <p className="px-4 text-[10px] font-black uppercase tracking-wider text-white/40 mb-2">Hậu cần & Vật tư</p>
              <button
                type="button"
                onClick={() => onChangeTab('ALL_MATERIALS')}
                className={`flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-[15px] transition text-left ${
                  currentTab === 'ALL_MATERIALS'
                    ? 'border-l-4 border-[#5DF8D8] bg-[#0D5A84]/80 text-[#5DF8D8] shadow-lg shadow-cyan-950/20 font-bold'
                    : 'text-white/90 hover:bg-white/10 font-semibold'
                }`}
              >
                <Truck className="h-5.5 w-5.5 shrink-0" />
                <span>Yêu cầu vận chuyển</span>
              </button>
            </div>
          )}
        </nav>
      </div>

      {/* Logout footer */}
      <div className="p-4 border-t border-white/10">
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 text-sm font-bold text-red-200 hover:bg-red-950/30 hover:text-red-100 transition"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span>Đăng xuất tài khoản</span>
        </button>
      </div>
    </aside>
  )
}
