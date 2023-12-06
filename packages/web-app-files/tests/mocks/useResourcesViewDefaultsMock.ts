import { useResourcesViewDefaults } from 'web-app-files/src/composables'
import { readonly, ref } from 'vue'
import { mock, mockDeep } from 'jest-mock-extended'
import { Task } from 'vue-concurrency'
import { SpaceResource } from '@ownclouders/web-client/src/helpers'

export const useResourcesViewDefaultsMock = (
  options: Partial<ReturnType<typeof useResourcesViewDefaults>> = {}
): ReturnType<typeof useResourcesViewDefaults> => {
  return {
    fileListHeaderY: ref(0),
    refreshFileListHeaderPosition: jest.fn(),
    loadResourcesTask: mockDeep<Task<any, any>>({
      isRunning: false
    }),
    areResourcesLoading: ref(false),
    storeItems: ref([]),
    sortFields: ref([]),
    paginatedResources: ref([]),
    paginationPages: readonly(ref(0)),
    paginationPage: readonly(ref(0)),
    handleSort: jest.fn(),
    sortBy: readonly(ref('name')),
    sortDir: undefined,
    selectedResources: ref([]),
    selectedResourcesIds: ref([]),
    selectedResourceSpace: ref(mock<SpaceResource>()),
    isResourceInSelection: jest.fn(() => false),
    isSideBarOpen: ref(false),
    sideBarActivePanel: ref(''),
    scrollToResource: jest.fn(),
    scrollToResourceFromRoute: jest.fn(),
    viewMode: ref('resource-table'),
    viewSize: ref(1),
    ...options
  }
}
