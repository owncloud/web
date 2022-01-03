import { User } from '../types'

export const userStore = new Map<string, User>([
  [
    'admin',
    {
      id: 'admin',
      displayName: process.env.ADMIN_USERNAME || 'admin',
      password: 'admin',
      email: 'admin@example.org'
    }
  ],
  [
    'Alice',
    {
      id: 'Alice',
      displayName: 'Alice Hansen',
      password: '1234',
      email: 'alice@example.org'
    }
  ],
  [
    'Brian',
    {
      id: 'Brian',
      displayName: 'Brian Murphy',
      password: '1234',
      email: 'brian@example.org'
    }
  ],
  [
    'Carol',
    {
      id: 'Carol',
      displayName: 'Carol King',
      password: '1234',
      email: 'carol@example.org'
    }
  ]
])
