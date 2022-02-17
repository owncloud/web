import { mapMutations } from 'vuex'
import { clientService } from 'web-pkg/src/services'
import { bus } from 'web-pkg/src/instance'

export default {
  data: function () {
    return {
      selectedSpace: null
    }
  },
  computed: {
    $_uploadSpaceImage_items() {
      return [
        {
          name: 'upload-space-image',
          icon: 'image-add',
          handler: this.$_uploadSpaceImage_trigger,
          label: () => {
            return this.$gettext('Upload new space image')
          },
          isEnabled: ({ spaces }) => spaces.length === 1,
          componentType: 'oc-button',
          class: 'oc-files-actions-upload-space-image-trigger'
        }
      ]
    }
  },
  methods: {
    ...mapMutations('Files', ['UPDATE_RESOURCE_FIELD']),
    $_uploadSpaceImage_trigger({ spaces }) {
      if (spaces.length !== 1) {
        return
      }

      this.selectedSpace = spaces[0]
      this.$refs.spaceImageInput.click()
    },
    $_uploadSpaceImage(ev) {
      const graphClient = clientService.graphAuthenticated(this.configuration.server, this.getToken)
      const file = ev.currentTarget.files[0]

      const extraHeaders = {}
      if (file.lastModifiedDate) {
        extraHeaders['X-OC-Mtime'] = '' + file.lastModifiedDate.getTime() / 1000
      } else if (file.lastModified) {
        extraHeaders['X-OC-Mtime'] = '' + file.lastModified / 1000
      }

      this.$client.files
        .putFileContents(`/spaces/${this.selectedSpace.id}/.space/${file.name}`, file, {
          headers: extraHeaders,
          overwrite: true
        })
        .then((image) => {
          graphClient.drives
            .updateDrive(
              this.selectedSpace.id,
              {
                special: [
                  {
                    specialFolder: {
                      name: 'image'
                    },
                    id: Buffer.from(image['OC-FileId'], 'base64').toString().split(':').pop()
                  }
                ]
              },
              {}
            )
            .then(({ data }) => {
              this.UPDATE_RESOURCE_FIELD({
                id: this.selectedSpace.id,
                field: 'spaceImageData',
                value: data.special.find((special) => special.specialFolder.name === 'image')
              })
              bus.publish('app.files.list.load')
              this.showMessage({
                title: this.$gettext('Space image successfully uploaded')
              })
            })
        })
        .catch((error) => {
          this.showMessage({
            title: this.$gettext('Upload new space image failed…'),
            desc: error,
            status: 'danger'
          })
        })
    }
  }
}
