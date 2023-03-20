<template>
  <div>
    <context-action-menu :menu-sections="menuSections" :action-options="_actionOptions" />
    <quota-modal
      v-if="quotaModalIsOpen"
      :cancel="closeQuotaModal"
      :spaces="quotaModalSelectedSpaces"
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
import ContextActionMenu from 'web-pkg/src/components/ContextActions/ContextActionMenu.vue'
import QuotaModal from 'web-pkg/src/components/Spaces/QuotaModal.vue'
import ReadmeContentModal from 'web-pkg/src/components/Spaces/ReadmeContentModal.vue'

import Delete from 'web-pkg/src/mixins/spaces/delete'
import Rename from 'web-pkg/src/mixins/spaces/rename'
import Restore from 'web-pkg/src/mixins/spaces/restore'
import { useFileActionsShowDetails } from '../../composables/actions/files/useFileActionsShowDetails'
import EditDescription from 'web-pkg/src/mixins/spaces/editDescription'
import EditQuota from 'web-pkg/src/mixins/spaces/editQuota'
import Disable from 'web-pkg/src/mixins/spaces/disable'
import ShowMembers from 'web-pkg/src/mixins/spaces/showMembers'
import { useSpaceActionsUploadImage } from '../../composables/actions/spaces/useSpaceActionsUploadImage'
import EditReadmeContent from 'web-pkg/src/mixins/spaces/editReadmeContent'
import { isLocationSpacesActive } from '../../router'
import {
  computed,
  defineComponent,
  getCurrentInstance,
  PropType,
  Ref,
  ref,
  toRef,
  unref,
  VNodeRef
} from 'vue'
import { thumbnailService } from 'web-app-files/src/services'
import { useCapabilitySpacesMaxQuota, useRouter, useStore } from 'web-pkg/src/composables'
import { FileActionOptions, SpaceActionOptions } from 'web-pkg/src/composables/actions'

export default defineComponent({
  name: 'SpaceContextActions',
  components: { ContextActionMenu, QuotaModal, ReadmeContentModal },
  mixins: [
    Rename,
    Delete,
    EditDescription,
    EditQuota,
    Disable,
    ShowMembers,
    Restore,
    EditReadmeContent
  ],

  props: {
    actionOptions: {
      type: Object as PropType<SpaceActionOptions>,
      required: true
    }
  },
  setup(props) {
    const instance = getCurrentInstance().proxy as any
    const router = useRouter()
    const store = useStore()

    const actionOptions = toRef(props, 'actionOptions') as Ref<SpaceActionOptions>

    const { actions: showDetailsItems } = useFileActionsShowDetails({ store })

    const spaceImageInput: VNodeRef = ref(null)
    const { actions: uploadImageActions, uploadImageSpace } = useSpaceActionsUploadImage({
      store,
      spaceImageInput
    })

    const menuItemsMembers = computed(() => {
      const fileHandlers = [...instance.$_showMembers_items]
      return [...fileHandlers].filter((item) => item.isEnabled(unref(actionOptions)))
    })

    const menuItemsPrimaryActions = computed(() => {
      const fileHandlers = [
        ...instance.$_rename_items,
        ...instance.$_editDescription_items,
        ...unref(uploadImageActions)
      ]

      if (isLocationSpacesActive(router, 'files-spaces-generic')) {
        fileHandlers.splice(2, 0, ...instance.$_editReadmeContent_items)
      }
      return [...fileHandlers].filter((item) => item.isEnabled(unref(actionOptions)))
    })

    const menuItemsSecondaryActions = computed(() => {
      const fileHandlers = [
        ...instance.$_editQuota_items,
        ...instance.$_disable_items,
        ...instance.$_restore_items,
        ...instance.$_delete_items
      ]

      return [...fileHandlers].filter((item) => item.isEnabled(unref(actionOptions)))
    })

    const menuItemsSidebar = computed(() => {
      const fileHandlers = [...unref(showDetailsItems)]
      return [...fileHandlers].filter((item) =>
        // HACK: showDetails provides FileAction[] but we have SpaceAtionOptions, so we need to cast them to FileActionOptions
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
      uploadImageSpace
    }
  },
  computed: {
    quotaModalSelectedSpaces() {
      return [this.$data.$_editQuota_selectedSpace]
    },
    quotaModalIsOpen() {
      return this.$data.$_editQuota_modalOpen
    },
    readmeContentModalIsOpen() {
      return this.$data.$_editReadmeContent_modalOpen
    },
    supportedSpaceImageMimeTypes() {
      return thumbnailService.getSupportedMimeTypes('image/').join(',')
    }
  },
  methods: {
    closeQuotaModal() {
      this.$_editQuota_closeModal()
    },
    closeReadmeContentModal() {
      this.$_editReadmeContent_closeModal()
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
