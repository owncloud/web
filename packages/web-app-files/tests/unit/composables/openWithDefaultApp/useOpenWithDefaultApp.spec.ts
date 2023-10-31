import { getComposableWrapper } from 'web-test-helpers'
import { mock } from 'jest-mock-extended'
import { Resource, SpaceResource } from '@ownclouders/web-client'
import { useOpenWithDefaultApp } from '../../../../src/composables/openWithDefaultApp'
import { useFileActions, Action } from '@ownclouders/web-pkg'

jest.mock('@ownclouders/web-pkg', () => ({
  ...jest.requireActual('@ownclouders/web-pkg'),
  useFileActions: jest.fn()
}))

describe('useOpenWithDefaultApp', () => {
  it('should be valid', () => {
    expect(useOpenWithDefaultApp).toBeDefined()
  })
  describe('method "openWithDefaultApp"', () => {
    it('should call the default action handler for files', () => {
      getWrapper({
        setup: ({ openWithDefaultApp }, { defaultEditorAction }) => {
          openWithDefaultApp({
            space: mock<SpaceResource>(),
            resource: mock<Resource>({ isFolder: false })
          })
          expect(defaultEditorAction.handler).toHaveBeenCalled()
        }
      })
    })
    it('should not call the default action handler for folders', () => {
      getWrapper({
        setup: ({ openWithDefaultApp }, { defaultEditorAction }) => {
          openWithDefaultApp({
            space: mock<SpaceResource>(),
            resource: mock<Resource>({ isFolder: true })
          })
          expect(defaultEditorAction.handler).not.toHaveBeenCalled()
        }
      })
    })
  })
})

function getWrapper({
  setup,
  defaultEditorAction = mock<Action>({ handler: jest.fn() })
}: {
  setup: (
    instance: ReturnType<typeof useOpenWithDefaultApp>,
    mocks: { defaultEditorAction: any }
  ) => void
  defaultEditorAction?: any
}) {
  jest.mocked(useFileActions).mockReturnValue(
    mock<ReturnType<typeof useFileActions>>({
      getDefaultEditorAction: () => defaultEditorAction
    })
  )

  const mocks = { defaultEditorAction }

  return {
    wrapper: getComposableWrapper(() => {
      const instance = useOpenWithDefaultApp()
      setup(instance, mocks)
    })
  }
}
