import { clientService } from 'web-pkg/src/services'
import { isLocationSpacesActive } from '../../router'

export default {
  computed: {
    $_virus_scan_items() {
      return [
        {
          name: 'virus-scan',
          icon: 'virus',
          label: () => this.$gettext('Scan for viruses'),
          handler: this.$_virus_scan_trigger,
          isEnabled: ({ resources }) => {
            if (resources.length === 0) {
              return false
            }

            if (resources[0].isFolder) {
              return false
            }

            if (!isLocationSpacesActive(this.$router, 'files-spaces-generic')) {
              return false
            }

            if (
              isLocationSpacesActive(this.$router, 'files-spaces-generic') &&
              this.space?.driveType === 'share' &&
              resources[0].path === '/'
            ) {
              return false
            }

            return true
          },
          componentType: 'button',
          class: 'oc-files-actions-virus-scan-trigger'
        }
      ]
    }
  },
  methods: {
    async $_virus_scan_trigger({ resources }) {
      const accessToken = this.$store.getters['runtime/auth/accessToken']
      const httpClient = clientService.httpAuthenticated(accessToken)
      const { server } = this.$store.getters.configuration
      await httpClient.get(
        `${server}remote.php/dav/postprocessing/virusscan/${resources[0].fileId}`
      )
    }
  }
}
