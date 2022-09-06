import { buildShare } from '../../helpers/resources'
import { useStore } from 'web-pkg/src/composables'
import { useActiveLocation } from '../router'
import { isLocationSharesActive } from '../../router'
import { computed, ref, unref } from '@vue/composition-api'
import { useTask } from 'vue-concurrency'
import { clientService } from 'web-pkg/src/services'

export function useIncomingParentShare() {
  const store = useStore()
  const incomingParentShare = ref(null)
  const sharesTree = computed(() => store.state.Files.sharesTree)
  const isSharedWithMeLocation = useActiveLocation(isLocationSharesActive, 'files-shares-with-me')

  const loadIncomingParentShare = useTask(function* (signal, resource) {
    console.log('resource', resource)
    let parentShare
    for (const shares of Object.values(unref(sharesTree)) as any) {
      parentShare = shares.find((s) => s.incoming)
      if (parentShare) {
        console.log('via incoming:', parentShare)
        incomingParentShare.value = parentShare
        return
      }
    }

    if (unref(isSharedWithMeLocation)) {
      incomingParentShare.value = resource.share
      console.log('via share obj', incomingParentShare.value)
      return
    }

    if (resource.shareId) {
      const parentShare = yield clientService.owncloudSdk.shares.getShare(resource.shareId)
      if (parentShare) {
        incomingParentShare.value = buildShare(parentShare.shareInfo, resource, true)
        console.log('via share id', incomingParentShare.value)
        return
      }
    }

    console.log('No parent share')
    incomingParentShare.value = null
  })

  return { loadIncomingParentShare, incomingParentShare }
}
