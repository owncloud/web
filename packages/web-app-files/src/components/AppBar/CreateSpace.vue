<template>
  <oc-button
    id="new-space-menu-btn"
    key="new-space-menu-btn-enabled"
    v-oc-tooltip="$gettext('Create a new space')"
    :aria-label="$gettext('Create a new space')"
    appearance="filled"
    variation="primary"
    @click="showCreateSpaceModal"
  >
    <oc-icon name="add" />
    <span v-translate>New Space</span>
  </oc-button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useGettext } from 'vue3-gettext'
import {
  useModals,
  useCreateSpace,
  useSpaceHelpers,
  useMessages,
  useSpacesStore,
  useResourcesStore
} from '@ownclouders/web-pkg'

export default defineComponent({
  setup() {
    const { showMessage, showErrorMessage } = useMessages()
    const { $gettext } = useGettext()
    const { createSpace } = useCreateSpace()
    const { checkSpaceNameModalInput } = useSpaceHelpers()
    const { dispatchModal } = useModals()
    const spacesStore = useSpacesStore()
    const { upsertResource } = useResourcesStore()

    const addNewSpace = async (name: string) => {
      try {
        const createdSpace = await createSpace(name)
        upsertResource(createdSpace)
        spacesStore.upsertSpace(createdSpace)
        showMessage({ title: $gettext('Space was created successfully') })
      } catch (error) {
        console.error(error)
        showErrorMessage({
          title: $gettext('Creating space failed…'),
          errors: [error]
        })
      }
    }

    const showCreateSpaceModal = () => {
      dispatchModal({
        title: $gettext('Create a new space'),
        confirmText: $gettext('Create'),
        hasInput: true,
        inputLabel: $gettext('Space name'),
        inputValue: $gettext('New space'),
        onConfirm: (name: string) => addNewSpace(name),
        onInput: checkSpaceNameModalInput
      })
    }

    return { showCreateSpaceModal }
  }
})
</script>
