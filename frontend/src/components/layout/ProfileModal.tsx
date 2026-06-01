import { useState, useEffect } from 'react'
import {
  User,
  Phone,
  Mail,
  KeyRound,
  ShieldCheck,
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import { api } from '../../api'
import { useAuth } from '../../context/AuthContext'

interface ProfileModalProps {
  onClose: () => void
}

const displayRoles: Record<string, string> = {
  BOOKING_STAFF: 'Bộ phận Booking',
  LOGISTICS_COORDINATOR: 'Điều phối viên Logistics',
  CONSULTANT: 'Chuyên gia Đào tạo',
  MATERIALS_STAFF: 'Nhân viên Vật tư',
  ADMIN: 'Quản trị viên',
}

export function ProfileModal({ onClose }: ProfileModalProps) {
  const { updateUserFullName } = useAuth()
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'PASSWORD'>('PROFILE')
  
  // Tab 1: Profile States
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  
  // Tab 2: Password States
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // UX States
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Fetch current user details on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        setIsLoadingProfile(true)
        setErrorMsg(null)
        const profile = await api.getMyProfile()
        setFullName(profile.fullName)
        setPhone(profile.phone)
        setEmail(profile.email)
        setRole(profile.role)
      } catch (err: any) {
        setErrorMsg(err.message || 'Không thể tải thông tin cá nhân.')
      } finally {
        setIsLoadingProfile(false)
      }
    }
    void fetchProfile()
  }, [])

  // Handle Tab 1 profile submit
  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim() || !phone.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ Họ và tên và Số điện thoại.')
      return
    }
    
    try {
      setIsSubmitting(true)
      setErrorMsg(null)
      setSuccessMsg(null)
      const res = await api.updateMyProfile(fullName.trim(), phone.trim())
      updateUserFullName(res.fullName)
      setSuccessMsg('Cập nhật thông tin cá nhân thành công!')
    } catch (err: any) {
      setErrorMsg(err.message || 'Có lỗi xảy ra khi cập nhật thông tin.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Tab 2 password submit
  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrorMsg('Vui lòng điền đầy đủ thông tin mật khẩu.')
      return
    }
    if (newPassword.length < 8) {
      setErrorMsg('Mật khẩu mới phải từ 8 ký tự trở lên.')
      return
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không trùng khớp.')
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMsg(null)
      setSuccessMsg(null)
      await api.changePassword(oldPassword, newPassword)
      setSuccessMsg('Đổi mật khẩu tài khoản thành công!')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setErrorMsg(err.message || 'Có lỗi xảy ra khi đổi mật khẩu.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-md transition-all duration-300">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-950/20 border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-[#093C5D] to-[#3B7597] px-6 py-5 flex items-center justify-between text-white relative">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 backdrop-blur-md">
              <User className="h-5.5 w-5.5 text-[#38D9CD]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-wide">Cập nhật tài khoản</h2>
              <p className="text-[11px] font-semibold text-slate-200 mt-0.5">Quản lý hồ sơ cá nhân và bảo mật</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1.5 hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-slate-100 bg-slate-50/50 p-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('PROFILE')
              setErrorMsg(null)
              setSuccessMsg(null)
            }}
            className={`flex-1 py-2.5 text-xs font-black rounded-lg transition-all ${
              activeTab === 'PROFILE'
                ? 'bg-white text-[#0B3970] shadow-sm ring-1 ring-slate-100'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Thông tin cá nhân
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('PASSWORD')
              setErrorMsg(null)
              setSuccessMsg(null)
            }}
            className={`flex-1 py-2.5 text-xs font-black rounded-lg transition-all ${
              activeTab === 'PASSWORD'
                ? 'bg-white text-[#0B3970] shadow-sm ring-1 ring-slate-100'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Đổi mật khẩu
          </button>
        </div>

        {/* Status Alerts */}
        {(errorMsg || successMsg) && (
          <div className="px-6 pt-5">
            {errorMsg && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-150 bg-red-50/80 p-3.5 text-xs font-extrabold text-red-700 leading-5">
                <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="flex items-start gap-2.5 rounded-xl border border-emerald-150 bg-emerald-50/80 p-3.5 text-xs font-extrabold text-emerald-700 leading-5">
                <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-emerald-500" />
                <span>{successMsg}</span>
              </div>
            )}
          </div>
        )}

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoadingProfile ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-[#093C5D]" />
              <span className="text-xs font-bold">Đang tải thông tin cá nhân...</span>
            </div>
          ) : activeTab === 'PROFILE' ? (
            <form onSubmit={handleProfileSubmit} className="space-y-4 text-left">
              {/* Email (Read only) */}
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Địa chỉ Email</span>
                <div className="relative mt-2">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Mail className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="h-11 w-full rounded-xl border border-slate-100 bg-slate-50 px-4 pl-10 text-xs font-bold text-slate-400 cursor-not-allowed outline-hidden"
                  />
                </div>
                <p className="mt-1.5 text-[10px] font-semibold text-slate-400 leading-relaxed">Email được đăng ký bởi quản trị viên hệ thống và không thể thay đổi.</p>
              </div>

              {/* Role (Read only) */}
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Vai trò / Chức danh</span>
                <div className="relative mt-2">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <ShieldCheck className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="text"
                    value={displayRoles[role] || role}
                    disabled
                    className="h-11 w-full rounded-xl border border-slate-100 bg-slate-50 px-4 pl-10 text-xs font-bold text-slate-400 cursor-not-allowed outline-hidden"
                  />
                </div>
              </div>

              {/* Full Name (Editable) */}
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Họ và tên *</span>
                <div className="relative mt-2">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <User className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Nhập họ và tên..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 pl-10 text-xs font-bold text-[#18395F] outline-hidden transition placeholder:text-slate-400 focus:border-[#126CB0] focus:ring-2 focus:ring-[#126CB0]/10"
                  />
                </div>
              </div>

              {/* Phone (Editable) */}
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Số điện thoại *</span>
                <div className="relative mt-2">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Phone className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="Nhập số điện thoại..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 pl-10 text-xs font-bold text-[#18395F] outline-hidden transition placeholder:text-slate-400 focus:border-[#126CB0] focus:ring-2 focus:ring-[#126CB0]/10"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 h-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-600 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B3970] px-5 text-xs font-extrabold text-white transition hover:bg-[#126CB0] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    'Lưu thông tin'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4 text-left">
              {/* Old Password */}
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Mật khẩu hiện tại *</span>
                <div className="relative mt-2">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <KeyRound className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 pl-10 text-xs font-bold text-[#18395F] outline-hidden transition placeholder:text-slate-400 focus:border-[#126CB0] focus:ring-2 focus:ring-[#126CB0]/10"
                  />
                </div>
              </div>

              {/* New Password */}
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Mật khẩu mới *</span>
                <div className="relative mt-2">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <KeyRound className="h-4.5 w-4.5 text-[#126CB0]" />
                  </span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Tối thiểu 8 ký tự..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 pl-10 text-xs font-bold text-[#18395F] outline-hidden transition placeholder:text-slate-400 focus:border-[#126CB0] focus:ring-2 focus:ring-[#126CB0]/10"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Xác nhận mật khẩu mới *</span>
                <div className="relative mt-2">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <KeyRound className="h-4.5 w-4.5 text-[#126CB0]" />
                  </span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Nhập lại mật khẩu mới..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 pl-10 text-xs font-bold text-[#18395F] outline-hidden transition placeholder:text-slate-400 focus:border-[#126CB0] focus:ring-2 focus:ring-[#126CB0]/10"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 h-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-600 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B3970] px-5 text-xs font-extrabold text-white transition hover:bg-[#126CB0] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang đổi...
                    </>
                  ) : (
                    'Đổi mật khẩu'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
