import { useSpaceHelpers } from '../../../../src/composables/spaces'
import {
  createStore,
  defaultComponentMocks,
  defaultStoreMockOptions,
  getComposableWrapper
} from 'web-test-helpers'

describe('useSpaceHelpers', () => {
  it('should be valid', () => {
    expect(useSpaceHelpers).toBeDefined()
  })
  describe('method "checkSpaceNameModalInput"', () => {
    it('should not show an error message with a valid space name', () => {
      getWrapper({
        setup: ({ checkSpaceNameModalInput }, { storeOptions }) => {
          checkSpaceNameModalInput('Space')
          const { setModalInputErrorMessage } = storeOptions.actions
          expect(setModalInputErrorMessage).toHaveBeenCalledWith(expect.anything(), null)
        }
      })
    })
    it('should show an error message with an empty name', () => {
      getWrapper({
        setup: ({ checkSpaceNameModalInput }, { storeOptions }) => {
          checkSpaceNameModalInput('')
          const { setModalInputErrorMessage } = storeOptions.actions
          expect(setModalInputErrorMessage).not.toHaveBeenCalledWith(expect.anything(), null)
        }
      })
    })
    it('should show an error with an name longer than 255 characters', () => {
      getWrapper({
        setup: ({ checkSpaceNameModalInput }, { storeOptions }) => {
          checkSpaceNameModalInput('n'.repeat(256))
          const { setModalInputErrorMessage } = storeOptions.actions
          expect(setModalInputErrorMessage).not.toHaveBeenCalledWith(expect.anything(), null)
        }
      })
    })
    it.each(['/', '\\', '.', ':', '?', '*', '"', '>', '<', '|'])(
      'should show an error message with a name including a special character',
      (specialChar) => {
        getWrapper({
          setup: ({ checkSpaceNameModalInput }, { storeOptions }) => {
            checkSpaceNameModalInput(specialChar)
            const { setModalInputErrorMessage } = storeOptions.actions
            expect(setModalInputErrorMessage).not.toHaveBeenCalledWith(expect.anything(), null)
          }
        })
      }
    )
  })
})

function getWrapper({
  setup
}: {
  setup: (
    instance: ReturnType<typeof useSpaceHelpers>,
    options: { storeOptions: typeof defaultStoreMockOptions }
  ) => void
}) {
  const mocks = defaultComponentMocks()
  const storeOptions = defaultStoreMockOptions
  const store = createStore(storeOptions)
  return {
    wrapper: getComposableWrapper(
      () => {
        const instance = useSpaceHelpers()
        setup(instance, { storeOptions })
      },
      {
        store,
        mocks
      }
    )
  }
}
