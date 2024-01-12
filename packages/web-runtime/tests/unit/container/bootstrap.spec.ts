import { mock } from 'jest-mock-extended'
import { createApp, defineComponent, App } from 'vue'
import { useAppsStore, useConfigStore } from '@ownclouders/web-pkg'
import {
  initializeApplications,
  announceApplicationsReady,
  announceCustomScripts,
  announceCustomStyles,
  announceConfiguration
} from '../../../src/container/bootstrap'
import { buildApplication } from '../../../src/container/application'
import { createTestingPinia } from 'web-test-helpers/src'

jest.mock('../../../src/container/application')

describe('initialize applications', () => {
  beforeEach(() => createTestingPinia())

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

    const configStore = useConfigStore()
    configStore.apps = ['internalFishy', 'internalValid']
    configStore.externalApps = [{ path: 'externalFishy' }, { path: 'externalValid' }]

    const applications = await initializeApplications({
      app: createApp(defineComponent({})),
      configStore,
      store: undefined,
      router: undefined,
      gettext: undefined,
      supportedLanguages: {}
    })

    expect(buildApplicationMock).toHaveBeenCalledTimes(4)
    expect(initialize).toHaveBeenCalledTimes(2)
    expect(errorSpy).toHaveBeenCalledTimes(2)
    expect(errorSpy.mock.calls[0][0]).toMatchObject(fishyError)
    expect(errorSpy.mock.calls[1][0]).toMatchObject(fishyError)

    createTestingPinia()
    await announceApplicationsReady({
      app: mock<App>(),
      appsStore: useAppsStore(),
      applications
    })
    expect(ready).toHaveBeenCalledTimes(2)
  })
})

describe('announceCustomScripts', () => {
  beforeEach(() => createTestingPinia())
  afterEach(() => {
    document.getElementsByTagName('html')[0].innerHTML = ''
  })

  it('injects basic scripts', () => {
    const configStore = useConfigStore()
    configStore.scripts = [{ src: 'foo.js' }, { src: 'bar.js' }]
    announceCustomScripts({ configStore })
    const elements = document.getElementsByTagName('script')
    expect(elements.length).toBe(2)
  })

  it('skips the injection if no src option is provided', () => {
    const configStore = useConfigStore()
    configStore.scripts = [{}, {}, {}, {}, {}]
    announceCustomScripts({ configStore })
    const elements = document.getElementsByTagName('script')
    expect(elements.length).toBeFalsy()
  })

  it('loads scripts synchronous by default', () => {
    const configStore = useConfigStore()
    configStore.scripts = [{ src: 'foo.js' }]
    announceCustomScripts({ configStore })
    const element = document.querySelector<HTMLScriptElement>('[src="foo.js"]')
    expect(element.async).toBeFalsy()
  })

  it('injects scripts async if the corresponding configurations option is set', () => {
    const configStore = useConfigStore()
    configStore.scripts = [{ src: 'foo.js', async: true }]
    announceCustomScripts({ configStore })
    const element = document.querySelector<HTMLScriptElement>('[src="foo.js"]')
    expect(element.async).toBeTruthy()
  })
})

describe('announceCustomStyles', () => {
  beforeEach(() => createTestingPinia())
  afterEach(() => {
    document.getElementsByTagName('html')[0].innerHTML = ''
  })

  it('injects basic styles', () => {
    const styles = [{ href: 'foo.css' }, { href: 'bar.css' }]
    const configStore = useConfigStore()
    configStore.styles = styles
    announceCustomStyles({ configStore })

    styles.forEach(({ href }) => {
      const element = document.querySelector<HTMLLinkElement>(`[href="${href}"]`)
      expect(element).toBeTruthy()
      expect(element.type).toBe('text/css')
      expect(element.rel).toBe('stylesheet')
    })
  })

  it('skips the injection if no href option is provided', () => {
    const configStore = useConfigStore()
    configStore.styles = [{}, {}]
    announceCustomStyles({ configStore })
    const elements = document.getElementsByTagName('link')
    expect(elements.length).toBeFalsy()
  })
})

describe('announceConfiguration', () => {
  beforeEach(() => createTestingPinia({ stubActions: false }))

  it('should not enable embed mode when it is not set', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(mock<Response>({ status: 200, json: () => Promise.resolve({}) }))
    const configStore = useConfigStore()
    await announceConfiguration({ path: '/config.json', configStore })
    expect(configStore.options.embed.enabled).toStrictEqual(false)
  })

  it('should embed mode when it is set in config.json', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      mock<Response>({
        status: 200,
        json: () => Promise.resolve({ options: { embed: { enabled: true } } })
      })
    )
    const configStore = useConfigStore()
    await announceConfiguration({ path: '/config.json', configStore })
    expect(configStore.options.embed.enabled).toStrictEqual(true)
  })

  it('should enable embed mode when it is set in URL query but config.json does not set it', async () => {
    Object.defineProperty(window, 'location', {
      value: {
        search: '?embed=true'
      },
      writable: true
    })
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(mock<Response>({ status: 200, json: () => Promise.resolve({}) }))
    const configStore = useConfigStore()
    await announceConfiguration({ path: '/config.json', configStore })
    expect(configStore.options.embed.enabled).toStrictEqual(true)
  })

  it('should not enable the embed mode when it is set in URL query but config.json disables it', async () => {
    Object.defineProperty(window, 'location', {
      value: {
        search: '?embed=true'
      },
      writable: true
    })
    jest.spyOn(global, 'fetch').mockResolvedValue(
      mock<Response>({
        status: 200,
        json: () => Promise.resolve({ options: { embed: { enabled: false } } })
      })
    )
    const configStore = useConfigStore()
    await announceConfiguration({ path: '/config.json', configStore })
    expect(configStore.options.embed.enabled).toStrictEqual(false)
  })
})
