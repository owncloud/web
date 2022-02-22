import { isLocationSpacesActive } from '../../../router'
import { mapMutations, mapState, mapActions } from 'vuex'
import { bus } from 'web-pkg/src/instance'

export default {
  computed: {
    ...mapState('Files', ['currentFolder']),
    $_setSpaceReadme_items() {
      return [
        {
          name: 'set-space-readme',
          icon: 'markdown',
          handler: this.$_setSpaceReadme_setReadmeSpace,
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
            return isLocationSpacesActive(this.$router, 'files-spaces-project')
          },
          canBeDefault: false,
          componentType: 'oc-button',
          class: 'oc-files-actions-set-space-readme-trigger'
        }
      ]
    }
  },
  methods: {
    ...mapMutations('Files', ['UPDATE_RESOURCE_FIELD']),
    ...mapActions(['showMessage']),
    async $_setSpaceReadme_setReadmeSpace({ resources }) {
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
          title: this.$gettext('Space description successfully set')
        })
        bus.publish('app.files.list.load')
      } catch (error) {
        this.showMessage({
          title: this.$gettext('Set space readme failed…'),
          desc: error,
          status: 'danger'
        })
      }
    }
  }
}
