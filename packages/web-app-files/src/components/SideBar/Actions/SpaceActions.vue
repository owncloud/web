<template>
  <div>
    <readme-content-modal
      v-if="readmeContentModalIsOpen"
      :cancel="closeReadmeContentModal"
      :space="resources[0]"
    ></readme-content-modal>
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
import Disable from '../../../mixins/spaces/actions/disable'
import Restore from '../../../mixins/spaces/actions/restore'
import EditDescription from '../../../mixins/spaces/actions/editDescription'
import EditReadmeContent from '../../../mixins/spaces/actions/editReadmeContent'
import UploadImage from '../../../mixins/spaces/actions/uploadImage'
import ReadmeContentModal from '../../../components/Spaces/ReadmeContentModal.vue'

export default {
  name: 'SpaceActions',
  title: ($gettext) => {
    return $gettext('Actions')
  },
  components: { ActionMenuItem, ReadmeContentModal },
  mixins: [Rename, Delete, EditDescription, EditReadmeContent, Disable, Restore, UploadImage],
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
        ...this.$_restore_items,
        ...this.$_delete_items,
        ...this.$_disable_items
      ].filter((item) => item.isEnabled({ resources: this.resources }))
    },
    readmeContentModalIsOpen() {
      return this.$data.$_editReadmeContent_modalOpen
    }
  },
  methods: {
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
