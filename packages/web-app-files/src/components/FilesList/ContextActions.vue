<template>
  <context-action-menu :menu-sections="menuSections" :items="items" :space="space" />
</template>

<script lang="ts">
import ContextActionMenu from 'web-pkg/src/components/ContextActions/ContextActionMenu.vue'

import { useFileActions } from '../../composables/actions/files/useFileActions'

import { useStore } from 'web-pkg/src/composables'
import { computed, defineComponent, PropType, unref } from 'vue'
import { Resource } from 'web-client'
import { SpaceResource } from 'web-client/src/helpers'

import { useFileActionsSetImage } from '../../composables/actions/spaces/useSpaceActionsSetImage'
import { useSetReadme } from 'web-pkg/src/composables/actions/spaces/setReadme'

import {
  useFileActionsCreateQuickLink,
  useFileActionsPaste,
  useFileActionsShowDetails,
  useFileActionsShowShares,
  useFileActionsAcceptShare,
  useFileActionsCopy,
  useFileActionsDeclineShare,
  useFileActionsDelete,
  useFileActionsDownloadArchive,
  useFileActionsEmptyTrashBin,
  useFileActionsMove,
  useFileActionsRestore,
  useFileActionsDownloadFile,
  useFileActionsRename,
  useFileActionsShowEditTags,
  useFileActionsNavigate,
  useFileActionsFavorite
} from '../../composables/actions/files'

export default defineComponent({
  name: 'ContextActions',
  components: { ContextActionMenu },
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
    const store = useStore()

    const { editorActions, loadExternalAppActions } = useFileActions()

    const { actions: acceptShareActions } = useFileActionsAcceptShare({ store })
    const { actions: copyActions } = useFileActionsCopy({ store })
    const { actions: createQuickLinkActions } = useFileActionsCreateQuickLink({ store })
    const { actions: declineShareActions } = useFileActionsDeclineShare({ store })
    const { actions: deleteActions } = useFileActionsDelete({ store })
    const { actions: downloadArchiveActions } = useFileActionsDownloadArchive({ store })
    const { actions: downloadFileActions } = useFileActionsDownloadFile()
    const { actions: favoriteActions } = useFileActionsFavorite({ store })
    const { actions: emptyTrashBinActions } = useFileActionsEmptyTrashBin({ store })
    const { actions: moveActions } = useFileActionsMove({ store })
    const { actions: navigateActions } = useFileActionsNavigate({ store })
    const { actions: pasteActions } = useFileActionsPaste({ store })
    const { actions: renameActions } = useFileActionsRename({ store })
    const { actions: restoreActions } = useFileActionsRestore({ store })
    const { actions: setSpaceImageActions } = useFileActionsSetImage({ store })
    const { actions: setSpaceReadmeActions } = useSetReadme({ store })
    const { actions: showDetailsActions } = useFileActionsShowDetails({ store })
    const { actions: showEditTagsActions } = useFileActionsShowEditTags({ store })
    const { actions: showSharesActions } = useFileActionsShowShares({ store })

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
        ...unref(setSpaceImageActions),
        ...unref(setSpaceReadmeActions),
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
})
</script>
