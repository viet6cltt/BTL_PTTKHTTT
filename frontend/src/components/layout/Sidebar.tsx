import {
  BookOpen,
  Calendar,
  ClipboardList,
  Database,
  LogOut,
  Plane,
  Truck,
} from 'lucide-react'
import type { TabType } from '../../App'
import { useAuth } from '../../context/AuthContext'

type SidebarProps = {
  currentTab: TabType
  onChangeTab: (tab: TabType) => void
}

export function Sidebar({ currentTab, onChangeTab }: SidebarProps) {
  const { user, logout } = useAuth()

  if (!user) return null

  const isBooking = user.role === 'BOOKING_STAFF' || user.role === 'ADMIN'
  const isCoordinator = user.role === 'LOGISTICS_COORDINATOR' || user.role === 'ADMIN'
  const isConsultant = user.role === 'CONSULTANT'
  const isMaterials = user.role === 'MATERIALS_STAFF' || user.role === 'ADMIN'
  const canManageMasterData = user.role === 'ADMIN'

  return (
    <aside className="flex flex-col justify-between bg-[#093C5D] text-white shadow-2xl lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:w-[270px]">
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
          <div className="space-y-1">
            <p className="mb-2 px-4 text-[10px] font-black uppercase tracking-wider text-white/40">
              Seminar Booking
            </p>
            <button
              type="button"
              onClick={() => onChangeTab('LIST')}
              className={`flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left text-[15px] transition ${
                currentTab === 'LIST' || currentTab === 'DETAIL'
                  ? 'border-l-4 border-[#5DF8D8] bg-[#0D5A84]/80 font-bold text-[#5DF8D8] shadow-lg shadow-cyan-950/20'
                  : 'font-semibold text-white/90 hover:bg-white/10'
              }`}
            >
              <Calendar className="h-5.5 w-5.5 shrink-0" />
              <span>Danh sách seminar</span>
            </button>

            {isBooking && (
              <button
                type="button"
                onClick={() => onChangeTab('CREATE')}
                className={`flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left text-[15px] transition ${
                  currentTab === 'CREATE'
                    ? 'border-l-4 border-[#5DF8D8] bg-[#0D5A84]/80 font-bold text-[#5DF8D8] shadow-lg shadow-cyan-950/20'
                    : 'font-semibold text-white/90 hover:bg-white/10'
                }`}
              >
                <ClipboardList className="h-5.5 w-5.5 shrink-0" />
                <span>Tạo seminar mới</span>
              </button>
            )}
          </div>

          {canManageMasterData && (
            <div className="space-y-1 border-t border-white/10 pt-4">
              <p className="mb-2 px-4 text-[10px] font-black uppercase tracking-wider text-white/40">
                Quản trị hệ thống
              </p>
              <button
                type="button"
                onClick={() => onChangeTab('MASTER_DATA')}
                className={`flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left text-[15px] transition ${
                  currentTab === 'MASTER_DATA'
                    ? 'border-l-4 border-[#5DF8D8] bg-[#0D5A84]/80 font-bold text-[#5DF8D8] shadow-lg shadow-cyan-950/20'
                    : 'font-semibold text-white/90 hover:bg-white/10'
                }`}
              >
                <Database className="h-5.5 w-5.5 shrink-0" />
                <span>Master data</span>
              </button>
            </div>
          )}

          {isConsultant && (
            <div className="space-y-1 border-t border-white/10 pt-4">
              <p className="mb-2 px-4 text-[10px] font-black uppercase tracking-wider text-white/40">
                Chuyên gia đào tạo
              </p>
              <button
                type="button"
                onClick={() => onChangeTab('MY_TRAVEL')}
                className={`flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left text-[15px] transition ${
                  currentTab === 'MY_TRAVEL'
                    ? 'border-l-4 border-[#5DF8D8] bg-[#0D5A84]/80 font-bold text-[#5DF8D8] shadow-lg shadow-cyan-950/20'
                    : 'font-semibold text-white/90 hover:bg-white/10'
                }`}
              >
                <Plane className="h-5.5 w-5.5 shrink-0" />
                <span>Lịch trình của tôi</span>
              </button>
            </div>
          )}

          {(isMaterials || isCoordinator) && (
            <div className="space-y-1 border-t border-white/10 pt-4">
              <p className="mb-2 px-4 text-[10px] font-black uppercase tracking-wider text-white/40">
                Hậu cần & Vật tư
              </p>
              <button
                type="button"
                onClick={() => onChangeTab('ALL_MATERIALS')}
                className={`flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left text-[15px] transition ${
                  currentTab === 'ALL_MATERIALS'
                    ? 'border-l-4 border-[#5DF8D8] bg-[#0D5A84]/80 font-bold text-[#5DF8D8] shadow-lg shadow-cyan-950/20'
                    : 'font-semibold text-white/90 hover:bg-white/10'
                }`}
              >
                <Truck className="h-5.5 w-5.5 shrink-0" />
                <span>Yêu cầu vận chuyển</span>
              </button>
            </div>
          )}
        </nav>
      </div>

      <div className="border-t border-white/10 p-4">
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 text-sm font-bold text-red-200 transition hover:bg-red-950/30 hover:text-red-100"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span>Đăng xuất tài khoản</span>
        </button>
      </div>
    </aside>
  )
}
