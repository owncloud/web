import { watch, Ref } from '@vue/composition-api'

interface DocumentTitleOptions {
  document: Document
  title: Ref<string>
}

export function useDocumentTitle({ document, title }: DocumentTitleOptions): void {
  watch(
    title,
    (newTitle) => {
      document.title = newTitle
    },
    { immediate: true }
  )
}
