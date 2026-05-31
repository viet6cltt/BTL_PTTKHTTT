import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ChevronRight,
  FileSignature,
  FileText,
  Mail,
  MapPin,
  Pencil,
  Package2,
  PackageCheck,
  PieChart,
  Phone,
  Plane,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  Trash2,
  Truck,
  User,
  UserCheck,
  UserRound,
  XCircle,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { InfoCard } from '../components/info/InfoCard'
import { api, SeminarResponse, SeminarReservationResponse, TravelArrangementResponse, MaterialRequestResponse, SeminarRequirementsPreviewResponse, FacilityResponse, AudioVisualEquipmentResponse, TravelItineraryResponse } from '../api'
import { useAuth } from '../context/AuthContext'

interface SeminarDetailPageProps {
  seminarId: number
  onBack: () => void
}

type DraftRoom = {
  roomNameSpec: string
  seatingArrangement: string
  numSeats: string
  roomImage: File | null
}

export function SeminarDetailPage({ seminarId, onBack }: SeminarDetailPageProps) {
  const { user } = useAuth()
  
  // Core Data States
  const [seminar, setSeminar] = useState<SeminarResponse | null>(null)
  const [reservation, setReservation] = useState<SeminarReservationResponse | null>(null)
  const [travelList, setTravelList] = useState<TravelArrangementResponse[]>([])
  const [travelItinerary, setTravelItinerary] = useState<TravelItineraryResponse | null>(null)
  const [materialsList, setMaterialsList] = useState<MaterialRequestResponse[]>([])
  const [previewRequirements, setPreviewRequirements] = useState<SeminarRequirementsPreviewResponse | null>(null)
  const [facilities, setFacilities] = useState<FacilityResponse[]>([])
  const [avEquipmentOptions, setAvEquipmentOptions] = useState<AudioVisualEquipmentResponse[]>([])

  // UI Flow States
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'INFO' | 'CONTRACT' | 'TRAVEL' | 'MATERIALS' | 'REPORT'>('INFO')

  // Modals & Sub-forms
  const [isAssigning, setIsAssigning] = useState(false)
  const [isAddingTravel, setIsAddingTravel] = useState(false)
  const [editingTravelId, setEditingTravelId] = useState<number | null>(null)
  const [isCreatingMaterials, setIsCreatingMaterials] = useState(false)
  const [isCreatingFacility, setIsCreatingFacility] = useState(false)
  const [isCompletingVenue, setIsCompletingVenue] = useState(false)
  const [showFacilityForm, setShowFacilityForm] = useState(false)
  
  // Form fields
  const [scannedFile, setScannedFile] = useState<File | null>(null)
  const [finalCost, setFinalCost] = useState<string>('')
  const [contractNotes, setContractNotes] = useState<string>('')

  // Facility fields
  const [facilityName, setFacilityName] = useState('')
  const [facilityAddress, setFacilityAddress] = useState('')
  const [facilityCity, setFacilityCity] = useState('')
  const [facilityCapacity, setFacilityCapacity] = useState('')
  const [facilitySalesName, setFacilitySalesName] = useState('')
  const [facilitySalesPhone, setFacilitySalesPhone] = useState('')
  const [facilitySalesEmail, setFacilitySalesEmail] = useState('')
  const [facilityRoomCount, setFacilityRoomCount] = useState('')
  const [facilityDailyCost, setFacilityDailyCost] = useState('')

  // Venue completion fields
  const [draftRooms, setDraftRooms] = useState<DraftRoom[]>([
    { roomNameSpec: '', seatingArrangement: '', numSeats: '', roomImage: null },
  ])

  // AV reservation fields
  const [avRows, setAvRows] = useState<Array<{ equipmentId: string; quantityReserved: string; costForEachEquipment: string }>>([
    { equipmentId: '', quantityReserved: '1', costForEachEquipment: '0' },
  ])

  // Travel fields
  const [transportMode, setTransportMode] = useState<string>('FLIGHT')
  const [carrierName, setCarrierName] = useState('')
  const [serviceNumber, setServiceNumber] = useState('')
  const [departureLocation, setDepartureLocation] = useState('')
  const [arrivalLocation, setArrivalLocation] = useState('')
  const [departureTime, setDepartureTime] = useState('')
  const [arrivalTime, setArrivalTime] = useState('')
  const [seatInfo, setSeatInfo] = useState('')
  const [travelCost, setTravelCost] = useState('')
  const [travelAgency, setTravelAgency] = useState('Đại lý vé Hồng Hà')

  // Materials fields
  const [neededByDate, setNeededByDate] = useState('')
  const [materialNotes, setMaterialNotes] = useState('')
  const [materialsQuantities, setMaterialsQuantities] = useState<Record<number, number>>({})

  // Load all logistics data for this seminar
  async function loadAllLogisticsData() {
    try {
      setIsLoading(true)
      setErrorMsg(null)
      
      const sem = await api.getSeminarById(seminarId)
      setSeminar(sem)
      
      // Load reservation details
      try {
        const res = await api.getReservationsBySeminar(seminarId)
        setReservation(res)
      } catch {
        setReservation(null)
      }

      // Load travel itineraries
      try {
        const trav = await api.getTravelBySeminar(seminarId)
        setTravelList(trav || [])
      } catch {
        setTravelList([])
      }

      try {
        const itinerary = await api.getTravelItinerary(seminarId, sem.consultantId)
        setTravelItinerary(itinerary)
      } catch {
        setTravelItinerary(null)
      }

      // Load material requests
      try {
        const mat = await api.getMaterialRequestsBySeminar(seminarId)
        setMaterialsList(mat || [])
      } catch {
        setMaterialsList([])
      }

      // If coordinator, load preview requirements & available facilities in background
      if (user?.role === 'LOGISTICS_COORDINATOR' || user?.role === 'ADMIN') {
        try {
          const reqs = await api.getRequirementsPreview(seminarId)
          setPreviewRequirements(reqs)
          
          // Seed initial quantities for materials creation form
          const initialQuants: Record<number, number> = {}
          reqs.materials.forEach((m) => {
            initialQuants[m.materialId] = m.calculatedQuantity
          })
          setMaterialsQuantities(initialQuants)

          const facs = await api.searchFacilities(sem.city, sem.anticipatedRegistrants)
          setFacilities(facs.content || [])

          const avOptions = await api.getAudioVisualEquipments()
          setAvEquipmentOptions(avOptions || [])
        } catch {
          // Ignore background load failures
        }
      }

    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi không thể tải thông tin logistics của seminar này.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAllLogisticsData()
  }, [seminarId])

  // Operation Triggers
  async function handleAssignCoordinator() {
    if (!seminar || !user) return
    try {
      setIsAssigning(true)
      setErrorMsg(null)
      const targetUserId = user.role === 'LOGISTICS_COORDINATOR' ? user.userId : 6
      await api.assignCoordinator(seminar.id, targetUserId)
      if (user.role === 'LOGISTICS_COORDINATOR') {
        setSuccessMsg('Bạn đã nhận nhiệm vụ phụ trách Hậu cần cho Seminar này thành công!')
      } else {
        setSuccessMsg('Đã phân công Điều phối viên Hoàng Anh Đức phụ trách seminar!')
      }
      await loadAllLogisticsData()
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi phân công điều phối viên.')
    } finally {
      setIsAssigning(false)
    }
  }

  async function handleSelectHotel(facilityId: number) {
    if (!seminar) return
    try {
      setErrorMsg(null)
      await api.createContract(seminar.id, facilityId)
      setSuccessMsg('Khởi tạo hợp đồng địa điểm thành công! Hãy bổ sung phòng nghỉ & vật tư.')
      await loadAllLogisticsData()
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể tạo hợp đồng nháp.')
    }
  }

  async function handleCreateFacilitySubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!seminar || !facilityName || !facilityAddress || !facilityCity || !facilityCapacity) {
      setErrorMsg('Vui lòng nhập tên, địa chỉ, thành phố và sức chứa của địa điểm.')
      return
    }

    try {
      setIsCreatingFacility(true)
      setErrorMsg(null)
      const created = await api.createFacility({
        facilityName,
        address: facilityAddress,
        city: facilityCity,
        maxCapacity: Number(facilityCapacity),
        salesManagerName: facilitySalesName || undefined,
        salesManagerPhone: facilitySalesPhone || undefined,
        salesManagerEmail: facilitySalesEmail || undefined,
        numberOfRoom: facilityRoomCount ? Number(facilityRoomCount) : undefined,
        costForEachDay: facilityDailyCost ? Number(facilityDailyCost) : undefined,
      })

      setFacilities((current) => [created, ...current])
      setFacilityName('')
      setFacilityAddress('')
      setFacilityCity(seminar.city)
      setFacilityCapacity(String(seminar.anticipatedRegistrants))
      setFacilitySalesName('')
      setFacilitySalesPhone('')
      setFacilitySalesEmail('')
      setFacilityRoomCount('')
      setFacilityDailyCost('')
      setShowFacilityForm(false)
      setSuccessMsg('Đã thêm địa điểm tổ chức thủ công vào danh sách lựa chọn.')
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể tạo địa điểm tổ chức.')
    } finally {
      setIsCreatingFacility(false)
    }
  }

  async function handleCompleteVenueSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reservation?.contractId || !scannedFile || !finalCost) {
      setErrorMsg('Vui lòng chọn file quét hợp đồng và điền tổng chi phí.')
      return
    }

    const roomsToCreate = draftRooms.filter((room) => room.roomNameSpec && room.numSeats)
    const existingSeatCount =
      reservation.roomReservations?.reduce((total, room) => total + room.numSeats, 0) || 0
    const newSeatCount = roomsToCreate.reduce((total, room) => total + Number(room.numSeats || 0), 0)
    if (existingSeatCount + newSeatCount < seminar!.anticipatedRegistrants) {
      setErrorMsg(`Tổng số ghế phòng họp cần tối thiểu ${seminar!.anticipatedRegistrants} chỗ.`)
      return
    }

    const equipments = avRows
      .filter((row) => row.equipmentId && row.quantityReserved)
      .map((row) => ({
        equipmentId: Number(row.equipmentId),
        quantityReserved: Number(row.quantityReserved),
        costForEachEquipment: Number(row.costForEachEquipment) || 0,
      }))

    try {
      setIsCompletingVenue(true)
      setErrorMsg(null)

      for (const room of roomsToCreate) {
        const formData = new FormData()
        formData.append('contractId', String(reservation.contractId))
        formData.append('roomNameSpec', room.roomNameSpec)
        formData.append('seatingArrangement', room.seatingArrangement)
        formData.append('numSeats', room.numSeats)
        if (room.roomImage) {
          formData.append('roomImage', room.roomImage)
        }
        await api.createRoomReservation(formData)
      }

      if (equipments.length > 0) {
        await api.saveAvEquipmentReservations({
          contractId: reservation.contractId,
          equipments,
        })
      }

      await api.approveContract(
        reservation.contractId,
        scannedFile,
        Number(finalCost),
        contractNotes,
      )

      setSuccessMsg('Đã hoàn tất địa điểm tổ chức: phòng họp, AV và hợp đồng đã được duyệt.')
      setScannedFile(null)
      setFinalCost('')
      setContractNotes('')
      setDraftRooms([{ roomNameSpec: '', seatingArrangement: '', numSeats: '', roomImage: null }])
      setAvRows([{ equipmentId: '', quantityReserved: '1', costForEachEquipment: '0' }])
      await loadAllLogisticsData()
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể hoàn tất cấu hình địa điểm.')
    } finally {
      setIsCompletingVenue(false)
    }
  }

  async function handleAddTravelSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!seminar || !departureLocation || !arrivalLocation || !departureTime || !arrivalTime) {
      setErrorMsg('Vui lòng điền đầy đủ thông tin di chuyển bắt buộc.')
      return
    }
    try {
      setErrorMsg(null)
      const payload = {
        seminarId: seminar.id,
        consultantId: seminar.consultantId,
        travelAgencyName: travelAgency,
        transportMode,
        carrierName: carrierName || 'Vietnam Airlines',
        serviceNumber: serviceNumber || 'VN123',
        departureLocation,
        arrivalLocation,
        departureTime: departureTime + ':00',
        arrivalTime: arrivalTime + ':00',
        seatInfo: seatInfo || '32A',
        cost: Number(travelCost) || 0,
      }

      if (editingTravelId) {
        await api.updateTravel(editingTravelId, payload)
        setSuccessMsg('Cập nhật lịch trình di chuyển thành công!')
      } else {
        await api.createTravel(payload)
        setSuccessMsg('Lên lịch trình vé di chuyển cho chuyên gia thành công!')
      }
      setIsAddingTravel(false)
      setEditingTravelId(null)
      resetTravelForm()
      await loadAllLogisticsData()
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi lưu lịch trình di chuyển.')
    }
  }

  function startEditTravel(travel: TravelArrangementResponse) {
    setEditingTravelId(travel.travelArrangementId)
    setTransportMode(travel.transportMode)
    setCarrierName(travel.carrierName || '')
    setServiceNumber(travel.serviceNumber || '')
    setDepartureLocation(travel.departureLocation)
    setArrivalLocation(travel.arrivalLocation)
    setDepartureTime(toDateTimeInputValue(travel.departureTime))
    setArrivalTime(toDateTimeInputValue(travel.arrivalTime))
    setSeatInfo(travel.seatInfo || '')
    setTravelCost(travel.cost !== null && travel.cost !== undefined ? String(travel.cost) : '')
    setTravelAgency(travel.travelAgencyName || '')
    setIsAddingTravel(true)
  }

  function resetTravelForm() {
    setTransportMode('FLIGHT')
    setCarrierName('')
    setServiceNumber('')
    setDepartureLocation('')
    setArrivalLocation('')
    setDepartureTime('')
    setArrivalTime('')
    setSeatInfo('')
    setTravelCost('')
    setTravelAgency('Đại lý vé Hồng Hà')
  }

  async function handleConfirmTravelTicket(travelId: number) {
    try {
      setErrorMsg(null)
      await api.updateTravelStatus(travelId, 'CONFIRMED')
      setSuccessMsg('Xác nhận lịch trình di chuyển thành công! Cám ơn chuyên gia.')
      await loadAllLogisticsData()
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi xác nhận lịch trình.')
    }
  }

  async function handleCancelTravelTicket(travelId: number) {
    try {
      setErrorMsg(null)
      await api.updateTravelStatus(travelId, 'CANCELLED')
      setSuccessMsg('Đã hủy lịch trình di chuyển.')
      await loadAllLogisticsData()
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi hủy lịch trình.')
    }
  }

  async function handleDeleteTravelTicket(travelId: number) {
    try {
      setErrorMsg(null)
      await api.deleteTravel(travelId)
      setSuccessMsg('Đã xóa lịch trình di chuyển.')
      await loadAllLogisticsData()
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi xóa lịch trình.')
    }
  }

  async function handleCreateMaterialsSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!seminar || !neededByDate) {
      setErrorMsg('Vui lòng nhập ngày cần bàn giao tài liệu học phần.')
      return
    }
    try {
      setErrorMsg(null)
      const items = Object.entries(materialsQuantities).map(([matId, qty]) => ({
        materialId: Number(matId),
        requestedQuantity: qty,
      }))
      await api.createMaterialRequest(seminar.id, {
        neededByDate,
        notes: materialNotes,
        items,
      })
      setSuccessMsg('Tạo yêu cầu đóng gói vận chuyển tài liệu học tập thành công!')
      setIsCreatingMaterials(false)
      setNeededByDate('')
      setMaterialNotes('')
      await loadAllLogisticsData()
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi yêu cầu vật tư.')
    }
  }

  async function handleUpdateShipment(requestId: number, nextStatus: 'PACKED' | 'SHIPPED' | 'DELIVERED') {
    try {
      setErrorMsg(null)
      await api.updateShipmentStatus(requestId, nextStatus)
      setSuccessMsg(`Cập nhật trạng thái đóng gói/vận chuyển thành [${nextStatus}] thành công!`)
      await loadAllLogisticsData()
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi cập nhật vận chuyển.')
    }
  }

  async function handleConfirmDeliveredAtVenue(requestId: number) {
    const note = prompt('Vui lòng nhập ghi chú kiểm kê tài liệu khi nhận tại địa điểm:')
    if (note === null) return // Canceled
    try {
      setErrorMsg(null)
      await api.confirmDelivered(requestId, note || 'Học liệu đã nhận đầy đủ tại sảnh khách sạn.')
      setSuccessMsg('Xác nhận nhận học liệu tại địa điểm tổ chức seminar thành công!')
      await loadAllLogisticsData()
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi nhận học liệu.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0B3970] border-t-transparent" />
      </div>
    )
  }

  if (!seminar) return null

  // Role permissions helpers
  const isBookingStaff = user?.role === 'BOOKING_STAFF' || user?.role === 'ADMIN'
  const isCoordinatorRole = user?.role === 'LOGISTICS_COORDINATOR'
  const canManageSeminarLogistics =
    user?.role === 'ADMIN' || (isCoordinatorRole && seminar.coordinatorId === user.userId)
  const isConsultant = user?.role === 'CONSULTANT'
  const isMaterialsStaff = user?.role === 'MATERIALS_STAFF' || user?.role === 'ADMIN'

  const hasCoordinatorAssigned = seminar.coordinatorId !== null
  const facilityCost = reservation?.totalCost || 0
  const travelCostTotal = travelList.reduce((total, item) => total + (item.cost || 0), 0)
  const materialItemCount = materialsList.reduce(
    (total, request) =>
      total + request.items.reduce((requestTotal, item) => requestTotal + item.requestedQuantity, 0),
    0,
  )
  const estimatedMaterialCost = materialItemCount * 15000
  const estimatedGrandTotal = facilityCost + travelCostTotal + estimatedMaterialCost

  return (
    <div className="space-y-6">
      
      {/* Back button & Title */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-[#5DF8D8] hover:text-[#0B3970]"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <div className="flex items-center gap-2 text-xs font-black tracking-wide uppercase text-slate-400">
            <span>Quản lý Seminar</span>
            <ChevronRight className="h-3 w-3" />
            <span>Mã số #{seminar.id}</span>
          </div>
          <h1 className="text-2xl font-black text-[#0B3970] mt-1">{seminar.seminarName}</h1>
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-600 flex items-center gap-2">
          <XCircle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm font-bold text-teal-700 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-teal-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Coordinator Assignment alert for Booking Staff */}
      {!hasCoordinatorAssigned && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-left">
            <h3 className="text-sm font-black text-amber-800 uppercase tracking-wider">Chưa phân công Điều phối viên Hậu cần</h3>
            <p className="mt-1 text-xs text-amber-700 leading-5">
              Học phần này chưa được gán cho nhân viên phụ trách thuê địa điểm khách sạn và lập lịch trình đưa đón chuyên gia.
            </p>
          </div>
          {(isBookingStaff || user?.role === 'LOGISTICS_COORDINATOR') && (
            <button
              type="button"
              disabled={isAssigning}
              onClick={handleAssignCoordinator}
              className="flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 py-3 text-xs font-black text-white shadow-md shadow-amber-900/10 hover:bg-amber-700 transition shrink-0"
            >
              <UserCheck className="h-4.5 w-4.5" />
              {isAssigning 
                ? 'Đang thực hiện...' 
                : user?.role === 'LOGISTICS_COORDINATOR' 
                  ? 'Nhận nhiệm vụ phụ trách' 
                  : 'Gán cho Hoàng Anh Đức (Coordinator)'}
            </button>
          )}
        </div>
      )}

      {/* Tab Selectors */}
      <div className="flex border-b border-slate-200 bg-white/40 p-1.5 rounded-xl border">
        {[
          { id: 'INFO', label: 'Tổng quan', icon: FileText },
          { id: 'CONTRACT', label: 'Địa điểm', icon: Building2 },
          { id: 'TRAVEL', label: 'Di chuyển', icon: Plane },
          { id: 'MATERIALS', label: 'Học liệu', icon: Package2 },
          { id: 'REPORT', label: 'Tổng kết chi phí', icon: PieChart },
        ].map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as any)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-xs font-extrabold transition-all ${
                activeTab === t.id
                  ? 'bg-[#0B3970] text-white shadow-md shadow-blue-900/20'
                  : 'text-slate-500 hover:bg-white/60 hover:text-[#0B3970]'
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          )
        })}
      </div>

      <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_360px]">
        
        {/* Main Tab Panels */}
        <section className="space-y-6">

          {/* TAB 1: Core Info */}
          {activeTab === 'INFO' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/70 space-y-6 text-left">
              <div className="flex items-center gap-2.5 text-[#0B3970] border-b border-slate-100 pb-4">
                <Sparkles className="h-5.5 w-5.5 text-[#126CB0]" />
                <h2 className="text-base font-black">Thông tin chung học phần</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <DetailField label="Tên Seminar chính thức" value={seminar.seminarName} wide />
                <DetailField label="Phân loại học phần" value={seminar.seminarTypeName} />
                <DetailField label="Thành phố tổ chức" value={seminar.city} />
                <DetailField label="Chuyên gia phụ trách" value={seminar.consultantFullName} />
                <DetailField label="Người điều phối (Logistics)" value={seminar.coordinatorFullName || 'Chưa phân công'} />
                <DetailField label="Ngày khai giảng" value={formatDate(seminar.startDate)} />
                <DetailField label="Ngày kết thúc" value={formatDate(seminar.endDate)} />
                <DetailField label="Học viên dự kiến" value={`${seminar.anticipatedRegistrants} người`} />
                <DetailField label="Ghi chú booking" value={seminar.note || 'Không có ghi chú'} wide />
              </div>
            </div>
          )}

          {/* TAB 2: Contract Details */}
          {activeTab === 'CONTRACT' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/70 space-y-6 text-left">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5 text-[#0B3970]">
                  <Building2 className="h-5.5 w-5.5 text-[#126CB0]" />
                  <h2 className="text-base font-black">Thông tin thuê địa điểm tổ chức</h2>
                </div>
                {reservation?.contractStatus && (
                  <span className={`rounded-sm border px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${
                    reservation.contractStatus === 'APPROVED'
                      ? 'bg-teal-50 border-teal-200 text-teal-700'
                      : reservation.contractStatus === 'REJECTED'
                      ? 'bg-red-50 border-red-200 text-red-700'
                      : 'bg-amber-50 border-amber-200 text-amber-700'
                  }`}>
                    {reservation.contractStatus === 'APPROVED' ? 'Đã ký duyệt' : reservation.contractStatus === 'REJECTED' ? 'Bị từ chối' : 'Đang thương lượng'}
                  </span>
                )}
              </div>

              {!reservation?.contractId ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4">
                    <p className="text-xs font-bold text-amber-800">
                      ⚠️ Seminar này chưa được ký kết địa điểm tổ chức (Khách sạn/Hội trường).
                    </p>
                  </div>
                  {canManageSeminarLogistics && (
                    <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/50 space-y-4 text-left">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h4 className="text-xs font-black uppercase tracking-wider text-[#0B3970] flex items-center gap-1.5">
                          <Building2 className="h-4 w-4 text-[#126CB0]" />
                          Danh sách địa điểm phù hợp ở {seminar.city} (Sức chứa &gt;= {seminar.anticipatedRegistrants} người)
                        </h4>
                        <button
                          type="button"
                          onClick={() => {
                            setFacilityCity(seminar.city)
                            setFacilityCapacity(String(seminar.anticipatedRegistrants))
                            setShowFacilityForm((current) => !current)
                          }}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#0B3970] bg-white px-4 py-2.5 text-xs font-black text-[#0B3970] transition hover:bg-[#0B3970] hover:text-white"
                        >
                          <PlusCircle className="h-4 w-4" />
                          Thêm địa điểm thủ công
                        </button>
                      </div>

                      {showFacilityForm && (
                        <form onSubmit={handleCreateFacilitySubmit} className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm space-y-4">
                          <div>
                            <h5 className="text-sm font-black text-[#0B3970]">Thông tin địa điểm mới</h5>
                            <p className="mt-1 text-xs font-semibold text-slate-500">
                              Coordinator có thể nhập nhanh địa điểm chưa có trong danh mục để tạo hợp đồng cho seminar này.
                            </p>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <FacilityInput label="Tên địa điểm *" value={facilityName} onChange={setFacilityName} placeholder="VD: Khách sạn Sunlight Convention" />
                            <FacilityInput label="Thành phố *" value={facilityCity} onChange={setFacilityCity} placeholder="VD: Hà Nội" />
                            <div className="md:col-span-2">
                              <FacilityInput label="Địa chỉ *" value={facilityAddress} onChange={setFacilityAddress} placeholder="VD: 12 Nguyễn Văn Cừ, Long Biên" />
                            </div>
                            <FacilityInput label="Sức chứa tối đa *" type="number" value={facilityCapacity} onChange={setFacilityCapacity} placeholder="VD: 80" />
                            <FacilityInput label="Số phòng họp" type="number" value={facilityRoomCount} onChange={setFacilityRoomCount} placeholder="VD: 3" />
                            <FacilityInput label="Chi phí/ngày (VNĐ)" type="number" value={facilityDailyCost} onChange={setFacilityDailyCost} placeholder="VD: 4500000" />
                            <FacilityInput label="Tên sales phụ trách" value={facilitySalesName} onChange={setFacilitySalesName} placeholder="VD: Nguyễn Minh Anh" />
                            <FacilityInput label="SĐT sales" value={facilitySalesPhone} onChange={setFacilitySalesPhone} placeholder="VD: 0901234567" />
                            <FacilityInput label="Email sales" type="email" value={facilitySalesEmail} onChange={setFacilitySalesEmail} placeholder="sales@hotel.vn" />
                          </div>

                          <div className="flex flex-wrap justify-end gap-3 pt-2">
                            <button
                              type="button"
                              onClick={() => setShowFacilityForm(false)}
                              className="rounded-lg px-4 py-2 text-xs font-black text-slate-500 transition hover:bg-slate-100"
                            >
                              Hủy
                            </button>
                            <button
                              type="submit"
                              disabled={isCreatingFacility}
                              className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-black text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                            >
                              {isCreatingFacility ? 'Đang lưu...' : 'Lưu địa điểm'}
                            </button>
                          </div>
                        </form>
                      )}

                      <div className="space-y-3">
                        {facilities.length > 0 ? (
                          facilities.map((f) => (
                            <div key={f.facilityId} className="flex flex-col sm:flex-row sm:items-center sm:justify-between border border-slate-100 p-4 rounded-xl bg-white gap-4 shadow-sm hover:shadow-md transition">
                              <div>
                                <h5 className="text-sm font-extrabold text-[#0B3970]">{f.facilityName}</h5>
                                <p className="text-xs text-slate-400 mt-1">{f.address}</p>
                                <div className="flex flex-wrap items-center gap-3 mt-2">
                                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                                    Sức chứa: {f.maxCapacity} người
                                  </span>
                                  <span className="inline-flex items-center rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700">
                                    Đơn giá: {f.costForEachDay.toLocaleString('vi-VN')} VNĐ / ngày
                                  </span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleSelectHotel(f.facilityId)}
                                className="rounded-xl bg-[#0B3970] px-4 py-2.5 text-xs font-black text-white hover:bg-[#126CB0] transition shadow-md shadow-slate-900/10 cursor-pointer shrink-0"
                              >
                                Tiến hành đàm phán
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="py-6 text-center text-xs text-slate-400 bg-white border rounded-xl">
                            Không tìm thấy địa điểm nào ở {seminar.city} phù hợp với sức chứa tối thiểu {seminar.anticipatedRegistrants} người.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <DetailField label="Tên Khách sạn" value={reservation.facilityName} />
                    <DetailField label="Địa chỉ" value={reservation.facilityAddress} />
                    <DetailField label="Tổng chi phí thuê tạm tính" value={reservation.totalCost ? `${reservation.totalCost.toLocaleString('vi-VN')} VNĐ` : 'Chưa chốt chi phí'} />
                    <DetailField label="File scan hợp đồng" value={
                      reservation.contractDocPath ? (
                        <a
                          href={facilityFileUrl(reservation.contractDocPath)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 font-black underline hover:text-blue-800"
                        >
                          Tải/Xem scan PDF hợp đồng đã ký
                        </a>
                      ) : (
                        <span className="text-slate-400">Chưa tải file scan lên</span>
                      )
                    } />
                  </div>

                  {/* Room bookings listing */}
                  <div className="border-t border-slate-100 pt-5 space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Phòng họp & Sơ đồ bàn ghế đã gán</h3>
                        <p className="mt-1 text-xs font-semibold text-slate-400">
                          Lưu tên phòng, kiểu sắp xếp, số ghế và ảnh minh họa phòng họp.
                        </p>
                      </div>
                      {reservation.contractStatus === 'APPROVED' && (
                        <span className="rounded-lg bg-teal-50 px-3 py-2 text-[10px] font-black uppercase tracking-wide text-teal-700">
                          Đã khóa cấu hình
                        </span>
                      )}
                    </div>

                    {canManageSeminarLogistics && reservation.contractStatus !== 'APPROVED' && (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-bold text-amber-800">
                        Phòng họp sẽ được nhập trong form hoàn tất địa điểm bên dưới, rồi duyệt hợp đồng ở bước cuối.
                      </div>
                    )}

                    <div className="grid gap-3 sm:grid-cols-2">
                      {reservation.roomReservations && reservation.roomReservations.length > 0 ? (
                        reservation.roomReservations.map((r, i) => (
                          <div key={r.roomReservationId || i} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50/50 text-xs leading-5">
                            {r.roomImageUrl ? (
                              <img
                                src={facilityFileUrl(r.roomImageUrl)}
                                alt={r.roomNameSpec}
                                className="h-32 w-full object-cover"
                              />
                            ) : (
                              <div className="grid h-24 w-full place-items-center bg-[#EBFDFA] text-teal-600">
                                <Building2 className="h-8 w-8" />
                              </div>
                            )}
                            <div className="space-y-2 p-3.5">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-extrabold text-[#0B3970]">{r.roomNameSpec}</p>
                                  <p className="text-slate-500">Bố trí: {r.seatingArrangement || 'Chưa ghi'} • {r.numSeats} chỗ ngồi</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400">Chưa cấu hình phòng tổ chức cụ thể.</p>
                      )}
                    </div>
                  </div>

                  {/* Audio visual equipment list */}
                  <div className="border-t border-slate-100 pt-5 space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Thiết bị âm thanh, ánh sáng (AV) thuê thêm</h3>
                        <p className="mt-1 text-xs font-semibold text-slate-400">
                          Danh mục thiết bị lấy từ module masterdata, lưu theo hợp đồng địa điểm.
                        </p>
                      </div>
                      {reservation.contractStatus === 'APPROVED' && (
                        <span className="rounded-lg bg-teal-50 px-3 py-2 text-[10px] font-black uppercase tracking-wide text-teal-700">
                          Đã khóa cấu hình
                        </span>
                      )}
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b text-slate-400 font-extrabold">
                            <th className="py-2 text-left">Mã thiết bị</th>
                            <th className="py-2 text-right">Số lượng thuê</th>
                            <th className="py-2 text-right">Đơn giá / bộ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reservation.avEquipments && reservation.avEquipments.length > 0 ? (
                            reservation.avEquipments.map((av, idx) => (
                              <tr key={idx} className="border-b font-bold text-slate-600">
                                <td className="py-2 text-left">{getEquipmentLabel(av.equipmentId, avEquipmentOptions)}</td>
                                <td className="py-2 text-right">{av.quantityReserved} bộ</td>
                                <td className="py-2 text-right">{formatCurrency(av.costForEachEquipment || 0)}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={3} className="py-3 text-center text-slate-400">Không có thiết bị AV thuê phụ trội</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Final venue completion form */}
                  {canManageSeminarLogistics && reservation.contractStatus === 'PENDING_NEGOTIATE' && (
                    <form onSubmit={handleCompleteVenueSubmit} className="border-t border-slate-100 pt-5 space-y-5">
                      <div className="rounded-2xl border border-teal-100 bg-[#F0FFFC] p-5 space-y-5">
                        <div className="flex items-center gap-2 text-[#065A4F]">
                          <FileSignature className="h-5 w-5" />
                          <h4 className="text-sm font-black">Hoàn tất cấu hình địa điểm & duyệt hợp đồng</h4>
                        </div>

                        <div className="space-y-3">
                          <h5 className="text-xs font-black uppercase tracking-wider text-slate-500">1. Phòng họp</h5>
                          {draftRooms.map((room, index) => (
                            <div key={index} className="rounded-xl border border-slate-200 bg-white p-4">
                              <div className="grid gap-4 md:grid-cols-2">
                                <FacilityInput label="Tên/loại phòng *" value={room.roomNameSpec} onChange={(value) => updateDraftRoom(index, 'roomNameSpec', value, setDraftRooms)} placeholder="VD: Grand Ballroom A" />
                                <FacilityInput label="Kiểu sắp xếp bàn ghế" value={room.seatingArrangement} onChange={(value) => updateDraftRoom(index, 'seatingArrangement', value, setDraftRooms)} placeholder="VD: U-shape, Classroom, Theater" />
                                <FacilityInput label="Số ghế *" type="number" value={room.numSeats} onChange={(value) => updateDraftRoom(index, 'numSeats', value, setDraftRooms)} placeholder={`Tối thiểu ${seminar.anticipatedRegistrants}`} />
                                <label className="flex flex-col gap-1.5 text-xs">
                                  <span className="font-extrabold text-slate-600">Ảnh phòng họp</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => updateDraftRoom(index, 'roomImage', e.target.files?.[0] || null, setDraftRooms)}
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-hidden"
                                  />
                                </label>
                              </div>
                              {draftRooms.length > 1 && (
                                <div className="mt-3 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => setDraftRooms((current) => current.filter((_, roomIndex) => roomIndex !== index))}
                                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-black text-red-500 transition hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Xóa phòng
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => setDraftRooms((current) => [...current, { roomNameSpec: '', seatingArrangement: '', numSeats: '', roomImage: null }])}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-black text-[#0B3970] transition hover:border-[#0B3970]"
                          >
                            <PlusCircle className="h-4 w-4" />
                            Thêm phòng
                          </button>
                        </div>

                        <div className="space-y-3">
                          <h5 className="text-xs font-black uppercase tracking-wider text-slate-500">2. Thiết bị AV</h5>
                          {avRows.map((row, index) => (
                            <div key={index} className="grid gap-3 md:grid-cols-[minmax(0,1.5fr)_120px_150px_40px]">
                              <label className="flex flex-col gap-1.5 text-xs">
                                <span className="font-extrabold text-slate-600">Thiết bị</span>
                                <select
                                  value={row.equipmentId}
                                  onChange={(e) => updateAvRow(index, 'equipmentId', e.target.value, setAvRows)}
                                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-hidden"
                                >
                                  <option value="">Chọn thiết bị...</option>
                                  {avEquipmentOptions.map((equipment) => (
                                    <option key={equipment.id} value={equipment.id}>
                                      {equipment.equipmentName} ({equipment.unit})
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <FacilityInput label="Số lượng" type="number" value={row.quantityReserved} onChange={(value) => updateAvRow(index, 'quantityReserved', value, setAvRows)} placeholder="1" />
                              <FacilityInput label="Đơn giá/bộ" type="number" value={row.costForEachEquipment} onChange={(value) => updateAvRow(index, 'costForEachEquipment', value, setAvRows)} placeholder="0" />
                              <button
                                type="button"
                                onClick={() => setAvRows((current) => current.filter((_, rowIndex) => rowIndex !== index))}
                                className="mt-5 grid h-10 w-10 place-items-center rounded-lg text-red-500 transition hover:bg-red-50"
                                title="Xóa dòng"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => setAvRows((current) => [...current, { equipmentId: '', quantityReserved: '1', costForEachEquipment: '0' }])}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-black text-[#0B3970] transition hover:border-[#0B3970]"
                          >
                            <PlusCircle className="h-4 w-4" />
                            Thêm thiết bị
                          </button>
                        </div>

                        <div className="space-y-3">
                          <h5 className="text-xs font-black uppercase tracking-wider text-slate-500">3. Hợp đồng ký duyệt</h5>
                          <div className="grid gap-4 sm:grid-cols-2 text-xs">
                            <label className="flex flex-col gap-1.5">
                              <span className="font-extrabold text-slate-600">File quét hợp đồng (PDF/Image) *</span>
                              <input
                                type="file"
                                required
                                onChange={(e) => setScannedFile(e.target.files?.[0] || null)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-hidden"
                              />
                            </label>
                            <FacilityInput label="Tổng giá trị hợp đồng thực tế (VNĐ) *" type="number" value={finalCost} onChange={setFinalCost} placeholder="Ví dụ: 12000000" />
                          </div>
                          <FacilityInput label="Ghi chú điều khoản" value={contractNotes} onChange={setContractNotes} placeholder="Thương lượng giảm 10% tiệc trà..." />
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            type="submit"
                            disabled={isCompletingVenue}
                            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-3 text-xs font-black text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                          >
                            <FileSignature className="h-4 w-4" />
                            {isCompletingVenue ? 'Đang hoàn tất...' : 'Submit & duyệt hợp đồng'}
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                </div>
              )}
            </div>
          )}

          {/* TAB 3: Travel Schedules */}
          {activeTab === 'TRAVEL' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/70 space-y-6 text-left">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5 text-[#0B3970]">
                  <Plane className="h-5.5 w-5.5 text-[#126CB0]" />
                  <h2 className="text-base font-black">Lịch trình di chuyển của chuyên gia</h2>
                </div>
                {canManageSeminarLogistics && !isAddingTravel && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTravelId(null)
                      resetTravelForm()
                      setIsAddingTravel(true)
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0B3970] px-4 py-2.5 text-xs font-black text-white transition hover:bg-[#126CB0]"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Thêm chặng
                  </button>
                )}
              </div>

              {travelItinerary && (
                <div className="grid gap-3 md:grid-cols-3">
                  <CostCard label="Tổng chi phí di chuyển" value={travelItinerary.totalCost || 0} note={`${travelItinerary.arrangements.length} chặng`} />
                  <div className="rounded-2xl border border-slate-200 bg-[#F8FBFF] p-5">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Trạng thái tổng thể</p>
                    <p className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wide ${travelStatusClass(travelItinerary.overallStatus)}`}>
                      {travelStatusLabel(travelItinerary.overallStatus)}
                    </p>
                    <p className="mt-3 text-xs font-semibold leading-5 text-slate-500">Tổng hợp từ toàn bộ chặng di chuyển</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-[#F8FBFF] p-5">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Địa điểm lưu trú/tổ chức</p>
                    <p className="mt-2 text-sm font-black text-[#0B3970]">
                      {travelItinerary.facilityReservations[0]?.facilityName || 'Chưa có địa điểm'}
                    </p>
                    <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
                      {travelItinerary.facilityReservations[0]?.facilityAddress || 'Chưa có thông tin từ facility_contract'}
                    </p>
                  </div>
                </div>
              )}

              {isAddingTravel && canManageSeminarLogistics && (
                <form onSubmit={handleAddTravelSubmit} className="border p-5 rounded-xl bg-slate-50/50 space-y-4 text-left">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#0B3970]">
                    {editingTravelId ? 'Cập nhật lịch trình di chuyển' : 'Nhập thông tin vé đưa đón chuyên gia'}
                  </h4>

                  <div className="grid gap-4 sm:grid-cols-3 text-xs">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-slate-600">Phương thức vận chuyển *</label>
                      <select
                        value={transportMode}
                        onChange={(e) => setTransportMode(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                      >
                        <option value="FLIGHT">Máy bay (Flight)</option>
                        <option value="TRAIN">Tàu hỏa (Train)</option>
                        <option value="BUS">Xe khách liên tỉnh (Bus)</option>
                        <option value="CAR">Xe ô tô riêng (Car)</option>
                        <option value="OTHER">Khác</option>
                      </select>
                    </div>
                    <TravelTextInput label="Hãng vận chuyển" value={carrierName} onChange={setCarrierName} placeholder="Ví dụ: Vietnam Airlines" />
                    <TravelTextInput label="Mã hiệu chuyến bay/số xe" value={serviceNumber} onChange={setServiceNumber} placeholder="Ví dụ: VN213" />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 text-xs">
                    <TravelTextInput label="Điểm khởi hành *" value={departureLocation} onChange={setDepartureLocation} placeholder="Sân bay Nội Bài, Hà Nội" required />
                    <TravelTextInput label="Điểm đến *" value={arrivalLocation} onChange={setArrivalLocation} placeholder="Sân bay Tân Sơn Nhất, TP.HCM" required />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 text-xs">
                    <TravelTextInput label="Thời gian khởi hành *" type="datetime-local" value={departureTime} onChange={setDepartureTime} placeholder="" required />
                    <TravelTextInput label="Thời gian đến nơi *" type="datetime-local" value={arrivalTime} onChange={setArrivalTime} placeholder="" required />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3 text-xs">
                    <TravelTextInput label="Thông tin số ghế" value={seatInfo} onChange={setSeatInfo} placeholder="12A" />
                    <TravelTextInput label="Giá vé (VNĐ)" type="number" value={travelCost} onChange={setTravelCost} placeholder="1850000" />
                    <TravelTextInput label="Đại lý xuất vé" value={travelAgency} onChange={setTravelAgency} placeholder="Đại lý vé Hồng Hà" />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingTravel(false)
                        setEditingTravelId(null)
                        resetTravelForm()
                      }}
                      className="text-xs font-bold text-slate-500 hover:text-slate-700"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-teal-500 px-4 py-2 text-xs font-black text-white hover:bg-teal-600 transition"
                    >
                      {editingTravelId ? 'Lưu thay đổi' : 'Tạo lịch trình'}
                    </button>
                  </div>
                </form>
              )}

              {travelList.length === 0 ? (
                <div className="py-8 text-center space-y-4">
                  <p className="text-sm text-slate-500">Chưa có thông tin vé tàu/máy bay nào được lên lịch đưa đón chuyên gia.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {travelList.map((t) => {
                    const status = getTravelStatus(t)
                    return (
                      <div key={t.travelArrangementId} className="border border-slate-200 bg-slate-50/20 rounded-2xl p-5 space-y-4 relative overflow-hidden">
                        <div className="absolute right-4 top-4">
                          <span className={`rounded-sm border px-2 py-0.5 text-[9px] font-black uppercase tracking-wide ${travelStatusClass(status)}`}>
                            {travelStatusLabel(status)}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 pr-28">
                          <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700">
                            <Plane className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-[#0B3970]">
                              {t.transportMode} • {t.carrierName || 'Chưa nhập hãng'} ({t.serviceNumber || 'N/A'})
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">Xuất vé thông qua: {t.travelAgencyName || 'N/A'}</p>
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 text-xs border-t border-slate-100 pt-3">
                          <TravelInfoBlock label="Điểm khởi hành / Giờ đi" place={t.departureLocation} time={t.departureTime} />
                          <TravelInfoBlock label="Điểm đến / Giờ đến" place={t.arrivalLocation} time={t.arrivalTime} />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3 text-xs border-t border-slate-100 pt-3">
                          <DetailMini label="Chỗ ngồi" value={t.seatInfo || 'Chưa định cấu hình'} />
                          <DetailMini label="Chi phí vé" value={formatCurrency(t.cost || 0)} />
                          <DetailMini label="Xác nhận lúc" value={t.confirmationSentDatetime ? new Date(t.confirmationSentDatetime).toLocaleString('vi-VN') : 'Chưa xác nhận'} />
                        </div>

                        <div className="border-t border-slate-100 pt-3.5 flex flex-wrap justify-end gap-2">
                          {canManageSeminarLogistics && status !== 'CANCELLED' && (
                            <>
                              <button
                                type="button"
                                onClick={() => startEditTravel(t)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black text-[#0B3970] transition hover:border-[#0B3970]"
                              >
                                <Pencil className="h-4 w-4" />
                                Sửa
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCancelTravelTicket(t.travelArrangementId)}
                                className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-black text-white transition hover:bg-amber-600"
                              >
                                Hủy chặng
                              </button>
                            </>
                          )}
                          {canManageSeminarLogistics && (
                            <button
                              type="button"
                              onClick={() => handleDeleteTravelTicket(t.travelArrangementId)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-2 text-xs font-black text-white transition hover:bg-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                              Xóa
                            </button>
                          )}
                          {isConsultant && status === 'BOOKED' && (
                            <button
                              type="button"
                              onClick={() => handleConfirmTravelTicket(t.travelArrangementId)}
                              className="flex items-center gap-1.5 rounded-lg bg-teal-500 px-4 py-2 text-xs font-black text-white hover:bg-teal-600 transition shadow-sm"
                            >
                              <UserCheck className="h-4 w-4" />
                              Tôi xác nhận lịch trình
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Material Deliveries */}
          {activeTab === 'MATERIALS' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/70 space-y-6 text-left">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5 text-[#0B3970]">
                  <Package2 className="h-5.5 w-5.5 text-[#126CB0]" />
                  <h2 className="text-base font-black">Yêu cầu đóng gói học liệu & Vận chuyển</h2>
                </div>
              </div>

              {materialsList.length === 0 ? (
                <div className="py-8 text-center space-y-4">
                  <p className="text-sm text-slate-500">Seminar này chưa được lập yêu cầu vật tư/giáo trình học viên gửi tới khách sạn.</p>
                  {canManageSeminarLogistics && previewRequirements && (
                    <div>
                      {!isCreatingMaterials ? (
                        <button
                          type="button"
                          onClick={() => setIsCreatingMaterials(true)}
                          className="inline-flex items-center gap-2 rounded-xl bg-[#0B3970] px-5 py-3 text-xs font-black text-white hover:bg-[#126CB0] transition"
                        >
                          <PlusCircle className="h-4 w-4" />
                          Lập Yêu cầu vận chuyển Học liệu
                        </button>
                      ) : (
                        <form onSubmit={handleCreateMaterialsSubmit} className="border p-5 rounded-xl bg-slate-50/50 space-y-5 text-left">
                          <h4 className="text-xs font-black uppercase tracking-wider text-[#0B3970]">Kế hoạch cung ứng sách vở đào tạo</h4>
                          
                          <div className="grid gap-4 sm:grid-cols-2 text-xs">
                            <div className="flex flex-col gap-1.5">
                              <label className="font-bold text-slate-600">Ngày cần bàn giao tại khách sạn *</label>
                              <input
                                type="date"
                                required
                                value={neededByDate}
                                onChange={(e) => setNeededByDate(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-hidden"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="font-bold text-slate-600">Ghi chú giao hàng</label>
                              <input
                                type="text"
                                placeholder="Gửi sảnh lễ tân trước 15:00..."
                                value={materialNotes}
                                onChange={(e) => setMaterialNotes(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-hidden"
                              />
                            </div>
                          </div>

                          <div className="border-t border-slate-200 pt-3 space-y-3">
                            <p className="text-xs font-black text-[#0B3970] uppercase tracking-wider">Danh mục giáo trình tính toán theo định mức quy định</p>
                            <div className="space-y-2 max-h-48 overflow-y-auto border p-3 rounded-lg bg-white">
                              {previewRequirements.materials.map((m) => (
                                <div key={m.materialId} className="flex items-center justify-between border-b pb-2 text-xs">
                                  <div>
                                    <p className="font-bold text-slate-700">{m.materialName}</p>
                                    <p className="text-[10px] text-slate-400">Loại vật tư: {m.materialType} • Định mức chuẩn: {m.defaultQuantity || 0} {m.unit}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      required
                                      min={1}
                                      value={materialsQuantities[m.materialId] || ''}
                                      onChange={(e) => setMaterialsQuantities({ ...materialsQuantities, [m.materialId]: Number(e.target.value) })}
                                      className="w-16 rounded border px-2 py-1 text-right"
                                    />
                                    <span className="text-[11px] text-slate-500 font-bold shrink-0">{m.unit}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex justify-end gap-3 pt-2">
                            <button
                              type="button"
                              onClick={() => setIsCreatingMaterials(false)}
                              className="text-xs font-bold text-slate-500 hover:text-slate-700"
                            >
                              Hủy bỏ
                            </button>
                            <button
                              type="submit"
                              className="rounded-lg bg-teal-500 px-4 py-2 text-xs font-black text-white hover:bg-teal-600 transition"
                            >
                              Gửi yêu cầu cung ứng
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-5">
                  {materialsList.map((m) => {
                    const shipmentStyles: Record<string, string> = {
                      REQUESTED: 'bg-blue-50 border-blue-200 text-blue-700',
                      PACKED: 'bg-amber-50 border-amber-200 text-amber-700',
                      SHIPPED: 'bg-indigo-50 border-indigo-200 text-indigo-700',
                      DELIVERED: 'bg-teal-50 border-teal-200 text-teal-700',
                    }

                    const shipmentLabels: Record<string, string> = {
                      REQUESTED: 'Đã lập yêu cầu',
                      PACKED: 'Đã đóng gói hoàn tất',
                      SHIPPED: 'Đang vận chuyển (On Transit)',
                      DELIVERED: 'Đã giao tới Khách sạn',
                    }

                    return (
                      <div key={m.id} className="border border-slate-200 bg-slate-50/20 rounded-2xl p-5 space-y-4 text-xs">
                        <div className="flex items-center justify-between border-b pb-3">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4.5 w-4.5 text-blue-700" />
                            <span className="font-extrabold text-[#0B3970]">Mã yêu cầu gửi hàng #{m.id}</span>
                          </div>
                          <span className={`rounded-sm border px-2 py-0.5 text-[9px] font-black uppercase tracking-wide ${shipmentStyles[m.shipmentStatus] || 'bg-slate-100'}`}>
                            {shipmentLabels[m.shipmentStatus] || m.shipmentStatus}
                          </span>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3 text-slate-500 font-bold">
                          <div>
                            <p className="text-[10px] text-slate-400 font-extrabold uppercase">Ngày lập phiếu</p>
                            <p className="mt-0.5 text-slate-700">{formatDate(m.requestDate)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-extrabold uppercase">Hạn chốt giao hàng</p>
                            <p className="mt-0.5 text-red-600 font-black">{formatDate(m.neededByDate)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-extrabold uppercase">Ghi chú hành trình</p>
                            <p className="mt-0.5 text-slate-700 truncate">{m.notes || 'Không có'}</p>
                          </div>
                        </div>

                        {/* List items requested */}
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <p className="font-extrabold text-[#0B3970] text-[10px] uppercase">Chi tiết danh mục đóng gói</p>
                          <div className="space-y-1 bg-white p-3 rounded-lg border">
                            {m.items && m.items.map((item, id) => (
                              <div key={id} className="flex justify-between py-1 border-b last:border-0">
                                <span className="font-semibold text-slate-600">{item.materialName}</span>
                                <span className="font-black text-[#0B3970]">{item.requestedQuantity} quyển/bộ</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Delivery note */}
                        {m.deliveredConfirmedAt && (
                          <div className="rounded-lg bg-teal-50 border border-teal-100 p-3 mt-2 text-teal-800 font-bold">
                            <p className="text-[10px] text-teal-600 font-extrabold uppercase">Bàn giao & Ký nhận tại khách sạn</p>
                            <p className="mt-0.5">Lúc: {new Date(m.deliveredConfirmedAt).toLocaleString('vi-VN')}</p>
                            <p className="mt-1 text-[11px] text-slate-500 leading-4">Ghi chú thủ kho: {m.deliveryConfirmationNote}</p>
                          </div>
                        )}

                        {/* Action buttons for Materials Staff */}
                        {isMaterialsStaff && m.shipmentStatus !== 'DELIVERED' && (
                          <div className="border-t border-slate-100 pt-3 flex flex-wrap gap-2 justify-end">
                            {m.shipmentStatus === 'REQUESTED' && (
                              <button
                                type="button"
                                onClick={() => handleUpdateShipment(m.id, 'PACKED')}
                                className="rounded bg-amber-500 px-3 py-1.5 text-[11px] font-black text-white hover:bg-amber-600 transition shadow-sm"
                              >
                                Xác nhận đã đóng gói (PACKED)
                              </button>
                            )}
                            {m.shipmentStatus === 'PACKED' && (
                              <button
                                type="button"
                                onClick={() => handleUpdateShipment(m.id, 'SHIPPED')}
                                className="rounded bg-indigo-500 px-3 py-1.5 text-[11px] font-black text-white hover:bg-indigo-600 transition shadow-sm"
                              >
                                Bàn giao đơn vị vận chuyển (SHIPPED)
                              </button>
                            )}
                            {m.shipmentStatus === 'SHIPPED' && (
                              <button
                                type="button"
                                onClick={() => handleUpdateShipment(m.id, 'DELIVERED')}
                                className="rounded bg-teal-500 px-3 py-1.5 text-[11px] font-black text-white hover:bg-teal-600 transition shadow-sm"
                              >
                                Đã giao tới khách sạn (DELIVERED)
                              </button>
                            )}
                          </div>
                        )}

                        {/* Coordinator receipt verification */}
                        {canManageSeminarLogistics && m.shipmentStatus === 'DELIVERED' && !m.deliveredConfirmedAt && (
                          <div className="border-t border-slate-100 pt-3 flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleConfirmDeliveredAtVenue(m.id)}
                              className="flex items-center gap-1 rounded bg-[#0B3970] px-3.5 py-2 text-xs font-black text-white hover:bg-[#126CB0] transition shadow-sm"
                            >
                              <PackageCheck className="h-4 w-4" />
                              Tôi đã nhận học liệu & Xác nhận kiểm kê (Receipt OK)
                            </button>
                          </div>
                        )}

                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'REPORT' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/70 space-y-6 text-left">
              <div className="flex items-center gap-2.5 text-[#0B3970] border-b border-slate-100 pb-4">
                <PieChart className="h-5.5 w-5.5 text-[#126CB0]" />
                <h2 className="text-base font-black">Báo cáo & Tổng kết chi phí</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <CostCard
                  label="Chi phí địa điểm"
                  value={facilityCost}
                  note={reservation?.contractStatus === 'APPROVED' ? 'Theo hợp đồng đã duyệt' : 'Chưa có hợp đồng đã duyệt'}
                />
                <CostCard
                  label="Chi phí di chuyển"
                  value={travelCostTotal}
                  note={`${travelList.length} lịch trình đã nhập`}
                />
                <CostCard
                  label="Chi phí học liệu"
                  value={estimatedMaterialCost}
                  note={`${materialItemCount} đơn vị x 15.000 VNĐ tạm tính`}
                />
              </div>

              <div className="rounded-2xl border border-[#0B3970]/15 bg-[#F5FAFF] p-6">
                <p className="text-xs font-black uppercase tracking-wider text-slate-500">Tổng chi phí dự kiến</p>
                <p className="mt-2 text-3xl font-black text-[#0B3970]">
                  {formatCurrency(estimatedGrandTotal)}
                </p>
                <p className="mt-3 text-xs font-semibold leading-5 text-slate-500">
                  Chi phí học liệu hiện là tạm tính ở FE vì API material_request chưa trả đơn giá in ấn/vật tư.
                  Khi BE bổ sung đơn giá, phần tổng kết này có thể dùng trực tiếp số liệu thật.
                </p>
              </div>

              <div className="grid gap-3 text-xs font-bold text-slate-600">
                <ReportRow label="Địa điểm tổ chức" value={reservation?.facilityName || 'Chưa chọn địa điểm'} />
                <ReportRow label="Trạng thái hợp đồng" value={reservation?.contractStatus || 'Chưa tạo hợp đồng'} />
                <ReportRow label="Lịch trình di chuyển" value={`${travelList.filter((t) => getTravelStatus(t) === 'CONFIRMED').length}/${travelList.length} đã xác nhận`} />
                <ReportRow label="Yêu cầu học liệu" value={`${materialsList.length} yêu cầu, ${materialItemCount} đơn vị vật tư/học liệu`} />
              </div>
            </div>
          )}

        </section>

        {/* Right Column: Auxiliary Consultant Profile & Actions */}
        <aside className="space-y-6">
          
          {/* Consultant Info Card */}
          <InfoCard
            title="Chuyên gia đào tạo"
            icon={<UserRound className="h-6 w-6 text-[#156DB2]" />}
          >
            <div className="flex gap-4 text-left">
              <div className="relative grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#B9FFF1] text-[#257AB7]">
                <User className="h-10 w-10 fill-[#257AB7]/20 stroke-[#257AB7]" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-extrabold text-[#18395F] truncate">{seminar.consultantFullName}</h3>
                <span className="mt-2 inline-flex rounded-full bg-[#B9FFF1] px-3 py-1 text-[10px] font-extrabold text-[#009C8E]">
                  Specialist Consultant
                </span>
                <div className="mt-4 space-y-2.5 text-xs text-slate-500">
                  <p className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" />
                    0903 222 111
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">{seminar.consultantFullName.toLowerCase().replace(/\s+/g, '')}@gmail.com</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" />
                    {seminar.city}, Việt Nam
                  </p>
                </div>
              </div>
            </div>
          </InfoCard>

          {/* Quick Stats overview */}
          <InfoCard
            title="Tổng kiểm kê Hậu cần"
            icon={<ShieldCheck className="h-6 w-6 text-[#156DB2]" />}
            highlighted
          >
            <div className="space-y-3.5 text-xs text-slate-600 text-left leading-5">
              <div className="flex justify-between items-center">
                <span>Hợp đồng Venue (Khách sạn):</span>
                <span className={`font-black uppercase text-[10px] ${
                  reservation?.contractStatus === 'APPROVED' ? 'text-teal-600' : 'text-amber-500'
                }`}>
                  {reservation?.contractStatus === 'APPROVED' ? 'ĐÃ KHÓA' : 'CHƯA PHÊ DUYỆT'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Vé đưa đón Chuyên gia:</span>
                <span className={`font-black uppercase text-[10px] ${
                  travelList.length > 0 && travelList.every(t => getTravelStatus(t) === 'CONFIRMED')
                    ? 'text-teal-600'
                    : 'text-amber-500'
                }`}>
                  {travelList.length > 0 && travelList.every(t => getTravelStatus(t) === 'CONFIRMED') ? 'CHẤT LƯỢNG OK' : 'CHƯA HOÀN TẤT'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Trạng thái Sách vở học viên:</span>
                <span className={`font-black uppercase text-[10px] ${
                  materialsList.length > 0 && materialsList.every(m => m.deliveredConfirmedAt !== null)
                    ? 'text-teal-600'
                    : 'text-amber-500'
                }`}>
                  {materialsList.length > 0 && materialsList.every(m => m.deliveredConfirmedAt !== null) ? 'ĐÃ BÀN GIAO' : 'ĐANG VẬN CHUYỂN'}
                </span>
              </div>
            </div>
          </InfoCard>

        </aside>

      </div>
    </div>
  )
}

type DetailFieldProps = {
  label: string
  value: React.ReactNode
  wide?: boolean
}

function DetailField({ label, value, wide }: DetailFieldProps) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-[#F8FBFF] px-4 py-3.5 ${wide ? 'md:col-span-2' : ''}`}>
      <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-1.5 min-h-5 text-sm font-bold text-[#18395F]">{value}</div>
    </div>
  )
}

type FacilityInputProps = {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  type?: string
}

function FacilityInput({ label, value, onChange, placeholder, type = 'text' }: FacilityInputProps) {
  return (
    <label className="flex flex-col gap-1.5 text-xs">
      <span className="font-extrabold text-slate-600">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-hidden focus:border-[#1788A7] focus:ring-2 focus:ring-[#36F1D1]/25"
      />
    </label>
  )
}

type TravelTextInputProps = {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  type?: string
  required?: boolean
}

function TravelTextInput({ label, value, onChange, placeholder, type = 'text', required }: TravelTextInputProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-bold text-slate-600">{label}</span>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-hidden focus:border-[#1788A7] focus:ring-2 focus:ring-[#36F1D1]/25"
      />
    </label>
  )
}

function TravelInfoBlock({ label, place, time }: { label: string; place: string; time: string }) {
  return (
    <div>
      <p className="font-extrabold text-slate-400 uppercase text-[9px]">{label}</p>
      <p className="font-bold text-slate-700 mt-1">{place}</p>
      <p className="text-slate-500 font-bold text-[10px] mt-0.5">{new Date(time).toLocaleString('vi-VN')}</p>
    </div>
  )
}

function DetailMini({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="font-extrabold text-slate-400 uppercase text-[9px]">{label}</p>
      <p className="font-bold text-slate-700 mt-0.5">{value}</p>
    </div>
  )
}

function CostCard({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-[#F8FBFF] p-5">
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-black text-[#0B3970]">{formatCurrency(value)}</p>
      <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">{note}</p>
    </div>
  )
}

function ReportRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-slate-100 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-black text-[#18395F]">{value}</span>
    </div>
  )
}

function updateAvRow(
  index: number,
  field: 'equipmentId' | 'quantityReserved' | 'costForEachEquipment',
  value: string,
  setAvRows: React.Dispatch<React.SetStateAction<Array<{ equipmentId: string; quantityReserved: string; costForEachEquipment: string }>>>,
) {
  setAvRows((current) =>
    current.map((row, rowIndex) =>
      rowIndex === index ? { ...row, [field]: value } : row,
    ),
  )
}

function updateDraftRoom<K extends keyof DraftRoom>(
  index: number,
  field: K,
  value: DraftRoom[K],
  setDraftRooms: React.Dispatch<React.SetStateAction<DraftRoom[]>>,
) {
  setDraftRooms((current) =>
    current.map((room, roomIndex) =>
      roomIndex === index ? { ...room, [field]: value } : room,
    ),
  )
}

function getEquipmentLabel(equipmentId: number, options: AudioVisualEquipmentResponse[]) {
  const equipment = options.find((item) => item.id === equipmentId)
  if (!equipment) {
    return `AV Equipment #${equipmentId}`
  }
  return `${equipment.equipmentName} (${equipment.unit})`
}

function getTravelStatus(travel: TravelArrangementResponse) {
  return travel.status || travel.travelArrangementStatus || 'BOOKED'
}

function travelStatusLabel(status: 'BOOKED' | 'CONFIRMED' | 'CANCELLED') {
  const labels = {
    BOOKED: 'Chờ xác nhận',
    CONFIRMED: 'Đã xác nhận',
    CANCELLED: 'Đã hủy',
  }
  return labels[status]
}

function travelStatusClass(status: 'BOOKED' | 'CONFIRMED' | 'CANCELLED') {
  const classes = {
    BOOKED: 'bg-amber-50 border-amber-200 text-amber-700',
    CONFIRMED: 'bg-teal-50 border-teal-200 text-teal-700',
    CANCELLED: 'bg-red-50 border-red-200 text-red-700',
  }
  return classes[status]
}

function toDateTimeInputValue(value: string) {
  if (!value) return ''
  return value.slice(0, 16)
}

function facilityFileUrl(path?: string | null) {
  if (!path) return ''
  return `http://localhost:8080/api/v1/facility-contracts/view-file?path=${encodeURIComponent(path)}`
}

function formatCurrency(value: number) {
  return `${value.toLocaleString('vi-VN')} VNĐ`
}

function formatDate(isoDate: string) {
  if (!isoDate) return ''
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}
