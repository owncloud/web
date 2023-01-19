import { mockDeep } from 'jest-mock-extended'
import { createApp, defineComponent } from 'vue'
import { ConfigurationManager } from 'web-pkg/src'
import {
  initializeApplications,
  announceApplicationsReady,
  announcePermissionManager
} from '../../../src/container'
import { buildApplication } from '../../../src/container/application'

jest.mock('../../../src/container/application')

describe('initialize applications', () => {
  it('continues even if one or more applications are falsy', async () => {
    const fishyError = new Error('fishy')
    const initialize = jest.fn()
    const ready = jest.fn()
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(jest.fn)
    const buildApplicationMock = jest
      .fn()
      .mockImplementation(({ applicationPath }: { applicationPath: string }) => {
        if (applicationPath.includes('Valid')) {
          return Promise.resolve({ initialize, ready })
        }

        return Promise.reject(fishyError)
      })

    jest.mocked(buildApplication).mockImplementation(buildApplicationMock)

    const applications = await initializeApplications({
      configurationManager: mockDeep<ConfigurationManager>(),
      runtimeConfiguration: {
        apps: ['internalFishy', 'internalValid'],
        external_apps: [{ path: 'externalFishy' }, { path: 'externalValid' }]
      },
      store: undefined,
      router: undefined,
      translations: undefined,
      supportedLanguages: {}
    })

    expect(buildApplicationMock).toHaveBeenCalledTimes(4)
    expect(initialize).toHaveBeenCalledTimes(2)
    expect(errorSpy).toHaveBeenCalledTimes(2)
    expect(errorSpy.mock.calls[0][0]).toMatchObject(fishyError)
    expect(errorSpy.mock.calls[1][0]).toMatchObject(fishyError)

    await announceApplicationsReady({ applications })
    expect(ready).toHaveBeenCalledTimes(2)
  })
})

describe('announcePermissionManager', () => {
  it('should inject vue object contains permissionManager instance', () => {
    const app = createApp(defineComponent({}))
    announcePermissionManager({ app, store: {} as any })
    expect(app.config.globalProperties.$permissionManager).toBeDefined()
    expect((window as any).__$permissionManager).toBeDefined()
  })
})
