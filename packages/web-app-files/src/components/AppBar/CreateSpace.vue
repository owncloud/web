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
import { mapActions, mapMutations } from 'vuex'
import { defineComponent } from 'vue'
import { useClientService } from 'web-pkg/src/composables'
import { useCreateSpace } from 'web-app-files/src/composables'
import { useSpaceHelpers } from 'web-pkg/src/composables/spaces'

export default defineComponent({
  setup() {
    const clientService = useClientService()
    const { createSpace } = useCreateSpace()
    const { checkSpaceNameModalInput } = useSpaceHelpers()
    return { clientService, createSpace, checkSpaceNameModalInput }
  },
  methods: {
    ...mapActions(['showMessage', 'createModal', 'hideModal', 'setModalInputErrorMessage']),
    ...mapMutations('runtime/spaces', ['UPSERT_SPACE']),
    ...mapMutations('Files', ['UPSERT_RESOURCE', 'UPDATE_RESOURCE_FIELD']),

    showCreateSpaceModal() {
      const modal = {
        variation: 'passive',
        title: this.$gettext('Create a new space'),
        cancelText: this.$gettext('Cancel'),
        confirmText: this.$gettext('Create'),
        hasInput: true,
        inputLabel: this.$gettext('Space name'),
        inputValue: this.$gettext('New space'),
        onCancel: this.hideModal,
        onConfirm: this.addNewSpace,
        onInput: this.checkSpaceNameModalInput
      }

      this.createModal(modal)
    },

    async addNewSpace(name) {
      try {
        const createdSpace = await this.createSpace(name)
        this.hideModal()
        this.UPSERT_RESOURCE(createdSpace)
        this.UPSERT_SPACE(createdSpace)
      } catch (error) {
        console.error(error)
        this.showMessage({
          title: this.$gettext('Creating space failed…'),
          status: 'danger'
        })
      }
    }
  }
})
</script>
