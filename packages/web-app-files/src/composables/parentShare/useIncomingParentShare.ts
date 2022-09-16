import { buildShare } from '../../helpers/resources'
import { useStore } from 'web-pkg/src/composables'
import { computed, ref, unref } from '@vue/composition-api'
import { useTask } from 'vue-concurrency'
import { clientService } from 'web-pkg/src/services'

export function useIncomingParentShare() {
  const store = useStore()
  const incomingParentShare = ref(null)
  const sharesTree = computed(() => store.getters['Files/sharesTree'])

  const loadIncomingParentShare = useTask(function* (signal, resource) {
    let parentShare
    for (const shares of Object.values(unref(sharesTree)) as any) {
      parentShare = shares.find((s) => s.incoming)
      if (parentShare) {
        incomingParentShare.value = parentShare
        return
      }
    }

    if (resource.shareId) {
      parentShare = yield clientService.owncloudSdk.shares.getShare(resource.shareId)
      if (parentShare) {
        incomingParentShare.value = buildShare(parentShare.shareInfo, resource, true)
        return
      }
    }

    incomingParentShare.value = null
  })

  return { loadIncomingParentShare, incomingParentShare }
}
