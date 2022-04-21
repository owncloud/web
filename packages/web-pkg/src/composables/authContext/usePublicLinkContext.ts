import { Route } from 'vue-router'
import { computed, unref } from '@vue/composition-api'
import { contextRouteNameKey } from '../appDefaults/useAppNavigation'
import { MaybeRef } from '../../utils'
import { useRoute } from '../router'

interface PublicLinkTokenOptions {
  currentRoute?: MaybeRef<Route>
}

export const usePublicLinkContext = (options: PublicLinkTokenOptions) => {
  const currentRoute = options.currentRoute || useRoute()
  return computed(() => {
    return unref(currentRoute).query[contextRouteNameKey] === 'files-public-files'
  })
}
