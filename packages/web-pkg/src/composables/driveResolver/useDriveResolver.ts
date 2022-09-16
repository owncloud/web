import { useStore } from '../store'
import { Store } from 'vuex'
import { computed, Ref, ref, unref, watch } from '@vue/composition-api'

interface DriveResolverOptions {
  store?: Store<any>
  driveAliasAndItem?: Ref<string>
}

export const useDriveResolver = (options: DriveResolverOptions = {}) => {
  const store = options.store || useStore()
  const areSpacesLoading = computed(
    () =>
      !store.getters['runtime/spaces/spacesInitialized'] ||
      store.getters['runtime/spaces/spacesLoading']
  )
  const spaces = computed(() => store.getters['runtime/spaces/spaces'])
  const space = ref(null)
  const item = ref(null)
  watch(
    [options.driveAliasAndItem, areSpacesLoading],
    ([driveAliasAndItem]) => {
      if (!driveAliasAndItem) {
        space.value = null
        item.value = null
        return
      }
      if (unref(space) && driveAliasAndItem.startsWith(unref(space).driveAlias)) {
        item.value = driveAliasAndItem.slice(unref(space).driveAlias.length)
        return
      }
      let matchingSpace = null
      let path = null
      unref(spaces).forEach((s) => {
        if (!driveAliasAndItem.startsWith(s.driveAlias)) {
          return
        }
        if (!matchingSpace || s.driveAlias.length > matchingSpace.driveAlias.length) {
          matchingSpace = s
          path = driveAliasAndItem.slice(s.driveAlias.length)
        }
      })
      space.value = matchingSpace
      item.value = path
    },
    { immediate: true }
  )
  return {
    areSpacesLoading,
    space,
    item
  }
}
