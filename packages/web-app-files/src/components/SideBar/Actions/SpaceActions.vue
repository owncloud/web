<template>
  <div>
    <readme-content-modal
      v-if="readmeContentModalIsOpen"
      :cancel="closeReadmeContentModal"
      :space="resources[0]"
    ></readme-content-modal>
    <quota-modal
      v-if="quotaModalIsOpen"
      :cancel="closeQuotaModal"
      :spaces="[resources[0]]"
      :max-quota="maxQuota"
    />
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
        :space="space"
        class="oc-rounded"
      />
    </oc-list>
  </div>
</template>

<script lang="ts">
import ActionMenuItem from 'web-pkg/src/components/ContextActions/ActionMenuItem.vue'
import Rename from 'web-pkg/src/mixins/spaces/rename'
import Delete from 'web-pkg/src/mixins/spaces/delete'
import Disable from 'web-pkg/src/mixins/spaces/disable'
import Restore from 'web-pkg/src/mixins/spaces/restore'
import EditDescription from 'web-pkg/src/mixins/spaces/editDescription'
import EditReadmeContent from 'web-pkg/src/mixins/spaces/editReadmeContent'
import UploadImage from '../../../mixins/spaces/actions/uploadImage'
import EditQuota from 'web-pkg/src/mixins/spaces/editQuota'
import QuotaModal from 'web-pkg/src/components/Spaces/QuotaModal.vue'
import ReadmeContentModal from 'web-pkg/src/components/Spaces/ReadmeContentModal.vue'
import { thumbnailService } from '../../../services'
import { computed, ComputedRef, defineComponent, inject, unref } from 'vue'
import { Resource, SpaceResource } from 'web-client'
import { useCapabilitySpacesMaxQuota } from 'web-pkg/src/composables'

export default defineComponent({
  name: 'SpaceActions',
  components: { ActionMenuItem, QuotaModal, ReadmeContentModal },
  mixins: [
    Rename,
    Delete,
    EditDescription,
    EditReadmeContent,
    Disable,
    Restore,
    UploadImage,
    EditQuota
  ],
  setup() {
    const resource = inject<Resource>('resource')
    const resources = computed(() => {
      return [unref(resource)]
    })

    return {
      maxQuota: useCapabilitySpacesMaxQuota(),
      space: inject<ComputedRef<SpaceResource>>('space'),
      resources
    }
  },
  computed: {
    actions() {
      return [
        ...this.$_rename_items,
        ...this.$_editDescription_items,
        ...this.$_uploadImage_items,
        ...this.$_editReadmeContent_items,
        ...this.$_editQuota_items,
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
})
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

  > li:hover {
    text-decoration: none !important;
    background-color: var(--oc-color-background-hover);
  }
}
</style>
