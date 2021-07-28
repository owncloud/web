import Vuex from 'vuex'
import DesignSystem from 'owncloud-design-system'
import stubs from '@/tests/unit/stubs/index.js'
import { createLocalVue, mount } from '@vue/test-utils'
import FileInfo from '@files/src/components/SideBar/FileInfo.vue'

import GetTextPlugin from 'vue-gettext'

const localVue = createLocalVue()
localVue.use(DesignSystem)
localVue.use(Vuex)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

const filesPersonalRoute = { name: 'files-personal' }
const filesPublicRoute = { name: 'files-public-list' }

const favoriteTrigger = jest.fn(() => {
  return Promise.resolve()
})

function getWrapper(
  route,
  { filename = 'testfile', extension, type = 'file', publicLink = false }
) {
  const mountStubs = { ...stubs, 'oc-button': false }
  const mountOptions = {
    localVue,
    store: createStore({}, filename, extension, type),
    stubs: mountStubs,
    mocks: {
      $route: route,
      publicPage: () => publicLink
    },
    provide: {
      displayedItem: {
        value: getResource({ filename, extension, type })
      }
    },
    propsData: {
      isContentDisplayed: true
    }
  }
  return mount(FileInfo, mountOptions)
}

const selectors = {
  favoritesButton: '.file_info button.file_info__favorite'
}

describe('FileInfo', () => {
  describe.each([[filesPersonalRoute], [filesPublicRoute]])(
    'FileInfo Components on %s routes',
    (route) => {
      it.each([
        [{ filename: 'testfile', extension: 'txt', type: 'file' }],
        [{ filename: 'test-file', extension: 'drawio', type: 'file' }],
        [{ filename: 'testfolder', extension: '', type: 'folder' }]
      ])('should show the fileinfo correctly', (data) => {
        const wrapper = getWrapper(route, data)

        expect(wrapper).toMatchSnapshot()
      })

      it('should call the favorite trigger when button is clicked', async () => {
        const wrapper = getWrapper(route, {
          filename: 'testfile',
          extension: 'jpg'
        })

        const favoritesButton = wrapper.find(selectors.favoritesButton)
        await favoritesButton.trigger('click.native.stop')
        expect(favoriteTrigger).toHaveBeenCalled()
      })
    }
  )
})

function getResource({ filename, extension, type }) {
  // convert date from 2 days ago to format 'Mon, 12 Jul 2021 11:04:33 GMT'
  const d = new Date()
  d.setDate(d.getDate() - 2)
  const mdate = d.toGMTString()
  return {
    id: '4',
    fileId: '4',
    icon: type,
    name: type === 'file' ? `${filename}.${extension}` : filename,
    extension: extension,
    path: type === 'file' ? `/${filename}.${extension}` : `/${filename}`,
    type,
    mdate,
    size: '163',
    indicators: [],
    permissions: 'RDNVW',
    starred: false,
    shareTypes: [],
    ownerDisplayName: 'user1',
    ownerId: 'user1',
    canDownload: () => true,
    isReceivedShare: () => true,
    canBeDeleted: () => true,
    canRename: () => true
  }
}

function createStore(state, filename, extension, type = 'file') {
  return new Vuex.Store({
    modules: {
      Files: {
        state: {
          ...state,
          currentFolder: { path: '' }
        },
        namespaced: true,
        getters: {
          highlightedFile: () => {
            return getResource({ filename, extension, type })
          }
        },
        actions: {
          markFavorite: favoriteTrigger
        }
      }
    },
    getters: {
      capabilities: () => {
        return {
          files: {
            favorites: true
          }
        }
      }
    }
  })
}
