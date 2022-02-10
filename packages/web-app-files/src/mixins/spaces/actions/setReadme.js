import { isLocationSpacesActive } from '../../../router'
import { mapMutations, mapGetters } from 'vuex'
import { bus } from 'web-pkg/src/instance'

export default {
  computed: {
    ...mapGetters('Files', ['currentFolder']),
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
    $_setSpaceReadme_trigger({ resources }) {
      const space = this.currentFolder
      this.$client.files.getFileContents(resources[0].webDavPath).then((fileContent) => {
        this.$client.files
          .putFileContents(`/spaces/${space.id}/.space/readme.md`, fileContent)
          .then((fileMetaData) => {
            this.UPDATE_RESOURCE_FIELD({
              id: space.id,
              field: 'spaceReadmeData',
              value: { ...space.spaceReadmeData, ...{ etag: fileMetaData.ETag } }
            })
            this.showMessage({
              title: this.$gettext('Space description successfully set')
            })
            bus.publish('app.files.list.load')
          })
      })
    }
  }
}
