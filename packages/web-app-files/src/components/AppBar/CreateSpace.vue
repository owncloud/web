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
import { useModals, useCreateSpace, useSpaceHelpers, useStore } from '@ownclouders/web-pkg'

export default defineComponent({
  setup() {
    const store = useStore()
    const { $gettext } = useGettext()
    const { createSpace } = useCreateSpace()
    const { checkSpaceNameModalInput } = useSpaceHelpers()
    const { registerModal } = useModals()

    const addNewSpace = async (name: string) => {
      try {
        const createdSpace = await createSpace(name)
        store.commit('Files/UPSERT_RESOURCE', createdSpace)
        store.commit('runtime/spaces/UPSERT_SPACE', createdSpace)
        store.dispatch('showMessage', {
          title: $gettext('Space was created successfully')
        })
      } catch (error) {
        console.error(error)
        store.dispatch('showErrorMessage', {
          title: $gettext('Creating space failed…'),
          error
        })
      }
    }

    const showCreateSpaceModal = () => {
      registerModal({
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
