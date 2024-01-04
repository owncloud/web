import { Resource } from '@ownclouders/web-client'
import { useAbility } from '../ability'
import {
  useCapabilityFilesSharingApiEnabled,
  useCapabilityFilesSharingResharing
} from '../capability'
import { unref } from 'vue'

export const useCanShare = () => {
  const ability = useAbility()

  const sharingApiEnabled = useCapabilityFilesSharingApiEnabled()
  const resharingEnabled = useCapabilityFilesSharingResharing()

  const canShare = (item: Resource) => {
    if (!unref(sharingApiEnabled)) {
      return false
    }
    if (item.isReceivedShare() && !unref(resharingEnabled)) {
      return false
    }
    return item.canShare({ ability })
  }

  return { canShare }
}
