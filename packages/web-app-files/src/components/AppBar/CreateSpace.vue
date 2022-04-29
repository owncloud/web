<template>
  <oc-button
    id="new-space-menu-btn"
    key="new-space-menu-btn-enabled"
    v-oc-tooltip="$gettext('Create a new space')"
    :aria-label="$gettext('Create a new space')"
    appearance="raw"
    variation="inverse"
    class="oc-background-primary-gradient oc-px-s oc-text-nowrap oc-py-s"
    @click="showCreateSpaceModal"
  >
    <oc-icon name="add" />
    <translate>New Space</translate>
  </oc-button>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'

import { buildSpace } from '../../helpers/resources'
import { useStore } from 'web-pkg/src/composables'
import { clientService } from 'web-pkg/src/services'

export default {
  setup() {
    const store = useStore()
    const graphClient = clientService.graphAuthenticated(
      store.getters.configuration.server,
      store.getters.getToken
    )

    return { graphClient }
  },
  computed: {
    ...mapGetters(['getToken', 'configuration'])
  },
  methods: {
    ...mapActions(['showMessage', 'createModal', 'hideModal', 'setModalInputErrorMessage']),
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
          const resource = buildSpace(space)
          this.UPSERT_RESOURCE(resource)

          this.$client.files.createFolder(`spaces/${space.id}/.space`).then(() => {
            this.$client.files
              .putFileContents(
                `spaces/${space.id}/.space/readme.md`,
                `### 👋 ${this.$gettext('Hello!')}\r\n${this.$gettext(
                  'Add a description to welcome the members of the Space.'
                )}\r\n${this.$gettext(
                  'Use markdown to format your text. [More info]'
                )}(https://www.markdownguide.org/basic-syntax/)`
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
          this.showMessage({
            title: this.$gettext('Creating space failed…'),
            desc: error,
            status: 'danger'
          })
        })
    }
  }
}
</script>
