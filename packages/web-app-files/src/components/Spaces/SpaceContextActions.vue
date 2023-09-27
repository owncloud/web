<template>
  <div>
    <context-action-menu :menu-sections="menuSections" :action-options="_actionOptions" />
    <quota-modal
      v-if="quotaModalIsOpen"
      :cancel="closeQuotaModal"
      :spaces="_actionOptions.resources"
      :max-quota="maxQuota"
    />
    <readme-content-modal
      v-if="readmeContentModalIsOpen"
      :cancel="closeReadmeContentModal"
      :space="_actionOptions.resources[0]"
    />
    <input
      id="space-image-upload-input"
      ref="spaceImageInput"
      type="file"
      name="file"
      multiple
      tabindex="-1"
      :accept="supportedSpaceImageMimeTypes"
      @change="uploadImageSpace"
    />
  </div>
</template>

<script lang="ts">
import ContextActionMenu from '@ownclouders/web-pkg'
import QuotaModal from '@ownclouders/web-pkg'
import ReadmeContentModal from '@ownclouders/web-pkg'

import { useFileActionsShowDetails } from '@ownclouders/web-pkg'
import { useSpaceActionsUploadImage } from 'web-app-files/src/composables'
import {
  useSpaceActionsDelete,
  useSpaceActionsDisable,
  useSpaceActionsEditDescription,
  useSpaceActionsEditQuota,
  useSpaceActionsEditReadmeContent,
  useSpaceActionsRename,
  useSpaceActionsRestore,
  useSpaceActionsShowMembers
} from '@ownclouders/web-pkg'
import { isLocationSpacesActive } from '@ownclouders/web-pkg'
import { computed, defineComponent, PropType, Ref, ref, toRef, unref, VNodeRef } from 'vue'
import {
  useCapabilitySpacesMaxQuota,
  useRouter,
  useStore,
  usePreviewService
} from '@ownclouders/web-pkg'
import { FileActionOptions, SpaceActionOptions } from '@ownclouders/web-pkg'
import { useFileActionsDownloadArchive } from '@ownclouders/web-pkg'

export default defineComponent({
  name: 'SpaceContextActions',
  components: { ContextActionMenu, QuotaModal, ReadmeContentModal },

  props: {
    actionOptions: {
      type: Object as PropType<SpaceActionOptions>,
      required: true
    }
  },
  setup(props) {
    const router = useRouter()
    const store = useStore()
    const previewService = usePreviewService()

    const actionOptions = toRef(props, 'actionOptions') as Ref<SpaceActionOptions>

    const supportedSpaceImageMimeTypes = computed(() => {
      return previewService.getSupportedMimeTypes('image/').join(',')
    })

    const { actions: deleteActions } = useSpaceActionsDelete({ store })
    const { actions: disableActions } = useSpaceActionsDisable({ store })
    const {
      actions: editQuotaActions,
      modalOpen: quotaModalIsOpen,
      closeModal: closeQuotaModal
    } = useSpaceActionsEditQuota({ store })
    const { actions: editDescriptionActions } = useSpaceActionsEditDescription({ store })
    const {
      actions: editReadmeContentActions,
      modalOpen: readmeContentModalIsOpen,
      closeModal: closeReadmeContentModal
    } = useSpaceActionsEditReadmeContent({ store })
    const { actions: renameActions } = useSpaceActionsRename({ store })
    const { actions: restoreActions } = useSpaceActionsRestore({ store })
    const { actions: showDetailsActions } = useFileActionsShowDetails({ store })
    const { actions: showMembersActions } = useSpaceActionsShowMembers({ store })
    const { actions: downloadArchiveActions } = useFileActionsDownloadArchive({ store })

    const spaceImageInput: VNodeRef = ref(null)
    const { actions: uploadImageActions, uploadImageSpace } = useSpaceActionsUploadImage({
      store,
      spaceImageInput
    })

    const menuItemsMembers = computed(() => {
      const fileHandlers = [...unref(showMembersActions), ...unref(downloadArchiveActions)]
      // HACK: downloadArchiveActions requires FileActionOptions but we have SpaceActionOptions
      return [...fileHandlers].filter((item) => item.isEnabled(unref(actionOptions) as any))
    })

    const menuItemsPrimaryActions = computed(() => {
      const fileHandlers = [
        ...unref(renameActions),
        ...unref(editDescriptionActions),
        ...unref(uploadImageActions)
      ]

      if (isLocationSpacesActive(router, 'files-spaces-generic')) {
        fileHandlers.splice(2, 0, ...unref(editReadmeContentActions))
      }
      return [...fileHandlers].filter((item) => item.isEnabled(unref(actionOptions)))
    })

    const menuItemsSecondaryActions = computed(() => {
      const fileHandlers = [
        ...unref(editQuotaActions),
        ...unref(disableActions),
        ...unref(restoreActions),
        ...unref(deleteActions)
      ]

      return [...fileHandlers].filter((item) => item.isEnabled(unref(actionOptions)))
    })

    const menuItemsSidebar = computed(() => {
      const fileHandlers = [...unref(showDetailsActions)]
      return [...fileHandlers].filter((item) =>
        // HACK: showDetails provides FileAction[] but we have SpaceActionOptions, so we need to cast them to FileActionOptions
        item.isEnabled(unref(actionOptions) as unknown as FileActionOptions)
      )
    })

    const menuSections = computed(() => {
      const sections = []
      if (unref(menuItemsMembers).length) {
        sections.push({
          name: 'members',
          items: unref(menuItemsMembers)
        })
      }
      if (unref(menuItemsPrimaryActions).length) {
        sections.push({
          name: 'primaryActions',
          items: unref(menuItemsPrimaryActions)
        })
      }
      if (unref(menuItemsSecondaryActions).length) {
        sections.push({
          name: 'secondaryActions',
          items: unref(menuItemsSecondaryActions)
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
      _actionOptions: actionOptions,
      menuSections,
      maxQuota: useCapabilitySpacesMaxQuota(),
      spaceImageInput,
      uploadImageActions,
      uploadImageSpace,

      supportedSpaceImageMimeTypes,

      readmeContentModalIsOpen,
      closeReadmeContentModal,

      quotaModalIsOpen,
      closeQuotaModal
    }
  }
})
</script>

<style lang="scss">
#space-image-upload-input {
  position: absolute;
  left: -99999px;
}
</style>
