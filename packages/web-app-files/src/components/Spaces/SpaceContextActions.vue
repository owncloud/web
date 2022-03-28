<template>
  <div>
    <context-action-menu :menu-sections="menuSections" :items="items" />
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

<script>
import ContextActionMenu from '../ContextActionMenu.vue'
import QuotaModal from './QuotaModal.vue'
import ReadmeContentModal from './ReadmeContentModal.vue'

import Delete from '../../mixins/spaces/actions/delete'
import Rename from '../../mixins/spaces/actions/rename'
import Restore from '../../mixins/spaces/actions/restore'
import ShowDetails from '../../mixins/spaces/actions/showDetails'
import EditDescription from '../../mixins/spaces/actions/editDescription'
import EditQuota from '../../mixins/spaces/actions/editQuota'
import DeletedFiles from '../../mixins/spaces/actions/deletedFiles'
import Disable from '../../mixins/spaces/actions/disable'
import ShowMembers from '../../mixins/spaces/actions/showMembers'
import UploadImage from '../../mixins/spaces/actions/uploadImage'
import EditReadmeContent from '../../mixins/spaces/actions/editReadmeContent'
import { isLocationSpacesActive } from '../../router'

export default {
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

      if (
        isLocationSpacesActive(this.$router, 'files-spaces-project') &&
        this.$route.params.storageId
      ) {
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
}
</script>

<style lang="scss">
#space-image-upload-input {
  position: absolute;
  left: -99999px;
}
</style>
