import { mapActions } from 'vuex'

export default {
  computed: {
    $_uploadLogo_items() {
      return [
        {
          name: 'upload-logo',
          icon: 'image-add',
          label: () => {
            return this.$gettext('Upload logo')
          },
          handler: this.$_resetLogo_trigger,
          componentType: 'button',
          class: 'oc-general-actions-upload-logo-trigger'
        }
      ]
    }
  },
  methods: {
    ...mapActions(['showMessage']),

    $_uploadLogo_trigger({ resources }) {
      this.showMessage('Logo upload')
    }
  }
}
