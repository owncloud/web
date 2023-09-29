import {
  createStore,
  defaultStoreMockOptions,
  defaultComponentMocks,
  getComposableWrapper,
  RouteLocation
} from 'web-test-helpers'
import { unref } from 'vue'
import { Resource } from '@ownclouders/web-client'
import { mock, mockDeep } from 'jest-mock-extended'
import { extensions } from '../../src/extensions'
import { ApplicationSetupOptions } from 'web-pkg/src/apps'
import { UppyService } from 'web-pkg/src/services/uppy'

const getAction = (opts: ApplicationSetupOptions) => {
  const { action } = unref(extensions(opts))[0]
  return action
}

describe('useFileActionsImport', () => {
  describe('isEnabled', () => {
    it('is false when no companion url is given', () => {
      getWrapper({
        currentFolder: mock<Resource>({ canUpload: () => true }),
        setup: () => {
          const action = unref(extensions({ applicationConfig: {} }))[0].action
          expect(action.isEnabled()).toBeFalsy()
        }
      })
    })
    it('is false on public link pages', () => {
      getWrapper({
        routeName: 'files-public-link',
        setup: () => {
          const action = getAction({
            applicationConfig: {
              companionUrl: 'companionUrl'
            }
          })

          expect(action.isEnabled()).toBeFalsy()
        }
      })
    })
    it('is false when no write access is given', () => {
      getWrapper({
        currentFolder: mock<Resource>({ canUpload: () => false }),
        setup: () => {
          const action = getAction({
            applicationConfig: {
              companionUrl: 'companionUrl'
            }
          })
          expect(action.isEnabled()).toBeFalsy()
        }
      })
    })
    it('is false when no supported clouds are given', () => {
      getWrapper({
        currentFolder: mock<Resource>({ canUpload: () => true }),
        setup: () => {
          const action = unref(
            extensions({
              applicationConfig: {
                companionUrl: 'companionUrl',
                supportedClouds: []
              }
            })
          )[0].action
          expect(action.isEnabled()).toBeFalsy()
        }
      })
    })
    it('is true on generic space view when write access is given', () => {
      getWrapper({
        currentFolder: mock<Resource>({ canUpload: () => true }),
        setup: () => {
          const action = getAction({
            applicationConfig: {
              companionUrl: 'companionUrl'
            }
          })
          expect(action.isEnabled()).toBeTruthy()
        }
      })
    })
  })
  describe('isDisabled', () => {
    it('is true when uploads are running', () => {
      const uppyService = mockDeep<UppyService>()
      uppyService.getCurrentUploads.mockReturnValue({ id: '1' })
      getWrapper({
        uppyService,
        setup: () => {
          const action = getAction({ applicationConfig: { companionUrl: 'companionUrl' } })
          expect(action.isDisabled()).toBeTruthy()
        }
      })
    })
    it('is false when no uploads are running', () => {
      const uppyService = mockDeep<UppyService>()
      uppyService.getCurrentUploads.mockReturnValue({})
      getWrapper({
        uppyService,
        setup: () => {
          const action = getAction({ applicationConfig: { companionUrl: 'companionUrl' } })
          expect(action.isDisabled()).toBeFalsy()
        }
      })
    })
  })

  describe('handler', () => {
    it.each([
      { supportedClouds: undefined, calls: 4 },
      { supportedClouds: ['OneDrive'], calls: 2 },
      { supportedClouds: ['GoogleDrive'], calls: 2 },
      { supportedClouds: ['WebdavPublicLink'], calls: 2 }
    ])('should only add supported clouds as uppy plugin', ({ supportedClouds, calls }) => {
      const uppyService = mockDeep<UppyService>()
      getWrapper({
        uppyService,
        setup: async () => {
          const action = getAction({
            applicationConfig: { companionUrl: 'companionUrl', supportedClouds }
          })
          await action.handler()
          expect(uppyService.addPlugin).toHaveBeenCalledTimes(calls)
        }
      })
    })
  })
})

function getWrapper({
  routeName = 'files-spaces-generic',
  currentFolder = mock<Resource>(),
  uppyService = mockDeep<UppyService>(),
  setup = () => undefined
} = {}) {
  const mocks = {
    ...defaultComponentMocks({ currentRoute: mock<RouteLocation>({ name: routeName }) }),
    $uppyService: uppyService
  }
  const storeOptions = defaultStoreMockOptions
  storeOptions.modules.Files.getters.currentFolder.mockReturnValue(currentFolder)
  storeOptions.modules.runtime.modules.auth.getters.isPublicLinkContextReady.mockReturnValue(false)
  const store = createStore(storeOptions)
  return {
    wrapper: getComposableWrapper(setup, {
      mocks,
      provide: mocks,
      store
    })
  }
}
