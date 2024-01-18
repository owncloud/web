import { defaultComponentMocks, defaultPlugins, mount, RouteLocation } from 'web-test-helpers'
import ResourceDetails from '../../../../src/components/FilesList/ResourceDetails.vue'
import { mock } from 'jest-mock-extended'
import { useFileActions } from '@ownclouders/web-pkg'
import { SpaceResource } from '@ownclouders/web-client'
import { useRouteQuery } from '@ownclouders/web-pkg'
import { ref } from 'vue'

jest.mock('@ownclouders/web-pkg', () => ({
  ...jest.requireActual('@ownclouders/web-pkg'),
  getIndicators: jest.fn(() => []),
  useRouteQuery: jest.fn(),
  useFileActions: jest.fn()
}))

describe('ResourceDetails component', () => {
  jest.mocked(useFileActions).mockImplementation(() =>
    mock<ReturnType<typeof useFileActions>>({
      getDefaultEditorAction: () => ({ handler: jest.fn() }) as any
    })
  )

  it('renders resource details correctly', () => {
    const { wrapper } = getWrapper(true)
    expect(wrapper.html()).toMatchSnapshot()
  })

  describe('open with default actions', () => {
    it("doesn't open default action if query param 'openWithDefaultApp' isn't set true", () => {
      const { wrapper } = getWrapper()
      expect(wrapper.vm.defaultEditorAction.handler).not.toHaveBeenCalled()
    })
    it("opens default action if query param 'openWithDefaultApp' is set true", () => {
      jest.mocked(useRouteQuery).mockImplementationOnce(() => ref('true'))
      const { wrapper } = getWrapper()
      expect(wrapper.vm.defaultEditorAction.handler).toHaveBeenCalled()
    })
  })

  function getWrapper(isFolder = false) {
    const mocks = {
      ...defaultComponentMocks({
        currentRoute: mock<RouteLocation>({
          name: 'files-public-link',
          query: { openWithDefaultAppQuery: 'true' }
        })
      })
    }
    mocks.$clientService.webdav.listFileVersions.mockResolvedValue([])

    const file = {
      id: 0,
      name: 'image.jpg',
      size: 24064,
      mdate: 'Wed, 21 Oct 2015 07:28:00 GMT',
      mimeType: 'image/jpg',
      isFolder,
      owner: [
        {
          username: 'admin'
        }
      ]
    }
    const space = mock<SpaceResource>()

    return {
      mocks,
      wrapper: mount(ResourceDetails, {
        props: {
          space,
          singleResource: file
        },
        global: {
          mocks,
          plugins: [...defaultPlugins()],
          provide: {
            ...mocks,
            space,
            resource: file
          }
        }
      })
    }
  }
})
