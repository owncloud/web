<template>
  <div class="oc-flex oc-flex-nowrap oc-flex-middle">
    <oc-spinner v-if="removalInProgress" :aria-label="$gettext('Removing public link')" />
    <template v-else>
      <oc-button
        v-oc-tooltip="editButtonLabel"
        :aria-label="editButtonLabel"
        :data-testid="`files-link-id-${link.id}-btn-edit`"
        appearance="raw"
        class="oc-files-file-link-edit oc-mr-xs"
        @click="editLink"
      >
        <oc-icon name="pencil" />
      </oc-button>
      <oc-button
        v-oc-tooltip="deleteButtonLabel"
        :aria-label="deleteButtonLabel"
        appearance="raw"
        class="oc-files-file-link-delete"
        @click="$_removeLink"
      >
        <oc-icon name="delete-bin-5" />
      </oc-button>
    </template>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'

export default {
  name: 'LinkActions',
  inject: ['changeView'],
  props: {
    link: {
      type: Object,
      required: true
    }
  },

  data: () => ({
    removalInProgress: false
  }),

  computed: {
    ...mapGetters('Files', ['highlightedFile']),

    editButtonLabel() {
      return this.$gettext('Edit public link')
    },

    deleteButtonLabel() {
      return this.$gettext('Delete public link')
    }
  },

  methods: {
    ...mapActions(['showMessage', 'createModal', 'hideModal']),
    ...mapActions('Files', ['removeLink']),
    ...mapMutations('Files', ['TRIGGER_PUBLIC_LINK_EDIT']),
    $_removeLink() {
      const modal = {
        variation: 'danger',
        title: this.$gettext('Delete public link'),
        message: this.$gettext(
          'Are you sure you want to delete this link? Recreating the same link again is not possible.'
        ),
        cancelText: this.$gettext('Cancel'),
        confirmText: this.$gettext('Delete'),
        onCancel: this.hideModal,
        onConfirm: () =>
          this.deleteLink({
            client: this.$client,
            share: this.link,
            resource: this.highlightedFile
          })
      }

      this.createModal(modal)
    },

    deleteLink({ client, share, resource }) {
      this.hideModal()
      this.removeLink({ client, share, resource })

      this.showMessage({
        title: this.$gettext('Public link was deleted successfully')
      })
    },

    editLink() {
      this.TRIGGER_PUBLIC_LINK_EDIT(this.link)
      this.changeView('editPublicLink')
    }
  }
}
</script>
