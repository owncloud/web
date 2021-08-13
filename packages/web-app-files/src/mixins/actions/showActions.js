import { mapMutations } from 'vuex'
import { isTrashbinRoute } from '../../helpers/route'

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

    $_showActions_trigger() {
      this.SET_APP_SIDEBAR_ACTIVE_PANEL(isTrashbinRoute(this.$route) ? null : 'actions-item')
    }
  }
}
