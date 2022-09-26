import { computed, ComputedRef, unref, WritableComputedRef } from '@vue/composition-api'
import { Resource } from 'web-client'
import { useStore } from 'web-pkg/src/composables'
import { Store } from 'vuex'
import { SpaceResource } from 'web-client/src/helpers'

interface SelectedResourcesResult {
  selectedResources: WritableComputedRef<Resource[]>
  selectedResourcesIds: WritableComputedRef<(string | number)[]>
  isResourceInSelection(resource: Resource): boolean
  selectedResourceSpace?: ComputedRef<SpaceResource>
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

  const selectedResourceSpace = computed(() => {
    if (unref(selectedResources).length !== 1) {
      return null
    }
    const storageId = unref(selectedResources)[0].storageId
    return store.getters['runtime/spaces/spaces'].find((space) => space.id === storageId)
  })

  return {
    selectedResources,
    selectedResourcesIds,
    isResourceInSelection,
    selectedResourceSpace
  }
}
