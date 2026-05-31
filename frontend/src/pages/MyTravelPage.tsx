import { useEffect, useState } from 'react'
import { api, TravelArrangementResponse } from '../api'
import { CheckCircle2, Info, MapPin, Navigation, Plane, User } from 'lucide-react'
import { PageHeader } from '../components/layout/PageHeader'
import { useAuth } from '../context/AuthContext'

export function MyTravelPage() {
  const { user } = useAuth()
  const [itinerary, setItinerary] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  async function loadItinerary() {
    try {
      setIsLoading(true)
      setErrorMsg(null)
      const data = await api.getMyTravel()
      setItinerary(data)
    } catch (err: any) {
      setErrorMsg('Hiện tại không có lịch trình di chuyển nào được gán cho tài khoản của bạn.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadItinerary()
  }, [])

  async function handleConfirmTicket(arrangementId: number) {
    try {
      setErrorMsg(null)
      await api.updateTravelStatus(arrangementId, 'CONFIRMED')
      setSuccessMsg('Xác nhận lịch di chuyển thành công!')
      await loadItinerary()
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi xác nhận lịch trình.')
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
    <div className="space-y-7">
      <PageHeader
        title="Lịch trình của tôi"
        description="Theo dõi chi tiết vé máy bay, phòng khách sạn và lịch trình công tác của bạn"
        icon={<Navigation className="h-10 w-10" strokeWidth={2.4} />}
      />

      {errorMsg && (
        <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs font-bold text-amber-700">
          <Info className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="rounded-xl border border-teal-200 bg-teal-50 p-4 text-xs font-bold text-teal-700 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-teal-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {itinerary && (
        <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_340px]">
          
          {/* Main travel logs */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/70 text-left">
              <h3 className="text-base font-black text-[#0B3970] border-b border-slate-100 pb-3 flex items-center gap-2">
                <Plane className="h-5 w-5 text-blue-600" />
                Chuyến bay & Chặng xe đã đặt
              </h3>

              <div className="mt-5 space-y-4">
                {itinerary.arrangements && itinerary.arrangements.length > 0 ? (
                  itinerary.arrangements.map((a: TravelArrangementResponse) => (
                    <div key={a.travelArrangementId} className="border rounded-2xl p-5 bg-slate-50/30 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-blue-800 uppercase tracking-wide">
                          {a.transportMode} • {a.carrierName} ({a.serviceNumber})
                        </span>
                        <span className={`rounded-sm border px-2 py-0.5 text-[9px] font-black uppercase ${
                          a.travelArrangementStatus === 'CONFIRMED'
                            ? 'bg-teal-50 border-teal-200 text-teal-700'
                            : 'bg-amber-50 border-amber-200 text-amber-700'
                        }`}>
                          {a.travelArrangementStatus === 'CONFIRMED' ? 'Đã xác nhận' : 'Đang chờ duyệt'}
                        </span>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 text-xs border-t border-slate-100 pt-3">
                        <div>
                          <p className="font-extrabold text-slate-400 uppercase text-[9px]">Điểm đi / Thời gian</p>
                          <p className="font-bold text-slate-700 mt-1">{a.departureLocation}</p>
                          <p className="text-slate-500 font-semibold mt-0.5">{new Date(a.departureTime).toLocaleString('vi-VN')}</p>
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-400 uppercase text-[9px]">Điểm đến / Thời gian</p>
                          <p className="font-bold text-slate-700 mt-1">{a.arrivalLocation}</p>
                          <p className="text-slate-500 font-semibold mt-0.5">{new Date(a.arrivalTime).toLocaleString('vi-VN')}</p>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-extrabold text-slate-400 uppercase text-[9px]">Thông tin ghế ngồi:</span>
                          <span className="font-black text-[#0B3970] ml-1">{a.seatInfo || 'Chưa định cấu hình'}</span>
                        </div>
                        {a.travelArrangementStatus === 'BOOKED' && (
                          <button
                            type="button"
                            onClick={() => handleConfirmTicket(a.travelArrangementId)}
                            className="rounded-lg bg-teal-500 px-4 py-2 text-xs font-black text-white hover:bg-teal-600 transition shadow-sm"
                          >
                            Xác nhận duyệt vé
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 py-4 text-center">Chưa có vé xe/máy bay được cấp phát.</p>
                )}
              </div>
            </div>

            {/* Hotel accommodation */}
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/70 text-left">
              <h3 className="text-base font-black text-[#0B3970] border-b border-slate-100 pb-3 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-indigo-600" />
                Nơi lưu trú & Phòng khách sạn chốt chỗ
              </h3>
              <div className="mt-5 space-y-3">
                {itinerary.facilityReservations && itinerary.facilityReservations.length > 0 ? (
                  itinerary.facilityReservations.map((f: any, idx: number) => (
                    <div key={idx} className="border rounded-2xl p-4 bg-slate-50/30 flex gap-4 text-xs">
                      <div className="h-10 w-10 bg-indigo-50 text-indigo-700 flex items-center justify-center rounded shrink-0">
                        <MapPin className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-black text-[#0B3970]">{f.facilityName}</h4>
                        <p className="text-slate-400 mt-0.5">{f.address}</p>
                        <p className="text-slate-500 font-bold mt-1">Liên hệ Lễ tân khách sạn để check-in theo mã Seminar #{itinerary.seminarId}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 py-4 text-center">Chưa có phòng khách sạn liên kết.</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar profile */}
          <aside className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl text-left">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-[#B9FFF1] text-[#009C8E] flex items-center justify-center">
                  <User className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#0B3970]">{user?.fullName}</h4>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Chuyên gia giảng dạy</p>
                </div>
              </div>
              <div className="mt-5 border-t pt-4 text-xs text-slate-500 space-y-2">
                <p><strong>Seminar liên kết:</strong> #{itinerary.seminarId}</p>
                <p><strong>Trạng thái chặng di chuyển:</strong> <span className="font-black text-teal-600">{itinerary.overallStatus}</span></p>
                <p className="text-[10px] text-slate-400 leading-4 mt-2">Vui lòng kiểm tra kỹ múi giờ bay và các lưu ý giao nhận phòng trước khi di chuyển.</p>
              </div>
            </div>
          </aside>

        </div>
      )}
    </div>
  )
}
