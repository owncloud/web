import { Ref, computed, unref } from 'vue'
import { basename } from 'path'
import { FileContext } from './types'
import { useAppMeta } from './useAppMeta'
import { useDocumentTitle } from './useDocumentTitle'
import { Store } from 'vuex'
import { MaybeRef } from '../../utils'
import { Route } from 'vue-router'

interface AppDocumentTitleOptions {
  store: Store<any>
  applicationId: string
  applicationName?: MaybeRef<string>
  currentFileContext: Ref<FileContext>
  currentRoute?: Ref<Route>
}

export function useAppDocumentTitle({
  store,
  applicationId,
  applicationName,
  currentFileContext,
  currentRoute
}: AppDocumentTitleOptions): void {
  const appMeta = useAppMeta({ applicationId, store })

  const titleSegments = computed(() => {
    const baseTitle =
      basename(unref(unref(currentFileContext).fileName)) || unref(currentRoute)?.meta?.title
    const meta = unref(unref(appMeta).applicationMeta)

    return [baseTitle, unref(applicationName) || meta.name || meta.id].filter(Boolean)
  })

  useDocumentTitle({
    titleSegments
  })
}
