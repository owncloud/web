import { Ref, computed, unref } from 'vue'
import { basename } from 'path'
import { FileContext } from './types'
import { useAppMeta } from './useAppMeta'
import { useDocumentTitle } from './useDocumentTitle'
import { Store } from 'vuex'
import { RouteLocationNormalizedLoaded } from 'vue-router'
import { MaybeRef, useTranslations } from 'web-pkg'

interface AppDocumentTitleOptions {
  store: Store<any>
  applicationId: string
  applicationName?: MaybeRef<string>
  currentFileContext: Ref<FileContext>
  currentRoute?: Ref<RouteLocationNormalizedLoaded>
}

export function useAppDocumentTitle({
  store,
  applicationId,
  applicationName,
  currentFileContext,
  currentRoute
}: AppDocumentTitleOptions): void {
  const appMeta = useAppMeta({ applicationId, store })
  const { $gettext } = useTranslations()

  const titleSegments = computed(() => {
    const baseTitle =
      basename(unref(unref(currentFileContext).fileName)) ||
      $gettext(unref(currentRoute)?.meta?.title as string)
    const meta = unref(unref(appMeta).applicationMeta)

    return [baseTitle, unref(applicationName) || meta.name || meta.id].filter(Boolean)
  })

  useDocumentTitle({
    titleSegments
  })
}
