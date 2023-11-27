<template>
  <section class="files-embed-actions">
    <oc-button data-testid="button-cancel" appearance="raw-inverse" @click="emitCancel">{{
      $gettext('Cancel')
    }}</oc-button>
    <oc-button
      v-if="!isLocationPicker"
      key="btn-share"
      data-testid="button-share"
      variation="inverse"
      appearance="filled"
      :disabled="
        areSelectActionsDisabled || !createLinkAction.isEnabled({ resources: selectedFiles, space })
      "
      @click="createLinkAction.handler({ resources: selectedFiles, space })"
      >{{ $gettext('Share links') }}</oc-button
    >
    <oc-button
      data-testid="button-select"
      variation="inverse"
      appearance="filled"
      :disabled="areSelectActionsDisabled"
      @click="emitSelect"
      >{{ selectLabel }}</oc-button
    >
  </section>
</template>

<script lang="ts">
import { computed, unref } from 'vue'
import {
  FileAction,
  useAbility,
  useEmbedMode,
  useFileActionsCreateLink,
  useStore
} from '@ownclouders/web-pkg'
import { Resource, SpaceResource } from '@ownclouders/web-client'
import { useGettext } from 'vue3-gettext'

export default {
  setup() {
    const store = useStore()
    const ability = useAbility()
    const language = useGettext()
    const { isLocationPicker, postMessage } = useEmbedMode()

    const space = computed<SpaceResource>(() => store.getters['runtime/spaces/currentSpace'])
    const selectedFiles = computed<Resource[]>(() => {
      if (isLocationPicker.value) {
        return [store.getters['Files/currentFolder']]
      }

      return store.getters['Files/selectedFiles']
    })

    const { actions: createLinkActions } = useFileActionsCreateLink({ store })
    const createLinkAction = computed<FileAction>(() => unref(createLinkActions)[0])

    const areSelectActionsDisabled = computed<boolean>(() => selectedFiles.value.length < 1)

    const canCreatePublicLinks = computed<boolean>(() => ability.can('create-all', 'PublicLink'))

    const selectLabel = computed<string>(() =>
      isLocationPicker.value ? language.$gettext('Choose') : language.$gettext('Attach as copy')
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
      selectLabel,
      emitCancel,
      emitSelect,
      space,
      createLinkAction
    }
  }
}
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
