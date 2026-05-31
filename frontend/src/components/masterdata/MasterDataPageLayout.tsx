import type { ReactNode } from 'react'
import { PageHeader } from '../layout/PageHeader'

type MasterDataPageLayoutProps = {
  title: string
  description: string
  icon: ReactNode
  children: ReactNode
}

export function MasterDataPageLayout({
  title,
  description,
  icon,
  children,
}: MasterDataPageLayoutProps) {
  return (
    <div className="space-y-7">
      <PageHeader title={title} description={description} icon={icon} />
      {children}
    </div>
  )
}
