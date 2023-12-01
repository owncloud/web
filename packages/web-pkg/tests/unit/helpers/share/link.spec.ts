import { getDefaultLinkPermissions, getExpirationRules } from '../../../../src/helpers/share'
import { Store } from 'vuex'
import { Ability } from '@ownclouders/web-client/src/helpers/resource/types'
import { mock } from 'jest-mock-extended'
import { SharePermissionBit } from '@ownclouders/web-client/src/helpers'
import { PublicExpirationCapability } from '@ownclouders/web-client/src/ocs/capabilities'

jest.mock('@vueuse/core', () => ({
  useClipboard: jest.fn().mockReturnValue({ copy: jest.fn() })
}))

const mockStore = {
  getters: {
    capabilities: {
      files_sharing: {
        public: {
          default_permissions: 1,
          password: {
            enforced_for: {
              read_only: false
            }
          }
        }
      }
    }
  },
  state: {
    user: {
      capabilities: {
        files_sharing: {
          public: {
            default_permissions: 1,
            expire_date: {
              enforced: true,
              days: 5
            },
            password: {
              enforced_for: {
                read_only: false
              }
            }
          }
        }
      }
    }
  },
  dispatch: jest.fn(() => Promise.resolve({ url: '' }))
}

const returnBitmask = 1
jest.mock('@ownclouders/web-client/src/helpers/share', () => ({
  ...jest.requireActual('@ownclouders/web-client/src/helpers/share'),
  LinkShareRoles: {
    getByName: jest.fn().mockReturnValue({ bitmask: jest.fn(() => returnBitmask) })
  },
  linkRoleViewerFolder: { name: 'viewer' }
}))

describe('getDefaultLinkPermissions', () => {
  it('returns internal if user is not allowed to create public links', () => {
    const permissions = getDefaultLinkPermissions({
      ability: mock<Ability>({ can: () => false }),
      store: mockStore as any
    })
    expect(permissions).toBe(SharePermissionBit.Internal)
  })
  it.each([SharePermissionBit.Internal, SharePermissionBit.Read])(
    'returns the defined default permissions from the capabilities if user is allowed to create public links',
    (defaultPermissions) => {
      const store = {
        state: {
          user: {
            capabilities: {
              files_sharing: { public: { default_permissions: defaultPermissions } }
            }
          }
        }
      }
      const permissions = getDefaultLinkPermissions({
        ability: mock<Ability>({ can: () => true }),
        store: store as any
      })
      expect(permissions).toBe(defaultPermissions)
    }
  )
})

describe('getExpirationRules', () => {
  it('correctly computes rules based on the "expire_date"-capability', () => {
    jest.useFakeTimers().setSystemTime(new Date('2000-01-01'))

    const capabilities = mock<PublicExpirationCapability>({ enforced: true, days: '10' })
    const rules = getExpirationRules({
      currentLanguage: 'de',
      store: {
        getters: { capabilities: { files_sharing: { public: { expire_date: capabilities } } } }
      } as Store<any>
    })

    expect(rules.enforced).toEqual(capabilities.enforced)
    expect(rules.default).toEqual(new Date('2000-01-11'))
    expect(rules.min).toEqual(new Date('2000-01-01'))
    expect(rules.max).toEqual(new Date('2000-01-11'))
  })
})
