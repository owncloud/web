import { Route } from 'vue-router'
import { computed, unref } from '@vue/composition-api'
import { MaybeRef } from '../../utils'

interface PublicLinkTokenOptions {
  currentRoute: MaybeRef<Route>
}

export const usePublicLinkToken = ({ currentRoute }: PublicLinkTokenOptions) => {
  return computed(() => {
    return (unref(currentRoute).params.item || unref(currentRoute).params.filePath || '').split(
      '/'
    )[1]
  })
}
