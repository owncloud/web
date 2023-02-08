import { mapActions } from 'vuex'
import { clientService } from 'web-pkg'

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

    $_resetLogo_trigger() {
      try {
        const accessToken = this.$store.getters['runtime/auth/accessToken']
        const httpClient = clientService.httpAuthenticated(accessToken)
        httpClient.delete('/branding/logo')
        this.showMessage({
          title: this.$gettext('Logo was reset successfully')
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
