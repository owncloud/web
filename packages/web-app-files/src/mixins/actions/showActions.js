import { mapActions, mapMutations } from 'vuex'

export default {
  computed: {
    $_showActions_items() {
      return [
        {
          icon: 'slideshow',
          label: () => this.$gettext('All Actions'),
          handler: this.$_showActions_trigger,
          isEnabled: () => true,
          componentType: 'oc-button',
          class: 'oc-files-actions-show-actions-trigger'
        }
      ]
    }
  },
  methods: {
    ...mapMutations('Files', ['SET_APP_SIDEBAR_ACTIVE_PANEL']),
    ...mapActions('Files', ['setHighlightedFile']),

    $_showActions_trigger(resource) {
      this.setHighlightedFile(resource)
      this.SET_APP_SIDEBAR_ACTIVE_PANEL('actions-item')
    }
  }
}
