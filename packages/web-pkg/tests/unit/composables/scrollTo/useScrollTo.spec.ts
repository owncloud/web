import { mock, mockDeep } from 'jest-mock-extended'
import { useScrollTo } from '../../../../src/composables/scrollTo'
import { Resource } from '@ownclouders/web-client/src'
import { eventBus } from '../../../../src/services'
import { defaultComponentMocks } from 'web-test-helpers/src/mocks/defaultComponentMocks'
import { defaultStoreMockOptions } from 'web-test-helpers/src/mocks/store/defaultStoreMockOptions'
import { getComposableWrapper, RouteLocation } from 'web-test-helpers'

const mockResourceId = 'fakeResourceId'
const mockFilesTopBar = {
  offsetHeight: 75
}

describe('useScrollTo', () => {
  it('should be valid', () => {
    expect(useScrollTo).toBeDefined()
  })
  describe('method "scrollToResource"', () => {
    const getHTMLPageObject = () => ({
      getBoundingClientRect: jest.fn(() => ({ bottom: 300, top: 0 })),
      scrollIntoView: jest.fn(),
      scrollBy: jest.fn(),
      offsetHeight: 100
    })

    it('does nothing when no element was found', () => {
      const htmlPageObject = getHTMLPageObject()
      jest.spyOn(document, 'querySelectorAll').mockImplementation(() => [] as any)
      jest.spyOn(document, 'getElementById').mockImplementation(() => mockFilesTopBar as any)

      const mocks = defaultComponentMocks()

      getComposableWrapper(
        () => {
          const { scrollToResource } = useScrollTo()
          scrollToResource(mockResourceId)
          expect(htmlPageObject.scrollIntoView).not.toHaveBeenCalled()
        },
        { mocks, provide: mocks, store: defaultStoreMockOptions }
      )
    })
    it('calls "scrollIntoView" when the page bottom is reached', () => {
      const htmlPageObject = getHTMLPageObject()
      jest.spyOn(document, 'querySelectorAll').mockImplementation(() => [htmlPageObject] as any)
      jest.spyOn(document, 'getElementById').mockImplementation(() => mockFilesTopBar as any)

      window.innerHeight = 100

      const mocks = defaultComponentMocks()

      getComposableWrapper(
        () => {
          const { scrollToResource } = useScrollTo()
          scrollToResource(mockResourceId)
          expect(htmlPageObject.scrollIntoView).toHaveBeenCalled()
        },
        { mocks, provide: mocks, store: defaultStoreMockOptions }
      )
    })
    it('calls "scrollIntoView" when the page top is reached', () => {
      const htmlPageObject = getHTMLPageObject()
      jest.spyOn(document, 'querySelectorAll').mockImplementation(() => [htmlPageObject] as any)
      jest.spyOn(document, 'getElementById').mockImplementation(() => mockFilesTopBar as any)

      window.innerHeight = 500

      const mocks = defaultComponentMocks()

      getComposableWrapper(
        () => {
          const { scrollToResource } = useScrollTo()
          scrollToResource(mockResourceId)
          expect(htmlPageObject.scrollIntoView).toHaveBeenCalled()
        },
        { mocks, provide: mocks, store: defaultStoreMockOptions }
      )
    })
  })
  describe('method "scrollToResourceFromRoute"', () => {
    const resourceId = 'someFileId'

    it('does not scroll without the "scrollTo" param', () => {
      const mocks = { ...defaultComponentMocks() }

      getComposableWrapper(
        () => {
          const resource = mockDeep<Resource>({ id: resourceId })
          const { scrollToResourceFromRoute } = useScrollTo()
          const querySelectorAllSpy = jest.spyOn(document, 'querySelectorAll')
          scrollToResourceFromRoute([resource], 'files-app-bar')
          expect(querySelectorAllSpy).not.toHaveBeenCalled()
        },
        {
          mocks,
          provide: mocks,
          store: defaultStoreMockOptions
        }
      )
    })
    it('does not scroll when no resource found', () => {
      const mocks = {
        ...defaultComponentMocks({
          currentRoute: mock<RouteLocation>({ query: { scrollTo: resourceId } })
        })
      }

      getComposableWrapper(
        () => {
          const resource = mockDeep<Resource>({ id: 'someOtherFileId' })
          const { scrollToResourceFromRoute } = useScrollTo()
          const querySelectorAllSpy = jest.spyOn(document, 'querySelectorAll')
          scrollToResourceFromRoute([resource], 'files-app-bar')
          expect(querySelectorAllSpy).not.toHaveBeenCalled()
        },
        {
          mocks,
          provide: mocks,
          store: defaultStoreMockOptions
        }
      )
    })
    it('does not scroll when resource is processing', () => {
      const mocks = {
        ...defaultComponentMocks({
          currentRoute: mock<RouteLocation>({ query: { scrollTo: resourceId } })
        })
      }

      getComposableWrapper(
        () => {
          const resource = mockDeep<Resource>({ id: resourceId, processing: true })
          const { scrollToResourceFromRoute } = useScrollTo()
          const querySelectorAllSpy = jest.spyOn(document, 'querySelectorAll')
          scrollToResourceFromRoute([resource], 'files-app-bar')
          expect(querySelectorAllSpy).not.toHaveBeenCalled()
        },
        {
          mocks,
          provide: mocks,
          store: defaultStoreMockOptions
        }
      )
    })
    it('scrolls to the resource when the "scrollTo" param is given and a resource is found', () => {
      const store = { commit: jest.fn() }
      const mocks = {
        ...defaultComponentMocks({
          currentRoute: mock<RouteLocation>({ query: { scrollTo: resourceId } })
        })
      }

      getComposableWrapper(
        () => {
          const resource = mockDeep<Resource>({ id: resourceId })
          const { scrollToResourceFromRoute } = useScrollTo()
          const querySelectorAllSpy = jest.spyOn(document, 'querySelectorAll')
          scrollToResourceFromRoute([resource], 'files-app-bar')
          expect(querySelectorAllSpy).toHaveBeenCalled()
        },
        {
          mocks,
          provide: {
            ...mocks,
            store
          }
        }
      )
    })
    it('opens the sidebar when a resource is found and the "details" param is given', () => {
      const store = { commit: jest.fn() }
      const mocks = {
        ...defaultComponentMocks({
          currentRoute: mock<RouteLocation>({
            query: { scrollTo: resourceId, details: 'details' }
          })
        })
      }

      getComposableWrapper(
        () => {
          const busStub = jest.spyOn(eventBus, 'publish')
          const resource = mockDeep<Resource>({ id: resourceId })
          const { scrollToResourceFromRoute } = useScrollTo()
          scrollToResourceFromRoute([resource], 'files-app-bar')
          expect(busStub).toHaveBeenCalled()
        },
        {
          mocks,
          provide: {
            ...mocks,
            store
          }
        }
      )
    })
  })
})
