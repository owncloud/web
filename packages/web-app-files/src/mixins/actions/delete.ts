import MixinDeleteResources from '../deleteResources'
import { mapState, mapGetters } from 'vuex'
import {
  isLocationPublicActive,
  isLocationSpacesActive,
  isLocationTrashActive,
  isLocationCommonActive
} from '../../router'
import { isProjectSpaceResource } from 'web-client/src/helpers'

export default {
  mixins: [MixinDeleteResources],
  computed: {
    ...mapState('Files', ['currentFolder']),
    ...mapGetters(['capabilities', 'user']),
    $_delete_items() {
      return [
        {
          name: 'delete',
          icon: 'delete-bin-5',
          label: () => this.$gettext('Delete'),
          handler: this.$_delete_trigger,
          isEnabled: ({ resources }) => {
            if (
              !isLocationSpacesActive(this.$router, 'files-spaces-generic') &&
              !isLocationPublicActive(this.$router, 'files-public-link') &&
              !isLocationCommonActive(this.$router, 'files-common-search')
            ) {
              return false
            }
            if (resources.length === 0) {
              return false
            }

            if (
              isLocationSpacesActive(this.$router, 'files-spaces-generic') &&
              this.space?.driveType === 'share' &&
              resources[0].path === '/'
            ) {
              return false
            }

            // CERNBox do not allow actions above home/project root
            const elems = resources[0].path?.split('/').filter(Boolean) || [] //"/eos/project/c/cernbox"
            if (isLocationSpacesActive(this.$router, 'files-spaces-generic') && elems.length < 5) {
              return false
            }

            const deleteDisabled = resources.some((resource) => {
              return !resource.canBeDeleted()
            })
            return !deleteDisabled
          },
          componentType: 'button',
          class: 'oc-files-actions-delete-trigger'
        },
        {
          // this menu item is ONLY for the trashbin (permanently delete a file/folder)
          name: 'delete-permanent',
          icon: 'delete-bin-5',
          label: () => this.$gettext('Delete'),
          handler: this.$_delete_trigger,
          isEnabled: ({ resources }) => {
            if (!isLocationTrashActive(this.$router, 'files-trash-generic')) {
              return false
            }
            if (this.capabilities?.files?.permanent_deletion === false) {
              return false
            }

            if (
              isProjectSpaceResource(this.space) &&
              !this.space.isEditor(this.user) &&
              !this.space.isManager(this.user)
            ) {
              return false
            }

            return resources.length > 0
          },
          componentType: 'button',
          class: 'oc-files-actions-delete-permanent-trigger'
        }
      ]
    }
  },
  methods: {
    $_delete_trigger({ resources }) {
      this.$_deleteResources_displayDialog(resources)
    }
  }
}
