import {
  copyQuicklink,
  createQuicklink,
  CreateQuicklink,
  getDefaultLinkPermissions
} from '../../../../src/helpers/share'
import { DateTime } from 'luxon'
import { Store } from 'vuex'
import { ClientService, PasswordPolicyService } from '../../../../src/services'
import { useClipboard } from '@vueuse/core'
import { Ability } from '@ownclouders/web-client/src/helpers/resource/types'
import { mock, mockDeep } from 'jest-mock-extended'
import { Language } from 'vue3-gettext'
import { Resource } from '@ownclouders/web-client'
import { SharePermissionBit } from '@ownclouders/web-client/src/helpers'

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

const mockResource = mock<Resource>({
  fileId: '1234',
  path: '/path/to/file'
})

const getAbilityMock = (hasPermission) => mock<Ability>({ can: () => hasPermission })

let returnBitmask = 1
jest.mock('@ownclouders/web-client/src/helpers/share', () => ({
  ...jest.requireActual('@ownclouders/web-client/src/helpers/share'),
  LinkShareRoles: {
    getByName: jest.fn().mockReturnValue({ bitmask: jest.fn(() => returnBitmask) })
  },
  linkRoleViewerFolder: { name: 'viewer' }
}))

describe('createQuicklink', () => {
  it('should create a quicklink with the correct parameters', async () => {
    const clientService = mockDeep<ClientService>()
    clientService.owncloudSdk.shares.getShares.mockResolvedValue([])
    const passwordPolicyService = mockDeep<PasswordPolicyService>()
    const args: CreateQuicklink = {
      store: mockStore as unknown as Store<any>,
      resource: mockResource,
      password: 'password',
      language: mock<Language>({ $gettext: (str: string) => str }),
      clientService,
      ability: getAbilityMock(true)
    }

    const link = await createQuicklink(args)

    expect(link).toBeDefined()
    expect(link.url).toBeDefined()

    await copyQuicklink({ ...args, passwordPolicyService })
    expect(useClipboard).toHaveBeenCalled()

    expect(mockStore.dispatch).toHaveBeenCalledWith('Files/addLink', {
      path: mockResource.path,
      client: clientService.owncloudSdk,
      params: {
        name: 'Link',
        permissions: '1', // viewer
        quicklink: true,
        password: args.password,
        expireDate: DateTime.now().plus({ days: 5 }).endOf('day').toISO(),
        spaceRef: mockResource.fileId
      },
      storageId: mockResource.fileId
    })

    expect(mockStore.dispatch).toHaveBeenCalledWith('showMessage', {
      title: 'The link has been copied to your clipboard.'
    })
  })

  it.each(['viewer', 'internal'])(
    'should create a quicklink without a password if no password is provided and capabilities set to default %s',
    async (role) => {
      const clientService = mockDeep<ClientService>()
      clientService.owncloudSdk.shares.getShares.mockResolvedValue([])
      const passwordPolicyService = mockDeep<PasswordPolicyService>()
      returnBitmask = role === 'viewer' ? 1 : 0
      mockStore.state.user.capabilities.files_sharing.public.default_permissions = returnBitmask

      const args: CreateQuicklink = {
        store: mockStore as unknown as Store<any>,
        resource: mockResource,
        language: mock<Language>({ $gettext: (str: string) => str }),
        clientService,
        ability: getAbilityMock(true)
      }

      const link = await createQuicklink(args)

      expect(link).toBeDefined()
      expect(link.url).toBeDefined()

      await copyQuicklink({ ...args, passwordPolicyService })
      expect(useClipboard).toHaveBeenCalled()

      expect(mockStore.dispatch).toHaveBeenCalledWith('Files/addLink', {
        path: mockResource.path,
        client: clientService.owncloudSdk,
        params: {
          name: 'Link',
          permissions: role === 'viewer' ? '1' : '0',
          quicklink: true,
          expireDate: DateTime.now().plus({ days: 5 }).endOf('day').toISO(),
          spaceRef: mockResource.fileId
        },
        storageId: mockResource.fileId
      })

      expect(mockStore.dispatch).toHaveBeenCalledWith('showMessage', {
        title: 'The link has been copied to your clipboard.'
      })
    }
  )
})

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
