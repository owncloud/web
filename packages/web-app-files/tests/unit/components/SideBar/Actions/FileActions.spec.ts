import FileActions from 'web-app-files/src/components/SideBar/Actions/FileActions.vue'
import { Resource, SpaceResource } from '@ownclouders/web-client/src/helpers'
import { mock } from 'jest-mock-extended'
import {
  defaultPlugins,
  defaultStubs,
  mount,
  defaultComponentMocks,
  RouteLocation
} from 'web-test-helpers'
import { useFileActions } from '@ownclouders/web-pkg'
import { Action } from '@ownclouders/web-pkg'

jest.mock('@ownclouders/web-pkg', () => ({
  ...jest.requireActual('@ownclouders/web-pkg'),
  useFileActions: jest.fn()
}))

const fileActions = {
  copy: {
    handler: jest.fn(),
    label: () => 'Copy',
    componentType: 'button',
    class: 'oc-files-actions-copy-trigger',
    selector: '.oc-files-actions-copy-trigger'
  },
  move: {
    handler: jest.fn(),
    label: () => 'Move',
    componentType: 'button',
    class: 'oc-files-actions-move-trigger',
    selector: '.oc-files-actions-move-trigger'
  },
  download: {
    handler: jest.fn(),
    label: () => 'Download',
    componentType: 'button',
    class: 'oc-files-actions-download-file-trigger',
    selector: '.oc-files-actions-download-file-trigger'
  },
  'text-editor': {
    handler: jest.fn(),
    label: () => 'Open in Text Editor',
    componentType: 'button',
    class: 'oc-files-actions-text-editor-trigger',
    selector: '.oc-files-actions-text-editor-trigger'
  }
}

describe('FileActions', () => {
  describe('when user is on personal route', () => {
    describe('action handlers', () => {
      it('renders action handlers as clickable elements', async () => {
        jest.mocked(useFileActions).mockImplementation(() =>
          mock<ReturnType<typeof useFileActions>>({
            getAllAvailableActions: () => Object.values(fileActions) as any as Action[]
          })
        )

        const actions = ['copy', 'move', 'download', 'text-editor']
        const { wrapper } = getWrapper()

        for (const button of actions) {
          const action = fileActions[button]

          const buttonElement = wrapper.find(action.selector)
          expect(buttonElement.exists()).toBeTruthy()

          await buttonElement.trigger('click.stop')
          expect(action.handler).toHaveBeenCalledTimes(1)
        }
      })
    })

    describe('menu items', () => {
      it('renders a list of actions', () => {
        const { wrapper } = getWrapper()
        for (const action of ['copy', 'text-editor']) {
          expect(wrapper.find(fileActions[action].selector).exists()).toBeTruthy()
        }
      })
    })
  })
})

function getWrapper() {
  return {
    wrapper: mount(FileActions, {
      global: {
        plugins: [...defaultPlugins()],
        mocks: defaultComponentMocks({
          currentRoute: mock<RouteLocation>({
            name: 'files-spaces-generic',
            path: '/files/spaces/personal/admin'
          })
        }),
        stubs: { ...defaultStubs, OcButton: false },
        provide: {
          space: mock<SpaceResource>(),
          resource: mock<Resource>({
            extension: 'md'
          })
        }
      }
    })
  }
}
