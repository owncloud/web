import { Group } from '../types'

export const groupStore = new Map<string, Group>([
  [
    'security',
    {
      id: 'security',
      displayName: 'security department'
    }
  ],
  [
    'sales',
    {
      id: 'sales',
      displayName: 'sales department'
    }
  ],
  [
    'finance',
    {
      id: 'finance',
      displayName: 'finance department'
    }
  ]
])
