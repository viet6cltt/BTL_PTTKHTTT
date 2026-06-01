import {
  CalendarPlus,
  CheckCircle2,
  Clock3,
  FileText,
  Lightbulb,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  UserRound,
  UsersRound,
  XCircle,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import { api } from '../api'

interface CreateSeminarPageProps {
  onSaveSuccess: () => void
  onCancel: () => void
}

export function CreateSeminarPage({ onSaveSuccess, onCancel }: CreateSeminarPageProps) {
  const [types, setTypes] = useState<any[]>([])
  const [consultants, setConsultants] = useState<any[]>([])
  
  const [selectedTypeId, setSelectedTypeId] = useState<number | ''>('')
  const [selectedConsultantId, setSelectedConsultantId] = useState<number | ''>('')
  
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [expectedTimeSlot, setExpectedTimeSlot] = useState<'FULL_DAY' | 'MORNING' | 'AFTERNOON'>('FULL_DAY')
  const [city, setCity] = useState('')
  const [anticipatedRegistrants, setAnticipatedRegistrants] = useState<number | ''>('')
  const [note, setNote] = useState('')

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Load lookup data
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)
        const [typesList, consultantsPage] = await Promise.all([
          api.getSeminarTypes(),
          api.getConsultants(),
        ])
        setTypes(typesList || [])
        setConsultants(consultantsPage?.content || [])
      } catch (err: any) {
        setErrorMsg('Không thể tải dữ liệu danh mục chuyên gia/loại học phần.')
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  // Dynamic preview info cards
  const selectedTypeInfo = types.find((t) => t.id === Number(selectedTypeId))
  const selectedConsultantInfo = consultants.find((c) => c.consultantId === Number(selectedConsultantId))

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedTypeId || !selectedConsultantId || !startDate || !endDate || !city || !anticipatedRegistrants) {
      setErrorMsg('Vui lòng điền đầy đủ các thông tin bắt buộc.')
      return
    }

    setIsSubmitting(true)
    setErrorMsg(null)
    try {
      await api.createSeminar({
        seminarTypeId: Number(selectedTypeId),
        consultantId: Number(selectedConsultantId),
        startDate,
        endDate,
        expectedTimeSlot,
        city,
        anticipatedRegistrants: Number(anticipatedRegistrants),
      })
      onSaveSuccess()
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi lưu thông tin seminar.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0B3970] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="relative mx-auto max-w-[1180px] space-y-8">
      <PageHeader
        title="Tạo seminar mới"
        description="Nhập thông tin đăng ký seminar từ bộ phận đào tạo"
        icon={<CalendarPlus className="h-10 w-10" strokeWidth={2.4} />}
      />

      {errorMsg && (
        <div className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-200 p-4 text-sm font-bold text-red-600">
          <XCircle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_355px]">
        
        {/* Left column: main form */}
        <form onSubmit={handleSave} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/70 space-y-7">
          <div className="flex items-center gap-3 text-[#0B3970] border-b border-slate-100 pb-4">
            <FileText className="h-6 w-6 text-[#126CB0]" />
            <h2 className="text-lg font-extrabold">Thông tin chi tiết học phần</h2>
          </div>

          <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
            
            {/* Seminar Type Select */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="seminarTypeId" className="text-xs font-black uppercase tracking-wider text-slate-500">
                Loại seminar *
              </label>
              <select
                id="seminarTypeId"
                required
                value={selectedTypeId}
                onChange={(e) => setSelectedTypeId(e.target.value ? Number(e.target.value) : '')}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-[#18395F] outline-hidden focus:border-[#1788A7] focus:ring-2 focus:ring-[#36F1D1]/25"
              >
                <option value="">Chọn loại seminar...</option>
                {types.map((t) => (
                  <option key={t.id} value={t.id}>{t.typeName}</option>
                ))}
              </select>
            </div>

            {/* Consultant Select */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="consultantId" className="text-xs font-black uppercase tracking-wider text-slate-500">
                Chuyên gia giảng dạy (Consultant) *
              </label>
              <select
                id="consultantId"
                required
                value={selectedConsultantId}
                onChange={(e) => setSelectedConsultantId(e.target.value ? Number(e.target.value) : '')}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-[#18395F] outline-hidden focus:border-[#1788A7] focus:ring-2 focus:ring-[#36F1D1]/25"
              >
                <option value="">Chọn chuyên gia...</option>
                {consultants.map((c) => (
                  <option key={c.consultantId} value={c.consultantId}>{c.fullName}</option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="startDate" className="text-xs font-black uppercase tracking-wider text-slate-500">
                Ngày bắt đầu *
              </label>
              <input
                id="startDate"
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-[#18395F] outline-hidden focus:border-[#1788A7] focus:ring-2 focus:ring-[#36F1D1]/25"
              />
            </div>

            {/* End Date */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="endDate" className="text-xs font-black uppercase tracking-wider text-slate-500">
                Ngày kết thúc *
              </label>
              <input
                id="endDate"
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-[#18395F] outline-hidden focus:border-[#1788A7] focus:ring-2 focus:ring-[#36F1D1]/25"
              />
            </div>

            {/* Expected TimeSlot */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="timeSlot" className="text-xs font-black uppercase tracking-wider text-slate-500">
                Khung giờ học dự kiến *
              </label>
              <select
                id="timeSlot"
                required
                value={expectedTimeSlot}
                onChange={(e) => setExpectedTimeSlot(e.target.value as any)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-[#18395F] outline-hidden focus:border-[#1788A7] focus:ring-2 focus:ring-[#36F1D1]/25"
              >
                <option value="FULL_DAY">Cả ngày (Sáng + Chiều)</option>
                <option value="MORNING">Chỉ buổi sáng</option>
                <option value="AFTERNOON">Chỉ buổi chiều</option>
              </select>
            </div>

            {/* City Location */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="city" className="text-xs font-black uppercase tracking-wider text-slate-500">
                Thành phố tổ chức *
              </label>
              <input
                id="city"
                type="text"
                required
                placeholder="Ví dụ: Hà Nội, TP. Hồ Chí Minh, Đà Nẵng..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-[#18395F] outline-hidden focus:border-[#1788A7] focus:ring-2 focus:ring-[#36F1D1]/25"
              />
            </div>

            {/* Anticipated Registrants */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="anticipated" className="text-xs font-black uppercase tracking-wider text-slate-500">
                Số học viên dự kiến *
              </label>
              <input
                id="anticipated"
                type="number"
                required
                min={1}
                placeholder="Ví dụ: 50"
                value={anticipatedRegistrants}
                onChange={(e) => setAnticipatedRegistrants(e.target.value ? Number(e.target.value) : '')}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-[#18395F] outline-hidden focus:border-[#1788A7] focus:ring-2 focus:ring-[#36F1D1]/25"
              />
            </div>

            {/* Note */}
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <label htmlFor="note" className="text-xs font-black uppercase tracking-wider text-slate-500">
                Ghi chú nội bộ
              </label>
              <textarea
                id="note"
                rows={3}
                placeholder="Yêu cầu đặc biệt về phòng ốc, thiết bị dạy học..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full resize-y rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-[#18395F] outline-hidden focus:border-[#1788A7] focus:ring-2 focus:ring-[#36F1D1]/25"
              />
            </div>

          </div>

          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={onCancel}
              className="h-12 min-w-24 rounded-lg border border-slate-300 bg-white px-6 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-12 min-w-36 items-center justify-center gap-2 rounded-lg bg-[#26E6CA] px-6 text-sm font-extrabold text-[#06466A] shadow-lg shadow-teal-200/70 transition hover:bg-[#1DD7BE] disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
            >
              <CheckCircle2 className="h-5 w-5 fill-[#06466A] text-[#26E6CA]" />
              {isSubmitting ? 'Đang tạo...' : 'Lưu seminar'}
            </button>
          </div>
        </form>

        {/* Right column: auxiliary preview panels */}
        <aside className="space-y-5 xl:pt-0">
          <SeminarTypeCard info={selectedTypeInfo} />
          <ConsultantCard info={selectedConsultantInfo} />
          <NoticeCard />
        </aside>
      </div>
    </div>
  )
}

function SeminarTypeCard({ info }: { info?: any }) {
  return (
    <AsideCard
      title="Học phần giảng dạy"
      icon={<Lightbulb className="h-5 w-5" />}
      highlighted
    >
      {info ? (
        <div className="space-y-5 text-left">
          <div>
            <h3 className="text-base font-extrabold text-[#092F5A]">{info.typeName}</h3>
            <p className="mt-2 text-xs font-medium leading-6 text-slate-500">
              {info.description || 'Chưa có mô tả học phần.'}
            </p>
          </div>
          <div className="grid gap-4 text-xs text-slate-600">
            <DetailRow
              icon={<Clock3 className="h-5 w-5" />}
              title="Thời lượng chương trình"
              description={`${info.durationHours} giờ thực hành`}
            />
            <DetailRow
              icon={<UsersRound className="h-5 w-5" />}
              title="Bố trí chỗ ngồi tham khảo"
              description={info.arrangementNotes || 'Theo chuẩn phòng LAB'}
            />
          </div>
        </div>
      ) : (
        <EmptyAsideState message="Chọn loại học phần để xem mô tả" />
      )}
    </AsideCard>
  )
}

function ConsultantCard({ info }: { info?: any }) {
  return (
    <AsideCard
      title="Thông tin chuyên gia"
      icon={<UserRound className="h-5 w-5" />}
    >
      {info ? (
        <div className="flex gap-4 text-left">
          <div className="relative h-14 w-14 shrink-0 rounded-full overflow-hidden border border-[#38D9CD] bg-[#CFFFF7] text-[#257AB7] shadow-inner">
            {info.avatarUrl ? (
              <img
                src={`http://localhost:8080/api/v1/facility-contracts/view-file?path=${encodeURIComponent(info.avatarUrl)}`}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full w-full place-items-center">
                <User className="h-10 w-10 fill-[#257AB7]/20 stroke-[#257AB7]" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-extrabold text-[#092F5A]">{info.fullName}</h3>
            <span className="mt-2 inline-flex rounded-full bg-[#DFFFF9] px-3 py-1 text-[10px] font-extrabold text-[#009C8E]">
              {info.specialty || 'Chuyên gia Đào tạo'}
            </span>
            <div className="mt-4 space-y-2.5 text-xs font-medium text-slate-500">
              <p className="flex items-center gap-2.5">
                <Phone className="h-3.5 w-3.5 text-[#156DB2]" />
                {info.phone}
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="h-3.5 w-3.5 text-[#156DB2]" />
                <span className="truncate">{info.email}</span>
              </p>
              <p className="flex items-center gap-2.5">
                <MapPin className="h-3.5 w-3.5 text-[#156DB2]" />
                {info.city}, {info.country}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <EmptyAsideState message="Chọn chuyên gia đào tạo để xem lý lịch" />
      )}
    </AsideCard>
  )
}

function NoticeCard() {
  return (
    <AsideCard
      title="Lưu ý quan trọng"
      icon={
        <span className="grid h-5 w-5 place-items-center rounded-full bg-[#1679B7] text-[11px] font-bold text-white">
          i
        </span>
      }
      highlighted
    >
      <div className="flex gap-3 text-left">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#E2FFFA] text-[#00A995]">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <p className="text-xs font-medium leading-6 text-slate-500">
          Chuyên gia không thể nhận hai lịch giảng dạy chồng chéo ngày tổ chức. Hệ thống sẽ tự động xác thực tính khả dụng trước khi xác nhận.
        </p>
      </div>
    </AsideCard>
  )
}

function AsideCard({
  title,
  icon,
  highlighted = false,
  children,
}: {
  title: string
  icon: React.ReactNode
  highlighted?: boolean
  children: React.ReactNode
}) {
  return (
    <section
      className={`overflow-hidden rounded-2xl border bg-white shadow-xl shadow-slate-200/70 ${
        highlighted ? 'border-[#A7F3E9]' : 'border-slate-200'
      }`}
    >
      <div
        className={`flex items-center gap-3 border-b px-6 py-4 ${
          highlighted
            ? 'border-[#A7F3E9] bg-[#E8FFFB]'
            : 'border-slate-100 bg-white'
        }`}
      >
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#EFFDFF] text-[#156DB2] shadow-sm shadow-sky-100">
          {icon}
        </div>
        <h2 className="text-base font-extrabold text-[#092F5A]">{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </section>
  )
}

function DetailRow({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex gap-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#E8FFFB] text-[#156DB2]">
        {icon}
      </div>
      <div>
        <p className="font-extrabold text-[#092F5A]">{title}</p>
        <p className="mt-1 leading-5 text-slate-500">{description}</p>
      </div>
    </div>
  )
}

function EmptyAsideState({ message }: { message: string }) {
  return (
    <div className="grid place-items-center rounded-xl border border-dashed border-slate-300 bg-[#F8FBFF] px-5 py-6 text-center">
      <UserRound className="mb-2 h-6 w-6 text-slate-400" />
      <p className="text-xs font-semibold text-slate-400">{message}</p>
    </div>
  )
}
