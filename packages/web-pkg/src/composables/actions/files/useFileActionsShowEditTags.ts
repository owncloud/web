import { Store } from 'vuex'
import { eventBus } from '../../../services'
import { useCapabilityFilesTags } from '../../capability'
import { useIsFilesAppActive } from '../helpers'
import { useRouter } from '../../router'
import { useStore } from '../../store'
import { SideBarEventTopics } from '../../sideBar'
import { computed } from 'vue'
import { FileAction, FileActionOptions } from '../types'
import { useGettext } from 'vue3-gettext'

export const useFileActionsShowEditTags = ({ store }: { store?: Store<any> } = {}) => {
  store = store || useStore()
  const router = useRouter()
  const { $gettext } = useGettext()
  const isFilesAppActive = useIsFilesAppActive()
  const hasTags = useCapabilityFilesTags()

  const handler = ({ resources }: FileActionOptions) => {
    store.commit('Files/SET_FILE_SELECTION', resources)
    eventBus.publish(SideBarEventTopics.openWithPanel, 'tags')
  }

  const actions = computed((): FileAction[] => [])

  return {
    actions
  }
}
