import { watch, Ref, unref } from 'vue'
import { useEventBus } from '../eventBus'
import { useThemeStore } from '../piniaStores'
import { EventBus } from '../../services'

interface DocumentTitleOptions {
  titleSegments: Ref<string[]>
  eventBus?: EventBus
}

export function useDocumentTitle({ titleSegments, eventBus }: DocumentTitleOptions): void {
  const { currentTheme } = useThemeStore()

  eventBus = eventBus || useEventBus()

  watch(
    titleSegments,
    (newTitleSegments) => {
      const titleSegments = unref(newTitleSegments)

      const glue = ' - '
      const payload = {
        shortDocumentTitle: titleSegments.join(glue),
        fullDocumentTitle: [...titleSegments, currentTheme.common.name].join(glue)
      }

      eventBus.publish('runtime.documentTitle.changed', payload)
    },
    { immediate: true, deep: true }
  )
}
