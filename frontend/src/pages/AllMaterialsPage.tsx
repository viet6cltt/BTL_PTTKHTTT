import { useEffect, useState } from 'react'
import { api, MaterialRequestResponse } from '../api'
import { CheckCircle2, Package, Truck, XCircle } from 'lucide-react'
import { PageHeader } from '../components/layout/PageHeader'
import { useAuth } from '../context/AuthContext'

export function AllMaterialsPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<MaterialRequestResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  async function loadRequests() {
    try {
      setIsLoading(true)
      setErrorMsg(null)
      const data = await api.getAllMaterialRequests()
      setRequests(data || [])
    } catch (err: any) {
      setErrorMsg('Không thể kết nối lấy danh sách yêu cầu vận chuyển giáo trình.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  async function handleStatusUpdate(id: number, nextStatus: 'PACKED' | 'SHIPPED' | 'DELIVERED') {
    try {
      setErrorMsg(null)
      await api.updateShipmentStatus(id, nextStatus)
      setSuccessMsg(`Cập nhật trạng thái lô hàng #${id} thành [${nextStatus}] thành công!`)
      await loadRequests()
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi cập nhật lô vận chuyển.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0B3970] border-t-transparent" />
      </div>
    )
  }

  const isMaterialsStaff = user?.role === 'MATERIALS_STAFF'

  if (!isMaterialsStaff) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm font-bold text-red-600">
        Bạn không có quyền truy cập trang này. Chức năng này chỉ dành cho bộ phận vật tư (MATERIALS_STAFF).
      </div>
    )
  }

  return (
    <div className="space-y-7 text-left">
      <PageHeader
        title="Quản lý Vận chuyển Tài liệu"
        description="Đóng gói, theo dõi hành trình và giao nhận các thùng tài liệu học tập, giáo trình tới khách sạn"
        icon={<Truck className="h-10 w-10" strokeWidth={2.4} />}
      />

      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-600 flex items-center gap-2">
          <XCircle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="rounded-xl border border-teal-200 bg-teal-50 p-4 text-xs font-bold text-teal-700 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-teal-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/70">
        <h3 className="text-base font-black text-[#0B3970] border-b border-slate-100 pb-3 flex items-center gap-2">
          <Package className="h-5 w-5 text-indigo-600" />
          Tất cả danh sách kiện hàng Hậu cần
        </h3>

        <div className="mt-6 space-y-6">
          {requests.length > 0 ? (
            requests.map((r) => {
              const shipmentStyles: Record<string, string> = {
                REQUESTED: 'bg-blue-50 border-blue-200 text-blue-700',
                PACKED: 'bg-amber-50 border-amber-200 text-amber-700',
                SHIPPED: 'bg-indigo-50 border-indigo-200 text-indigo-700',
                DELIVERED: 'bg-teal-50 border-teal-200 text-teal-700',
              }

              const shipmentLabels: Record<string, string> = {
                REQUESTED: 'Đã tiếp nhận yêu cầu',
                PACKED: 'Đã đóng gói hoàn tất',
                SHIPPED: 'Đang trên đường giao',
                DELIVERED: 'Đã giao tới lễ tân',
              }

              return (
                <div key={r.id} className="border border-slate-200 bg-slate-50/20 rounded-2xl p-5 space-y-4 text-xs leading-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-3 gap-2">
                    <div>
                      <h4 className="font-black text-[#0B3970] text-sm">Kiện giáo trình Seminar: {r.seminarName}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Yêu cầu ID: #{r.id} • Hợp đồng Venue: #{r.contractId || 'N/A'}</p>
                    </div>
                    <span className={`rounded-sm border px-2 py-0.5 text-[9px] font-black uppercase tracking-wide shrink-0 ${shipmentStyles[r.shipmentStatus] || 'bg-slate-100'}`}>
                      {shipmentLabels[r.shipmentStatus] || r.shipmentStatus}
                    </span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3 text-slate-500 font-bold">
                    <div>
                      <p className="text-[9px] text-slate-400 font-extrabold uppercase">Ngày yêu cầu</p>
                      <p className="mt-0.5 text-slate-700">{formatDate(r.requestDate)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-extrabold uppercase">Hạn chốt giao hàng</p>
                      <p className="mt-0.5 text-red-600 font-black">{formatDate(r.neededByDate)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-extrabold uppercase">Lưu ý chặng xe</p>
                      <p className="mt-0.5 text-slate-700 truncate">{r.notes || 'Không có'}</p>
                    </div>
                  </div>

                  {/* List of elements */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <p className="font-extrabold text-[#0B3970] text-[9px] uppercase tracking-wider">Danh mục đóng gói chi tiết</p>
                    <div className="space-y-1 bg-white p-3 rounded-lg border">
                      {r.items && r.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between py-1 border-b last:border-0 font-semibold">
                          <span className="text-slate-600">{item.materialName}</span>
                          <span className="text-[#0B3970] font-black">{item.requestedQuantity} quyển/bộ</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {r.deliveredConfirmedAt && (
                    <div className="rounded-lg bg-teal-50 border border-teal-100 p-3 mt-2 text-teal-800 font-bold">
                      <p className="text-[10px] text-teal-600 font-extrabold uppercase">Điều phối viên đã xác nhận nhận hàng</p>
                      <p className="mt-0.5">Xác nhận lúc: {new Date(r.deliveredConfirmedAt).toLocaleString('vi-VN')}</p>
                      <p className="mt-1 text-[10px] text-slate-400 font-semibold">Biên bản nhận: "{r.deliveryConfirmationNote}"</p>
                    </div>
                  )}

                  {/* Shipment controls for Materials Staff */}
                  {isMaterialsStaff && r.shipmentStatus !== 'DELIVERED' && (
                    <div className="border-t border-slate-100 pt-3 flex flex-wrap gap-2 justify-end">
                      {r.shipmentStatus === 'REQUESTED' && (
                        <button
                          type="button"
                          onClick={() => handleStatusUpdate(r.id, 'PACKED')}
                          className="rounded bg-amber-500 px-3.5 py-2 text-xs font-black text-white hover:bg-amber-600 transition shadow-sm"
                        >
                          Xác nhận đóng gói xong (PACKED)
                        </button>
                      )}
                      {r.shipmentStatus === 'PACKED' && (
                        <button
                          type="button"
                          onClick={() => handleStatusUpdate(r.id, 'SHIPPED')}
                          className="rounded bg-indigo-500 px-3.5 py-2 text-xs font-black text-white hover:bg-indigo-600 transition shadow-sm"
                        >
                          Giao cho đối tác Viettel Post (SHIPPED)
                        </button>
                      )}
                      {r.shipmentStatus === 'SHIPPED' && (
                        <button
                          type="button"
                          onClick={() => handleStatusUpdate(r.id, 'DELIVERED')}
                          className="rounded bg-teal-500 px-3.5 py-2 text-xs font-black text-white hover:bg-teal-600 transition shadow-sm"
                        >
                          Cập nhật đã giao tới Khách sạn (DELIVERED)
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <div className="py-12 text-center text-slate-400 font-bold">
              Hiện tại chưa có yêu cầu gửi vật liệu học tập nào.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function formatDate(isoDate: string) {
  if (!isoDate) return ''
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}
