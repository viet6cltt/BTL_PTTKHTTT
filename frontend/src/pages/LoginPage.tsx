import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { KeyRound, Mail, ShieldAlert, Sparkles, UserCheck } from 'lucide-react'

export function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const quickRoles = [
    { label: 'Booking Staff', email: 'booking1@training.com', role: 'BOOKING_STAFF', desc: 'Tạo seminar & phân công' },
    { label: 'Logistics Coordinator', email: 'coordinator@training.com', role: 'LOGISTICS_COORDINATOR', desc: 'Duyệt khách sạn, đặt vé xe, vật tư' },
    { label: 'Consultant', email: 'leminhtuan@gmail.com', role: 'CONSULTANT', desc: 'Chuyên gia xem lịch & ký duyệt' },
    { label: 'Materials Staff', email: 'materials@training.com', role: 'MATERIALS_STAFF', desc: 'Đóng gói & vận chuyển vật tư' },
    { label: 'System Admin', email: 'admin@training.com', role: 'ADMIN', desc: 'Quản trị hệ thống toàn quyền' },
  ]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return
    setIsSubmitting(true)
    setErrorMsg(null)
    try {
      await login(email, password)
    } catch (err: any) {
      setErrorMsg(err.message || 'Đăng nhập không thành công, vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleQuickLogin(targetEmail: string) {
    setEmail(targetEmail)
    setPassword('password')
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-radial from-[#F5FAFF] to-[#E2EFFF] p-4 text-[#18395F]">
      {/* Background blobs for advanced aesthetics */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-[#5DF8D8]/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-[#6A4BC3]/10 blur-3xl" />

      <div className="relative w-full max-w-[1000px] overflow-hidden rounded-3xl border border-white/60 bg-white/70 shadow-2xl backdrop-blur-xl transition-all duration-300 md:grid md:grid-cols-12">
        
        {/* Left column: Login form */}
        <div className="p-8 md:col-span-7 lg:p-12">
          <div className="flex items-center gap-2 text-sm font-extrabold tracking-wider uppercase text-[#126CB0]">
            <Sparkles className="h-5 w-5 text-[#5DF8D8]" strokeWidth={2.5} />
            Hệ thống Quản lý Logistics Đào tạo
          </div>
          
          <h1 className="mt-4 text-3xl font-black tracking-tight text-[#0B3970] lg:text-4xl">
            Đăng nhập hệ thống
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Vui lòng nhập tài khoản được cấp để tiếp tục công việc.
          </p>

          {errorMsg && (
            <div className="mt-6 flex items-start gap-2 rounded-xl bg-red-50 p-4 text-xs font-bold text-red-600 border border-red-100">
              <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Email của bạn
              </label>
              <div className="relative mt-2">
                <Mail className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pr-4 pl-11 text-sm font-semibold outline-hidden transition focus:border-[#126CB0] focus:ring-2 focus:ring-[#126CB0]/25"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Mật khẩu
                </label>
              </div>
              <div className="relative mt-2">
                <KeyRound className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pr-4 pl-11 text-sm font-semibold outline-hidden transition focus:border-[#126CB0] focus:ring-2 focus:ring-[#126CB0]/25"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center rounded-xl bg-[#0B3970] py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-900/25 transition-all hover:bg-[#126CB0] hover:shadow-xl hover:shadow-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            >
              {isSubmitting ? 'Đang xác thực...' : 'Đăng nhập ngay'}
            </button>
          </form>
        </div>

        {/* Right column: Quick demo login selection */}
        <div className="border-t border-slate-200/50 bg-[#F5FAFF]/60 p-8 md:col-span-5 md:border-t-0 md:border-l lg:p-10">
          <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#3B7597]">
            <UserCheck className="h-4.5 w-4.5 text-[#126CB0]" />
            Chế độ thử nghiệm nhanh
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Click vào một vai trò dưới đây để điền nhanh thông tin tài khoản demo (mật khẩu mặc định là <code className="rounded-md bg-slate-200 px-1 py-0.5 font-bold">password</code>).
          </p>

          <div className="mt-6 space-y-3.5">
            {quickRoles.map((qr) => (
              <button
                key={qr.role}
                type="button"
                onClick={() => handleQuickLogin(qr.email)}
                className={`flex w-full flex-col items-start rounded-xl border p-3.5 text-left transition-all ${
                  email === qr.email
                    ? 'border-[#5DF8D8] bg-[#EBFDFA] ring-2 ring-[#5DF8D8]/30 shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-extrabold text-[#0B3970]">{qr.label}</span>
                  <span className="rounded-sm bg-slate-100 px-1.5 py-0.5 text-[9px] font-black text-slate-500">
                    {qr.role}
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-slate-400">{qr.email}</div>
                <div className="mt-1.5 text-[10px] font-semibold text-slate-500">{qr.desc}</div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
