export interface NotificationItem {
  id: string
  title: string
  body: string
  timestamp: string
  type: 'overdue' | 'travel' | 'contract' | 'material' | 'general'
  isRead: boolean
  role: string
  link: {
    tab: 'LIST' | 'CREATE' | 'DETAIL' | 'MY_TRAVEL' | 'ALL_MATERIALS' | 'MASTER_DATA'
    seminarId?: number
    seminarTypeId?: number
  }
}

export function addNotification(notif: {
  title: string
  body: string
  type: 'overdue' | 'travel' | 'contract' | 'material' | 'general'
  role: 'LOGISTICS_COORDINATOR' | 'MATERIALS_STAFF' | 'CONSULTANT' | 'BOOKING_STAFF' | 'ADMIN' | 'ALL'
  link: {
    tab: 'LIST' | 'CREATE' | 'DETAIL' | 'MY_TRAVEL' | 'ALL_MATERIALS' | 'MASTER_DATA'
    seminarId?: number
    seminarTypeId?: number
  }
}) {
  try {
    const raw = localStorage.getItem('app_notifications')
    const list: NotificationItem[] = raw ? JSON.parse(raw) : []
    
    const newItem: NotificationItem = {
      id: String(Date.now() + Math.random()),
      title: notif.title,
      body: notif.body,
      timestamp: 'Vừa xong',
      type: notif.type,
      isRead: false,
      role: notif.role,
      link: notif.link
    }
    
    list.unshift(newItem)
    localStorage.setItem('app_notifications', JSON.stringify(list))
    
    // Dispatch standard event to trigger state reload on active navbar immediately
    window.dispatchEvent(new Event('notifications-updated'))
  } catch (err) {
    console.error('Error adding notification', err)
  }
}
