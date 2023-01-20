import { watch, Ref, unref } from 'vue'
import { useStore } from '../store'
import { Store } from 'vuex'
import { useEventBus } from '../eventBus'
import { EventBus } from '../../services'

interface DocumentTitleOptions {
  titleSegments: Ref<string[]>
  store?: Store<any>
  eventBus?: EventBus
}

export function useDocumentTitle({ titleSegments, store, eventBus }: DocumentTitleOptions): void {
  store = store || useStore()
  eventBus = eventBus || useEventBus()

  watch(
    titleSegments,
    (newTitleSegments) => {
      const titleSegments = unref(newTitleSegments)

      const glue = ' - '
      const generalName = store.getters['configuration'].currentTheme.general.name
      const payload = {
        shortDocumentTitle: titleSegments.join(glue),
        fullDocumentTitle: [...titleSegments, generalName].join(glue)
      }

      eventBus.publish('runtime.documentTitle.changed', payload)
    },
    { immediate: true, deep: true }
  )
}
