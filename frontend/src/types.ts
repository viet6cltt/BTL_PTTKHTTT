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
  coordinatorId: number | null
  coordinatorFullName: string | null
  seminarName: string
  startDate: string
  endDate: string
  city: string
  anticipatedRegistrants: number
  note: string | null
  bookingCreatedDateTime: string
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
