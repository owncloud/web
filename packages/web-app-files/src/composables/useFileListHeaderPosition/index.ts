import { ref, nextTick, onMounted, Ref, watch } from '@vue/composition-api'
import { useStore } from '../store'

export const useFileListHeaderPosition = (): { y: Ref; refresh: () => void } => {
  const store = useStore()
  const y = ref(0)
  const refresh = async (): Promise<void> => {
    await nextTick()
    const appBar = document.querySelector('#files-app-bar')
    const height = appBar ? appBar.getBoundingClientRect().height : 0

    if (y.value === height) {
      return
    }

    y.value = height
  }

  // vue 3 (also 2 with composition api bridge) has no created hook (uses setup instead), so call it here
  window.onresize = refresh
  onMounted(refresh)
  watch(() => store.getters['Files/inProgress'].length > 0, refresh)

  return { y, refresh }
}
