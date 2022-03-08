import { mapState } from 'vuex'

export default {
  data: function () {
    return {
      $_editReadmeContent_modalOpen: false
    }
  },
  computed: {
    ...mapState(['user']),
    $_editReadmeContent_items() {
      return [
        {
          name: 'editReadmeContent',
          icon: 'markdown',
          label: () => {
            return this.$gettext('Edit description')
          },
          handler: this.$_editReadmeContent_trigger,
          isEnabled: ({ resources }) => {
            if (resources.length !== 1) {
              return false
            }

            if (!resources[0].canEditReadme({ user: this.user })) {
              return false
            }

            return !!resources[0].spaceReadmeData
          },
          componentType: 'oc-button',
          class: 'oc-files-actions-edit-readme-content-trigger'
        }
      ]
    }
  },
  methods: {
    $_editReadmeContent_trigger() {
      this.$data.$_editReadmeContent_modalOpen = true
    },
    $_editReadmeContent_closeModal() {
      this.$data.$_editReadmeContent_modalOpen = false
    }
  }
}
