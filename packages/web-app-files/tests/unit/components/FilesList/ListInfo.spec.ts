import ListInfo from '../../../../src/components/FilesList/ListInfo.vue'
import { defaultComponentMocks, defaultPlugins, shallowMount } from 'web-test-helpers'
import { mock } from 'vitest-mock-extended'
import { Resource } from '@ownclouders/web-client'

describe('ListInfo', () => {
  describe('files and folders', () => {
    describe('information text', () => {
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
        const wrapper = getWrapper({ resources: cases.prop.resources })
        const itemElement = wrapper.find('p')
        expect(itemElement.text()).toBe(cases.expectedText)
      })
    })
  })
  describe('size prop', () => {
    describe('when size prop is greater than zero', () => {
      it.each`
        size              | expectedSize
        ${1}              | ${'1 B'}
        ${100}            | ${'100 B'}
        ${10000}          | ${'10 kB'}
        ${10000000}       | ${'10 MB'}
        ${10000000000}    | ${'10 GB'}
        ${10000000000000} | ${'10 TB'}
      `('should calculate size units', ({ size, expectedSize }) => {
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

        const wrapper = getWrapper({ resources })

        expect(wrapper.find('p').text()).toBe(
          `5 items with ${expectedSize} in total (2 files, 3 folders)`
        )
      })
    })
  })
})

function getWrapper({ resources = [] } = {}) {
  const mocks = {
    ...defaultComponentMocks()
  }

  return shallowMount(ListInfo, {
    global: {
      mocks,
      plugins: [...defaultPlugins({ piniaOptions: { resourcesStore: { resources } } })],
      provide: mocks
    }
  })
}
