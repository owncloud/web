import { mapState } from 'vuex'

export default {
  data: () => {
    return {
      $_editQuota_modalOpen: false
    }
  },
  computed: {
    ...mapState('Files', ['currentFolder']),
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
            if (resources.length !== 1) {
              return false
            }

            return resources[0].spaceQuota
          },
          componentType: 'oc-button',
          class: 'oc-files-actions-edit-quota-trigger'
        }
      ]
    }
  },
  methods: {
    $_editQuota_trigger() {
      this.$data.$_editQuota_modalOpen = true
    },
    $_editQuota_closeModal() {
      this.$data.$_editQuota_modalOpen = false
    }
  }
}
