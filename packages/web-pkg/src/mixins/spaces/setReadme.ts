import { mapMutations, mapState, mapActions } from 'vuex'

export default {
  computed: {
    ...mapState('Files', ['currentFolder']),
    ...mapState('runtime/spaces', ['spaces']),
    ...mapState(['user']),
    $_setSpaceReadme_items() {
      return [
        {
          name: 'set-space-readme',
          icon: 'markdown',
          handler: this.$_setSpaceReadme_trigger,
          label: () => {
            return this.$gettext('Set as space description')
          },
          isEnabled: ({ resources }) => {
            if (resources.length !== 1) {
              return false
            }
            if (!resources[0].mimeType?.startsWith('text/')) {
              return false
            }
            if (this.$router.currentRoute.name !== 'files-spaces-generic') {
              return false
            }

            if (!this.space) {
              return false
            }

            return this.space.canEditReadme({ user: this.user })
          },
          canBeDefault: false,
          componentType: 'button',
          class: 'oc-files-actions-set-space-readme-trigger'
        }
      ]
    }
  },
  methods: {
    ...mapMutations('runtime/spaces', ['UPDATE_SPACE_FIELD']),
    ...mapActions(['showMessage']),
    async $_setSpaceReadme_trigger({ resources }) {
      try {
        const fileContent = await this.$client.files.getFileContents(resources[0].webDavPath)
        const fileMetaData = await this.$client.files.putFileContents(
          `/spaces/${this.space.id}/.space/readme.md`,
          fileContent
        )
        this.UPDATE_SPACE_FIELD({
          id: this.space.id,
          field: 'spaceReadmeData',
          value: { ...this.space.spaceReadmeData, ...{ etag: fileMetaData?.ETag } }
        })
        this.showMessage({
          title: this.$gettext('Space description was set successfully')
        })
      } catch (error) {
        console.error(error)
        this.showMessage({
          title: this.$gettext('Failed to set space description'),
          status: 'danger'
        })
      }
    }
  }
}
