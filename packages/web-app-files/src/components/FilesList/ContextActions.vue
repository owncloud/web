<template>
  <context-action-menu :menu-sections="menuSections" :items="items" :space="space" />
</template>

<script lang="ts">
import ContextActionMenu from 'web-pkg/src/components/ContextActions/ContextActionMenu.vue'

import { useFileActions } from '../../mixins/fileActions'
import { useCreateQuickLink } from '../../mixins/actions/createQuicklink'

import { usePaste } from '../../mixins/actions/paste'
import { useShowDetails } from '../../mixins/actions/showDetails'
import { useShowShares } from '../../mixins/actions/showShares'
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
import { useDownloadFile } from 'web-app-files/src/mixins/actions/downloadFile'
import { useRename } from 'web-app-files/src/mixins/actions/rename'
import { useShowEditTags } from 'web-app-files/src/mixins/actions/showEditTags'
import { useNavigate } from 'web-app-files/src/mixins/actions/navigate'
import { useFavorite } from 'web-app-files/src/mixins/actions/favorite'

export default {
  name: 'ContextActions',
  components: { ContextActionMenu },
  mixins: [SetSpaceImage, SetSpaceReadme],
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

    const { editorActions, loadExternalAppActions } = useFileActions()

    const { actions: acceptShareActions } = useAcceptShare({ store })
    const { actions: copyActions } = useCopy({ store })
    const { actions: createQuickLinkActions } = useCreateQuickLink({ store })
    const { actions: declineShareActions } = useDeclineShare({ store })
    const { actions: deleteActions } = useDelete({ store })
    const { actions: downloadArchiveActions } = useDownloadArchive({ store })
    const { actions: downloadFileActions } = useDownloadFile()
    const { actions: favoriteActions } = useFavorite({ store })
    const { actions: emptyTrashBinActions } = useEmptyTrashBin({ store })
    const { actions: moveActions } = useMove({ store })
    const { actions: navigateActions } = useNavigate({ store })
    const { actions: pasteActions } = usePaste({ store })
    const { actions: renameActions } = useRename({ store })
    const { actions: restoreActions } = useRestore({ store })
    const { actions: showDetailsActions } = useShowDetails({ store })
    const { actions: showEditTagsActions } = useShowEditTags()
    const { actions: showSharesActions } = useShowShares()

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
      return [...unref(showSharesActions), ...unref(createQuickLinkActions)].filter((item) =>
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
        ...unref(downloadFileActions),
        ...unref(moveActions),
        ...unref(pasteActions),
        ...unref(renameActions),
        ...unref(restoreActions),
        ...instance.$_setSpaceImage_items,
        ...instance.$_setSpaceReadme_items,
        ...unref(showEditTagsActions)
      ].filter((item) => item.isEnabled(unref(filterParams)))
    })

    const menuItemsSidebar = computed(() => {
      const fileHandlers = [...unref(navigateActions)]

      return [
        ...unref(favoriteActions).map((action) => {
          action.keepOpen = true
          return action
        }),
        ...fileHandlers,
        ...unref(showDetailsActions)
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
          items: [...unref(showDetailsActions)]
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
