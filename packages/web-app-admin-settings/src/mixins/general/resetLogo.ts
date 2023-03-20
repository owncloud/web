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
          isEnabled: () => {
            return this.$can('update-all', 'Logo')
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

    $_resetLogo_trigger() {
      this.$_resetLogo_reset()
    },

    async $_resetLogo_reset() {
      try {
        const httpClient = this.$clientService.httpAuthenticated
        await httpClient.delete('/branding/logo')
        this.showMessage({
          title: this.$gettext('Logo was reset successfully. Reloading page...')
        })
        setTimeout(() => {
          this.$router.go(this.$router.currentRoute)
        }, 1000)
      } catch (e) {
        console.error(e)
        this.showMessage({
          title: this.$gettext('Failed to reset logo'),
          status: 'danger'
        })
      }
    }
  }
}
