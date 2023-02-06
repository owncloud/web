import { mapActions } from 'vuex'

export default {
  computed: {
    $_resetLogo_items() {
      return [
        {
          name: 'reset-logo',
          icon: 'restart',
          label: () => {
            return this.$gettext('Reset logo')
          },
          handler: this.$_resetLogo_trigger,
          componentType: 'button',
          class: 'oc-general-actions-reset-logo-trigger'
        }
      ]
    }
  },
  methods: {
    ...mapActions(['showMessage']),

    $_resetLogo_trigger({ resources }) {
      this.showMessage('Logo reset')
    }
  }
}
