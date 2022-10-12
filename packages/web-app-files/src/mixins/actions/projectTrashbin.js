import { createLocationCommon } from '../../router'
import { mapState } from 'vuex'
export default {
  computed: {
    ...mapState('Files', ['currentFolder']),
    $_projectTrashbin_items() {
      return [
        {
          name: 'project-trashbin',
          icon: 'delete-bin-5',
          handler: this.$_navigate_to_trashbin,
          label: () =>
            this.$pgettext(
              'Action in the files list row to go to trashbin of selected project',
              'Open trashbin'
            ),
          isEnabled: ({ resources }) => {
            if (resources.length !== 1) {
              return false
            }

            // if resources[0].path === /eos/project/x/xxxx
            if (
              resources[0].path.includes('/eos/project/') &&
              (resources[0].path.match(/\//g) || []).length === 4
            )
              return true

            if (this.$route.name !== 'files-common-projects') {
              return false
            }
            return true
          },
          componentType: 'button',
          class: 'oc-files-actions-accept-share-trigger'
        }
      ]
    }
  },
  methods: {
    $_navigate_to_trashbin({ resources }) {
      this.$router.push(
        createLocationCommon('files-common-projects-trash', {
          params: {
            context: 'private'
          },
          query: { project: resources[0].path, name: resources[0].name }
        })
      )
    }
  }
}
