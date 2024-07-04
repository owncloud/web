<template>
  <section class="files-embed-actions">
    <oc-button data-testid="button-cancel" appearance="raw-inverse" @click="emitCancel"
      >{{ $gettext('Cancel') }}
    </oc-button>
    <oc-button
      v-if="!isLocationPicker && !isFilePicker"
      key="btn-share"
      data-testid="button-share"
      variation="inverse"
      appearance="filled"
      :disabled="
        areSelectActionsDisabled || !createLinkAction.isVisible({ resources: selectedFiles, space })
      "
      @click="createLinkAction.handler({ resources: selectedFiles, space })"
      >{{ $gettext('Share link(s)') }}
    </oc-button>
    <oc-button
      v-if="!isFilePicker"
      data-testid="button-select"
      variation="inverse"
      appearance="filled"
      :disabled="areSelectActionsDisabled"
      @click="emitSelect"
      >{{ selectLabel }}
    </oc-button>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, unref } from 'vue'
import {
  FileAction,
  useAbility,
  useEmbedMode,
  useFileActionsCreateLink,
  useResourcesStore,
  useSpacesStore
} from '@ownclouders/web-pkg'
import { Resource } from '@ownclouders/web-client'
import { useGettext } from 'vue3-gettext'
import { storeToRefs } from 'pinia'

export default defineComponent({
  setup() {
    const ability = useAbility()
    const { $gettext } = useGettext()
    const { isLocationPicker, isFilePicker, postMessage } = useEmbedMode()
    console.log(unref(isFilePicker))
    const spacesStore = useSpacesStore()
    const { currentSpace: space } = storeToRefs(spacesStore)

    const resourcesStore = useResourcesStore()
    const { currentFolder, selectedResources } = storeToRefs(resourcesStore)

    const selectedFiles = computed<Resource[]>(() => {
      if (isLocationPicker.value) {
        return [unref(currentFolder)]
      }

      return unref(selectedResources)
    })

    const { actions: createLinkActions } = useFileActionsCreateLink({ enforceModal: true })
    const createLinkAction = computed<FileAction>(() => unref(createLinkActions)[0])

    const areSelectActionsDisabled = computed<boolean>(() => selectedFiles.value.length < 1)

    const canCreatePublicLinks = computed<boolean>(() => ability.can('create-all', 'PublicLink'))

    const selectLabel = computed<string>(() =>
      isLocationPicker.value ? $gettext('Choose') : $gettext('Attach as copy')
    )

    const emitSelect = (): void => {
      postMessage<Resource[]>(
        'owncloud-embed:select',
        JSON.parse(JSON.stringify(selectedFiles.value))
      )
    }

    const emitCancel = (): void => {
      postMessage<null>('owncloud-embed:cancel', null)
    }

    return {
      selectedFiles,
      areSelectActionsDisabled,
      canCreatePublicLinks,
      isLocationPicker,
      isFilePicker,
      selectLabel,
      emitCancel,
      emitSelect,
      space,
      createLinkAction
    }
  }
})
</script>

<style scoped>
.files-embed-actions {
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  gap: var(--oc-space-medium);
  justify-content: flex-end;
  padding: var(--oc-space-medium) 0;
  padding-right: var(--oc-space-small);
  width: 100%;
}
</style>
