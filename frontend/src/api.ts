const API_ROOT_URL = 'http://localhost:8080'
const API_BASE_URL = `${API_ROOT_URL}/api/v1`

export type UserRole = 'BOOKING_STAFF' | 'LOGISTICS_COORDINATOR' | 'CONSULTANT' | 'MATERIALS_STAFF' | 'ADMIN'
export type UserStatus = 'ACTIVE' | 'DISABLED'
export type TravelArrangementStatus = 'BOOKED' | 'CONFIRMED' | 'CANCELLED'

export interface AuthResponse {
  accessToken: string
  userId: number
  role: UserRole
  fullName: string
}

export interface CreateUserRequest {
  fullName: string
  email: string
  password: string
  phone: string
  role: UserRole
  status: UserStatus
}

export interface UpdateUserRequest {
  fullName?: string
  email?: string
  password?: string
  phone?: string
  role?: UserRole
  status?: UserStatus
}

export interface UserResponse {
  userId: number
  fullName: string
  email: string
  phone: string
  role: UserRole
  status: UserStatus
  createdAt: string
}

export type SeminarStatus = 'PENDING_LOGISTICS' | 'FACILITY_SECURED' | 'TRAVEL_CONFIRMED' | 'READY_FOR_SEMINAR' | 'CANCELLED' | 'OVERDUE'

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
  status?: TravelArrangementStatus
  travelArrangementStatus?: TravelArrangementStatus
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
  overallStatus: TravelArrangementStatus
}

export interface ConsultantResponse {
  consultantId: number
  userId: number
  fullName: string
  email: string
  phone: string | null
  specialty: string | null
  travelPreference: string | null
  address: string | null
  city: string | null
  country: string | null
  avatarUrl?: string | null
}

export interface UpdateMyConsultantProfileRequest {
  travelPreference?: string | null
  address?: string | null
  city?: string | null
  country?: string | null
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

export interface FacilityCreateRequest {
  facilityName: string
  address: string
  city: string
  maxCapacity: number
  salesManagerName?: string
  salesManagerPhone?: string
  salesManagerEmail?: string
  numberOfRoom?: number
  costForEachDay?: number
}

export interface AudioVisualEquipmentResponse {
  id: number
  equipmentName: string
  equipmentType: string
  unit: string
}

export interface MaterialResponse {
  id: number
  materialName: string
  materialType: string
  description: string | null
  unit: string
}

export interface SeminarTypeResponse {
  id: number
  typeName: string
  description: string | null
  durationHours: number
  arrangementNotes: string | null
}

export interface MaterialRequirementResponse {
  seminarTypeId: number
  materialId: number
  materialName: string
  materialType: string
  unit: string
  defaultQuantity: number
  dependOnNumParticipant: boolean
  participantPerQuantity: number | null
  notes: string | null
}

export interface AvEquipmentRequirementResponse {
  seminarTypeId: number
  equipmentId: number
  equipmentName: string
  equipmentType: string
  unit: string
  quantityRequired: number
  dependOnNumParticipant: boolean
  participantPerQuantity: number | null
}

export interface SeminarTypeRequest {
  typeName: string
  description: string | null
  durationHours: number
  arrangementNotes: string | null
}

export interface MaterialRequest {
  materialName: string
  materialType: string
  description: string | null
  unit: string
}

export interface AudioVisualEquipmentRequest {
  equipmentName: string
  equipmentType: string
  unit: string
}

export interface MaterialRequirementRequest {
  materialId: number
  defaultQuantity: number
  dependOnNumParticipant: boolean
  participantPerQuantity: number | null
  notes: string | null
}

export interface AvEquipmentRequirementRequest {
  equipmentId: number
  quantityRequired: number
  dependOnNumParticipant: boolean
  participantPerQuantity: number | null
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
      errorMsg = data.message || data.detail || data.title || errorMsg
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

  async updateMyProfile(fullName: string, phone: string): Promise<UserResponse> {
    const res = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ fullName, phone }),
    })
    return handleResponse<UserResponse>(res)
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ oldPassword, newPassword }),
    })
    return handleResponse<void>(res)
  },

  async getMyProfile(): Promise<UserResponse> {
    const res = await fetch(`${API_BASE_URL}/users/me`, {
      headers: getHeaders(),
    })
    return handleResponse<UserResponse>(res)
  },

  async createUser(data: CreateUserRequest): Promise<UserResponse> {
    const res = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse<UserResponse>(res)
  },

  async getUsers(filters: {
    keyword?: string
    role?: UserRole | ''
    status?: UserStatus | ''
    page?: number
    size?: number
  } = {}): Promise<PageResponse<UserResponse>> {
    const params = new URLSearchParams()
    if (filters.keyword) params.append('keyword', filters.keyword)
    if (filters.role) params.append('role', filters.role)
    if (filters.status) params.append('status', filters.status)
    if (filters.page !== undefined) params.append('page', String(filters.page))
    if (filters.size !== undefined) params.append('size', String(filters.size))

    const res = await fetch(`${API_BASE_URL}/users?${params.toString()}`, {
      headers: getHeaders(),
    })
    return handleResponse<PageResponse<UserResponse>>(res)
  },

  async updateUser(id: number, data: UpdateUserRequest): Promise<UserResponse> {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse<UserResponse>(res)
  },

  async updateUserStatus(id: number, status: UserStatus): Promise<UserResponse> {
    const res = await fetch(`${API_BASE_URL}/users/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    })
    return handleResponse<UserResponse>(res)
  },

  async resetUserPassword(id: number, temporaryPassword: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/users/${id}/reset-password`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ temporaryPassword }),
    })
    return handleResponse<void>(res)
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
    if (filters.coordinatorId !== undefined) params.append('coordinatorId', String(filters.coordinatorId))
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

  async createFacility(data: FacilityCreateRequest): Promise<FacilityResponse> {
    const res = await fetch(`${API_BASE_URL}/facilities`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse<FacilityResponse>(res)
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
    equipments: { equipmentId: number; quantityReserved: number; costForEachEquipment: number }[]
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

  async updateTravelStatus(travelArrangementId: number, status: TravelArrangementStatus): Promise<any> {
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

  async getSeminarTypes(): Promise<SeminarTypeResponse[]> {
    const res = await fetch(`${API_BASE_URL}/master-data/seminar-types`, {
      headers: getHeaders(),
    })
    return handleResponse<SeminarTypeResponse[]>(res)
  },

  async getSeminarTypeById(id: number): Promise<SeminarTypeResponse> {
    const res = await fetch(`${API_BASE_URL}/master-data/seminar-types/${id}`, {
      headers: getHeaders(),
    })
    return handleResponse<SeminarTypeResponse>(res)
  },

  async createSeminarType(data: SeminarTypeRequest): Promise<SeminarTypeResponse> {
    const res = await fetch(`${API_BASE_URL}/master-data/seminar-types`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse<SeminarTypeResponse>(res)
  },

  async updateSeminarType(id: number, data: SeminarTypeRequest): Promise<SeminarTypeResponse> {
    const res = await fetch(`${API_BASE_URL}/master-data/seminar-types/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse<SeminarTypeResponse>(res)
  },

  async deleteSeminarType(id: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/master-data/seminar-types/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })
    return handleResponse<void>(res)
  },

  async getConsultants(): Promise<PageResponse<ConsultantResponse>> {
    const res = await fetch(`${API_BASE_URL}/consultants`, {
      headers: getHeaders(),
    })
    return handleResponse<PageResponse<ConsultantResponse>>(res)
  },

  async getConsultantById(id: number): Promise<ConsultantResponse> {
    const res = await fetch(`${API_BASE_URL}/consultants/${id}`, {
      headers: getHeaders(),
    })
    return handleResponse<ConsultantResponse>(res)
  },

  async getConsultantByUserId(userId: number): Promise<ConsultantResponse> {
    const res = await fetch(`${API_BASE_URL}/consultants/by-user/${userId}`, {
      headers: getHeaders(),
    })
    return handleResponse<ConsultantResponse>(res)
  },

  async updateMyConsultantProfile(data: UpdateMyConsultantProfileRequest): Promise<ConsultantResponse> {
    const res = await fetch(`${API_BASE_URL}/consultants/me`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse<ConsultantResponse>(res)
  },

  async uploadConsultantAvatar(consultantId: number, file: File): Promise<ConsultantResponse> {
    const formData = new FormData()
    formData.append('file', file)
    const token = localStorage.getItem('token')
    const headers: HeadersInit = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    const res = await fetch(`${API_BASE_URL}/consultants/${consultantId}/avatar`, {
      method: 'PUT',
      headers,
      body: formData,
    })
    return handleResponse<ConsultantResponse>(res)
  },

  async getMaterials(): Promise<MaterialResponse[]> {
    const res = await fetch(`${API_ROOT_URL}/api/master-data/materials`, {
      headers: getHeaders(),
    })
    return handleResponse<MaterialResponse[]>(res)
  },

  async createMaterial(data: MaterialRequest): Promise<MaterialResponse> {
    const res = await fetch(`${API_ROOT_URL}/api/master-data/materials`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse<MaterialResponse>(res)
  },

  async updateMaterial(id: number, data: MaterialRequest): Promise<MaterialResponse> {
    const res = await fetch(`${API_ROOT_URL}/api/master-data/materials/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse<MaterialResponse>(res)
  },

  async deleteMaterial(id: number): Promise<void> {
    const res = await fetch(`${API_ROOT_URL}/api/master-data/materials/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })
    return handleResponse<void>(res)
  },

  async getAudioVisualEquipments(): Promise<AudioVisualEquipmentResponse[]> {
    const res = await fetch(`${API_ROOT_URL}/api/master-data/audio-visual-equipments`, {
      headers: getHeaders(),
    })
    return handleResponse<AudioVisualEquipmentResponse[]>(res)
  },

  async createAudioVisualEquipment(data: AudioVisualEquipmentRequest): Promise<AudioVisualEquipmentResponse> {
    const res = await fetch(`${API_ROOT_URL}/api/master-data/audio-visual-equipments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse<AudioVisualEquipmentResponse>(res)
  },

  async updateAudioVisualEquipment(
    id: number,
    data: AudioVisualEquipmentRequest,
  ): Promise<AudioVisualEquipmentResponse> {
    const res = await fetch(`${API_ROOT_URL}/api/master-data/audio-visual-equipments/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse<AudioVisualEquipmentResponse>(res)
  },

  async deleteAudioVisualEquipment(id: number): Promise<void> {
    const res = await fetch(`${API_ROOT_URL}/api/master-data/audio-visual-equipments/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })
    return handleResponse<void>(res)
  },

  async getMaterialRequirements(seminarTypeId: number): Promise<MaterialRequirementResponse[]> {
    const res = await fetch(
      `${API_ROOT_URL}/api/master-data/seminar-types/${seminarTypeId}/material-requirements`,
      { headers: getHeaders() },
    )
    return handleResponse<MaterialRequirementResponse[]>(res)
  },

  async createMaterialRequirement(
    seminarTypeId: number,
    data: MaterialRequirementRequest,
  ): Promise<MaterialRequirementResponse> {
    const res = await fetch(
      `${API_ROOT_URL}/api/master-data/seminar-types/${seminarTypeId}/material-requirements`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      },
    )
    return handleResponse<MaterialRequirementResponse>(res)
  },

  async updateMaterialRequirement(
    seminarTypeId: number,
    materialId: number,
    data: MaterialRequirementRequest,
  ): Promise<MaterialRequirementResponse> {
    const res = await fetch(
      `${API_ROOT_URL}/api/master-data/seminar-types/${seminarTypeId}/material-requirements/${materialId}`,
      {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      },
    )
    return handleResponse<MaterialRequirementResponse>(res)
  },

  async deleteMaterialRequirement(seminarTypeId: number, materialId: number): Promise<void> {
    const res = await fetch(
      `${API_ROOT_URL}/api/master-data/seminar-types/${seminarTypeId}/material-requirements/${materialId}`,
      {
        method: 'DELETE',
        headers: getHeaders(),
      },
    )
    return handleResponse<void>(res)
  },

  async getAvEquipmentRequirements(seminarTypeId: number): Promise<AvEquipmentRequirementResponse[]> {
    const res = await fetch(
      `${API_ROOT_URL}/api/master-data/seminar-types/${seminarTypeId}/av-equipment-requirements`,
      { headers: getHeaders() },
    )
    return handleResponse<AvEquipmentRequirementResponse[]>(res)
  },

  async createAvEquipmentRequirement(
    seminarTypeId: number,
    data: AvEquipmentRequirementRequest,
  ): Promise<AvEquipmentRequirementResponse> {
    const res = await fetch(
      `${API_ROOT_URL}/api/master-data/seminar-types/${seminarTypeId}/av-equipment-requirements`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      },
    )
    return handleResponse<AvEquipmentRequirementResponse>(res)
  },

  async updateAvEquipmentRequirement(
    seminarTypeId: number,
    equipmentId: number,
    data: AvEquipmentRequirementRequest,
  ): Promise<AvEquipmentRequirementResponse> {
    const res = await fetch(
      `${API_ROOT_URL}/api/master-data/seminar-types/${seminarTypeId}/av-equipment-requirements/${equipmentId}`,
      {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      },
    )
    return handleResponse<AvEquipmentRequirementResponse>(res)
  },

  async deleteAvEquipmentRequirement(seminarTypeId: number, equipmentId: number): Promise<void> {
    const res = await fetch(
      `${API_ROOT_URL}/api/master-data/seminar-types/${seminarTypeId}/av-equipment-requirements/${equipmentId}`,
      {
        method: 'DELETE',
        headers: getHeaders(),
      },
    )
    return handleResponse<void>(res)
  },
}
