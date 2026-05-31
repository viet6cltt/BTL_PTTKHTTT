const API_ROOT_URL = 'http://localhost:8080'
const API_BASE_URL = `${API_ROOT_URL}/api/v1`

export type UserRole = 'BOOKING_STAFF' | 'LOGISTICS_COORDINATOR' | 'CONSULTANT' | 'MATERIALS_STAFF' | 'ADMIN'

export interface AuthResponse {
  accessToken: string
  userId: number
  role: UserRole
  fullName: string
}

export type SeminarStatus = 'PENDING_LOGISTICS' | 'FACILITY_SECURED' | 'TRAVEL_CONFIRMED' | 'READY_FOR_SEMINAR' | 'CANCELLED'

export interface SeminarResponse {
  id: number
  seminarTypeId: number
  seminarTypeName: string
  consultantId: number
  consultantFullName: string
  bookingDepartmentUserId: number
  bookingDepartmentUserFullName: string
  coordinatorId: number | null
  coordinatorFullName: string | null
  seminarName: string
  startDate: string
  endDate: string
  expectedTimeSlot: 'FULL_DAY' | 'MORNING' | 'AFTERNOON'
  city: string
  anticipatedRegistrants: number
  status: SeminarStatus
  note: string | null
  bookingCreatedDateTime: string
}

export interface PageResponse<T> {
  content: T[]
  totalPages: number
  totalElements: number
  size: number
  number: number
}

export interface CalculatedMaterial {
  materialId: number
  materialName: string
  materialType: string
  unit: string
  calculatedQuantity: number
  dependOnNumParticipant: boolean
  participantPerQuantity: number
  defaultQuantity: number
  notes: string | null
}

export interface CalculatedAvEquipment {
  equipmentId: number
  equipmentName: string
  equipmentType: string
  unit: string
  calculatedQuantity: number
  dependOnNumParticipant: boolean
  participantPerQuantity: number
  quantityRequired: number
}

export interface SeminarRequirementsPreviewResponse {
  seminarId: number
  seminarName: string
  seminarTypeId: number
  seminarTypeName: string
  anticipatedRegistrants: number
  materials: CalculatedMaterial[]
  avEquipment: CalculatedAvEquipment[]
}

export interface AvEquipmentReservation {
  contractId?: number
  equipmentId: number
  quantityReserved: number
  costForEachEquipment: number | null
}

export interface RoomReservation {
  roomReservationId?: number
  contractId?: number
  roomNameSpec: string
  seatingArrangement: string
  numSeats: number
  roomImageUrl?: string
}

export interface SeminarReservationResponse {
  seminarId: number
  contractId: number | null
  facilityName: string | null
  facilityAddress: string | null
  contractStatus: 'PENDING_NEGOTIATE' | 'APPROVED' | 'REJECTED' | null
  contractDocPath: string | null
  totalCost: number | null
  avEquipments: AvEquipmentReservation[]
  roomReservations: RoomReservation[]
}

export interface TravelArrangementResponse {
  travelArrangementId: number
  seminarId: number
  consultantId: number
  travelAgencyName: string | null
  transportMode: 'FLIGHT' | 'TRAIN' | 'BUS' | 'CAR' | 'OTHER'
  carrierName: string | null
  serviceNumber: string | null
  departureLocation: string
  arrivalLocation: string
  departureTime: string
  arrivalTime: string
  seatInfo: string | null
  cost: number | null
  confirmationSentDatetime: string | null
  status?: 'BOOKED' | 'CONFIRMED' | 'CANCELLED'
  travelArrangementStatus?: 'BOOKED' | 'CONFIRMED' | 'CANCELLED'
}

export interface TravelFacilityInfoResponse {
  seminarId: number
  facilityName: string
  facilityAddress: string
  roomNameSpecs: string[]
}

export interface TravelItineraryResponse {
  seminarId: number | null
  consultantId: number
  arrangements: TravelArrangementResponse[]
  facilityReservations: TravelFacilityInfoResponse[]
  totalCost: number
  overallStatus: 'BOOKED' | 'CONFIRMED' | 'CANCELLED'
}

export interface MaterialRequestItem {
  materialId: number
  materialName: string
  requestedQuantity: number
  notes: string | null
}

export interface MaterialRequestResponse {
  id: number
  seminarId: number
  seminarName: string
  contractId: number | null
  requestDate: string
  neededByDate: string
  shipmentStatus: 'REQUESTED' | 'PACKED' | 'SHIPPED' | 'DELIVERED'
  deliveredConfirmedAt: string | null
  deliveryConfirmationNote: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  items: MaterialRequestItem[]
}

export interface FacilityResponse {
  facilityId: number
  facilityName: string
  address: string
  city: string
  maxCapacity: number
  salesManagerName: string
  salesManagerPhone: string
  salesManagerEmail: string
  numberOfRoom: number
  costForEachDay: number
}

function getHeaders() {
  const token = localStorage.getItem('token')
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMsg = 'An error occurred'
    try {
      const data = await response.json()
      errorMsg = data.message || errorMsg
    } catch {
      // Ignore
    }
    throw new Error(errorMsg)
  }
  if (response.status === 204) {
    return {} as T
  }
  return response.json()
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    return handleResponse<AuthResponse>(res)
  },

  // Seminars
  async getSeminars(filters: {
    status?: string
    city?: string
    coordinatorId?: number
    page?: number
    size?: number
  } = {}): Promise<PageResponse<SeminarResponse>> {
    const params = new URLSearchParams()
    if (filters.status) params.append('status', filters.status)
    if (filters.city) params.append('city', filters.city)
    if (filters.coordinatorId) params.append('coordinatorId', String(filters.coordinatorId))
    if (filters.page !== undefined) params.append('page', String(filters.page))
    if (filters.size !== undefined) params.append('size', String(filters.size))

    const res = await fetch(`${API_BASE_URL}/seminars?${params.toString()}`, {
      headers: getHeaders(),
    })
    return handleResponse<PageResponse<SeminarResponse>>(res)
  },

  async getSeminarById(id: number): Promise<SeminarResponse> {
    const res = await fetch(`${API_BASE_URL}/seminars/${id}`, {
      headers: getHeaders(),
    })
    return handleResponse<SeminarResponse>(res)
  },

  async createSeminar(data: {
    seminarTypeId: number
    consultantId: number
    startDate: string
    endDate: string
    expectedTimeSlot: 'FULL_DAY' | 'MORNING' | 'AFTERNOON'
    city: string
    anticipatedRegistrants: number
  }): Promise<SeminarResponse> {
    const res = await fetch(`${API_BASE_URL}/seminars`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse<SeminarResponse>(res)
  },

  async assignCoordinator(id: number, logisticsCoordinatorId: number): Promise<SeminarResponse> {
    const res = await fetch(`${API_BASE_URL}/seminars/${id}/assign-coordinator`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ logisticsCoordinatorId }),
    })
    return handleResponse<SeminarResponse>(res)
  },

  async getRequirementsPreview(id: number): Promise<SeminarRequirementsPreviewResponse> {
    const res = await fetch(`${API_BASE_URL}/seminars/${id}/requirements-preview`, {
      headers: getHeaders(),
    })
    return handleResponse<SeminarRequirementsPreviewResponse>(res)
  },

  // Venue & Contracts
  async searchFacilities(city?: string, capacity?: number): Promise<PageResponse<FacilityResponse>> {
    const params = new URLSearchParams()
    if (city) params.append('city', city)
    if (capacity) params.append('capacity', String(capacity))
    const res = await fetch(`${API_BASE_URL}/facilities?${params.toString()}`, {
      headers: getHeaders(),
    })
    return handleResponse<PageResponse<FacilityResponse>>(res)
  },

  async createContract(seminarId: number, facilityId: number): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/facility-contracts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ seminarId, facilityId }),
    })
    return handleResponse<any>(res)
  },

  async approveContract(contractId: number, file: File, totalCost: number, notes?: string): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('totalCost', String(totalCost))
    if (notes) formData.append('notes', notes)

    const token = localStorage.getItem('token')
    const headers: HeadersInit = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const res = await fetch(`${API_BASE_URL}/facility-contracts/${contractId}/approve`, {
      method: 'PUT',
      headers,
      body: formData,
    })
    return handleResponse<any>(res)
  },

  async rejectContract(contractId: number, notes: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/facility-contracts/${contractId}/reject`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ notes }),
    })
    return handleResponse<any>(res)
  },

  async getReservationsBySeminar(seminarId: number): Promise<SeminarReservationResponse> {
    const res = await fetch(`${API_BASE_URL}/reservations/seminar/${seminarId}`, {
      headers: getHeaders(),
    })
    return handleResponse<SeminarReservationResponse>(res)
  },

  async saveAvEquipmentReservations(data: {
    contractId: number
    equipmentReservations: { equipmentId: number; quantityReserved: number; costForEachEquipment: number }[]
  }): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/reservations/av-equipment`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse<any>(res)
  },

  async createRoomReservation(formData: FormData): Promise<any> {
    const token = localStorage.getItem('token')
    const headers: HeadersInit = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const res = await fetch(`${API_BASE_URL}/reservations/rooms`, {
      method: 'POST',
      headers,
      body: formData,
    })
    return handleResponse<any>(res)
  },

  // Travel
  async getTravelBySeminar(seminarId: number): Promise<TravelArrangementResponse[]> {
    const res = await fetch(`${API_BASE_URL}/travel-arrangements/by-seminar/${seminarId}`, {
      headers: getHeaders(),
    })
    return handleResponse<TravelArrangementResponse[]>(res)
  },

  async getTravelByConsultant(consultantId: number): Promise<TravelArrangementResponse[]> {
    const res = await fetch(`${API_BASE_URL}/travel-arrangements/by-consultant/${consultantId}`, {
      headers: getHeaders(),
    })
    return handleResponse<TravelArrangementResponse[]>(res)
  },

  async getTravelItinerary(seminarId: number, consultantId: number): Promise<TravelItineraryResponse> {
    const params = new URLSearchParams({
      seminarId: String(seminarId),
      consultantId: String(consultantId),
    })
    const res = await fetch(`${API_BASE_URL}/travel-arrangements/itinerary?${params.toString()}`, {
      headers: getHeaders(),
    })
    return handleResponse<TravelItineraryResponse>(res)
  },

  async getTravelArrangementById(travelArrangementId: number): Promise<TravelArrangementResponse> {
    const res = await fetch(`${API_BASE_URL}/travel-arrangements/${travelArrangementId}`, {
      headers: getHeaders(),
    })
    return handleResponse<TravelArrangementResponse>(res)
  },

  async getMyTravel(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/travel-arrangements/my-itinerary`, {
      headers: getHeaders(),
    })
    return handleResponse<any>(res)
  },

  async createTravel(data: {
    seminarId: number
    consultantId: number
    travelAgencyName: string
    transportMode: string
    carrierName: string
    serviceNumber: string
    departureLocation: string
    arrivalLocation: string
    departureTime: string
    arrivalTime: string
    seatInfo: string
    cost: number
  }): Promise<TravelArrangementResponse> {
    const res = await fetch(`${API_BASE_URL}/travel-arrangements`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse<TravelArrangementResponse>(res)
  },

  async updateTravel(
    travelArrangementId: number,
    data: Partial<{
      travelAgencyName: string
      transportMode: string
      carrierName: string
      serviceNumber: string
      departureLocation: string
      arrivalLocation: string
      departureTime: string
      arrivalTime: string
      seatInfo: string
      cost: number
    }>
  ): Promise<TravelArrangementResponse> {
    const res = await fetch(`${API_BASE_URL}/travel-arrangements/${travelArrangementId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse<TravelArrangementResponse>(res)
  },

  async updateTravelStatus(travelArrangementId: number, status: 'BOOKED' | 'CONFIRMED' | 'CANCELLED'): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/travel-arrangements/${travelArrangementId}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    })
    return handleResponse<any>(res)
  },

  async deleteTravel(travelArrangementId: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/travel-arrangements/${travelArrangementId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })
    return handleResponse<void>(res)
  },

  // Materials
  async getMaterialRequestsBySeminar(seminarId: number): Promise<MaterialRequestResponse[]> {
    const res = await fetch(`${API_BASE_URL}/seminars/${seminarId}/material-requests`, {
      headers: getHeaders(),
    })
    return handleResponse<MaterialRequestResponse[]>(res)
  },

  async getAllMaterialRequests(): Promise<MaterialRequestResponse[]> {
    const res = await fetch(`${API_BASE_URL}/material-requests`, {
      headers: getHeaders(),
    })
    return handleResponse<MaterialRequestResponse[]>(res)
  },

  async createMaterialRequest(
    seminarId: number,
    data: { neededByDate: string; notes?: string; items: { materialId: number; requestedQuantity: number; notes?: string }[] }
  ): Promise<MaterialRequestResponse> {
    const res = await fetch(`${API_BASE_URL}/seminars/${seminarId}/material-requests`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse<MaterialRequestResponse>(res)
  },

  async updateShipmentStatus(id: number, shipmentStatus: 'REQUESTED' | 'PACKED' | 'SHIPPED' | 'DELIVERED'): Promise<MaterialRequestResponse> {
    const res = await fetch(`${API_BASE_URL}/material-requests/${id}/shipment-status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ shipmentStatus }),
    })
    return handleResponse<MaterialRequestResponse>(res)
  },

  async confirmDelivered(id: number, note: string): Promise<MaterialRequestResponse> {
    const res = await fetch(`${API_BASE_URL}/material-requests/${id}/confirm-delivered`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ note }),
    })
    return handleResponse<MaterialRequestResponse>(res)
  },

  async getSeminarTypes(): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/master-data/seminar-types`, {
      headers: getHeaders(),
    })
    return handleResponse<any[]>(res)
  },

  async getConsultants(): Promise<PageResponse<any>> {
    const res = await fetch(`${API_BASE_URL}/consultants`, {
      headers: getHeaders(),
    })
    return handleResponse<PageResponse<any>>(res)
  },

  async getAudioVisualEquipments(): Promise<AudioVisualEquipmentResponse[]> {
    const res = await fetch(`${API_ROOT_URL}/api/master-data/audio-visual-equipments`, {
      headers: getHeaders(),
    })
    return handleResponse<AudioVisualEquipmentResponse[]>(res)
  },
}
