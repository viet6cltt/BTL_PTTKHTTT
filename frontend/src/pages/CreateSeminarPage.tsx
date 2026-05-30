import {
  CalendarPlus,
  CheckCircle2,
  FileText,
  Lightbulb,
  Mail,
  MapPin,
  Phone,
  Save,
  User,
  UserRound,
} from 'lucide-react'
import {
  consultants,
  employees,
  seminarTypes,
} from '../data/seminarOptions'
import { CityField } from '../components/form/CityField'
import { DateField } from '../components/form/DateField'
import { FieldShell } from '../components/form/FieldShell'
import { InputField } from '../components/form/InputField'
import { NumberField } from '../components/form/NumberField'
import { SelectField } from '../components/form/SelectField'
import { InfoCard } from '../components/info/InfoCard'
import { PageHeader } from '../components/layout/PageHeader'
import { Sidebar } from '../components/layout/Sidebar'
import { TopNavbar } from '../components/layout/TopNavbar'

const seminarOverview = [
  { label: 'Kỹ năng mềm', value: '45%', color: '#257AB7' },
  { label: 'Chuyên môn', value: '35%', color: '#2F91CF' },
  { label: 'Quản lý', value: '15%', color: '#41E7D0' },
  { label: 'Khác', value: '5%', color: '#B9E9E1' },
]

export function CreateSeminarPage() {
  return (
    <div className="min-h-screen bg-[#F5FAFF] font-sans text-[#18395F]">
      <Sidebar />
      <div className="lg:pl-[270px]">
        <TopNavbar />
        <main className="relative overflow-hidden px-6 py-8 md:px-8 lg:px-6 xl:px-8">
          <div className="pointer-events-none absolute -right-36 top-11 h-100 w-100 rounded-full bg-[#B9FFF1]/50 blur-sm" />
          <div className="relative mx-auto max-w-[1180px] space-y-8">
            <PageHeader
              title="Tạo seminar mới"
              description="Nhập thông tin seminar từ bộ phận booking"
              icon={<CalendarPlus className="h-10 w-10" strokeWidth={2.4} />}
            />

            <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_355px]">
              <FormCard />
              <aside className="space-y-6">
                <SuggestionCard />
                <ConsultantCard />
                <NoticeCard />
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function FormCard() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/70">
      <div className="mb-8 flex items-center gap-3 text-[#0B3970]">
        <FileText className="h-6 w-6 text-[#126CB0]" />
        <h2 className="text-lg font-extrabold">Thông tin seminar</h2>
      </div>

      <div className="grid gap-x-6 gap-y-7 md:grid-cols-2">
        <InputField
          id="seminar-name"
          label="Tên seminar"
          placeholder="Nhập tên seminar"
          required
        />
        <SelectField
          id="seminar-type"
          label="Loại seminar"
          placeholder="Chọn loại seminar"
          options={seminarTypes}
          required
        />
        <SelectField
          id="consultant"
          label="Chuyên gia đào tạo"
          placeholder="Chọn chuyên gia đào tạo"
          options={consultants}
          required
        />
        <SelectField
          id="employee"
          label="Nhân viên phụ trách"
          placeholder="Chọn nhân viên phụ trách"
          options={employees}
          required
        />
        <DateField
          id="start-date"
          label="Ngày bắt đầu"
          placeholder="Chọn ngày bắt đầu"
          required
        />
        <DateField
          id="end-date"
          label="Ngày kết thúc"
          placeholder="Chọn ngày kết thúc"
          required
        />
        <CityField />
        <NumberField
          id="expected-learners"
          label="Số lượng học viên dự kiến"
          placeholder="Nhập số lượng"
          required
        />
        <div className="md:col-span-2">
          <DateField
            id="booking-created-date"
            label="Ngày tạo booking"
            placeholder="Chọn ngày tạo booking"
            required
          />
        </div>
        <div className="md:col-span-2">
          <FieldShell id="note" label="Ghi chú">
            <textarea
              id="note"
              rows={4}
              placeholder="Nhập ghi chú (nếu có)"
              className="w-full resize-y rounded-lg border border-slate-300 bg-white px-4 py-4 text-sm text-[#18395F] shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#1788A7] focus:ring-4 focus:ring-[#36F1D1]/20"
            />
          </FieldShell>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-5">
        <button
          type="button"
          className="h-13 min-w-25 rounded-lg border border-slate-300 bg-white px-7 text-sm font-bold text-slate-600 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
        >
          Hủy
        </button>
        <button
          type="button"
          className="flex h-13 min-w-32 items-center justify-center gap-2 rounded-lg border border-[#1679B7] bg-white px-6 text-sm font-bold text-[#1679B7] shadow-sm transition hover:bg-[#EBF8FF]"
        >
          <Save className="h-5 w-5" />
          Lưu nháp
        </button>
        <button
          type="button"
          className="flex h-13 min-w-36 items-center justify-center gap-2 rounded-lg bg-[#26E6CA] px-6 text-sm font-extrabold text-[#06466A] shadow-lg shadow-teal-200/70 transition hover:bg-[#1DD7BE]"
        >
          <CheckCircle2 className="h-5 w-5 fill-[#06466A] text-[#26E6CA]" />
          Lưu seminar
        </button>
      </div>
    </section>
  )
}

function SuggestionCard() {
  return (
    <InfoCard
      title="Thông tin gợi ý"
      icon={<Lightbulb className="h-6 w-6 text-[#156DB2]" />}
      highlighted
    >
      <p className="mb-8 text-sm font-extrabold text-[#18395F]">
        Tổng quan loại seminar
      </p>
      <div className="flex items-center gap-7">
        <div
          aria-label="Biểu đồ tỷ lệ loại seminar"
          className="h-22 w-22 shrink-0 rounded-full"
          style={{
            background:
              'conic-gradient(#257AB7 0deg 162deg, #2F91CF 162deg 288deg, #41E7D0 288deg 342deg, #B9E9E1 342deg 360deg)',
          }}
        >
          <div className="grid h-full w-full place-items-center rounded-full">
            <div className="h-10 w-10 rounded-full bg-white shadow-inner" />
          </div>
        </div>
        <div className="min-w-0 flex-1 space-y-4">
          {seminarOverview.map((item) => (
            <div
              key={item.label}
              className="grid grid-cols-[1rem_1fr_auto] items-center gap-3 text-sm text-slate-600"
            >
              <span
                className="h-2 w-2 rounded-[2px]"
                style={{ backgroundColor: item.color }}
              />
              <span>{item.label}</span>
              <span className="font-semibold">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </InfoCard>
  )
}

function ConsultantCard() {
  return (
    <InfoCard
      title="Thông tin consultant"
      icon={<UserRound className="h-6 w-6 text-[#156DB2]" />}
    >
      <div className="flex gap-5">
        <div className="relative grid h-18 w-18 shrink-0 place-items-center rounded-full bg-[#B9FFF1] text-[#257AB7]">
          <User className="h-13 w-13 fill-[#257AB7]/20 stroke-[#257AB7]" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-extrabold text-[#18395F]">
            Lê Minh Tuấn
          </h3>
          <span className="mt-3 inline-flex rounded-full bg-[#B9FFF1] px-4 py-2 text-xs font-semibold text-[#009C8E]">
            Chuyên gia hàng đầu
          </span>
          <div className="mt-5 space-y-4 text-sm text-slate-500">
            <p className="flex items-center gap-3">
              <Phone className="h-4 w-4" />
              0987 654 321
            </p>
            <p className="flex items-center gap-3">
              <Mail className="h-4 w-4" />
              leminhtuan@gmail.com
            </p>
            <p className="flex items-center gap-3">
              <MapPin className="h-4 w-4" />
              Hà Nội
            </p>
          </div>
        </div>
      </div>
    </InfoCard>
  )
}

function NoticeCard() {
  return (
    <InfoCard
      title="Lưu ý"
      icon={
        <span className="grid h-6 w-6 place-items-center rounded-full bg-[#1679B7] text-sm font-bold text-white">
          i
        </span>
      }
      highlighted
    >
      <p className="max-w-[28ch] text-sm leading-7 text-slate-500">
        Vui lòng kiểm tra kỹ thông tin trước khi lưu seminar. Thông tin sẽ được
        gửi đến các bộ phận liên quan để triển khai.
      </p>
    </InfoCard>
  )
}
