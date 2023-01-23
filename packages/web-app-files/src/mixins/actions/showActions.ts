import { isLocationTrashActive } from '../../router'
import isFilesAppActive from './helpers/isFilesAppActive'
import { eventBus } from 'web-pkg/src/services/eventBus'
import { SideBarEventTopics } from 'web-pkg/src/composables/sideBar'

export default {
  mixins: [isFilesAppActive],
  computed: {
    $_showActions_items() {
      return [
        {
          name: 'show-actions',
          icon: 'slideshow-3',
          label: () => this.$gettext('All Actions'),
          handler: this.$_showActions_trigger,
          isEnabled: ({ resources }) => {
            // sidebar is currently only available inside files app
            if (!this.$_isFilesAppActive) {
              return false
            }

            // we don't have batch actions in the right sidebar, yet.
            // return hardcoded `true` in all cases once we have them.
            return resources.length === 1
          },
          componentType: 'button',
          class: 'oc-files-actions-show-actions-trigger'
        }
      ]
    }
  },
  methods: {
    $_showActions_trigger() {
      // we don't have details in the trashbin, yet. the actions panel is the default
      // panel at the moment, so we need to use `null` as panel name for trashbins.
      // unconditionally return hardcoded `actions` once we have a dedicated
      // details panel in trashbins.
      const panelName = isLocationTrashActive(this.$router, 'files-trash-generic')
        ? null
        : 'actions'
      eventBus.publish(SideBarEventTopics.openWithPanel, panelName)
    }
  }
}
