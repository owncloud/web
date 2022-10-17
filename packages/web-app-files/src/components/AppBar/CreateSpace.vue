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
    <translate>New Space</translate>
  </oc-button>
</template>

<script lang="ts">
import { mapActions, mapMutations } from 'vuex'

import { defineComponent } from '@vue/composition-api'
import { useGraphClient } from 'web-pkg/src/composables'
import { buildSpace } from 'web-client/src/helpers'
import { configurationManager } from 'web-pkg/src/configuration'
import { WebDAV } from 'web-client/src/webdav'

export default defineComponent({
  setup() {
    return {
      ...useGraphClient()
    }
  },
  methods: {
    ...mapActions(['showMessage', 'createModal', 'hideModal', 'setModalInputErrorMessage']),
    ...mapMutations('runtime/spaces', ['UPSERT_SPACE']),
    ...mapMutations('Files', [
      'SET_CURRENT_FOLDER',
      'LOAD_FILES',
      'CLEAR_CURRENT_FILES_LIST',
      'SET_FILE_SELECTION',
      'UPSERT_RESOURCE',
      'UPDATE_RESOURCE_FIELD'
    ]),

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
        onInput: this.checkSpaceName
      }

      this.createModal(modal)
    },

    checkSpaceName(name) {
      if (name.trim() === '') {
        this.setModalInputErrorMessage(this.$gettext('Space name cannot be empty'))
        return
      }
      return this.setModalInputErrorMessage(null)
    },

    async addNewSpace(name) {
      try {
        const { data: space } = await this.graphClient.drives.createDrive({ name }, {})
        this.hideModal()
        const resource = buildSpace({ ...space, serverUrl: configurationManager.serverUrl })
        this.UPSERT_RESOURCE(resource)
        this.UPSERT_SPACE(resource)

        await (this.$clientService.webdav as WebDAV).createFolder(resource, { path: '.space' })
        const markdown = await (this.$clientService.webdav as WebDAV).putFileContents(resource, {
          path: '.space/readme.md',
          content: this.$gettext('Here you can add a description for this Space.')
        })

        const { data: updatedSpace } = await this.graphClient.drives.updateDrive(
          space.id,
          {
            special: [
              {
                specialFolder: {
                  name: 'readme'
                },
                id: markdown.id as string
              }
            ]
          },
          {}
        )
        this.UPDATE_RESOURCE_FIELD({
          id: space.id,
          field: 'spaceReadmeData',
          value: updatedSpace.special.find((special) => special.specialFolder.name === 'readme')
        })
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
