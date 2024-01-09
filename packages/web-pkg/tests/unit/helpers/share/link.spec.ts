import { getDefaultLinkPermissions, getExpirationRules } from '../../../../src/helpers/share'
import { Store } from 'vuex'
import { Ability } from '@ownclouders/web-client/src/helpers/resource/types'
import { mock } from 'jest-mock-extended'
import { SharePermissionBit } from '@ownclouders/web-client/src/helpers'
import { PublicExpirationCapability } from '@ownclouders/web-client/src/ocs/capabilities'

describe('getDefaultLinkPermissions', () => {
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
