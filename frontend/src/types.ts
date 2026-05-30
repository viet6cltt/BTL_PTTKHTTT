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
