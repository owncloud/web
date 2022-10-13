import { watch, Ref, unref } from '@vue/composition-api'
import { useStore } from '../store'
import { Store } from 'vuex'

interface DocumentTitleOptions {
  document: Document
  titleSegments: Ref<string[]>
  store?: Store<any>
}

export function useDocumentTitle({ document, titleSegments, store }: DocumentTitleOptions): void {
  store = store || useStore()

  watch(
    titleSegments,
    (newTitleSegments) => {
      const titleSegments = unref(newTitleSegments)

      // TODO: announce navigation

      titleSegments.push(store.getters['configuration'].currentTheme.general.name)
      document.title = titleSegments.join(' - ')
    },
    { immediate: true }
  )
}
