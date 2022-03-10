import { mapActions, mapGetters } from 'vuex'
import { isLocationTrashActive } from '../../router'
import { buildWebDavFilesTrashPath } from '../../helpers/resources'

export default {
  computed: {
    ...mapGetters('Files', ['activeFiles']),
    $_emptyTrashBin_items() {
      return [
        {
          name: 'empty-trash-bin',
          icon: 'delete-bin-5',
          label: () => this.$gettext('Empty trash bin'),
          handler: this.$_emptyTrashBin_trigger,
          isEnabled: ({ resources }) => {
            if (
              !isLocationTrashActive(this.$router, 'files-trash-personal') &&
              !isLocationTrashActive(this.$router, 'files-trash-spaces-project')
            ) {
              return false
            }
            // empty trash bin is not available for individual resources, but only for the trash bin as a whole
            return resources.length === 0
          },
          isDisabled: () => this.activeFiles.length === 0,
          componentType: 'oc-button',
          class: 'oc-files-actions-empty-trash-bin-trigger',
          variation: 'danger'
        }
      ]
    }
  },
  methods: {
    ...mapActions(['showMessage']),
    ...mapActions('Files', ['clearTrashBin']),
    ...mapGetters(['user']),
    $_emptyTrashBin_trigger() {
      this.$client.fileTrash
        .clearTrashBin(buildWebDavFilesTrashPath(this.user.id))
        .then(() => {
          this.showMessage({
            title: this.$gettext('All deleted files were removed')
          })
          this.clearTrashBin()
        })
        .catch((error) => {
          console.error(error)
          this.showMessage({
            title: this.$pgettext(
              'Error message in case clearing the trash bin fails',
              'Failed to delete all files permanently'
            ),
            status: 'danger'
          })
        })
    }
  }
}
