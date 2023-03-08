<template>
  <context-action-menu :menu-sections="menuSections" :items="items" :space="space" />
</template>

<script lang="ts">
import ContextActionMenu from 'web-pkg/src/components/ContextActions/ContextActionMenu.vue'

import { useFileActions } from '../../mixins/fileActions'

import { useStore } from 'web-pkg/src/composables'
import { computed, defineComponent, getCurrentInstance, PropType, unref } from 'vue'
import { Resource } from 'web-client'
import { SpaceResource } from 'web-client/src/helpers'

import { useSetImage } from '../../mixins/spaces/actions/setImage'
import { useSetReadme } from 'web-pkg/src/mixins/spaces/setReadme'

import {
  useCreateQuickLink,
  usePaste,
  useShowDetails,
  useShowShares,
  useAcceptShare,
  useCopy,
  useDeclineShare,
  useDelete,
  useDownloadArchive,
  useEmptyTrashBin,
  useMove,
  useRestore,
  useDownloadFile,
  useRename,
  useShowEditTags,
  useNavigate,
  useFavorite
} from '../../mixins/actions'

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
    const { actions: setSpaceImageActions } = useSetImage({ store })
    const { actions: setSpaceReadmeActions } = useSetReadme({ store })
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
