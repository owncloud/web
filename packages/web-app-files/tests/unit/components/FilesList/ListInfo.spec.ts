import ListInfo from '../../../../src/components/FilesList/ListInfo.vue'
import { defaultComponentMocks, defaultPlugins, shallowMount } from 'web-test-helpers'
import { mock } from 'vitest-mock-extended'
import { Resource } from '@ownclouders/web-client'

describe('ListInfo', () => {
  it('it renders content summary correctly', () => {
    const wrapper = getWrapper()
    expect(wrapper.html()).toMatchSnapshot()
  })
})

function getWrapper() {
  const resources = [
    mock<Resource>({
      isFolder: false,
      type: 'file',
      size: 10000000,
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
