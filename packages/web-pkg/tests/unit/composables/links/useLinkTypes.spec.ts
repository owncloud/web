import { unref } from 'vue'
import { useLinkTypes } from '../../../../src/composables/links/useLinkTypes'
import { defaultComponentMocks, getComposableWrapper } from 'web-test-helpers'
import { SharingLinkType } from '@ownclouders/web-client/src/generated'
import { AbilityRule } from '@ownclouders/web-client/src/helpers'
import { Capabilities } from '@ownclouders/web-client/src/ocs'
import { PasswordEnforcedForCapability } from '@ownclouders/web-client/src/ocs/capabilities'

describe('useLinkTypes', () => {
  it('should be valid', () => {
    expect(useLinkTypes).toBeDefined()
  })
  describe('computed "defaultLinkType"', () => {
    it('is internal if user can not create public links', () => {
      getWrapper({
        abilities: [],
        setup: ({ defaultLinkType }) => {
          expect(unref(defaultLinkType)).toBe(SharingLinkType.Internal)
        }
      })
    })
    it('is viewer if user can create public links and no default permissions are given', () => {
      getWrapper({
        abilities: [{ action: 'create-all', subject: 'PublicLink' }],
        setup: ({ defaultLinkType }) => {
          expect(unref(defaultLinkType)).toBe(SharingLinkType.View)
        }
      })
    })
    it('is viewer if default permissions are 1', () => {
      getWrapper({
        abilities: [{ action: 'create-all', subject: 'PublicLink' }],
        defaultPermissions: 1,
        setup: ({ defaultLinkType }) => {
          expect(unref(defaultLinkType)).toBe(SharingLinkType.View)
        }
      })
    })
    it('is internasl if default permissions are 0', () => {
      getWrapper({
        abilities: [{ action: 'create-all', subject: 'PublicLink' }],
        defaultPermissions: 0,
        setup: ({ defaultLinkType }) => {
          expect(unref(defaultLinkType)).toBe(SharingLinkType.Internal)
        }
      })
    })
  })
  describe('method "getAvailableLinkTypes"', () => {
    it('only returns the internal type if user can not create public links', () => {
      getWrapper({
        abilities: [],
        setup: ({ getAvailableLinkTypes }) => {
          expect(getAvailableLinkTypes({ isFolder: true })).toEqual([SharingLinkType.Internal])
        }
      })
    })
    it('returns all available types for folders accordingly', () => {
      getWrapper({
        abilities: [{ action: 'create-all', subject: 'PublicLink' }],
        setup: ({ getAvailableLinkTypes }) => {
          expect(getAvailableLinkTypes({ isFolder: true })).toEqual([
            SharingLinkType.Internal,
            SharingLinkType.View,
            SharingLinkType.Upload,
            SharingLinkType.Edit,
            SharingLinkType.CreateOnly
          ])
        }
      })
    })
    it('returns all available types for files accordingly', () => {
      getWrapper({
        abilities: [{ action: 'create-all', subject: 'PublicLink' }],
        setup: ({ getAvailableLinkTypes }) => {
          expect(getAvailableLinkTypes({ isFolder: false })).toEqual([
            SharingLinkType.Internal,
            SharingLinkType.View,
            SharingLinkType.Edit
          ])
        }
      })
    })
  })
  describe('method "getLinkRoleByType"', () => {
    it.each([
      SharingLinkType.Internal,
      SharingLinkType.View,
      SharingLinkType.Upload,
      SharingLinkType.Edit,
      SharingLinkType.CreateOnly
    ])('returns the link role by id', (type) => {
      getWrapper({
        setup: ({ getLinkRoleByType, linkShareRoles }) => {
          expect(getLinkRoleByType(type)).toEqual(linkShareRoles.find(({ id }) => id === type))
        }
      })
    })
  })
  describe('method "isPasswordEnforcedForLinkType"', () => {
    it('returns true for view type if set via capabilities', () => {
      getWrapper({
        passwordEnforcedFor: { read_only: true },
        setup: ({ isPasswordEnforcedForLinkType }) => {
          expect(isPasswordEnforcedForLinkType(SharingLinkType.View)).toBeTruthy()
        }
      })
    })
    it('returns true for upload type if set via capabilities', () => {
      getWrapper({
        passwordEnforcedFor: { upload_only: true },
        setup: ({ isPasswordEnforcedForLinkType }) => {
          expect(isPasswordEnforcedForLinkType(SharingLinkType.Upload)).toBeTruthy()
        }
      })
    })
    it('returns true for create only type if set via capabilities', () => {
      getWrapper({
        passwordEnforcedFor: { read_write: true },
        setup: ({ isPasswordEnforcedForLinkType }) => {
          expect(isPasswordEnforcedForLinkType(SharingLinkType.CreateOnly)).toBeTruthy()
        }
      })
    })
    it('returns true for edit type if set via capabilities', () => {
      getWrapper({
        passwordEnforcedFor: { read_write_delete: true },
        setup: ({ isPasswordEnforcedForLinkType }) => {
          expect(isPasswordEnforcedForLinkType(SharingLinkType.Edit)).toBeTruthy()
        }
      })
    })
  })
})

function getWrapper({
  setup,
  abilities = [],
  defaultPermissions = undefined,
  passwordEnforcedFor = undefined
}: {
  setup: (instance: ReturnType<typeof useLinkTypes>) => void
  abilities?: AbilityRule[]
  defaultPermissions?: number
  passwordEnforcedFor?: PasswordEnforcedForCapability
}) {
  const mocks = defaultComponentMocks()

  const capabilities = {
    files_sharing: {
      public: {
        default_permissions: defaultPermissions,
        password: { enforced_for: passwordEnforcedFor }
      }
    }
  } satisfies Partial<Capabilities['capabilities']>

  return {
    wrapper: getComposableWrapper(
      () => {
        const instance = useLinkTypes()
        setup(instance)
      },
      {
        mocks,
        pluginOptions: { abilities, piniaOptions: { capabilityState: { capabilities } } }
      }
    )
  }
}
