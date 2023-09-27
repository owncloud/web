import { computed, Ref } from 'vue'
import { Share } from 'web-client/src/helpers/share'
import { useStore } from '@ownclouders/web-pkg'

export function useShares() {
  const store = useStore()
  const outgoingLinks: Ref<Share[]> = computed(() => store.getters['Files/outgoingLinks'])
  const outgoingCollaborators: Ref<Share[]> = computed(() =>
    store.getters['Files/outgoingCollaborators'].filter((s) => s.collaborator.displayName)
  )
  return { outgoingCollaborators, outgoingLinks }
}
