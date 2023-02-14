import { mapState } from 'vuex'

export default {
  data: () => {
    return {
      $_editQuota_modalOpen: false,
      $_editQuota_selectedSpace: null
    }
  },
  computed: {
    ...mapState('Files', ['currentFolder']),
    ...mapState(['user']),

    $_editQuota_items() {
      return [
        {
          name: 'editQuota',
          icon: 'cloud',
          label: () => {
            return this.$gettext('Edit quota')
          },
          handler: this.$_editQuota_trigger,
          isEnabled: ({ resources }) => {
            if (!resources || !resources.length) {
              return false
            }
            if (!resources.some((resource) => 'spaceQuota' in resource || resource.drive?.quota)) {
              return false
            }
            if (resources.some((r) => r.spaceQuota === false)) {
              return false
            }
            return this.$permissionManager.canEditSpaceQuota()
          },
          componentType: 'button',
          class: 'oc-files-actions-edit-quota-trigger'
        }
      ]
    }
  },
  methods: {
    $_editQuota_trigger({ resources }) {
      this.$data.$_editQuota_selectedSpace = resources[0]
      this.$data.$_editQuota_modalOpen = true
    },
    $_editQuota_closeModal() {
      this.$data.$_editQuota_modalOpen = false
    }
  }
}
