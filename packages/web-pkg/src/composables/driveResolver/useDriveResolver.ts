import { useStore } from '../store'
import { Store } from 'vuex'
import { computed, Ref, unref } from '@vue/composition-api'

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
  const space = computed(() => {
    // TODO: this needs a virtual space for the logged in user in backends without spaces support
    let matchingSpace = null
    unref(spaces).forEach((space) => {
      if (!space.driveAlias) {
        // TODO: ever the case?!
        console.warn('stumbled over a space with empty drive alias...', space)
        return
      }
      if (!unref(options.driveAliasAndItem).startsWith(space.driveAlias)) {
        return
      }
      if (!matchingSpace || space.driveAlias.length > matchingSpace.driveAlias.length) {
        matchingSpace = space
      }
    })
    return matchingSpace
  })
  const item = computed(() => {
    if (!unref(space)) {
      return unref(options.driveAliasAndItem)
    }
    return unref(options.driveAliasAndItem).slice(unref(space).driveAlias.length)
  })
  return {
    areSpacesLoading,
    space,
    item
  }
}
