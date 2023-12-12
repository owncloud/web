<template>
  <context-action-menu :menu-sections="menuSections" :action-options="_actionOptions" />
</template>

<script lang="ts">
import ContextActionMenu from '../ContextActions/ContextActionMenu.vue'

import {
  useFileActionsOpenShortcut,
  ActionExtension,
  useExtensionRegistry,
  useFileActionsToggleHideShare,
  useStore
} from '../../composables'
import { computed, defineComponent, PropType, Ref, toRef, unref } from 'vue'

import {
  useFileActionsCopyQuickLink,
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
    const store = useStore()

    const { editorActions, loadExternalAppActions } = useFileActions()

    const { actions: acceptShareActions } = useFileActionsAcceptShare({ store })
    const { actions: hideShareActions } = useFileActionsToggleHideShare({ store })
    const { actions: copyActions } = useFileActionsCopy({ store })
    const { actions: createQuickLinkActions } = useFileActionsCopyQuickLink({ store })
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
    const { actions: setSpaceReadmeActions } = useFileActionsSetReadme({ store })
    const { actions: showDetailsActions } = useFileActionsShowDetails({ store })
    const { actions: createSpaceFromResourceActions } = useFileActionsCreateSpaceFromResource({
      store
    })
    const { actions: showSharesActions } = useFileActionsShowShares({ store })
    const { actions: openShortcutActions } = useFileActionsOpenShortcut({ store })

    const extensionRegistry = useExtensionRegistry()
    const extensionContextActions = computed(() => {
      return extensionRegistry
        .requestExtensions<ActionExtension>('action', ['resource.context-menu'])
        .map((e) => e.action)
    })

    // type cast to make vue-tsc aware of the type
    const actionOptions = toRef(props, 'actionOptions') as Ref<FileActionOptions>
    const menuItemsBatchActions = computed(() =>
      [
        ...unref(acceptShareActions),
        ...unref(declineShareActions),
        ...unref(downloadArchiveActions),
        ...unref(moveActions),
        ...unref(copyActions),
        ...unref(emptyTrashBinActions),
        ...unref(deleteActions),
        ...unref(restoreActions),
        ...unref(createSpaceFromResourceActions)
      ].filter((item) => item.isEnabled(unref(actionOptions)))
    )

    const menuItemsContext = computed(() => {
      const fileHandlers = [
        ...unref(openShortcutActions),
        ...unref(editorActions),
        ...loadExternalAppActions(unref(actionOptions))
      ]

      return [...fileHandlers]
        .filter((item) => item.isEnabled(unref(actionOptions)))
        .sort((x, y) => Number(y.hasPriority) - Number(x.hasPriority))
    })

    const menuItemsShare = computed(() => {
      return [...unref(showSharesActions), ...unref(createQuickLinkActions)].filter((item) =>
        item.isEnabled(unref(actionOptions))
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
        ...unref(acceptShareActions),
        ...unref(declineShareActions),
        ...unref(hideShareActions),
        ...unref(setSpaceImageActions),
        ...unref(setSpaceReadmeActions),
        ...unref(extensionContextActions)
      ].filter((item) => item.isEnabled(unref(actionOptions)))
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
      ].filter((item) => item.isEnabled(unref(actionOptions)))
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
