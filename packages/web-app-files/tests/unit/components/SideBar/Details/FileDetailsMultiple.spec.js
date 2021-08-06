import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'
import FileDetailsMultiple from 'packages/web-app-files/src/components/SideBar/Details/FileDetailsMultiple.vue'
import stubs from '../../../../../../../tests/unit/stubs'
import GetTextPlugin from 'vue-gettext'
import AsyncComputed from 'vue-async-computed'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(AsyncComputed)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

const selectors = {
  selectedFilesText: '[data-testid="selectedFilesText"]',
  filesCount: '[data-testid="filesCount"]',
  foldersCount: '[data-testid="foldersCount"]',
  size: '[data-testid="size"]'
}

const folderA = {
  type: 'folder',
  ownerId: 'marie',
  ownerDisplayName: 'Marie',
  mdate: 'Wed, 21 Oct 2015 07:28:00 GMT',
  size: '740'
}
const folderB = {
  type: 'folder',
  ownerId: 'marie',
  ownerDisplayName: 'Marie',
  mdate: 'Wed, 21 Oct 2015 07:28:00 GMT',
  size: '740'
}
const fileA = {
  type: 'file',
  ownerId: 'marie',
  ownerDisplayName: 'Marie',
  mdate: 'Wed, 21 Oct 2015 07:28:00 GMT',
  size: '740'
}
const fileB = {
  type: 'file',
  ownerId: 'marie',
  ownerDisplayName: 'Marie',
  mdate: 'Wed, 21 Oct 2015 07:28:00 GMT',
  size: '740'
}

describe('Details Multiple Selection SideBar Item', () => {
  it('should display information for two selected folders', () => {
    const wrapper = createWrapper([folderA, folderB])
    expect(wrapper.find(selectors.selectedFilesText).text()).toBe('2 items selected')
    expect(wrapper.find(selectors.filesCount).text()).toBe('Files 0')
    expect(wrapper.find(selectors.foldersCount).text()).toBe('Folders 2')
    expect(wrapper.find(selectors.size).text()).toBe('Size 1 KB')
  })
  it('should display information for two selected files', () => {
    const wrapper = createWrapper([fileA, fileB])
    expect(wrapper.find(selectors.selectedFilesText).text()).toBe('2 items selected')
    expect(wrapper.find(selectors.filesCount).text()).toBe('Files 2')
    expect(wrapper.find(selectors.foldersCount).text()).toBe('Folders 0')
    expect(wrapper.find(selectors.size).text()).toBe('Size 1 KB')
  })
  it('should display information for one selected file, one selected folder', () => {
    const wrapper = createWrapper([fileA, folderA])
    expect(wrapper.find(selectors.selectedFilesText).text()).toBe('2 items selected')
    expect(wrapper.find(selectors.filesCount).text()).toBe('Files 1')
    expect(wrapper.find(selectors.foldersCount).text()).toBe('Folders 1')
    expect(wrapper.find(selectors.size).text()).toBe('Size 1 KB')
  })
})

function createWrapper(testResource) {
  return shallowMount(FileDetailsMultiple, {
    store: new Vuex.Store({
      modules: {
        Files: {
          namespaced: true,
          getters: {
            selectedFiles: function() {
              return testResource
            }
          }
        }
      }
    }),
    localVue,
    stubs: stubs
  })
}
