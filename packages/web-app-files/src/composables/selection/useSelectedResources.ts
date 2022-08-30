import { computed, unref, WritableComputedRef } from '@vue/composition-api'
import { Resource } from 'web-client'
import { useStore } from 'web-pkg/src/composables'
import { Store } from 'vuex'

interface SelectedResourcesResult {
  selectedResources: WritableComputedRef<Resource[]>
  selectedResourcesIds: WritableComputedRef<(string | number)[]>
  isResourceInSelection(resource: Resource): boolean
}

interface SelectedResourcesOptions {
  store?: Store<any>
}

export const useSelectedResources = (
  options?: SelectedResourcesOptions
): SelectedResourcesResult => {
  const store = options.store || useStore()

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

  return {
    selectedResources,
    selectedResourcesIds,
    isResourceInSelection
  }
}
