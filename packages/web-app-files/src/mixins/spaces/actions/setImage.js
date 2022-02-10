import { isLocationSpacesActive } from '../../../router'
import { clientService } from 'web-pkg/src/services'
import { mapMutations } from 'vuex'
import { buildResource } from '../../../helpers/resources'
import { bus } from 'web-pkg/src/instance'

export default {
  computed: {
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
            if (!resources[0].mimeType?.startsWith('image/')) {
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
    $_setSpaceImage_trigger({ resources }) {
      const graphClient = clientService.graphAuthenticated(this.configuration.server, this.getToken)
      const spaceId = this.$route.params.spaceId
      const sourcePath = resources[0].webDavPath
      const destinationPath = `/spaces/${spaceId}/.space/${resources[0].name}`

      if (sourcePath === destinationPath) {
        return
      }

      this.$client.files.copy(sourcePath, destinationPath).then(() => {
        this.$client.files.fileInfo(destinationPath).then((fileInfo) => {
          const file = buildResource(fileInfo)

          graphClient.drives
            .updateDrive(
              spaceId,
              {
                special: [
                  {
                    specialFolder: {
                      name: 'image'
                    },
                    id: Buffer.from(file.id, 'base64').toString().split(':').pop()
                  }
                ]
              },
              {}
            )
            .then(({ data }) => {
              this.UPDATE_RESOURCE_FIELD({
                id: spaceId,
                field: 'spaceImageData',
                value: data.special.find((special) => special.specialFolder.name === 'image')
              })
              this.showMessage({
                title: this.$gettext('Space image successfully set')
              })
              bus.publish('app.files.list.load')
            })
            .catch((error) => {
              this.showMessage({
                title: this.$gettext('Set space image failed…'),
                desc: error,
                status: 'danger'
              })
            })
        })
      })
    }
  }
}
