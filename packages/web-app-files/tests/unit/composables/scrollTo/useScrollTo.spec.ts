import { mockDeep } from 'jest-mock-extended'
import { useScrollTo } from 'web-app-files/src/composables/scrollTo'
import { Resource } from 'web-client/src'
import { eventBus } from 'web-pkg/src'
import { defaultComponentMocks } from 'web-test-helpers/src/mocks/defaultComponentMocks'
import { defaultStoreMockOptions } from 'web-test-helpers/src/mocks/store/defaultStoreMockOptions'
import { createComposableWrapper } from '../composables.setup'

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

    it('calls does nothing when no element was found', () => {
      const htmlPageObject = getHTMLPageObject()
      jest.spyOn(document, 'querySelectorAll').mockImplementation(() => [] as any)

      createComposableWrapper(
        () => {
          const { scrollToResource } = useScrollTo()
          scrollToResource(mockDeep<Resource>())
          expect(htmlPageObject.scrollIntoView).not.toHaveBeenCalled()
        },
        { mocks: defaultComponentMocks(), store: defaultStoreMockOptions }
      )
    })
    it('calls "scrollIntoView" when the page bottom is reached', () => {
      const htmlPageObject = getHTMLPageObject()
      jest.spyOn(document, 'querySelectorAll').mockImplementation(() => [htmlPageObject] as any)
      window.innerHeight = 100

      createComposableWrapper(
        () => {
          const { scrollToResource } = useScrollTo()
          scrollToResource(mockDeep<Resource>())
          expect(htmlPageObject.scrollIntoView).toHaveBeenCalled()
        },
        { mocks: defaultComponentMocks(), store: defaultStoreMockOptions }
      )
    })
    it('calls "scrollBy" when the page top is reached', () => {
      const htmlPageObject = getHTMLPageObject()
      jest.spyOn(document, 'querySelectorAll').mockImplementation(() => [htmlPageObject] as any)
      jest
        .spyOn(document, 'getElementsByClassName')
        .mockImplementation(() => [htmlPageObject] as any)
      window.innerHeight = 500

      createComposableWrapper(
        () => {
          const { scrollToResource } = useScrollTo()
          scrollToResource(mockDeep<Resource>())
          expect(htmlPageObject.scrollBy).toHaveBeenCalled()
        },
        { mocks: defaultComponentMocks(), store: defaultStoreMockOptions }
      )
    })
  })
  describe('method "scrollToResourceFromRoute"', () => {
    const resourceId = 'someFileId'

    it('does not scroll without the "scrollTo" param', () => {
      createComposableWrapper(
        () => {
          const resource = mockDeep<Resource>({ id: resourceId })
          const { scrollToResourceFromRoute } = useScrollTo()
          const querySelectorAllSpy = jest.spyOn(document, 'querySelectorAll')
          scrollToResourceFromRoute([resource])
          expect(querySelectorAllSpy).not.toHaveBeenCalled()
        },
        {
          mocks: { ...defaultComponentMocks() },
          store: defaultStoreMockOptions
        }
      )
    })
    it('does not scroll when no resource found', () => {
      createComposableWrapper(
        () => {
          const resource = mockDeep<Resource>({ id: 'someOtherFileId' })
          const { scrollToResourceFromRoute } = useScrollTo()
          const querySelectorAllSpy = jest.spyOn(document, 'querySelectorAll')
          scrollToResourceFromRoute([resource])
          expect(querySelectorAllSpy).not.toHaveBeenCalled()
        },
        {
          mocks: {
            ...defaultComponentMocks({ currentRoute: { query: { scrollTo: resourceId } } })
          },
          store: defaultStoreMockOptions
        }
      )
    })
    it('scrolls to the resource when the "scrollTo" param is given and a resource is found', () => {
      createComposableWrapper(
        () => {
          const resource = mockDeep<Resource>({ id: resourceId })
          const { scrollToResourceFromRoute } = useScrollTo()
          const querySelectorAllSpy = jest.spyOn(document, 'querySelectorAll')
          scrollToResourceFromRoute([resource])
          expect(querySelectorAllSpy).toHaveBeenCalled()
        },
        {
          mocks: {
            ...defaultComponentMocks({
              currentRoute: { query: { scrollTo: resourceId } }
            }),
            $store: { commit: jest.fn() }
          },
          store: defaultStoreMockOptions
        }
      )
    })
    it('opens the sidebar when a resource is found and the "details" param is given', () => {
      createComposableWrapper(
        () => {
          const busStub = jest.spyOn(eventBus, 'publish')
          const resource = mockDeep<Resource>({ id: resourceId })
          const { scrollToResourceFromRoute } = useScrollTo()
          scrollToResourceFromRoute([resource])
          expect(busStub).toHaveBeenCalled()
        },
        {
          mocks: {
            ...defaultComponentMocks({
              currentRoute: { query: { scrollTo: resourceId, details: 'details-item' } }
            }),
            $store: { commit: jest.fn() }
          },
          store: defaultStoreMockOptions
        }
      )
    })
  })
})
