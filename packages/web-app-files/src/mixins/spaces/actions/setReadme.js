import { isLocationSpacesActive } from '../../../router'
import { mapMutations, mapState, mapActions } from 'vuex'
import { bus } from 'web-pkg/src/instance'

export default {
  inject: {
    currentSpace: {
      default: null
    }
  },
  computed: {
    ...mapState('Files', ['currentFolder']),
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
            if (!isLocationSpacesActive(this.$router, 'files-spaces-project')) {
              return false
            }

            if (!this.space) {
              return false
            }

            return this.space.canEditReadme({ user: this.user })
          },
          canBeDefault: false,
          componentType: 'oc-button',
          class: 'oc-files-actions-set-space-readme-trigger'
        }
      ]
    },
    space() {
      return this.currentSpace?.value
    }
  },
  methods: {
    ...mapMutations('Files', ['UPDATE_RESOURCE_FIELD']),
    ...mapActions(['showMessage']),
    async $_setSpaceReadme_trigger({ resources }) {
      const space = this.currentFolder

      try {
        const fileContent = await this.$client.files.getFileContents(resources[0].webDavPath)
        const fileMetaData = await this.$client.files.putFileContents(
          `/spaces/${space.id}/.space/readme.md`,
          fileContent
        )
        this.UPDATE_RESOURCE_FIELD({
          id: space.id,
          field: 'spaceReadmeData',
          value: { ...space.spaceReadmeData, ...{ etag: fileMetaData?.ETag } }
        })
        this.showMessage({
          title: this.$gettext('Space description was set successfully')
        })
        bus.publish('app.files.list.load')
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
