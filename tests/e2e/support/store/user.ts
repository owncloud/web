import { User } from '../types'

// get this from json
export const dummyUserStore = new Map<string, User>([
  [
    'admin',
    {
      id: 'admin',
      displayName: process.env.ADMIN_USERNAME || 'admin',
      password: process.env.ADMIN_PASSWORD || 'admin',
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
    'david',
    {
      id: 'david',
      displayName: 'David William Goodall',
      password: '1234',
      email: 'david@example.org'
    }
  ],
  [
    'edith',
    {
      id: 'edith',
      displayName: 'Edith Anne Widder',
      password: '1234',
      email: 'edith@example.org'
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
  ],
  [
    'marie',
    {
      id: 'marie',
      displayName: 'Marie Skłodowska Curie',
      password: 'radioactivity',
      email: 'marie@example.org'
    }
  ]
])

export const createdUserStore = new Map<string, User>()

export const federatedUserStore = new Map<string, User>()
