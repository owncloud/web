import { RouteLocationNamedRaw } from 'vue-router'

export interface NotificationAction {
  label: string
  link: string
  type: string
  primary: boolean
}

export interface Notification {
  notification_id: string
  app: string
  user: string
  datetime: string
  subject: string
  message?: string
  messageRich?: string
  messageRichParameters?: any
  object_type?: string
  object_id?: string
  link?: string
  actions?: NotificationAction[]
  computedMessage?: string
  computedLink?: RouteLocationNamedRaw
}
