<template>
  <context-action-menu :menu-sections="menuSections" :items="items" :space="space" />
</template>

<script lang="ts">
import ContextActionMenu from 'web-pkg/src/components/ContextActions/ContextActionMenu.vue'

import { useFileActions } from '../../mixins/fileActions'
import CreateQuicklink from '../../mixins/actions/createQuicklink'

import Paste from '../../mixins/actions/paste'
import ShowActions from '../../mixins/actions/showActions'
import { useShowDetails } from '../../mixins/actions/showDetails'
import ShowShares from '../../mixins/actions/showShares'
import SetSpaceImage from '../../mixins/spaces/actions/setImage'
import SetSpaceReadme from 'web-pkg/src/mixins/spaces/setReadme'
import { computed, getCurrentInstance, PropType, unref } from 'vue'
import { Resource } from 'web-client'
import { SpaceResource } from 'web-client/src/helpers'
import { useAcceptShare } from 'web-app-files/src/mixins/actions/acceptShare'
import { useCopy } from 'web-app-files/src/mixins/actions/copy'
import { useDeclineShare } from 'web-app-files/src/mixins/actions/declineShare'
import { useDelete } from 'web-app-files/src/mixins/actions/delete'
import { useDownloadArchive } from 'web-app-files/src/mixins/actions/downloadArchive'
import { useEmptyTrashBin } from '../../mixins/actions/emptyTrashBin'
import { useMove } from 'web-app-files/src/mixins/actions/move'
import { useRestore } from 'web-app-files/src/mixins/actions/restore'
import { useStore } from 'web-pkg/src'

export default {
  name: 'ContextActions',
  components: { ContextActionMenu },
  mixins: [
    CreateQuicklink,
    Paste,
    ShowActions,
    ShowShares,
    SetSpaceImage,
    SetSpaceReadme
  ],

  props: {
    space: {
      type: Object as PropType<SpaceResource>,
      required: true
    },
    items: {
      type: Array as PropType<Resource[]>,
      required: true
    }
  },

  setup(props) {
    const instance = getCurrentInstance().proxy as any
    const store = useStore()

    const { actions: showDetailsItems } = useShowDetails()
    const { editorActions, loadExternalAppActions } = useFileActions()

    const { actions: acceptShareActions } = useAcceptShare({ store })
    const { actions: copyActions } = useCopy({ store })
    const { actions: declineShareActions } = useDeclineShare({ store })
    const { actions: downloadArchiveActions } = useDownloadArchive({ store })
    const { actions: deleteActions } = useDelete({ store })
    const { actions: moveActions } = useMove({ store })
    const { actions: emptyTrashBinActions } = useEmptyTrashBin({ store })
    const { actions: restoreActions } = useRestore({ store })

    const filterParams = computed(() => {
      return {
        space: props.space,
        resources: props.items
      }
    })

    const menuItemsBatchActions = computed(() =>
      [
        ...unref(acceptShareActions),
        ...unref(copyActions),
        ...unref(declineShareActions),
        ...unref(deleteActions),
        ...unref(downloadArchiveActions),
        ...unref(emptyTrashBinActions),
        ...unref(moveActions),
        ...unref(restoreActions)
      ].filter((item) => item.isEnabled(unref(filterParams)))
    )

    const menuItemsContext = computed(() => {
      const fileHandlers = [...unref(editorActions), ...loadExternalAppActions(unref(filterParams))]

      return [...fileHandlers]
        .filter((item) => item.isEnabled(unref(filterParams)))
        .sort((x, y) => Number(y.canBeDefault) - Number(x.canBeDefault))
    })

    const menuItemsShare = computed(() => {
      return [...instance.$_showShares_items, ...instance.$_createQuicklink_items].filter((item) =>
        item.isEnabled(unref(filterParams))
      )
    })

    const menuItemsActions = computed(() => {
      return [
        ...unref(acceptShareActions),
        ...unref(declineShareActions),
        ...unref(copyActions),
        ...unref(deleteActions),
        ...unref(downloadArchiveActions),
        // ...instance.$_downloadFile_items,
        ...unref(moveActions),
        // ...instance.$_paste_items,
        // ...instance.$_rename_items,
        ...unref(restoreActions)
        // ...instance.$_setSpaceImage_items,
        // ...instance.$_setSpaceReadme_items,
        // ...instance.$_showEditTags_items
      ].filter((item) => item.isEnabled(unref(filterParams)))
    })

    const menuItemsSidebar = computed(() => {
      const fileHandlers = [
        // ...instance.$_navigate_items
      ]

      return [
        // ...instance.$_favorite_items.map((action) => {
        //   action.keepOpen = true
        //   return action
        // }),
        ...fileHandlers,
        ...unref(showDetailsItems)
      ].filter((item) => item.isEnabled(unref(filterParams)))
    })

    const menuSections = computed(() => {
      const sections = []
      if (props.items.length > 1) {
        if (unref(menuItemsBatchActions).length) {
          sections.push({
            name: 'batch-actions',
            items: [...unref(menuItemsBatchActions)]
          })
        }
        sections.push({
          name: 'batch-details',
          items: [...unref(showDetailsItems)]
        })
        return sections
      }

      if (unref(menuItemsContext).length) {
        sections.push({
          name: 'context',
          items: unref(menuItemsContext)
        })
      }
      if (unref(menuItemsShare).length) {
        sections.push({
          name: 'share',
          items: unref(menuItemsShare)
        })
      }
      if (unref(menuItemsActions).length) {
        sections.push({
          name: 'actions',
          items: unref(menuItemsActions)
        })
      }
      if (unref(menuItemsSidebar).length) {
        sections.push({
          name: 'sidebar',
          items: unref(menuItemsSidebar)
        })
      }
      return sections
    })

    return {
      menuSections
    }
  }
}
</script>
