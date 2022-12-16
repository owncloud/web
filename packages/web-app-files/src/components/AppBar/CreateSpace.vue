<template>
  <oc-button
    id="new-space-menu-btn"
    key="new-space-menu-btn-enabled"
    v-oc-tooltip="$gettext('Request new Project')"
    :aria-label="$gettext('Request new Project')"
    appearance="filled"
    variation="primary"
    @click="onNewProjectButtonClick"
  >
    <oc-icon name="add" />
    <span v-translate>New Project</span>
  </oc-button>
</template>

<script lang="ts">
import { mapActions, mapMutations } from 'vuex'

import { defineComponent } from 'vue'
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
    ...mapMutations('Files', ['UPSERT_RESOURCE', 'UPDATE_RESOURCE_FIELD']),

    onNewProjectButtonClick() {
      const win =window.open(
        'https://cern.service-now.com/service-portal?id=sc_cat_item&name=request-storage-space&se=CERNBox-Service',
        '_blank'
      )

      if (!win) {
          this.showMessage({
            title: this.$gettext('Blocked pop-ups and redirects'),
            timeout: 10,
            status: 'warning',
            desc: this.$gettext('Some features might not work correctly. Please enable pop-ups and redirects in Settings > Privacy & Security > Site Settings > Permissions')
          })
        }
    },
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
        return this.setModalInputErrorMessage(this.$gettext('Space name cannot be empty'))
      }
      if (name.length > 255) {
        return this.setModalInputErrorMessage(
          this.$gettext('Space name cannot exceed 255 characters')
        )
      }
      if (/[/\\.:?*"><|]/.test(name)) {
        return this.setModalInputErrorMessage(
          this.$gettext('Space name cannot contain the following characters: / \\ . : ? * " > < |')
        )
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
        this.UPDATE_RESOURCE_FIELD({
          id: space.id,
          field: 'spaceQuota',
          value: updatedSpace.quota
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
