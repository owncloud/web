import { mapActions } from 'vuex'
import { clientService } from 'web-pkg'
import { supportedLogoMimeTypes } from '../../defaults'

export default {
  computed: {
    $_uploadLogo_items() {
      return [
        {
          name: 'upload-logo',
          meta: () => this.supportedLogoMimeTypesDisplayValue,
          icon: 'image-add',
          label: () => {
            return this.$gettext('Upload logo')
          },
          handler: this.$_uploadLogo_trigger,
          componentType: 'button',
          class: 'oc-general-actions-upload-logo-trigger'
        }
      ]
    }
  },
  methods: {
    ...mapActions(['showMessage']),

    $_uploadLogo_trigger() {
      this.$refs.logoInput.click()
    },
    async $_uploadLogo_upload(ev) {
      const file = ev.currentTarget.files[0]

      if (!file) {
        return
      }

      if (!supportedLogoMimeTypes.includes(file.type)) {
        return this.showMessage({
          title: this.$gettext('The file type is unsupported'),
          status: 'danger'
        })
      }

      try {
        const accessToken = this.$store.getters['runtime/auth/accessToken']
        const httpClient = clientService.httpAuthenticated(accessToken)
        const formData = new FormData()
        formData.append('logo', file)
        await httpClient.post('/branding/logo', formData as never, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        this.showMessage({
          title: this.$gettext('Logo was uploaded successfully')
        })
        setTimeout(() => {
          this.$router.go(this.$router.currentRoute)
        }, 1000)
      } catch (e) {
        console.error(e)
        this.showMessage({
          title: this.$gettext('Failed to upload logo'),
          status: 'danger'
        })
      }
    }
  }
}
