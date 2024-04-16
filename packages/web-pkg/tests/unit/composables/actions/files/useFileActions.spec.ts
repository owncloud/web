import { mock } from 'vitest-mock-extended'
import { useFileActions } from '../../../../../src/composables/actions'
import { defaultComponentMocks, RouteLocation, getComposableWrapper } from 'web-test-helpers'
import { computed, unref } from 'vue'

const mockUseEmbedMode = vi.fn().mockReturnValue({ isEnabled: computed(() => false) })
vi.mock('../../../../../src/composables/embedMode', () => ({
  useEmbedMode: vi.fn().mockImplementation(() => mockUseEmbedMode())
}))

describe('fileActions', () => {
  describe('computed property "editorActions"', () => {
    it('should provide a list of editors', () => {
      getWrapper({
        setup: ({ editorActions }) => {
          expect(unref(editorActions).length).toBeTruthy()
        }
      })
    })
    it('should provide an empty list if embed mode is enables', () => {
      mockUseEmbedMode.mockReturnValue({
        isEnabled: computed(() => true)
      })
      getWrapper({
        setup: ({ editorActions }) => {
          expect(unref(editorActions).length).toBeFalsy()
        }
      })
    })
  })
})

function getWrapper({
  setup
}: {
  searchLocation: boolean
  setup: (instance: ReturnType<typeof useFileActions>) => void
}) {
  const mocks = {
    ...defaultComponentMocks({
      currentRoute: mock<RouteLocation>({ name: 'files-spaces-generic' })
    })
  }
  return {
    mocks,
    wrapper: getComposableWrapper(
      () => {
        const instance = useFileActions()
        setup(instance)
      },
      {
        mocks,
        provide: mocks,
        pluginOptions: {
          piniaOptions: {
            appsStore: {
              apps: {
                'text-editor': {
                  applicationMenu: {
                    priority: 20,
                    openAsEditor: true
                  },
                  defaultExtension: 'txt',
                  icon: 'file-text',
                  name: 'Text Editor',
                  id: 'text-editor',
                  color: '#0D856F',
                  isFileEditor: true,
                  extensions: [
                    {
                      extension: 'txt',
                      newFileMenu: {}
                    }
                  ]
                }
              },
              fileExtensions: [
                {
                  app: 'text-editor',
                  extension: 'txt',
                  newFileMenu: {},
                  hasPriority: false
                }
              ]
            }
          }
        }
      }
    )
  }
}
