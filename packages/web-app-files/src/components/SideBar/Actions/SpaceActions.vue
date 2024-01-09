<template>
  <div>
    <input
      id="space-image-upload-input"
      ref="spaceImageInput"
      type="file"
      name="file"
      tabindex="-1"
      :accept="supportedSpaceImageMimeTypes"
      @change="uploadImageSpace"
    />
    <oc-list id="oc-spaces-actions-sidebar" class-name="oc-mt-s">
      <action-menu-item
        v-for="(action, index) in actions"
        :key="`action-${index}`"
        :action="action"
        :action-options="actionOptions"
        class="oc-rounded"
      />
    </oc-list>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, inject, Ref, ref, unref, VNodeRef } from 'vue'
import { SpaceResource } from '@ownclouders/web-client'
import { ActionMenuItem } from '@ownclouders/web-pkg'
import { useStore, usePreviewService } from '@ownclouders/web-pkg'
import {
  useSpaceActionsDelete,
  useSpaceActionsDisable,
  useSpaceActionsDuplicate,
  useSpaceActionsEditDescription,
  useSpaceActionsEditQuota,
  useSpaceActionsEditReadmeContent,
  useSpaceActionsRename,
  useSpaceActionsRestore
} from '@ownclouders/web-pkg'
import { useSpaceActionsUploadImage } from 'web-app-files/src/composables'
import { useFileActionsDownloadArchive } from '@ownclouders/web-pkg'

export default defineComponent({
  name: 'SpaceActions',
  components: { ActionMenuItem },
  setup() {
    const store = useStore()
    const previewService = usePreviewService()
    const resource = inject<Ref<SpaceResource>>('resource')
    const actionOptions = computed(() => ({
      resources: [unref(resource)]
    }))

    const spaceImageInput: VNodeRef = ref(null)
    const supportedSpaceImageMimeTypes = computed(() => {
      return previewService.getSupportedMimeTypes('image/').join(',')
    })

    const { actions: deleteActions } = useSpaceActionsDelete({ store })
    const { actions: disableActions } = useSpaceActionsDisable({ store })
    const { actions: duplicateActions } = useSpaceActionsDuplicate({ store })
    const { actions: editDescriptionActions } = useSpaceActionsEditDescription({ store })
    const { actions: editQuotaActions } = useSpaceActionsEditQuota()
    const { actions: editReadmeContentActions } = useSpaceActionsEditReadmeContent({ store })
    const { actions: renameActions } = useSpaceActionsRename({ store })
    const { actions: restoreActions } = useSpaceActionsRestore({ store })
    const { actions: uploadImageActions, uploadImageSpace } = useSpaceActionsUploadImage({
      store,
      spaceImageInput
    })
    const { actions: downloadArchiveActions } = useFileActionsDownloadArchive({ store })

    const actions = computed(() =>
      [
        ...unref(downloadArchiveActions),
        ...unref(renameActions),
        ...unref(duplicateActions),
        ...unref(editDescriptionActions),
        ...unref(uploadImageActions),
        ...unref(editReadmeContentActions),
        ...unref(editQuotaActions),
        ...unref(restoreActions),
        ...unref(deleteActions),
        ...unref(disableActions)
      ].filter((item) => item.isEnabled(unref(actionOptions) as any))
    )

    return {
      actions,
      actionOptions,
      spaceImageInput,
      supportedSpaceImageMimeTypes,

      uploadImageActions,
      uploadImageSpace
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
