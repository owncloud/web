<template>
  <div>
    <context-action-menu :menu-sections="menuSections" :items="items" :space="space" />
    <quota-modal
      v-if="quotaModalIsOpen"
      :cancel="closeQuotaModal"
      :space="quotaModalSelectedSpace"
    />
    <readme-content-modal
      v-if="readmeContentModalIsOpen"
      :cancel="closeReadmeContentModal"
      :space="items[0]"
    />
    <input
      id="space-image-upload-input"
      ref="spaceImageInput"
      type="file"
      name="file"
      multiple
      tabindex="-1"
      accept="image/*"
      @change="$_uploadImage_uploadImageSpace"
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
import ShowDetails from '../../mixins/actions/showDetails'
import EditDescription from 'web-pkg/src/mixins/spaces/editDescription'
import EditQuota from 'web-pkg/src/mixins/spaces/editQuota'
import DeletedFiles from 'web-pkg/src/mixins/spaces/deletedFiles'
import Disable from 'web-pkg/src/mixins/spaces/disable'
import ShowMembers from 'web-pkg/src/mixins/spaces/showMembers'
import UploadImage from '../../mixins/spaces/actions/uploadImage'
import EditReadmeContent from 'web-pkg/src/mixins/spaces/editReadmeContent'
import { isLocationSpacesActive } from '../../router'
import { defineComponent, PropType } from 'vue'
import { SpaceResource } from 'web-client/src/helpers'

export default defineComponent({
  name: 'SpaceContextActions',
  components: { ContextActionMenu, QuotaModal, ReadmeContentModal },
  mixins: [
    Rename,
    Delete,
    EditDescription,
    EditQuota,
    DeletedFiles,
    Disable,
    ShowDetails,
    ShowMembers,
    Restore,
    UploadImage,
    EditReadmeContent
  ],

  props: {
    space: {
      type: Object as PropType<SpaceResource>,
      required: true
    },
    items: {
      type: Array,
      required: true
    }
  },

  computed: {
    quotaModalSelectedSpace() {
      return this.$data.$_editQuota_selectedSpace
    },
    quotaModalIsOpen() {
      return this.$data.$_editQuota_modalOpen
    },
    readmeContentModalIsOpen() {
      return this.$data.$_editReadmeContent_modalOpen
    },
    menuSections() {
      const sections = []

      if (this.menuItemsMembers.length) {
        sections.push({
          name: 'members',
          items: this.menuItemsMembers
        })
      }
      if (this.menuItemsPrimaryActions.length) {
        sections.push({
          name: 'primaryActions',
          items: this.menuItemsPrimaryActions
        })
      }
      if (this.menuItemsSecondaryActions.length) {
        sections.push({
          name: 'secondaryActions',
          items: this.menuItemsSecondaryActions
        })
      }
      if (this.menuItemsTrashBin.length) {
        sections.push({
          name: 'trashBin',
          items: this.menuItemsTrashBin
        })
      }
      if (this.menuItemsSidebar.length) {
        sections.push({
          name: 'sidebar',
          items: this.menuItemsSidebar
        })
      }

      return sections
    },

    filterParams() {
      return {
        resources: this.items
      }
    },

    menuItemsMembers() {
      const fileHandlers = [...this.$_showMembers_items]
      return [...fileHandlers].filter((item) => item.isEnabled(this.filterParams))
    },
    menuItemsPrimaryActions() {
      const fileHandlers = [
        ...this.$_rename_items,
        ...this.$_editDescription_items,
        ...this.$_uploadImage_items
      ]

      if (isLocationSpacesActive(this.$router, 'files-spaces-generic')) {
        fileHandlers.splice(2, 0, ...this.$_editReadmeContent_items)
      }
      return [...fileHandlers].filter((item) => item.isEnabled(this.filterParams))
    },
    menuItemsSecondaryActions() {
      const fileHandlers = [
        ...this.$_editQuota_items,
        ...this.$_disable_items,
        ...this.$_restore_items,
        ...this.$_delete_items
      ]

      return [...fileHandlers].filter((item) => item.isEnabled(this.filterParams))
    },
    menuItemsTrashBin() {
      const fileHandlers = [...this.$_deletedFiles_items]
      return [...fileHandlers].filter((item) => item.isEnabled(this.filterParams))
    },
    menuItemsSidebar() {
      const fileHandlers = [...this.$_showDetails_items]
      return [...fileHandlers].filter((item) => item.isEnabled(this.filterParams))
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
