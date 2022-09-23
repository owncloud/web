import { Ref, computed, unref } from '@vue/composition-api'
import { basename } from 'path'
import { FileContext } from './types'
import { useAppMeta } from './useAppMeta'
import { useDocumentTitle } from './useDocumentTitle'
import { Store } from 'vuex'
import { MaybeRef } from '../../utils'

interface AppDocumentTitleOptions {
  store: Store<any>
  document: Document
  applicationId: string
  applicationName?: MaybeRef<string>
  currentFileContext: Ref<FileContext>
}

export function useAppDocumentTitle({
  store,
  document,
  applicationId,
  applicationName,
  currentFileContext
}: AppDocumentTitleOptions): void {
  const appMeta = useAppMeta({ applicationId, store })

  const title = computed(() => {
    let fileName = basename(unref(unref(currentFileContext).fileName))
    if (fileName === 'undefined') fileName = ''
    const meta = unref(unref(appMeta).applicationMeta)

    return [
      fileName,
      unref(applicationName) || meta.name || meta.id,
      store.getters.configuration.currentTheme.general.name
    ]
      .filter(Boolean)
      .join(' - ')
  })

  useDocumentTitle({
    document,
    title
  })
}
