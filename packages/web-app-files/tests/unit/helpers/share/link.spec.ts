import { createQuicklink, CreateQuicklink } from '../../../../src/helpers/share/link'
import { DateTime } from 'luxon'
import { Store } from 'vuex'
import { clientService } from 'web-pkg/src/services'
import { useClipboard } from '@vueuse/core'
import { Ability } from 'web-pkg'
import { mock } from 'jest-mock-extended'

jest.mock('@vueuse/core', () => ({
  useClipboard: jest.fn().mockReturnValue({ copy: jest.fn() })
}))

const mockStore = {
  state: {
    user: {
      capabilities: {
        files_sharing: {
          quickLink: {
            default_role: 'viewer'
          },
          public: {
            expire_date: {
              enforced: true,
              days: 5
            }
          }
        }
      }
    }
  },
  dispatch: jest.fn(() => Promise.resolve({ url: '' }))
}

const mockResource = {
  fileId: '1234',
  path: '/path/to/file'
}

const getAbilityMock = (hasPermission) => mock<Ability>({ can: () => hasPermission })

let returnBitmask = 1
jest.mock('web-client/src/helpers/share', () => ({
  LinkShareRoles: {
    getByName: jest.fn().mockReturnValue({ bitmask: jest.fn(() => returnBitmask) })
  }
}))

describe('createQuicklink', () => {
  it('should create a quicklink with the correct parameters', async () => {
    const args: CreateQuicklink = {
      store: mockStore as unknown as Store<any>,
      resource: mockResource,
      password: 'password',
      $gettext: (str: string) => str,
      ability: getAbilityMock(true)
    }

    const link = await createQuicklink(args)

    expect(link).toBeDefined()
    expect(link.url).toBeDefined()

    expect(useClipboard).toHaveBeenCalled()

    expect(mockStore.dispatch).toHaveBeenCalledWith('Files/addLink', {
      path: mockResource.path,
      client: clientService.owncloudSdk,
      params: {
        name: 'Quicklink',
        permissions: 1, // viewer
        quicklink: true,
        password: args.password,
        expireDate: DateTime.now().plus({ days: 5 }).endOf('day').toISO(),
        spaceRef: mockResource.fileId
      },
      storageId: mockResource.fileId
    })

    expect(mockStore.dispatch).toHaveBeenCalledWith('showMessage', {
      title: 'The quicklink has been copied to your clipboard.'
    })
  })

  it.each(['viewer', 'internal'])(
    'should create a quicklink without a password if no password is provided and capabilities set to default %s',
    async (role) => {
      returnBitmask = role === 'viewer' ? 1 : 0
      mockStore.state.user.capabilities.files_sharing.quickLink.default_role = role

      const args: CreateQuicklink = {
        store: mockStore as unknown as Store<any>,
        resource: mockResource,
        $gettext: (str: string) => str,
        ability: getAbilityMock(true)
      }

      const link = await createQuicklink(args)

      expect(link).toBeDefined()
      expect(link.url).toBeDefined()

      expect(useClipboard).toHaveBeenCalled()

      expect(mockStore.dispatch).toHaveBeenCalledWith('Files/addLink', {
        path: mockResource.path,
        client: clientService.owncloudSdk,
        params: {
          name: 'Quicklink',
          permissions: role === 'viewer' ? 1 : 0,
          quicklink: true,
          expireDate: DateTime.now().plus({ days: 5 }).endOf('day').toISO(),
          spaceRef: mockResource.fileId
        },
        storageId: mockResource.fileId
      })

      expect(mockStore.dispatch).toHaveBeenCalledWith('showMessage', {
        title: 'The quicklink has been copied to your clipboard.'
      })
    }
  )
})
