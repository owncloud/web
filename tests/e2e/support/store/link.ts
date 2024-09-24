import { Link } from '../types'

export const createdLinkStore = new Map<string, Link>()

export const roleDisplayText: Record<string, string> = {
  'Invited people': 'Only for invited people',
  'Can view': 'Anyone with the link can view',
  'Can upload': 'Anyone with the link can upload',
  'Can edit': 'Anyone with the link can edit',
  'Secret File Drop': 'Secret File drop'
}
export const securePassword = 'Pwd:12345'
