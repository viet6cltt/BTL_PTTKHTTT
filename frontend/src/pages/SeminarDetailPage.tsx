import {
  BriefcaseBusiness,
  CheckCircle2,
  CircleDashed,
  ClipboardCheck,
  FileSignature,
  FileText,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  Plane,
  User,
  UserRound,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { InfoCard } from '../components/info/InfoCard'
import { PageHeader } from '../components/layout/PageHeader'
import { Sidebar } from '../components/layout/Sidebar'
import { TopNavbar } from '../components/layout/TopNavbar'
import type { SeminarDetail } from '../types'

// TODO: Replace mockSeminarDetail with GET /api/seminars/{seminarId}
const mockSeminarDetail: SeminarDetail = {
  id: 1003,
  seminarTypeId: 3,
  seminarTypeName: 'Đào tạo kỹ thuật phần mềm thực hành',
  consultantId: 3,
  consultantFullName: 'Phạm Quốc Huy',
  bookingDepartmentUserId: 1,
  bookingDepartmentUserFullName: 'Nguyễn Minh Booking',
  employeeId: null,
  employeeFullName: null,
  seminarName: 'Workshop CI/CD và kiểm thử tự động',
  startDate: '2025-07-12',
  endDate: '2025-07-13',
  city: 'TP. Hồ Chí Minh',
  anticipatedRegistrants: 80,
  note: 'Cần Internet ổn định và nhiều ổ cắm điện.',
  bookingCreatedDate: '2025-05-20',
  contractId: 5007,
  contractStatus: 'CREATED',
  travelArrangementStatus: 'NOT_SCHEDULED',
  materialRequestStatus: 'NOT_REQUESTED',
  consultantRole: 'Kỹ thuật phần mềm và đào tạo thực hành',
  consultantPhone: '0903 222 111',
  consultantEmail: 'phamquochuy@gmail.com',
  consultantCity: 'TP. Hồ Chí Minh',
  consultantCountry: 'Việt Nam',
}

export function SeminarDetailPage() {
  const seminar = mockSeminarDetail
  const canCreateContract =
    seminar.contractId === null || seminar.contractStatus === 'NOT_CREATED'
  const canOpenContract = seminar.contractStatus !== 'SIGNED'
  const isContractSigned = seminar.contractStatus === 'SIGNED'

  function handleContractAction() {
    // TODO: Navigate to contract function route when it is available.
  }

  function handleTravelAction() {
    // TODO: Navigate to travel arrangement route when it is available.
  }

  function handleMaterialRequestAction() {
    // TODO: Navigate to material request route when it is available.
  }

  return (
    <div className="min-h-screen bg-[#F5FAFF] font-sans text-[#18395F]">
      <Sidebar activeChild="Danh sách seminar" />
      <div className="lg:pl-[270px]">
        <TopNavbar />
        <main className="relative overflow-hidden px-6 py-8 md:px-8 lg:px-6 xl:px-8">
          <div className="pointer-events-none absolute -right-36 top-11 h-100 w-100 rounded-full bg-[#B9FFF1]/50 blur-sm" />
          <div className="relative mx-auto max-w-[1220px] space-y-7">
            <div className="space-y-4">
              <p className="text-sm font-bold text-slate-500">
                Seminar / Danh sách seminar / Chi tiết seminar
              </p>
              <PageHeader
                title="Chi tiết seminar"
                description="Theo dõi thông tin seminar và trạng thái xử lý logistics"
                icon={<ClipboardCheck className="h-10 w-10" strokeWidth={2.4} />}
              />
            </div>

            <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_360px]">
              <section className="space-y-7">
                <SeminarInfoCard seminar={seminar} />
                <LogisticsStatusCard seminar={seminar} />
              </section>

              <aside className="space-y-6">
                <ConsultantInfoCard seminar={seminar} />
                <QuickActionsCard
                  canCreateContract={canCreateContract}
                  canOpenContract={canOpenContract}
                  isContractSigned={isContractSigned}
                  onContractAction={handleContractAction}
                  onMaterialRequestAction={handleMaterialRequestAction}
                  onTravelAction={handleTravelAction}
                />
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

type SeminarDetailProps = {
  seminar: SeminarDetail
}

function SeminarInfoCard({ seminar }: SeminarDetailProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/70">
      <div className="mb-7 flex items-center gap-3 text-[#0B3970]">
        <FileText className="h-6 w-6 text-[#126CB0]" />
        <h2 className="text-lg font-extrabold">Thông tin seminar</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DetailField label="Tên seminar" value={seminar.seminarName} wide />
        <DetailField label="Loại seminar" value={seminar.seminarTypeName} />
        <DetailField
          label="Chuyên gia đào tạo"
          value={seminar.consultantFullName}
        />
        <DetailField
          label="Nhân viên phụ trách"
          value={
            seminar.employeeFullName ?? (
              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500">
                Chưa có người phụ trách
              </span>
            )
          }
        />
        <DetailField label="Thành phố tổ chức" value={seminar.city} />
        <DetailField label="Ngày bắt đầu" value={formatDate(seminar.startDate)} />
        <DetailField label="Ngày kết thúc" value={formatDate(seminar.endDate)} />
        <DetailField
          label="Số học viên dự kiến"
          value={`${seminar.anticipatedRegistrants} học viên`}
        />
        <DetailField
          label="Ngày tạo booking"
          value={formatDate(seminar.bookingCreatedDate)}
        />
        <DetailField
          label="Ghi chú"
          value={seminar.note ?? 'Không có ghi chú'}
          wide
        />
      </div>
    </section>
  )
}

type DetailFieldProps = {
  label: string
  value: ReactNode
  wide?: boolean
}

function DetailField({ label, value, wide }: DetailFieldProps) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-[#F8FBFF] px-4 py-4 ${
        wide ? 'md:col-span-2' : ''
      }`}
    >
      <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <div className="mt-2 min-h-6 text-sm font-bold leading-6 text-[#18395F]">
        {value}
      </div>
    </div>
  )
}

function LogisticsStatusCard({ seminar }: SeminarDetailProps) {
  const isContractSigned = seminar.contractStatus === 'SIGNED'
  const statusItems = [
    {
      title: 'Travel arrangement',
      description:
        seminar.travelArrangementStatus === 'SCHEDULED'
          ? 'Đã đặt lịch'
          : 'Chưa đặt lịch',
      icon: Plane,
      variant: getTravelStatusVariant(seminar),
    },
    {
      title: 'Contract',
      description: getContractStatusLabel(seminar.contractStatus),
      icon: FileSignature,
      variant: isContractSigned ? 'completed' : 'active',
    },
    {
      title: 'Material request',
      description: getMaterialRequestStatusLabel(seminar.materialRequestStatus),
      icon: PackageCheck,
      variant: getMaterialStatusVariant(seminar),
    },
  ]

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/70">
      <div className="mb-7 flex items-center gap-3 text-[#0B3970]">
        <BriefcaseBusiness className="h-6 w-6 text-[#126CB0]" />
        <h2 className="text-lg font-extrabold">Trạng thái logistics</h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {statusItems.map((item) => {
          const Icon = item.icon
          const variant = item.variant as StatusVariant

          return (
            <div
              key={item.title}
              className={`rounded-2xl border px-5 py-5 ${
                statusCardClassByVariant[variant]
              }`}
            >
              <div
                className={`grid h-12 w-12 place-items-center rounded-xl ${
                  statusIconClassByVariant[variant]
                }`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <h3
                className={`mt-5 text-base font-extrabold ${
                  variant === 'disabled' ? 'text-slate-500' : 'text-[#0B3970]'
                }`}
              >
                {item.title}
              </h3>
              <p
                className={`mt-2 text-sm font-bold ${
                  variant === 'disabled' ? 'text-slate-400' : 'text-[#009C8E]'
                }`}
              >
                {item.description}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function ConsultantInfoCard({ seminar }: SeminarDetailProps) {
  return (
    <InfoCard
      title="Thông tin consultant"
      icon={<UserRound className="h-6 w-6 text-[#156DB2]" />}
      highlighted
    >
      <div className="flex gap-5">
        <div className="grid h-18 w-18 shrink-0 place-items-center rounded-full bg-[#B9FFF1] text-[#257AB7]">
          <User className="h-13 w-13 fill-[#257AB7]/20 stroke-[#257AB7]" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-extrabold text-[#18395F]">
            {seminar.consultantFullName}
          </h3>
          <p className="mt-4 text-sm font-bold leading-6 text-[#18395F]">
            {seminar.consultantRole}
          </p>
          <div className="mt-5 space-y-4 text-sm text-slate-500">
            <ContactRow icon={<Phone className="h-4 w-4" />}>
              {seminar.consultantPhone}
            </ContactRow>
            <ContactRow icon={<Mail className="h-4 w-4" />}>
              {seminar.consultantEmail}
            </ContactRow>
            <ContactRow icon={<MapPin className="h-4 w-4" />}>
              {seminar.consultantCity}, {seminar.consultantCountry}
            </ContactRow>
          </div>
        </div>
      </div>
    </InfoCard>
  )
}

type ContactRowProps = {
  icon: ReactNode
  children: ReactNode
}

function ContactRow({ icon, children }: ContactRowProps) {
  return (
    <p className="flex items-center gap-3 break-words">
      <span className="shrink-0 text-slate-400">{icon}</span>
      <span className="min-w-0">{children}</span>
    </p>
  )
}

type QuickActionsCardProps = {
  canCreateContract: boolean
  canOpenContract: boolean
  isContractSigned: boolean
  onContractAction: () => void
  onMaterialRequestAction: () => void
  onTravelAction: () => void
}

function QuickActionsCard({
  canCreateContract,
  canOpenContract,
  isContractSigned,
  onContractAction,
  onMaterialRequestAction,
  onTravelAction,
}: QuickActionsCardProps) {
  return (
    <InfoCard
      title="Đi nhanh đến chức năng"
      icon={<CheckCircle2 className="h-6 w-6 text-[#156DB2]" />}
    >
      <div className="space-y-3">
        <QuickAction
          title="Đặt lịch travel cho consultant"
          description={
            isContractSigned
              ? 'Có thể triển khai đặt lịch'
              : 'Chỉ mở sau khi contract đã ký'
          }
          icon={<Plane className="h-5 w-5" />}
          active={isContractSigned}
          disabled={!isContractSigned}
          onClick={onTravelAction}
        />
        <QuickAction
          title={canCreateContract ? 'Tạo contract' : 'Xử lý contract'}
          description={
            canCreateContract
              ? 'Bước tiếp theo cần xử lý'
              : isContractSigned
                ? 'Contract đã ký'
                : 'Contract đã tạo, chờ ký'
          }
          icon={<FileSignature className="h-5 w-5" />}
          active={canOpenContract}
          disabled={!canOpenContract}
          onClick={onContractAction}
        />
        <QuickAction
          title="Tạo material request"
          description={
            isContractSigned
              ? 'Có thể gửi yêu cầu chuẩn bị'
              : 'Chỉ mở sau khi contract đã ký'
          }
          icon={<PackageCheck className="h-5 w-5" />}
          active={isContractSigned}
          disabled={!isContractSigned}
          onClick={onMaterialRequestAction}
        />
      </div>
    </InfoCard>
  )
}

const statusCardClassByVariant = {
  active: 'border-[#5DF8D8] bg-[#E8FFFB] shadow-lg shadow-teal-100/70',
  completed: 'border-[#5DF8D8] bg-white shadow-lg shadow-teal-100/70',
  disabled: 'border-slate-200 bg-slate-50',
} as const

const statusIconClassByVariant = {
  active: 'bg-[#5DF8D8] text-[#093C5D]',
  completed: 'bg-[#B9FFF1] text-[#093C5D]',
  disabled: 'bg-slate-200 text-slate-400',
} as const

type StatusVariant = keyof typeof statusCardClassByVariant

function getContractStatusLabel(status: SeminarDetail['contractStatus']) {
  if (status === 'SIGNED') {
    return 'Đã ký'
  }

  if (status === 'CREATED') {
    return 'Đã tạo, chưa ký'
  }

  return 'Chưa tạo'
}

function getMaterialRequestStatusLabel(
  status: SeminarDetail['materialRequestStatus'],
) {
  if (status === 'DELIVERED') {
    return 'Đã bàn giao'
  }

  if (status === 'REQUESTED') {
    return 'Đã yêu cầu'
  }

  return 'Chưa yêu cầu'
}

function getTravelStatusVariant(seminar: SeminarDetail): StatusVariant {
  if (seminar.travelArrangementStatus === 'SCHEDULED') {
    return 'completed'
  }

  if (seminar.contractStatus === 'SIGNED') {
    return 'active'
  }

  return 'disabled'
}

function getMaterialStatusVariant(seminar: SeminarDetail): StatusVariant {
  if (seminar.materialRequestStatus === 'DELIVERED') {
    return 'completed'
  }

  if (seminar.contractStatus === 'SIGNED') {
    return 'active'
  }

  return 'disabled'
}

type QuickActionProps = {
  title: string
  description: string
  icon: ReactNode
  active?: boolean
  disabled?: boolean
  onClick?: () => void
}

function QuickAction({
  title,
  description,
  icon,
  active,
  disabled,
  onClick,
}: QuickActionProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-xl border px-4 py-4 text-left transition ${
        active
          ? 'border-[#5DF8D8] bg-[#E8FFFB] text-[#093C5D] shadow-lg shadow-teal-100/70 hover:border-[#26E6CA] hover:bg-[#DFFFF8]'
          : 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400'
      }`}
    >
      <span
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${
          active ? 'bg-[#5DF8D8]' : 'bg-slate-200'
        }`}
      >
        {icon}
      </span>
      <ActionText title={title} description={description} />
      {active ? (
        <CheckCircle2 className="ml-auto h-5 w-5 shrink-0" />
      ) : (
        <CircleDashed className="ml-auto h-5 w-5 shrink-0" />
      )}
    </button>
  )
}

type ActionTextProps = {
  title: string
  description: string
}

function ActionText({ title, description }: ActionTextProps) {
  return (
    <span className="min-w-0">
      <span className="block text-sm font-extrabold">{title}</span>
      <span className="mt-1 block text-xs font-semibold opacity-70">
        {description}
      </span>
    </span>
  )
}

function formatDate(isoDate: string) {
  const [, month, day] = isoDate.split('-')

  return `${day}/${month}/${isoDate.slice(0, 4)}`
}
