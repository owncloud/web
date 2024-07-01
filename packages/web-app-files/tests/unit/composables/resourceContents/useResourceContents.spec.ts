import { useResourceContents } from 'web-app-files/src/composables/resourceContents/useResourceContents'
import { mock } from 'vitest-mock-extended'
import { defaultComponentMocks, getComposableWrapper } from 'web-test-helpers'
import { unref } from 'vue'
import { Resource } from '@ownclouders/web-client'
import { describe } from 'vitest'

describe('resourceContents', () => {
  describe('resourceContentsText', () => {
    it.each([
      { prop: { resources: [] }, expectedText: '0 items in total (0 files, 0 folders)' },
      {
        prop: {
          resources: [mock<Resource>({ isFolder: true, type: 'folder', name: 'folder1' })]
        },
        expectedText: '1 item in total (0 files, 1 folder)'
      },
      {
        prop: { resources: [mock<Resource>({ isFolder: false, type: 'file', name: 'file1' })] },
        expectedText: '1 item in total (1 file, 0 folders)'
      },
      {
        prop: {
          resources: [
            mock<Resource>({
              isFolder: false,
              type: 'file',
              name: 'file1'
            }),
            mock<Resource>({
              isFolder: true,
              type: 'folder',
              name: 'folder1'
            })
          ]
        },
        expectedText: '2 items in total (1 file, 1 folder)'
      },
      {
        prop: {
          resources: [
            mock<Resource>({
              isFolder: false,
              type: 'file',
              name: 'file1'
            }),
            mock<Resource>({
              isFolder: false,
              type: 'file',
              name: 'file2'
            }),
            mock<Resource>({
              isFolder: true,
              type: 'folder',
              name: 'folder1'
            }),
            mock<Resource>({
              isFolder: true,
              type: 'folder',
              name: 'folder2'
            })
          ]
        },
        expectedText: '4 items in total (2 files, 2 folders)'
      }
    ])('should be singular or plural according to item, files and folders count', (cases) => {
      getWrapper({
        resources: cases.prop.resources,
        setup: ({ resourceContentsText }) => {
          expect(unref(resourceContentsText)).toBe(cases.expectedText)
        }
      })
    })
  })
  it.each`
    size              | expectedSize
    ${1}              | ${'1 B'}
    ${100}            | ${'100 B'}
    ${10000}          | ${'10 kB'}
    ${10000000}       | ${'10 MB'}
    ${10000000000}    | ${'10 GB'}
    ${10000000000000} | ${'10 TB'}
  `('should display correctly size according to items', ({ size, expectedSize }) => {
    const resources = [
      mock<Resource>({
        isFolder: false,
        size: parseInt(size),
        type: 'file',
        name: 'file1'
      }),
      mock<Resource>({
        isFolder: false,
        size: 0,
        type: 'file',
        name: 'file2'
      }),
      mock<Resource>({
        isFolder: true,
        size: 0,
        type: 'folder',
        name: 'folder1'
      }),
      mock<Resource>({
        isFolder: true,
        size: 0,
        type: 'folder',
        name: 'folder2'
      }),
      mock<Resource>({
        isFolder: true,
        size: 0,
        type: 'folder',
        name: 'folder3'
      })
    ]

    getWrapper({
      resources,
      setup: ({ resourceContentsText }) => {
        expect(unref(resourceContentsText)).toBe(
          `5 items with ${expectedSize} in total (2 files, 3 folders)`
        )
      }
    })
  })
})

function getWrapper({
  resources = [],
  setup
}: {
  resources: Resource[]
  setup: (instance: ReturnType<typeof useResourceContents>) => void
}) {
  const mocks = defaultComponentMocks()

  return {
    wrapper: getComposableWrapper(
      () => {
        const instance = useResourceContents()
        setup(instance)
      },
      {
        mocks,
        pluginOptions: {
          piniaOptions: {
            resourcesStore: { resources }
          }
        },
        provide: mocks
      }
    )
  }
}
