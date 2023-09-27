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
import { useClientService, useLoadingService } from '@ownclouders/web-pkg'
import { useCreateSpace } from '@ownclouders/web-pkg'
import { useSpaceHelpers } from '@ownclouders/web-pkg/src/composables/spaces'

export default defineComponent({
  setup() {
    const clientService = useClientService()
    const { createSpace } = useCreateSpace()
    const { checkSpaceNameModalInput } = useSpaceHelpers()
    const loadingService = useLoadingService()
    return { clientService, createSpace, checkSpaceNameModalInput, loadingService }
  },
  methods: {
    ...mapActions([
      'showMessage',
      'showErrorMessage',
      'createModal',
      'hideModal',
      'setModalInputErrorMessage'
    ]),
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
        onConfirm: (name) => this.loadingService.addTask(() => this.addNewSpace(name)),
        onInput: this.checkSpaceNameModalInput
      }

      this.createModal(modal)
    },

    async addNewSpace(name) {
      try {
        this.hideModal()
        const createdSpace = await this.createSpace(name)
        this.UPSERT_RESOURCE(createdSpace)
        this.UPSERT_SPACE(createdSpace)
        this.showMessage({
          title: this.$gettext('Space was created successfully')
        })
      } catch (error) {
        console.error(error)
        this.showErrorMessage({
          title: this.$gettext('Creating space failed…'),
          error
        })
      }
    }
  }
})
</script>
