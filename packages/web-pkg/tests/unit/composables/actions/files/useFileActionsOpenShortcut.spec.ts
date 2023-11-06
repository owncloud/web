import { mock } from 'jest-mock-extended'
import { ref, unref } from 'vue'
import {
  createStore,
  defaultComponentMocks,
  defaultStoreMockOptions,
  RouteLocation,
  getComposableWrapper
} from 'web-test-helpers'
import { ConfigurationManager, useFileActionsOpenShortcut, useRoute } from '../../../../../src'
import { Resource } from '@ownclouders/web-client'
import { GetFileContentsResponse } from '@ownclouders/web-client/src/webdav/getFileContents'

jest.mock('../../../../../src/composables/router', () => ({
  ...jest.requireActual('../../../../../src/composables/router'),
  useRoute: jest.fn()
}))

jest.mock('../../../../../src/composables/configuration', () => ({
  useConfigurationManager: () =>
    mock<ConfigurationManager>({
      serverUrl: 'https://demo.owncloud.com'
    })
}))

window = Object.create(window)
Object.defineProperty(window, 'location', {
  value: {
    href: ''
  },
  writable: true
})
Object.defineProperty(window, 'open', { writable: true })
window.open = jest.fn()

describe('openShortcut', () => {
  describe('computed property "actions"', () => {
    describe('method "isEnabled"', () => {
      it.each([
        {
          resources: [],
          expectedStatus: false
        },
        {
          resources: [mock<Resource>({ extension: 'txt' })],
          expectedStatus: false
        },
        {
          resources: [mock<Resource>({ extension: 'url', canDownload: () => false })],
          expectedStatus: false
        },
        {
          resources: [mock<Resource>({ extension: 'url', canDownload: () => true })],
          expectedStatus: true
        }
      ])('should be set correctly', ({ resources, expectedStatus }) => {
        getWrapper({
          setup: ({ actions }) => {
            expect(unref(actions)[0].isEnabled({ resources, space: null })).toBe(expectedStatus)
          }
        })
      })
    })
    describe('method "handler"', () => {
      it('adds http(s) protocol if missing and opens the url in a new tab', () => {
        getWrapper({
          getFileContentsValue: '[InternetShortcut]\nURL=owncloud.com',
          setup: async ({ actions }) => {
            await unref(actions)[0].handler({
              resources: [mock<Resource>()],
              space: null
            })
            expect(window.open).toHaveBeenCalledWith('https://owncloud.com')
          }
        })
      })
      it('omits xss code and opens the url in a new tab', () => {
        getWrapper({
          getFileContentsValue:
            '[InternetShortcut]\nURL=https://owncloud.com?default=<script>alert(document.cookie)</script>',
          setup: async ({ actions }) => {
            await unref(actions)[0].handler({
              resources: [mock<Resource>()],
              space: null
            })
            expect(window.open).toHaveBeenCalledWith('https://owncloud.com?default=')
          }
        })
      })
      it('opens the url in the same window if url links to OCIS instance', () => {
        getWrapper({
          getFileContentsValue: '[InternetShortcut]\nURL=https://demo.owncloud.com',
          setup: async ({ actions }) => {
            await unref(actions)[0].handler({
              resources: [mock<Resource>()],
              space: null
            })
            expect(window.location.href).toBe('https://demo.owncloud.com')
          }
        })
      })
    })
  })
  describe('method "extractUrl"', () => {
    it('extracts url correctly', () => {
      getWrapper({
        setup: ({ extractUrl }) => {
          expect(extractUrl('[InternetShortcut]\n' + 'URL=https://owncloud.com')).toEqual(
            'https://owncloud.com'
          )
        }
      })
    })
    it('throws error if url cannot be extracted', () => {
      getWrapper({
        setup: ({ extractUrl }) => {
          expect(() => extractUrl('�������')).toThrow('unable to extract url')
        }
      })
    })
  })
})

function getWrapper({
  setup,
  getFileContentsValue = null
}: {
  getFileContentsValue?: string
  setup: (
    instance: ReturnType<typeof useFileActionsOpenShortcut>,
    options: {
      storeOptions: typeof defaultStoreMockOptions
    }
  ) => void
}) {
  const mocks = {
    ...defaultComponentMocks({
      currentRoute: mock<RouteLocation>({ name: 'files-spaces-generic' })
    })
  }

  mocks.$clientService.webdav.getFileContents.mockResolvedValue(
    mock<GetFileContentsResponse>({
      body: getFileContentsValue
    })
  )

  jest
    .mocked(useRoute)
    .mockImplementation(() =>
      ref(mock<RouteLocation>({ name: 'files-spaces-generic', path: '/files/' }) as any)
    )

  const storeOptions = {
    ...defaultStoreMockOptions
  }

  const store = createStore(storeOptions)

  return {
    wrapper: getComposableWrapper(
      () => {
        const instance = useFileActionsOpenShortcut({ store })
        setup(instance, { storeOptions })
      },
      {
        store,
        mocks,
        provide: mocks
      }
    )
  }
}
