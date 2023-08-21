import { computed, unref, WritableComputedRef, Ref } from 'vue'
import { Resource } from 'web-client'
import { useStore } from 'web-pkg/src/composables'
import { Store } from 'vuex'
import { buildShareSpaceResource, SpaceResource } from 'web-client/src/helpers'
import { configurationManager } from 'web-pkg/src/configuration'

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
    const storageId = resource.storageId
    // FIXME: Once we have the shareId in the OCS response, we can check for that and early return the share
    const space = store.getters['runtime/spaces/spaces'].find((space) => space.id === storageId)
    if (space) {
      return space
    }

    return buildShareSpaceResource({
      shareId: resource.shareId,
      shareName: resource.name,
      serverUrl: configurationManager.serverUrl
    })
  })

  return {
    selectedResources,
    selectedResourcesIds,
    isResourceInSelection,
    selectedResourceSpace
  }
}
