import { isLocationSpacesActive } from '../../../router'
import { clientService } from 'web-pkg/src/services'
import { mapMutations, mapActions, mapGetters } from 'vuex'
import { buildResource } from '../../../helpers/resources'
import { bus } from 'web-pkg/src/instance'
import { thumbnailService } from '../../../services'

export default {
  data: function () {
    return {
      $_setSpaceImage_thumbnailService: thumbnailService
    }
  },
  computed: {
    ...mapGetters(['configuration']),
    $_setSpaceImage_items() {
      return [
        {
          name: 'set-space-image',
          icon: 'image-edit',
          handler: this.$_setSpaceImage_trigger,
          label: () => {
            return this.$gettext('Set as space image')
          },
          isEnabled: ({ resources }) => {
            if (resources.length !== 1) {
              return false
            }
            if (!resources[0].mimeType) {
              return false
            }
            if (
              !this.$data.$_setSpaceImage_thumbnailService.isMimetypeSupported(
                resources[0].mimeType,
                true
              )
            ) {
              return false
            }
            return isLocationSpacesActive(this.$router, 'files-spaces-project')
          },
          canBeDefault: false,
          componentType: 'oc-button',
          class: 'oc-files-actions-set-space-image-trigger'
        }
      ]
    }
  },
  methods: {
    ...mapMutations('Files', ['UPDATE_RESOURCE_FIELD']),
    ...mapActions(['showMessage']),
    async $_setSpaceImage_trigger({ resources }) {
      const graphClient = clientService.graphAuthenticated(this.configuration.server, this.getToken)
      const spaceId = this.$route.params.spaceId
      const sourcePath = resources[0].webDavPath
      const destinationPath = `/spaces/${spaceId}/.space/${resources[0].name}`

      if (sourcePath === destinationPath) {
        return
      }
      try {
        await this.$client.files.copy(sourcePath, destinationPath)
        const fileInfo = await this.$client.files.fileInfo(destinationPath)
        const file = buildResource(fileInfo)
        const { data } = await graphClient.drives.updateDrive(
          spaceId,
          {
            special: [
              {
                specialFolder: {
                  name: 'image'
                },
                id: file.id
              }
            ]
          },
          {}
        )
        this.UPDATE_RESOURCE_FIELD({
          id: spaceId,
          field: 'spaceImageData',
          value: data.special.find((special) => special.specialFolder.name === 'image')
        })

        this.showMessage({
          title: this.$gettext('Space image was set successfully')
        })
        bus.publish('app.files.list.load')
      } catch (error) {
        console.error(error)
        this.showMessage({
          title: this.$gettext('Failed to set space image'),
          status: 'danger'
        })
      }
    }
  }
}
