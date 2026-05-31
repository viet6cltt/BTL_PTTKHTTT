import {
  CalendarPlus,
  CheckCircle2,
  FileText,
  Lightbulb,
  Mail,
  MapPin,
  Phone,
  User,
  UserRound,
} from 'lucide-react'
import { useState } from 'react'
import {
  bookingDepartmentUsers,
  consultantById,
  consultants,
  seminarTypeById,
  seminarTypes,
  type Consultant,
  type SeminarType,
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

export function CreateSeminarPage() {
  const [selectedSeminarType, setSelectedSeminarType] = useState('')
  const [selectedConsultant, setSelectedConsultant] = useState('')
  const [selectedBookingDepartmentUser, setSelectedBookingDepartmentUser] =
    useState('')

  return (
    <div className="min-h-screen bg-[#F5FAFF] font-sans text-[#18395F]">
      <Sidebar activeChild="Tạo seminar mới" />
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
              <FormCard
                bookingDepartmentUserValue={selectedBookingDepartmentUser}
                consultantValue={selectedConsultant}
                onBookingDepartmentUserChange={setSelectedBookingDepartmentUser}
                onConsultantChange={setSelectedConsultant}
                onSeminarTypeChange={setSelectedSeminarType}
                seminarTypeValue={selectedSeminarType}
              />
              <aside className="space-y-6">
                <SeminarTypeCard info={seminarTypeById[selectedSeminarType]} />
                <ConsultantCard info={consultantById[selectedConsultant]} />
                <NoticeCard />
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

type FormCardProps = {
  seminarTypeValue: string
  onSeminarTypeChange: (value: string) => void
  consultantValue: string
  onConsultantChange: (value: string) => void
  bookingDepartmentUserValue: string
  onBookingDepartmentUserChange: (value: string) => void
}

function FormCard({
  seminarTypeValue,
  onSeminarTypeChange,
  consultantValue,
  onConsultantChange,
  bookingDepartmentUserValue,
  onBookingDepartmentUserChange,
}: FormCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/70">
      <div className="mb-8 flex items-center gap-3 text-[#0B3970]">
        <FileText className="h-6 w-6 text-[#126CB0]" />
        <h2 className="text-lg font-extrabold">Thông tin seminar</h2>
      </div>

      <div className="grid gap-x-6 gap-y-7 md:grid-cols-2">
        <SelectField
          id="seminarTypeId"
          label="Loại seminar"
          placeholder="Chọn loại seminar"
          options={seminarTypes}
          value={seminarTypeValue}
          onChange={onSeminarTypeChange}
          required
        />
        <SelectField
          id="consultantId"
          label="Chuyên gia đào tạo"
          placeholder="Chọn chuyên gia đào tạo"
          options={consultants}
          value={consultantValue}
          onChange={onConsultantChange}
          required
        />
        <SelectField
          id="bookingDepartmentUserId"
          label="Nhân viên booking"
          placeholder="Chọn nhân viên booking"
          options={bookingDepartmentUsers}
          value={bookingDepartmentUserValue}
          onChange={onBookingDepartmentUserChange}
          required
        />
        <InputField
          id="seminarName"
          label="Tên seminar"
          placeholder="Nhập tên seminar"
          required
        />
        <DateField
          id="startDate"
          label="Ngày bắt đầu"
          placeholder="Chọn ngày bắt đầu"
          required
        />
        <DateField
          id="endDate"
          label="Ngày kết thúc"
          placeholder="Chọn ngày kết thúc"
          required
        />
        <CityField />
        <NumberField
          id="anticipatedRegistrants"
          label="Số lượng học viên dự kiến"
          placeholder="Nhập số lượng"
          required
        />
        <div className="md:col-span-2">
          <FieldShell id="note" label="Ghi chú">
            <textarea
              id="note"
              name="note"
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
          className="flex h-13 min-w-36 items-center justify-center gap-2 rounded-lg bg-[#26E6CA] px-6 text-sm font-extrabold text-[#06466A] shadow-lg shadow-teal-200/70 transition hover:bg-[#1DD7BE]"
        >
          <CheckCircle2 className="h-5 w-5 fill-[#06466A] text-[#26E6CA]" />
          Lưu seminar
        </button>
      </div>
    </section>
  )
}

type SeminarTypeCardProps = {
  info?: SeminarType
}

function SeminarTypeCard({ info }: SeminarTypeCardProps) {
  return (
    <InfoCard
      title="Thông tin loại seminar"
      icon={<Lightbulb className="h-6 w-6 text-[#156DB2]" />}
      highlighted
    >
      {info ? (
        <div className="space-y-5">
          <div>
            <h3 className="text-base font-extrabold text-[#18395F]">
              {info.typeName}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {info.description}
            </p>
          </div>
          <div className="grid gap-4 text-sm text-slate-600">
            <InfoRow
              label="Thời lượng dự kiến"
              value={`${info.durationHours} giờ`}
            />
            <InfoRow label="Cách bố trí tham khảo" value={info.arrangementNotes} />
          </div>
        </div>
      ) : (
        <PlaceholderText>Vui lòng chọn loại seminar</PlaceholderText>
      )}
    </InfoCard>
  )
}

type ConsultantCardProps = {
  info?: Consultant
}

function ConsultantCard({ info }: ConsultantCardProps) {
  return (
    <InfoCard
      title="Thông tin consultant"
      icon={<UserRound className="h-6 w-6 text-[#156DB2]" />}
    >
      {info ? (
        <div className="flex gap-5">
          <div className="relative grid h-18 w-18 shrink-0 place-items-center rounded-full bg-[#B9FFF1] text-[#257AB7]">
            <User className="h-13 w-13 fill-[#257AB7]/20 stroke-[#257AB7]" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-extrabold text-[#18395F]">
              {info.fullName}
            </h3>
            <span className="mt-3 inline-flex rounded-full bg-[#B9FFF1] px-4 py-2 text-xs font-semibold text-[#009C8E]">
              {info.work}
            </span>
            <div className="mt-5 space-y-4 text-sm text-slate-500">
              <p className="flex items-center gap-3">
                <Phone className="h-4 w-4" />
                {info.phone}
              </p>
              <p className="flex items-center gap-3">
                <Mail className="h-4 w-4" />
                {info.email}
              </p>
              <p className="flex items-center gap-3">
                <MapPin className="h-4 w-4" />
                {info.city}, {info.country}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <PlaceholderText>Vui lòng chọn consultant</PlaceholderText>
      )}
    </InfoCard>
  )
}

type InfoRowProps = {
  label: string
  value: string
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div>
      <p className="font-bold text-[#18395F]">{label}</p>
      <p className="mt-1 leading-6">{value}</p>
    </div>
  )
}

type PlaceholderTextProps = {
  children: string
}

function PlaceholderText({ children }: PlaceholderTextProps) {
  return (
    <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center text-sm font-semibold text-slate-400">
      {children}
    </p>
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
