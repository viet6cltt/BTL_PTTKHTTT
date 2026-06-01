import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  Banknote,
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Info,
  Navigation,
  Plane,
  RefreshCw,
  Route,
  TicketCheck,
  User,
  XCircle,
} from 'lucide-react'
import {
  api,
  ConsultantResponse,
  SeminarResponse,
  TravelArrangementResponse,
  TravelArrangementStatus,
  TravelFacilityInfoResponse,
  TravelItineraryResponse,
} from '../api'
import { PageHeader } from '../components/layout/PageHeader'
import { useAuth } from '../context/AuthContext'

const statusLabels: Record<TravelArrangementStatus, string> = {
  BOOKED: 'Chờ chuyên gia xác nhận',
  CONFIRMED: 'Đã xác nhận',
  CANCELLED: 'Đã hủy',
}

const transportLabels: Record<string, string> = {
  FLIGHT: 'Máy bay',
  TRAIN: 'Tàu hỏa',
  BUS: 'Xe khách',
  CAR: 'Ô tô',
  OTHER: 'Phương tiện khác',
}

export function MyTravelPage() {
  const { user } = useAuth()
  const [itinerary, setItinerary] = useState<TravelItineraryResponse | null>(null)
  const [consultant, setConsultant] = useState<ConsultantResponse | null>(null)
  const [seminarsById, setSeminarsById] = useState<Record<number, SeminarResponse>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdatingId, setIsUpdatingId] = useState<number | null>(null)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [showCompletedTrips, setShowCompletedTrips] = useState(false)
  const [profileForm, setProfileForm] = useState({
    travelPreference: '',
    address: '',
    city: '',
    country: '',
  })

  async function loadItinerary() {
    try {
      setIsLoading(true)
      setErrorMsg(null)
      const data = await api.getMyTravel()
      setItinerary(data)
      const seminarIds = Array.from(
        new Set([
          ...(data.arrangements || []).map((arrangement: TravelArrangementResponse) => arrangement.seminarId),
          ...(data.facilityReservations || []).map((facility: TravelFacilityInfoResponse) => facility.seminarId),
        ]),
      ).filter(Boolean)
      const seminarEntries = await Promise.all(
        seminarIds.map(async (seminarId: number) => {
          try {
            const seminar = await api.getSeminarById(seminarId)
            return [seminarId, seminar] as const
          } catch {
            return null
          }
        }),
      )
      setSeminarsById(Object.fromEntries(seminarEntries.filter((entry): entry is readonly [number, SeminarResponse] => entry !== null)))
      if (data.consultantId) {
        const consultantData = await api.getConsultantById(data.consultantId)
        setConsultant(consultantData)
        setProfileForm({
          travelPreference: consultantData.travelPreference || '',
          address: consultantData.address || '',
          city: consultantData.city || '',
          country: consultantData.country || '',
        })
      }
    } catch (err: any) {
      setItinerary(null)
      setErrorMsg(err.message || 'Hiện tại chưa có lịch trình di chuyển được gán cho tài khoản của bạn.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSaveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      setIsSavingProfile(true)
      setErrorMsg(null)
      setSuccessMsg(null)
      const updated = await api.updateMyConsultantProfile(profileForm)
      setConsultant(updated)
      setProfileForm({
        travelPreference: updated.travelPreference || '',
        address: updated.address || '',
        city: updated.city || '',
        country: updated.country || '',
      })
      setIsEditingProfile(false)
      setSuccessMsg('Đã cập nhật hồ sơ di chuyển của bạn.')
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể cập nhật hồ sơ di chuyển.')
    } finally {
      setIsSavingProfile(false)
    }
  }

  useEffect(() => {
    loadItinerary()
  }, [])

  const arrangements = useMemo(
    () =>
      [...(itinerary?.arrangements || [])].sort(
        (a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime(),
      ),
    [itinerary],
  )

  const now = Date.now()
  const pendingTrips = arrangements.filter((arrangement) => getArrangementStatus(arrangement) === 'BOOKED')
  const upcomingTrips = arrangements.filter(
    (arrangement) =>
      getArrangementStatus(arrangement) === 'CONFIRMED' &&
      new Date(arrangement.arrivalTime).getTime() >= now,
  )
  const completedTrips = arrangements.filter(
    (arrangement) =>
      getArrangementStatus(arrangement) === 'CANCELLED' ||
      (getArrangementStatus(arrangement) === 'CONFIRMED' &&
        new Date(arrangement.arrivalTime).getTime() < now),
  )
  const facilityBySeminarId = useMemo(
    () =>
      Object.fromEntries(
        (itinerary?.facilityReservations || []).map((facility) => [facility.seminarId, facility]),
      ),
    [itinerary?.facilityReservations],
  )
  const seminarAssignments = useMemo(() => {
    const ids = new Set<number>()
    arrangements.forEach((arrangement) => ids.add(arrangement.seminarId))
    itinerary?.facilityReservations?.forEach((facility) => ids.add(facility.seminarId))
    return Array.from(ids).map((seminarId) => ({
      seminarId,
      seminar: seminarsById[seminarId],
      facility: facilityBySeminarId[seminarId],
      trips: arrangements.filter((arrangement) => arrangement.seminarId === seminarId),
    }))
  }, [arrangements, facilityBySeminarId, itinerary?.facilityReservations, seminarsById])

  const nextTrip = [...pendingTrips, ...upcomingTrips].find((arrangement) => getArrangementStatus(arrangement) !== 'CANCELLED')
  const confirmedCount = arrangements.filter((arrangement) => getArrangementStatus(arrangement) === 'CONFIRMED').length

  async function handleUpdateTicketStatus(arrangementId: number, status: 'CONFIRMED' | 'CANCELLED') {
    try {
      setIsUpdatingId(arrangementId)
      setErrorMsg(null)
      setSuccessMsg(null)
      await api.updateTravelStatus(arrangementId, status)
      setSuccessMsg(status === 'CONFIRMED' ? 'Đã xác nhận chặng di chuyển thành công.' : 'Đã hủy chặng di chuyển.')
      await loadItinerary()
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể cập nhật trạng thái chặng di chuyển này.')
    } finally {
      setIsUpdatingId(null)
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
    <div className="space-y-7 text-left">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <PageHeader
          title="Lịch trình của tôi"
          description="Theo dõi vé di chuyển, nơi lưu trú và xác nhận các chặng công tác đã được hậu cần đặt"
          icon={<Navigation className="h-10 w-10" strokeWidth={2.4} />}
        />
        <button
          type="button"
          onClick={loadItinerary}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-extrabold text-[#0B3970] shadow-sm transition hover:border-[#5DF8D8]"
        >
          <RefreshCw className="h-4 w-4" />
          Làm mới
        </button>
      </div>

      {errorMsg && (
        <Message tone="warning" icon={<Info className="h-5 w-5 shrink-0" />}>
          {errorMsg}
        </Message>
      )}

      {successMsg && (
        <Message tone="success" icon={<CheckCircle2 className="h-5 w-5 shrink-0" />}>
          {successMsg}
        </Message>
      )}

      {!itinerary ? (
        <EmptyTravelState />
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryTile
              icon={<Route className="h-5 w-5" />}
              label="Số chặng"
              value={String(arrangements.length)}
              detail={`${confirmedCount}/${arrangements.length} chặng đã xác nhận`}
            />
            <SummaryTile
              icon={<TicketCheck className="h-5 w-5" />}
              label="Trạng thái tổng"
              value={statusLabels[itinerary.overallStatus]}
              detail={`Seminar #${itinerary.seminarId || 'N/A'}`}
            />
            <SummaryTile
              icon={<Banknote className="h-5 w-5" />}
              label="Chi phí dự kiến"
              value={formatMoney(itinerary.totalCost)}
              detail="Do phòng hậu cần đặt"
            />
            <SummaryTile
              icon={<CalendarClock className="h-5 w-5" />}
              label="Chặng kế tiếp"
              value={nextTrip ? formatShortDateTime(nextTrip.departureTime) : 'Chưa có'}
              detail={nextTrip ? `${nextTrip.departureLocation} -> ${nextTrip.arrivalLocation}` : 'Không có lịch sắp tới'}
            />
          </section>

          <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_340px]">
            <main className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
                <SectionTitle
                  icon={<Clock3 className="h-5 w-5 text-amber-600" />}
                  title="Chuyến đi đang chờ xác nhận"
                  subtitle="Kiểm tra thông tin vé, seminar và địa điểm trước khi xác nhận"
                />

                <div className="mt-5 space-y-4">
                  {pendingTrips.length > 0 ? (
                    pendingTrips.map((arrangement, index) => (
                      <TravelLeg
                        key={arrangement.travelArrangementId}
                        arrangement={arrangement}
                        index={index}
                        seminar={seminarsById[arrangement.seminarId]}
                        facility={facilityBySeminarId[arrangement.seminarId]}
                        isUpdating={isUpdatingId === arrangement.travelArrangementId}
                        onConfirm={() => handleUpdateTicketStatus(arrangement.travelArrangementId, 'CONFIRMED')}
                        onCancel={() => handleUpdateTicketStatus(arrangement.travelArrangementId, 'CANCELLED')}
                      />
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm font-bold text-slate-500">
                      Không có chuyến nào đang chờ bạn xác nhận.
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
                <SectionTitle
                  icon={<TicketCheck className="h-5 w-5 text-teal-600" />}
                  title="Upcoming đã xác nhận"
                  subtitle="Các chuyến sắp tới đã được bạn xác nhận với phòng hậu cần"
                />

                <div className="mt-5 space-y-4">
                  {upcomingTrips.length > 0 ? (
                    upcomingTrips.map((arrangement, index) => (
                      <TravelLeg
                        key={arrangement.travelArrangementId}
                        arrangement={arrangement}
                        index={index}
                        seminar={seminarsById[arrangement.seminarId]}
                        facility={facilityBySeminarId[arrangement.seminarId]}
                        isUpdating={isUpdatingId === arrangement.travelArrangementId}
                        onConfirm={() => handleUpdateTicketStatus(arrangement.travelArrangementId, 'CONFIRMED')}
                        onCancel={() => handleUpdateTicketStatus(arrangement.travelArrangementId, 'CANCELLED')}
                      />
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm font-bold text-slate-500">
                      Chưa có chuyến upcoming nào đã xác nhận.
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
                <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
                  <SectionTitle
                    icon={<CheckCircle2 className="h-5 w-5 text-slate-500" />}
                    title="Chuyến đã hoàn thiện"
                    subtitle="Ẩn mặc định để màn hình tập trung vào việc cần xử lý"
                    borderless
                  />
                  <button
                    type="button"
                    onClick={() => setShowCompletedTrips((current) => !current)}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black text-[#0B3970] transition hover:border-[#5DF8D8]"
                  >
                    {showCompletedTrips ? 'Ẩn lịch sử' : `Hiện ${completedTrips.length} chuyến`}
                  </button>
                </div>

                {showCompletedTrips && (
                  <div className="mt-5 space-y-4">
                    {completedTrips.length > 0 ? (
                      completedTrips.map((arrangement, index) => (
                        <TravelLeg
                          key={arrangement.travelArrangementId}
                          arrangement={arrangement}
                          index={index}
                          seminar={seminarsById[arrangement.seminarId]}
                          facility={facilityBySeminarId[arrangement.seminarId]}
                          isUpdating={isUpdatingId === arrangement.travelArrangementId}
                          onConfirm={() => handleUpdateTicketStatus(arrangement.travelArrangementId, 'CONFIRMED')}
                          onCancel={() => handleUpdateTicketStatus(arrangement.travelArrangementId, 'CANCELLED')}
                          compact
                        />
                      ))
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm font-bold text-slate-500">
                        Chưa có chuyến đã hoàn thiện.
                      </div>
                    )}
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
                <SectionTitle
                  icon={<Building2 className="h-5 w-5 text-indigo-600" />}
                  title="Seminar & địa điểm tham gia"
                  subtitle="Mỗi seminar gom đúng các chuyến đi và facility liên quan để dễ đối chiếu"
                />
                <div className="mt-5 grid gap-4">
                  {seminarAssignments.length > 0 ? (
                    seminarAssignments.map((assignment) => (
                      <SeminarAssignmentCard
                        key={assignment.seminarId}
                        seminarId={assignment.seminarId}
                        seminar={assignment.seminar}
                        facility={assignment.facility}
                        trips={assignment.trips}
                      />
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm font-bold text-slate-500">
                      Chưa có seminar hoặc facility nào được liên kết với tài khoản của bạn.
                    </div>
                  )}
                </div>
              </section>
            </main>

            <aside className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
                <div className="flex items-center gap-3">
                  <div className="block h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-[#38D9CD] bg-white shadow-md shadow-slate-200/80">
                    {consultant?.avatarUrl ? (
                      <img
                        src={`http://localhost:8080/api/v1/facility-contracts/view-file?path=${encodeURIComponent(consultant.avatarUrl)}`}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center bg-[#B9FFF1] text-[#009C8E]">
                        <User className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#0B3970]">{user?.fullName}</h3>
                    <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Chuyên gia đào tạo
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3 border-t border-slate-100 pt-5 text-xs font-bold text-slate-500">
                  <InfoLine label="Consultant ID" value={`#${itinerary.consultantId}`} />
                  <InfoLine label="Email" value={consultant?.email || user?.fullName || 'N/A'} />
                  <InfoLine label="Điện thoại" value={consultant?.phone || 'Chưa cập nhật'} />
                  <InfoLine label="Chuyên môn" value={consultant?.specialty || 'Chưa cập nhật'} />
                  <InfoLine label="Seminar liên kết" value={`#${itinerary.seminarId || 'N/A'}`} />
                  <InfoLine label="Trạng thái" value={statusLabels[itinerary.overallStatus]} strong />
                  <InfoLine label="Tổng chi phí" value={formatMoney(itinerary.totalCost)} strong />
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-base font-black text-[#0B3970]">Hồ sơ di chuyển</h2>
                    <p className="mt-1 text-xs font-bold text-slate-400">Thông tin hỗ trợ hậu cần đặt vé và lưu trú</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile((current) => !current)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-black text-[#0B3970] transition hover:border-[#5DF8D8]"
                  >
                    {isEditingProfile ? 'Đóng' : 'Sửa'}
                  </button>
                </div>

                {isEditingProfile ? (
                  <form onSubmit={handleSaveProfile} className="mt-4 space-y-3">
                    <ProfileField
                      label="Sở thích di chuyển"
                      value={profileForm.travelPreference}
                      onChange={(value) => setProfileForm((current) => ({ ...current, travelPreference: value }))}
                      multiline
                      placeholder="Ví dụ: ưu tiên chuyến bay buổi sáng, ghế lối đi..."
                    />
                    <ProfileField
                      label="Địa chỉ"
                      value={profileForm.address}
                      onChange={(value) => setProfileForm((current) => ({ ...current, address: value }))}
                      placeholder="Địa chỉ đón/trả phù hợp"
                    />
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                      <ProfileField
                        label="Thành phố"
                        value={profileForm.city}
                        onChange={(value) => setProfileForm((current) => ({ ...current, city: value }))}
                        placeholder="Hà Nội"
                      />
                      <ProfileField
                        label="Quốc gia"
                        value={profileForm.country}
                        onChange={(value) => setProfileForm((current) => ({ ...current, country: value }))}
                        placeholder="Việt Nam"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="w-full rounded-lg bg-[#0B3970] px-4 py-2.5 text-xs font-black text-white transition hover:bg-[#126CB0] disabled:cursor-wait disabled:bg-slate-300"
                    >
                      {isSavingProfile ? 'Đang lưu...' : 'Lưu hồ sơ'}
                    </button>
                  </form>
                ) : (
                  <div className="mt-4 space-y-3 text-xs font-bold text-slate-500">
                    <InfoLine label="Sở thích di chuyển" value={consultant?.travelPreference || 'Chưa cập nhật'} />
                    <InfoLine label="Địa chỉ" value={consultant?.address || 'Chưa cập nhật'} />
                    <InfoLine label="Thành phố" value={consultant?.city || 'Chưa cập nhật'} />
                    <InfoLine label="Quốc gia" value={consultant?.country || 'Chưa cập nhật'} />
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-xs font-semibold leading-5 text-blue-800">
                <div className="mb-3 flex items-center gap-2 font-black text-blue-900">
                  <AlertCircle className="h-5 w-5" />
                  Lưu ý trước khi đi
                </div>
                <p>
                  Kiểm tra đúng điểm đi, điểm đến, giờ khởi hành và mã ghế trước khi xác nhận. Sau khi xác nhận,
                  hệ thống ghi nhận thời điểm xác nhận để phòng hậu cần hoàn tất hồ sơ di chuyển.
                </p>
              </section>
            </aside>
          </div>
        </>
      )}
    </div>
  )
}

function TravelLeg({
  arrangement,
  index,
  seminar,
  facility,
  isUpdating,
  onConfirm,
  onCancel,
  compact = false,
}: {
  arrangement: TravelArrangementResponse
  index: number
  seminar?: SeminarResponse
  facility?: TravelFacilityInfoResponse
  isUpdating: boolean
  onConfirm: () => void
  onCancel: () => void
  compact?: boolean
}) {
  const status = getArrangementStatus(arrangement)
  const statusClass = {
    BOOKED: 'border-amber-200 bg-amber-50 text-amber-700',
    CONFIRMED: 'border-teal-200 bg-teal-50 text-teal-700',
    CANCELLED: 'border-red-200 bg-red-50 text-red-700',
  }[status]

  return (
    <article className={`rounded-2xl border border-slate-200 bg-slate-50/40 ${compact ? 'p-4' : 'p-5'}`}>
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Chuyến {index + 1} • Seminar #{arrangement.seminarId}
          </p>
          <h3 className="mt-1 text-base font-black text-[#0B3970]">
            {transportLabels[arrangement.transportMode] || arrangement.transportMode}
            {arrangement.carrierName ? ` - ${arrangement.carrierName}` : ''}
          </h3>
          <p className="mt-1 text-xs font-bold text-slate-500">
            {arrangement.travelAgencyName || 'Đặt trực tiếp'} • Mã chuyến: {arrangement.serviceNumber || 'N/A'}
          </p>
        </div>
        <span className={`inline-flex w-fit items-center gap-1.5 rounded-md border px-2.5 py-1 text-[10px] font-black uppercase ${statusClass}`}>
          {status === 'CONFIRMED' ? <CheckCircle2 className="h-3.5 w-3.5" /> : status === 'CANCELLED' ? <XCircle className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
          {statusLabels[status]}
        </span>
      </div>

      <div className="mt-4 grid gap-3 rounded-xl border border-blue-100 bg-white p-4 text-xs font-bold text-slate-500 md:grid-cols-2">
        <InfoLine
          label="Seminar tham gia"
          value={seminar?.seminarName || `Seminar #${arrangement.seminarId}`}
          strong
        />
        <InfoLine
          label="Facility / địa điểm"
          value={facility?.facilityName || 'Chưa có địa điểm liên kết'}
        />
        {seminar && <InfoLine label="Thời gian seminar" value={`${formatDate(seminar.startDate)} - ${formatDate(seminar.endDate)}`} />}
        {facility && <InfoLine label="Địa chỉ facility" value={facility.facilityAddress} />}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <TravelPoint label="Điểm đi" location={arrangement.departureLocation} time={arrangement.departureTime} />
        <div className="hidden h-px w-16 bg-slate-200 md:block" />
        <TravelPoint label="Điểm đến" location={arrangement.arrivalLocation} time={arrangement.arrivalTime} />
      </div>

      <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 text-xs font-bold text-slate-500 sm:grid-cols-3">
        <InfoLine label="Ghế / ghi chú vé" value={arrangement.seatInfo || 'Chưa có'} />
        <InfoLine label="Chi phí" value={formatMoney(arrangement.cost)} />
        <InfoLine
          label="Đã xác nhận lúc"
          value={arrangement.confirmationSentDatetime ? formatDateTime(arrangement.confirmationSentDatetime) : 'Chưa xác nhận'}
        />
      </div>

      {status === 'BOOKED' && (
        <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isUpdating}
            className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-black text-red-600 shadow-sm transition hover:bg-red-50 disabled:cursor-wait disabled:border-slate-200 disabled:text-slate-300"
          >
            <XCircle className="h-4 w-4" />
            Hủy chặng
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isUpdating}
            className="flex items-center gap-2 rounded-lg bg-teal-500 px-4 py-2 text-xs font-black text-white shadow-sm transition hover:bg-teal-600 disabled:cursor-wait disabled:bg-teal-300"
          >
            <TicketCheck className="h-4 w-4" />
            {isUpdating ? 'Đang xác nhận...' : 'Xác nhận chặng này'}
          </button>
        </div>
      )}
    </article>
  )
}

function TravelPoint({ label, location, time }: { label: string; location: string; time: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4">
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-black text-[#0B3970]">{location}</p>
      <p className="mt-1 text-xs font-bold text-slate-500">{formatDateTime(time)}</p>
    </div>
  )
}

function SeminarAssignmentCard({
  seminarId,
  seminar,
  facility,
  trips,
}: {
  seminarId: number
  seminar?: SeminarResponse
  facility?: TravelFacilityInfoResponse
  trips: TravelArrangementResponse[]
}) {
  const pendingCount = trips.filter((trip) => getArrangementStatus(trip) === 'BOOKED').length
  const confirmedCount = trips.filter((trip) => getArrangementStatus(trip) === 'CONFIRMED').length

  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50/40 p-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)]">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Seminar #{seminarId}</p>
          <h3 className="mt-1 text-base font-black leading-6 text-[#0B3970]">
            {seminar?.seminarName || 'Seminar chưa tải được thông tin'}
          </h3>
          <div className="mt-3 grid gap-3 text-xs font-bold text-slate-500 sm:grid-cols-3">
            <InfoLine label="Thành phố" value={seminar?.city || 'N/A'} />
            <InfoLine
              label="Ngày tổ chức"
              value={seminar ? `${formatDate(seminar.startDate)} - ${formatDate(seminar.endDate)}` : 'N/A'}
            />
            <InfoLine label="Số chuyến đi" value={`${trips.length} chuyến`} strong />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-black text-amber-700">
              {pendingCount} chờ xác nhận
            </span>
            <span className="rounded-md border border-teal-200 bg-teal-50 px-2.5 py-1 text-[11px] font-black text-teal-700">
              {confirmedCount} đã xác nhận
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-indigo-100 bg-white p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Facility liên quan</p>
          {facility ? (
            <>
              <h4 className="mt-1 text-sm font-black text-[#0B3970]">{facility.facilityName}</h4>
              <p className="mt-1 text-xs font-bold leading-5 text-slate-500">{facility.facilityAddress}</p>
              {facility.roomNameSpecs?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {facility.roomNameSpecs.map((room) => (
                    <span key={room} className="rounded-md bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700">
                      {room}
                    </span>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="mt-2 text-xs font-bold text-slate-400">Chưa có facility được liên kết.</p>
          )}
        </div>
      </div>
    </article>
  )
}

function SummaryTile({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#E9FFFB] text-[#007E73]">{icon}</div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p>
          <p className="mt-1 text-lg font-black text-[#0B3970]">{value}</p>
        </div>
      </div>
      <p className="mt-3 truncate text-xs font-bold text-slate-500">{detail}</p>
    </div>
  )
}

function SectionTitle({
  icon,
  title,
  subtitle,
  borderless = false,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  borderless?: boolean
}) {
  return (
    <div className={`flex items-start gap-2 ${borderless ? '' : 'border-b border-slate-100 pb-4'}`}>
      {icon}
      <div>
        <h2 className="text-base font-black text-[#0B3970]">{title}</h2>
        <p className="mt-1 text-xs font-bold text-slate-400">{subtitle}</p>
      </div>
    </div>
  )
}

function Message({ tone, icon, children }: { tone: 'success' | 'warning'; icon: React.ReactNode; children: React.ReactNode }) {
  const className =
    tone === 'success'
      ? 'border-teal-200 bg-teal-50 text-teal-700'
      : 'border-amber-200 bg-amber-50 text-amber-700'

  return (
    <div className={`flex items-start gap-2.5 rounded-xl border p-4 text-xs font-bold ${className}`}>
      {icon}
      <span>{children}</span>
    </div>
  )
}

function EmptyTravelState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-xl shadow-slate-200/70">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-slate-400">
        <Plane className="h-7 w-7" />
      </div>
      <h2 className="mt-4 text-lg font-black text-[#0B3970]">Chưa có lịch trình di chuyển</h2>
      <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">
        Khi phòng hậu cần đặt vé hoặc liên kết khách sạn cho seminar của bạn, thông tin sẽ xuất hiện tại đây.
      </p>
    </div>
  )
}

function InfoLine({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`mt-0.5 ${strong ? 'font-black text-[#0B3970]' : 'text-slate-600'}`}>{value}</p>
    </div>
  )
}

function ProfileField({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  multiline?: boolean
}) {
  return (
    <label className="block text-xs font-bold text-slate-600">
      <span className="mb-1.5 block">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#18395F] outline-none transition focus:border-[#5DF8D8]"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#18395F] outline-none transition focus:border-[#5DF8D8]"
        />
      )}
    </label>
  )
}

function getArrangementStatus(arrangement: TravelArrangementResponse): TravelArrangementStatus {
  return arrangement.status || arrangement.travelArrangementStatus || 'BOOKED'
}

function formatDateTime(value: string) {
  if (!value) return 'N/A'
  return new Date(value).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatShortDateTime(value: string) {
  if (!value) return 'N/A'
  return new Date(value).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  })
}

function formatDate(value: string) {
  if (!value) return 'N/A'
  const [year, month, day] = value.split('-')
  return `${day}/${month}/${year}`
}

function formatMoney(value: number | null) {
  if (value === null || value === undefined) return 'Chưa có'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}
