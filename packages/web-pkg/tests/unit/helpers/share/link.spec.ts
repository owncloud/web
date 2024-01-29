import { getDefaultLinkPermissions, getExpirationRules } from '../../../../src/helpers/share'
import { Ability } from '@ownclouders/web-client/src/helpers/resource/types'
import { mock } from 'vitest-mock-extended'
import { SharePermissionBit } from '@ownclouders/web-client/src/helpers'
import { PublicExpirationCapability } from '@ownclouders/web-client/src/ocs/capabilities'
import { createTestingPinia } from 'web-test-helpers'
import { useCapabilityStore } from '../../../../src/composables/piniaStores'

describe('getDefaultLinkPermissions', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns internal if user is not allowed to create public links', () => {
    const permissions = getDefaultLinkPermissions({
      ability: mock<Ability>({ can: () => false }),
      defaultPermissionsCapability: 1
    })
    expect(permissions).toBe(SharePermissionBit.Internal)
  })
  it.each([SharePermissionBit.Internal, SharePermissionBit.Read])(
    'returns the defined default permissions from the capabilities if user is allowed to create public links',
    (defaultPermissions) => {
      const permissions = getDefaultLinkPermissions({
        ability: mock<Ability>({ can: () => true }),
        defaultPermissionsCapability: defaultPermissions
      })
      expect(permissions).toBe(defaultPermissions)
    }
  )
})

describe('getExpirationRules', () => {
  it('correctly computes rules based on the "expire_date"-capability', () => {
    vi.useFakeTimers().setSystemTime(new Date('2000-01-01'))
    createTestingPinia()
    const capabilityStore = useCapabilityStore()
    const capabilities = mock<PublicExpirationCapability>({ enforced: true, days: '10' })
    capabilityStore.capabilities.files_sharing.public.expire_date = capabilities

    const rules = getExpirationRules({
      currentLanguage: 'de',
      capabilityStore
    })

    expect(rules.enforced).toEqual(capabilities.enforced)
    expect(rules.default).toEqual(new Date('2000-01-11'))
    expect(rules.min).toEqual(new Date('2000-01-01'))
    expect(rules.max).toEqual(new Date('2000-01-11'))
  })
})
