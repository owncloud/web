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
import { useGraphClient } from 'web-client/src/composables'
import { buildSpace } from 'web-client/src/helpers'
import { configurationManager } from 'web-pkg/src/configuration'

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

    addNewSpace(name) {
      return this.graphClient.drives
        .createDrive({ name }, {})
        .then(({ data: space }) => {
          this.hideModal()
          const resource = buildSpace({ ...space, serverUrl: configurationManager.serverUrl })
          this.UPSERT_RESOURCE(resource)
          this.UPSERT_SPACE(resource)

          this.$client.files.createFolder(`spaces/${space.id}/.space`).then(() => {
            this.$client.files
              .putFileContents(
                `spaces/${space.id}/.space/readme.md`,
                'Here you can add a description for this Space.'
              )
              .then((markdown) => {
                this.graphClient.drives
                  .updateDrive(
                    space.id,
                    {
                      special: [
                        {
                          specialFolder: {
                            name: 'readme'
                          },
                          id: markdown['OC-FileId']
                        }
                      ]
                    },
                    {}
                  )
                  .then(({ data }) => {
                    this.UPDATE_RESOURCE_FIELD({
                      id: space.id,
                      field: 'spaceReadmeData',
                      value: data.special.find((special) => special.specialFolder.name === 'readme')
                    })
                  })
              })
          })
        })
        .catch((error) => {
          console.error(error)
          this.showMessage({
            title: this.$gettext('Creating space failed…'),
            status: 'danger'
          })
        })
    }
  }
})
</script>
