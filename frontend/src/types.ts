import type { ComponentType } from 'react'

export type IconComponent = ComponentType<{
  className?: string
  strokeWidth?: number
}>

export type NavItem = {
  label: string
  icon: IconComponent
  active?: boolean
  expanded?: boolean
  children?: string[]
}

export type FieldProps = {
  id: string
  label: string
  placeholder: string
  required?: boolean
}

export type SelectOption = {
  value: string
  label: string
}

export type SeminarResponse = {
  id: number
  seminarTypeId: number
  seminarTypeName: string
  consultantId: number
  consultantFullName: string
  bookingDepartmentUserId: number
  bookingDepartmentUserFullName: string
  employeeId: number | null
  employeeFullName: string | null
  seminarName: string
  startDate: string
  endDate: string
  city: string
  anticipatedRegistrants: number
  note: string | null
  bookingCreatedDate: string
}

export type SeminarDetail = SeminarResponse & {
  contractId: number | null
  contractStatus: 'NOT_CREATED' | 'CREATED' | 'SIGNED'
  travelArrangementStatus: 'NOT_SCHEDULED' | 'SCHEDULED'
  materialRequestStatus: 'NOT_REQUESTED' | 'REQUESTED' | 'DELIVERED'
  consultantRole: string
  consultantPhone: string
  consultantEmail: string
  consultantCity: string
  consultantCountry: string
}

export type MaterialResponse = {
  id: number
  materialName: string
  materialType: string
  description: string | null
  unit: string
}

export type AudioVisualEquipmentResponse = {
  id: number
  equipmentName: string
  equipmentType: string
  unit: string
}

export type SeminarTypeResponse = {
  id: number
  typeName: string
  description: string | null
  durationHours: number
  arrangementNotes: string | null
}

export type MaterialRequirementResponse = {
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

export type AvEquipmentRequirementResponse = {
  seminarTypeId: number
  equipmentId: number
  equipmentName: string
  equipmentType: string
  unit: string
  quantityRequired: number
  dependOnNumParticipant: boolean
  participantPerQuantity: number | null
}
