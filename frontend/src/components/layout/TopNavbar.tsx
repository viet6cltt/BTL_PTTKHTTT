import { useState, useEffect } from 'react'
import {
  Bell,
  HelpCircle,
  LogOut,
  Menu,
  User,
  AlertTriangle,
  FileText,
  Navigation,
  Info,
  Check,
  Clock,
  Sparkles
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { ProfileModal } from './ProfileModal'
import { NotificationItem, addNotification } from '../../utils/notificationHelper'

const LIVE_OVERDUE_NOTIFICATION_KEY = 'live_overdue_notification_seminar_3_sent'
const LIVE_OVERDUE_NOTIFICATION_TITLE = 'CẢNH BÁO: Thêm 1 Seminar quá hạn mới!'
const LIVE_OVERDUE_NOTIFICATION_BODY =
  'Hệ thống quét phát hiện Seminar #3 "Quản trị rủi ro chuỗi cung ứng" đã quá hạn xử lý địa điểm giảng dạy!'

export function TopNavbar() {
  const { user, logout } = useAuth()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [notifFilter, setNotifFilter] = useState<'ALL' | 'UNREAD'>('ALL')
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  if (!user) return null

  // Format display roles nicely
  const displayRoles: Record<string, string> = {
    BOOKING_STAFF: 'Bộ phận Booking',
    LOGISTICS_COORDINATOR: 'Điều phối viên Logistics',
    CONSULTANT: 'Chuyên gia Đào tạo',
    MATERIALS_STAFF: 'Nhân viên Vật tư',
    ADMIN: 'Quản trị viên',
  }

  // Initialize role-specific notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const raw = localStorage.getItem('app_notifications')
    if (raw) {
      const parsed = JSON.parse(raw) as NotificationItem[]
      return parsed.filter(n => n.role === 'ALL' || n.role === user.role)
    }
    
    // Default list
    const defaults: NotificationItem[] = [
      {
        id: '1',
        title: 'CẢNH BÁO: Quá hạn phân công điều phối!',
        body: 'Seminar #1 "Kỹ năng bán hàng và đàm phán" đã quá hạn xử lý công tác hậu cần (quá 5 ngày quy định). Vui lòng phân công ngay!',
        timestamp: '3 phút trước',
        type: 'overdue',
        isRead: false,
        role: 'LOGISTICS_COORDINATOR',
        link: { tab: 'DETAIL', seminarId: 1 }
      },
      {
        id: '2',
        title: 'Hợp đồng phòng học đang chờ duyệt giá',
        body: 'Hợp đồng thuê hội trường ZZZ (Seminar #3) đã được tải lên bản nháp. Đang chờ điều phối viên rà soát duyệt giá trị hợp đồng.',
        timestamp: '2 giờ trước',
        type: 'contract',
        isRead: false,
        role: 'LOGISTICS_COORDINATOR',
        link: { tab: 'DETAIL', seminarId: 3 }
      },
      {
        id: '3',
        title: 'Chuyên gia xác nhận lịch trình',
        body: 'Chuyên gia Lê Minh Tuấn đã xác nhận thành công vé máy bay chặng đi Hà Nội cho Seminar #1.',
        timestamp: '1 ngày trước',
        type: 'travel',
        isRead: true,
        role: 'LOGISTICS_COORDINATOR',
        link: { tab: 'DETAIL', seminarId: 1 }
      },
      {
        id: '4',
        title: 'Nhân viên vật tư hoàn thành giao nhận',
        body: 'Nhân viên vật tư đã cập nhật trạng thái "Hoàn thành chuẩn bị vật tư" cho Seminar #1.',
        timestamp: '2 ngày trước',
        type: 'material',
        isRead: true,
        role: 'LOGISTICS_COORDINATOR',
        link: { tab: 'DETAIL', seminarId: 1 }
      },
      {
        id: 'c1',
        title: 'Yêu cầu xác nhận chặng di chuyển mới',
        body: 'Phòng hậu cần đã đặt vé máy bay chặng đi Hà Nội cho bạn (Seminar #1). Vui lòng kiểm tra và xác nhận chặng đi.',
        timestamp: '5 phút trước',
        type: 'travel',
        isRead: false,
        role: 'CONSULTANT',
        link: { tab: 'MY_TRAVEL' }
      },
      {
        id: 'c2',
        title: 'Phòng lưu trú đã đặt thành công',
        body: 'Phòng họp tại facility Mường Thanh Hà Nội đã được giữ chỗ từ ngày 31/05 - 01/06.',
        timestamp: '4 giờ trước',
        type: 'contract',
        isRead: false,
        role: 'CONSULTANT',
        link: { tab: 'MY_TRAVEL' }
      },
      {
        id: 'g1',
        title: 'Chào mừng bạn trở lại',
        body: 'Chúc bạn có một ngày làm việc hiệu quả và quản lý lớp học tối ưu!',
        timestamp: 'Vừa xong',
        type: 'general',
        isRead: false,
        role: 'ALL',
        link: { tab: 'LIST' }
      }
    ]
    localStorage.setItem('app_notifications', JSON.stringify(defaults))
    return defaults.filter(n => n.role === 'ALL' || n.role === user.role)
  })

  // Listen for changes in localStorage notifications
  useEffect(() => {
    function handleUpdate() {
      if (!user) return
      const raw = localStorage.getItem('app_notifications')
      if (raw) {
        const parsed = JSON.parse(raw) as NotificationItem[]
        const filtered = parsed.filter(n => n.role === 'ALL' || n.role === user.role)
        setNotifications(filtered)
      }
    }
    window.addEventListener('notifications-updated', handleUpdate)
    return () => window.removeEventListener('notifications-updated', handleUpdate)
  }, [user?.role])

  // Simulated live event feed (adds dynamic feel to the app)
  useEffect(() => {
    if (user.role !== 'LOGISTICS_COORDINATOR' && user.role !== 'ADMIN') return
    if (localStorage.getItem(LIVE_OVERDUE_NOTIFICATION_KEY) === 'true') return

    const raw = localStorage.getItem('app_notifications')
    if (raw) {
      const parsed = JSON.parse(raw) as NotificationItem[]
      const alreadySent = parsed.some(
        (item) =>
          item.type === 'overdue' &&
          item.title === LIVE_OVERDUE_NOTIFICATION_TITLE &&
          item.body === LIVE_OVERDUE_NOTIFICATION_BODY,
      )
      if (alreadySent) {
        localStorage.setItem(LIVE_OVERDUE_NOTIFICATION_KEY, 'true')
        return
      }
    }

    const timer = setTimeout(() => {
      localStorage.setItem(LIVE_OVERDUE_NOTIFICATION_KEY, 'true')
      addNotification({
        title: LIVE_OVERDUE_NOTIFICATION_TITLE,
        body: LIVE_OVERDUE_NOTIFICATION_BODY,
        type: 'overdue',
        role: 'LOGISTICS_COORDINATOR',
        link: { tab: 'DETAIL', seminarId: 3 }
      })
      setToastMsg('Cảnh báo mới: Có seminar vừa quá hạn địa điểm cần xử lý ngay!')
    }, 20000)

    return () => clearTimeout(timer)
  }, [user.role])

  // Clear toast after 5 seconds
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [toastMsg])

  const unreadCount = notifications.filter((n) => !n.isRead).length
  const displayedNotifications = notifications.filter((n) => {
    if (notifFilter === 'UNREAD') return !n.isRead
    return true
  })

  const markAllAsRead = () => {
    try {
      const raw = localStorage.getItem('app_notifications')
      if (raw) {
        const parsed = JSON.parse(raw) as NotificationItem[]
        const updated = parsed.map(n => {
          if (n.role === user.role || n.role === 'ALL') {
            return { ...n, isRead: true }
          }
          return n
        })
        localStorage.setItem('app_notifications', JSON.stringify(updated))
        window.dispatchEvent(new Event('notifications-updated'))
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleNotifClick = (notif: NotificationItem) => {
    try {
      const raw = localStorage.getItem('app_notifications')
      if (raw) {
        const parsed = JSON.parse(raw) as NotificationItem[]
        const updated = parsed.map(n => n.id === notif.id ? { ...n, isRead: true } : n)
        localStorage.setItem('app_notifications', JSON.stringify(updated))
        window.dispatchEvent(new Event('notifications-updated'))
      }
    } catch (e) {
      console.error(e)
    }
    setIsNotifOpen(false)

    // Trigger app navigation using the decoupled Custom Event
    window.dispatchEvent(
      new CustomEvent('app-navigate', {
        detail: {
          tab: notif.link.tab,
          seminarId: notif.link.seminarId || null,
          seminarTypeId: notif.link.seminarTypeId || null,
        },
      })
    )
  }

  const getNotifIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'overdue':
        return (
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-500 border border-rose-100 shadow-sm">
            <AlertTriangle className="h-5 w-5" />
          </div>
        )
      case 'contract':
        return (
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-purple-50 text-purple-500 border border-purple-100 shadow-sm">
            <FileText className="h-5 w-5" />
          </div>
        )
      case 'travel':
        return (
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-500 border border-teal-100 shadow-sm">
            <Navigation className="h-5 w-5" />
          </div>
        )
      case 'material':
        return (
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-500 border border-indigo-100 shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
        )
      default:
        return (
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-500 border border-sky-100 shadow-sm">
            <Info className="h-5 w-5" />
          </div>
        )
    }
  }

  return (
    <header className="sticky top-0 z-20 flex h-22 items-center bg-gradient-to-r from-[#093C5D] to-[#3B7597] px-9 text-white shadow-lg shadow-slate-900/15">
      
      {/* Toast Alert Popover */}
      {toastMsg && (
        <div className="fixed left-1/2 top-4 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-extrabold text-amber-900 shadow-2xl animate-bounce">
          <AlertTriangle className="h-5 w-5 text-amber-600 animate-pulse" />
          <span>{toastMsg}</span>
          <button
            type="button"
            onClick={() => setToastMsg(null)}
            className="rounded-lg bg-amber-100 p-1 text-amber-700 hover:bg-amber-200"
          >
            <Check className="h-4 w-4" />
          </button>
        </div>
      )}

      <button
        type="button"
        aria-label="Mở menu"
        className="grid h-11 w-11 place-items-center rounded-lg text-white transition hover:bg-white/10"
      >
        <Menu className="h-8 w-8" />
      </button>

      <div className="ml-auto flex items-center gap-5">
        
        {/* Notifications Popover Section */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            aria-label="Thông báo"
            className={`relative grid h-11 w-11 place-items-center rounded-full transition ${
              isNotifOpen ? 'bg-white/15' : 'hover:bg-white/10'
            }`}
          >
            <Bell className={`h-7 w-7 ${unreadCount > 0 ? 'animate-swing' : ''}`} />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-6 w-6 place-items-center rounded-full bg-[#39E8CF] text-xs font-black text-[#093C5D] shadow-md shadow-cyan-900/40 animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <>
              {/* Overlay Backdrop to Close on Outside Click */}
              <div
                className="fixed inset-0 z-30 cursor-default"
                onClick={() => setIsNotifOpen(false)}
              />

              {/* Notification Dialog Container */}
              <div className="absolute right-0 top-14 z-40 w-[380px] rounded-2xl border border-white/20 bg-white/98 p-4 text-slate-800 shadow-2xl shadow-slate-900/35 ring-1 ring-slate-900/10 backdrop-blur-md animate-fade-in text-left">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-black text-[#093C5D] flex items-center gap-1.5">
                    Thông báo
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-black text-rose-600">
                        {unreadCount} mới
                      </span>
                    )}
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="text-xs font-black text-[#156DB2] hover:text-[#0b3970] transition flex items-center gap-1"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Đọc tất cả
                    </button>
                  )}
                </div>

                {/* Filter Tabs */}
                <div className="mt-3 flex gap-2 border-b border-slate-100 pb-2">
                  <button
                    type="button"
                    onClick={() => setNotifFilter('ALL')}
                    className={`rounded-lg px-3 py-1 text-xs font-black transition ${
                      notifFilter === 'ALL'
                        ? 'bg-[#E9FFFB] text-[#007E73]'
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    Tất cả
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotifFilter('UNREAD')}
                    className={`rounded-lg px-3 py-1 text-xs font-black transition ${
                      notifFilter === 'UNREAD'
                        ? 'bg-[#E9FFFB] text-[#007E73]'
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    Chưa đọc
                  </button>
                </div>

                {/* Notification Items List */}
                <div className="max-h-[350px] overflow-y-auto space-y-2.5 pr-1 mt-3 custom-scrollbar">
                  {displayedNotifications.length > 0 ? (
                    displayedNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleNotifClick(notif)}
                        className={`group flex gap-3 p-3 rounded-xl border transition cursor-pointer relative text-left ${
                          !notif.isRead
                            ? 'bg-sky-50/40 border-sky-100 hover:border-[#38D9CD] hover:bg-white'
                            : 'bg-white border-slate-100 hover:bg-slate-50/40 hover:border-slate-200'
                        } ${notif.type === 'overdue' && !notif.isRead ? 'border-rose-100 bg-rose-50/20' : ''}`}
                      >
                        {getNotifIcon(notif.type)}
                        <div className="min-w-0 flex-1">
                          <h4 className={`text-xs font-black leading-tight text-slate-800 group-hover:text-[#156DB2] transition ${
                            notif.type === 'overdue' ? 'text-rose-950' : ''
                          }`}>
                            {notif.title}
                          </h4>
                          <p className="mt-1 text-[11px] font-bold text-slate-500 leading-relaxed line-clamp-2">
                            {notif.body}
                          </p>
                          <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                            <Clock className="h-3 w-3" />
                            <span>{notif.timestamp}</span>
                          </div>
                        </div>

                        {/* Unread Indicator Pulse Dot */}
                        {!notif.isRead && (
                          <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400">
                      <Bell className="h-10 w-10 text-slate-300 stroke-1 mb-2" />
                      <p className="text-xs font-bold">Không có thông báo nào phù hợp.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label="Trợ giúp"
          className="grid h-11 w-11 place-items-center rounded-full transition hover:bg-white/10"
        >
          <HelpCircle className="h-8 w-8" />
        </button>

        <button
          type="button"
          onClick={() => setIsProfileOpen(true)}
          title="Thông tin cá nhân"
          className="flex items-center gap-3 pl-2 border-l border-white/15 cursor-pointer hover:bg-white/5 active:bg-white/10 p-1.5 rounded-xl transition text-left"
        >
          <div className="grid h-13 w-13 place-items-center rounded-full border-2 border-[#38D9CD] bg-white text-[#1C6692] overflow-hidden">
            <User className="h-9 w-9 fill-[#D8F8F3] stroke-[#1C6692]" />
          </div>
          <div className="hidden leading-tight sm:block text-left">
            <div className="text-sm font-bold flex items-center gap-1">
              {user.fullName}
            </div>
            <p className="mt-1 text-[11px] font-extrabold uppercase tracking-wider text-[#38D9CD]">
              {displayRoles[user.role] || user.role}
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={logout}
          title="Đăng xuất"
          className="grid h-10 w-10 place-items-center rounded-lg bg-white/10 text-white transition hover:bg-red-500/20 hover:text-red-200"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>

      {isProfileOpen && (
        <ProfileModal onClose={() => setIsProfileOpen(false)} />
      )}
    </header>
  )
}
