import { isLocationSpacesActive } from '../../../router'
import { clientService } from 'web-pkg/src/services'
import { mapMutations, mapActions, mapGetters, mapState } from 'vuex'
import { buildResource } from '../../../helpers/resources'
import { bus } from 'web-pkg/src/instance'
import { thumbnailService } from '../../../services'

export default {
  inject: {
    currentSpace: {
      default: null
    }
  },
  computed: {
    ...mapGetters(['configuration']),
    ...mapState(['user']),
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
            if (!thumbnailService.isMimetypeSupported(resources[0].mimeType, true)) {
              return false
            }

            if (!isLocationSpacesActive(this.$router, 'files-spaces-project')) {
              return false
            }
            if (!this.space) {
              return false
            }

            return this.space.canEditImage({ user: this.user })
          },
          canBeDefault: false,
          componentType: 'oc-button',
          class: 'oc-files-actions-set-space-image-trigger'
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
    async $_setSpaceImage_trigger({ resources }) {
      const graphClient = clientService.graphAuthenticated(this.configuration.server, this.getToken)
      const storageId = this.$route.params.storageId
      const sourcePath = resources[0].webDavPath
      const destinationPath = `/spaces/${storageId}/.space/${resources[0].name}`

      if (sourcePath === destinationPath) {
        return
      }
      try {
        await this.$client.files.copy(sourcePath, destinationPath)
        const fileInfo = await this.$client.files.fileInfo(destinationPath)
        const file = buildResource(fileInfo)
        const { data } = await graphClient.drives.updateDrive(
          storageId,
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
          id: storageId,
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
