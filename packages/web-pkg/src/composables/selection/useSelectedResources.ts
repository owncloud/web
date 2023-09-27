import { computed, unref, WritableComputedRef, Ref } from 'vue'
import { Resource } from 'web-client'
import { useGetMatchingSpace, useStore } from '@ownclouders/web-pkg/src/composables'
import { Store } from 'vuex'
import { SpaceResource } from 'web-client/src/helpers'

export interface SelectedResourcesResult {
  selectedResources: Ref<Resource[]>
  selectedResourcesIds: Ref<(string | number)[]>
  isResourceInSelection(resource: Resource): boolean
  selectedResourceSpace?: Ref<SpaceResource>
}

interface SelectedResourcesOptions {
  store?: Store<any>
}

export const useSelectedResources = (
  options?: SelectedResourcesOptions
): SelectedResourcesResult => {
  const store = options.store || useStore()
  const { getMatchingSpace } = useGetMatchingSpace()

  const selectedResources: WritableComputedRef<Resource[]> = computed({
    get(): Resource[] {
      return store.getters['Files/selectedFiles']
    },
    set(resources) {
      store.commit('Files/SET_FILE_SELECTION', resources)
    }
  })
  const selectedResourcesIds: WritableComputedRef<(string | number)[]> = computed({
    get(): (string | number)[] {
      return store.state.Files.selectedIds
    },
    set(selectedIds) {
      store.commit('Files/SET_SELECTED_IDS', selectedIds)
    }
  })

  const isResourceInSelection = (resource: Resource): boolean => {
    return unref(selectedResourcesIds).includes(resource.id)
  }

  const selectedResourceSpace = computed(() => {
    if (unref(selectedResources).length !== 1) {
      return null
    }
    const resource = unref(selectedResources)[0]
    return getMatchingSpace(resource)
  })

  return {
    selectedResources,
    selectedResourcesIds,
    isResourceInSelection,
    selectedResourceSpace
  }
}
