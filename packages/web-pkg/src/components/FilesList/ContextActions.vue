<template>
  <context-action-menu :menu-sections="menuSections" :action-options="_actionOptions" />
</template>

<script lang="ts">
import ContextActionMenu from '../ContextActions/ContextActionMenu.vue'

import {
  useFileActionsOpenShortcut,
  ActionExtension,
  useExtensionRegistry,
  useFileActionsToggleHideShare
} from '../../composables'
import { computed, defineComponent, PropType, Ref, toRef, unref } from 'vue'

import {
  useFileActionsCopyQuickLink,
  useFileActionsPaste,
  useFileActionsShowDetails,
  useFileActionsShowShares,
  useFileActionsEnableSync,
  useFileActionsCopy,
  useFileActionsDisableSync,
  useFileActionsDelete,
  useFileActionsDownloadArchive,
  useFileActionsEmptyTrashBin,
  useFileActionsMove,
  useFileActionsRestore,
  useFileActionsDownloadFile,
  useFileActionsRename,
  useFileActionsSetImage,
  useFileActionsNavigate,
  useFileActionsFavorite,
  useFileActionsCreateSpaceFromResource,
  useFileActionsSetReadme,
  useFileActions
} from '../../composables/actions/files'

import { FileActionOptions } from '../../composables/actions'

export default defineComponent({
  name: 'ContextActions',
  components: { ContextActionMenu },
  props: {
    actionOptions: {
      type: Object as PropType<FileActionOptions>,
      required: true
    }
  },
  setup(props) {
    const { editorActions } = useFileActions()

    const { actions: enableSyncActions } = useFileActionsEnableSync()
    const { actions: hideShareActions } = useFileActionsToggleHideShare()
    const { actions: copyActions } = useFileActionsCopy()
    const { actions: createQuickLinkActions } = useFileActionsCopyQuickLink()
    const { actions: disableSyncActions } = useFileActionsDisableSync()
    const { actions: deleteActions } = useFileActionsDelete()
    const { actions: downloadArchiveActions } = useFileActionsDownloadArchive()
    const { actions: downloadFileActions } = useFileActionsDownloadFile()
    const { actions: favoriteActions } = useFileActionsFavorite()
    const { actions: emptyTrashBinActions } = useFileActionsEmptyTrashBin()
    const { actions: moveActions } = useFileActionsMove()
    const { actions: navigateActions } = useFileActionsNavigate()
    const { actions: pasteActions } = useFileActionsPaste()
    const { actions: renameActions } = useFileActionsRename()
    const { actions: restoreActions } = useFileActionsRestore()
    const { actions: setSpaceImageActions } = useFileActionsSetImage()
    const { actions: setSpaceReadmeActions } = useFileActionsSetReadme()
    const { actions: showDetailsActions } = useFileActionsShowDetails()
    const { actions: createSpaceFromResourceActions } = useFileActionsCreateSpaceFromResource()
    const { actions: showSharesActions } = useFileActionsShowShares()
    const { actions: openShortcutActions } = useFileActionsOpenShortcut()

    const extensionRegistry = useExtensionRegistry()
    const extensionContextActions = computed(() => {
      return extensionRegistry
        .requestExtensions<ActionExtension>('action', { scopes: ['resource.context-menu'] })
        .map((e) => e.action)
    })

    // type cast to make vue-tsc aware of the type
    const actionOptions = toRef(props, 'actionOptions') as Ref<FileActionOptions>
    const menuItemsBatchActions = computed(() =>
      [
        ...unref(enableSyncActions),
        ...unref(disableSyncActions),
        ...unref(downloadArchiveActions),
        ...unref(moveActions),
        ...unref(copyActions),
        ...unref(emptyTrashBinActions),
        ...unref(deleteActions),
        ...unref(restoreActions),
        ...unref(createSpaceFromResourceActions)
      ].filter((item) => item.isVisible(unref(actionOptions)))
    )

    const menuItemsContext = computed(() => {
      const fileHandlers = [...unref(openShortcutActions), ...unref(editorActions)]

      return [...fileHandlers]
        .filter((item) => item.isVisible(unref(actionOptions)))
        .sort((x, y) => Number(y.hasPriority) - Number(x.hasPriority))
    })

    const menuItemsShare = computed(() => {
      return [...unref(showSharesActions), ...unref(createQuickLinkActions)].filter((item) =>
        item.isVisible(unref(actionOptions))
      )
    })

    const menuItemsActions = computed(() => {
      return [
        ...unref(downloadArchiveActions),
        ...unref(downloadFileActions),
        ...unref(deleteActions),
        ...unref(moveActions),
        ...unref(copyActions),
        ...unref(pasteActions),
        ...unref(renameActions),
        ...unref(createSpaceFromResourceActions),
        ...unref(restoreActions),
        ...unref(enableSyncActions),
        ...unref(disableSyncActions),
        ...unref(hideShareActions),
        ...unref(setSpaceImageActions),
        ...unref(setSpaceReadmeActions),
        ...unref(extensionContextActions)
      ].filter((item) => item.isVisible(unref(actionOptions)))
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
      ].filter((item) => item.isVisible(unref(actionOptions)))
    })

    const menuSections = computed(() => {
      const sections = []
      if (unref(actionOptions).resources.length > 1) {
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
      menuSections,
      _actionOptions: actionOptions
    }
  }
})
</script>
