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
    'alice',
    {
      id: 'alice',
      displayName: 'Alice Hansen',
      password: '1234',
      email: 'alice@example.org'
    }
  ],
  [
    'brian',
    {
      id: 'brian',
      displayName: 'Brian Murphy',
      password: '1234',
      email: 'brian@example.org'
    }
  ],
  [
    'carol',
    {
      id: 'carol',
      displayName: 'Carol King',
      password: '1234',
      email: 'carol@example.org'
    }
  ],
  [
    'rina',
    {
      id: 'rina',
      displayName: 'Rina kumari Shrestha',
      password: '1234',
      email: 'rina@example.org'
    }
  ],
  [
    'anu',
    {
      id: 'anu',
      displayName: 'Anu Singh Feynman',
      password: '1234',
      email: 'anu@example.org'
    }
  ],
  [
    'max',
    {
      id: 'max',
      displayName: 'Max Testing',
      password: '12345678',
      email: 'maxtesting@owncloud.com'
    }
  ]
])
