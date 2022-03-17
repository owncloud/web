<template>
  <div>
    <readme-content-modal
      v-if="readmeContentModalIsOpen"
      :cancel="closeReadmeContentModal"
      :space="resources[0]"
    ></readme-content-modal>
    <quota-modal v-if="quotaModalIsOpen" :cancel="closeQuotaModal" :space="resources[0]" />
    <input
      id="space-image-upload-input"
      ref="spaceImageInput"
      type="file"
      name="file"
      tabindex="-1"
      :accept="supportedSpaceImageMimeTypes"
      @change="$_uploadImage_uploadImageSpace"
    />
    <oc-list id="oc-spaces-actions-sidebar" class-name="oc-mt-s">
      <action-menu-item
        v-for="(action, index) in actions"
        :key="`action-${index}`"
        :action="action"
        :items="resources"
        class="oc-py-xs"
      />
    </oc-list>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ActionMenuItem from '../../ActionMenuItem.vue'
import Rename from '../../../mixins/spaces/actions/rename'
import Delete from '../../../mixins/spaces/actions/delete'
import DeletedFiles from '../../../mixins/spaces/actions/deletedFiles'
import Disable from '../../../mixins/spaces/actions/disable'
import Restore from '../../../mixins/spaces/actions/restore'
import EditDescription from '../../../mixins/spaces/actions/editDescription'
import EditReadmeContent from '../../../mixins/spaces/actions/editReadmeContent'
import UploadImage from '../../../mixins/spaces/actions/uploadImage'
import EditQuota from '../../../mixins/spaces/actions/editQuota'
import QuotaModal from '../../Spaces/QuotaModal.vue'
import ReadmeContentModal from '../../../components/Spaces/ReadmeContentModal.vue'
import { thumbnailService } from '../../../services'

export default {
  name: 'SpaceActions',
  title: ($gettext) => {
    return $gettext('Actions')
  },
  components: { ActionMenuItem, QuotaModal, ReadmeContentModal },
  mixins: [
    Rename,
    Delete,
    DeletedFiles,
    EditDescription,
    EditReadmeContent,
    Disable,
    Restore,
    UploadImage,
    EditQuota
  ],
  computed: {
    ...mapGetters('Files', ['highlightedFile']),
    resources() {
      return [this.highlightedFile]
    },
    actions() {
      return [
        ...this.$_rename_items,
        ...this.$_editDescription_items,
        ...this.$_uploadImage_items,
        ...this.$_editReadmeContent_items,
        ...this.$_editQuota_items,
        ...this.$_deletedFiles_items,
        ...this.$_restore_items,
        ...this.$_delete_items,
        ...this.$_disable_items
      ].filter((item) => item.isEnabled({ resources: this.resources }))
    },
    readmeContentModalIsOpen() {
      return this.$data.$_editReadmeContent_modalOpen
    },
    quotaModalIsOpen() {
      return this.$data.$_editQuota_modalOpen
    },
    supportedSpaceImageMimeTypes() {
      return thumbnailService.getSupportedMimeTypes('image/').join(',')
    }
  },
  methods: {
    closeReadmeContentModal() {
      this.$_editReadmeContent_closeModal()
    },
    closeQuotaModal() {
      this.$_editQuota_closeModal()
    }
  }
}
</script>

<style lang="scss">
#space-image-upload-input {
  position: absolute;
  left: -99999px;
}

#oc-spaces-actions-sidebar {
  > li a,
  > li a:hover {
    color: var(--oc-color-swatch-passive-default);
    display: inline-flex;
    gap: 10px;
    vertical-align: top;
  }
}
</style>
